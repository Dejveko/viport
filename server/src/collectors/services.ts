import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Service } from '../types';

const exec = promisify(execFile);

interface RawUnit {
  unit: string;
  load: string;
  active: string;
  sub: string;
  description: string;
}

/** List all systemd .service units (active or not) as structured data. */
export async function collectServices(): Promise<Service[]> {
  // systemd emits real JSON with --output=json — no scraping required.
  const { stdout } = await exec(
    'systemctl',
    ['list-units', '--type=service', '--all', '--output=json', '--no-pager'],
    { maxBuffer: 16 * 1024 * 1024 },
  );
  const raw = JSON.parse(stdout) as RawUnit[];
  return raw.map((u) => ({
    unit: u.unit,
    load: u.load,
    active: u.active,
    sub: u.sub,
    description: u.description,
  }));
}
