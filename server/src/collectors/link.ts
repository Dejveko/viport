import { readFile } from 'node:fs/promises';

// A process cgroup line looks like: "0::/system.slice/nginx.service"
// or "0::/user.slice/user-1000.slice/user@1000.service/app.slice/app-foo.service".
// We take the LAST *.service segment as the most specific owning unit.
const UNIT_RE = /([\w@.\\-]+\.service)/g;

/** Resolve the systemd service unit that owns a pid, via its cgroup. */
export async function resolveUnit(pid: number): Promise<string | undefined> {
  try {
    const cgroup = await readFile(`/proc/${pid}/cgroup`, 'utf8');
    const matches = [...cgroup.matchAll(UNIT_RE)];
    return matches.length > 0 ? matches[matches.length - 1]![1] : undefined;
  } catch {
    // Process gone, or /proc unreadable (not root) — leave unit unresolved.
    return undefined;
  }
}
