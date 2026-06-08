import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export type ServiceAction = 'start' | 'stop' | 'restart';
export const ACTIONS: ServiceAction[] = ['start', 'stop', 'restart'];

// Accept only well-formed unit names. (execFile already avoids the shell, so this
// is belt-and-suspenders — it rejects obvious garbage before we shell out.)
const UNIT_RE = /^[\w@.\\-]+\.(service|socket)$/;

// Units we refuse to stop/restart: doing so can lock you out or take down the box.
const PROTECTED: RegExp[] = [
  /^sshd?\.service$/,
  /^systemd-logind\.service$/,
  /^dbus\.service$/,
  /^dbus-broker\.service$/,
  /^systemd-journald\.service$/,
  /^polkit\.service$/,
  /^user@\d+\.service$/, // your own user manager → kills your session
  /^session-\d+\.scope$/,
  /^getty@.*\.service$/,
  /^serial-getty@.*\.service$/,
  /^init\.scope$/,
];

export class ControlError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export interface ControlResult {
  ok: true;
  unit: string;
  action: ServiceAction;
}

function isProtected(unit: string): boolean {
  return PROTECTED.some((re) => re.test(unit));
}

/** Run `systemctl <action> <unit>` with validation + safety guards. */
export async function controlService(unit: string, action: ServiceAction): Promise<ControlResult> {
  if (!ACTIONS.includes(action)) throw new ControlError(`Unknown action "${action}"`, 400);
  if (!UNIT_RE.test(unit)) throw new ControlError(`Invalid unit name "${unit}"`, 400);
  if ((action === 'stop' || action === 'restart') && isProtected(unit)) {
    throw new ControlError(`Refusing to ${action} protected unit "${unit}" — it could lock you out.`, 403);
  }

  try {
    await exec('systemctl', [action, unit]);
    return { ok: true, unit, action };
  } catch (e) {
    const err = e as { stderr?: string; message?: string };
    const detail = (err.stderr || err.message || 'systemctl failed').trim();
    const denied = /access denied|permission|interactive authentication|not authorized/i.test(detail);
    throw new ControlError(detail, denied ? 403 : 500);
  }
}
