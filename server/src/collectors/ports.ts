import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Port, Protocol } from '../types';
import { resolveUnit } from './link';

const exec = promisify(execFile);

// Extracts the first ("name",pid=123) from ss's process column:
//   users:(("cupsd",pid=1234,fd=7))
const PROC_RE = /"([^"]+)",pid=(\d+)/;

function isLoopback(address: string): boolean {
  const a = address.replace(/^\[|\]$/g, '').split('%')[0]!; // strip [..] and %iface
  return a === '::1' || a.startsWith('127.');
}

function splitAddrPort(token: string): { address: string; port: number } | null {
  const idx = token.lastIndexOf(':');
  if (idx < 0) return null;
  const port = Number.parseInt(token.slice(idx + 1), 10);
  if (!Number.isFinite(port)) return null;
  return { address: token.slice(0, idx), port };
}

/** Parse one `ss -tulpnH` row into a Port (without the systemd unit yet). */
function parseRow(line: string): Port | null {
  // Columns: Netid State Recv-Q Send-Q Local:Port Peer:Port [Process]
  const f = line.split(/\s+/);
  if (f.length < 5) return null;

  const protocol = f[0] as Protocol;
  if (protocol !== 'tcp' && protocol !== 'udp') return null;

  const addr = splitAddrPort(f[4]!);
  if (!addr) return null;

  const procField = f.slice(6).join(' ');
  const m = PROC_RE.exec(procField);

  return {
    protocol,
    localAddress: addr.address,
    port: addr.port,
    state: f[1]!,
    pid: m ? Number.parseInt(m[2]!, 10) : undefined,
    processName: m ? m[1] : undefined,
    externallyReachable: !isLoopback(addr.address),
  };
}

/** Collect all listening TCP/UDP ports, enriched with owning process and unit. */
export async function collectPorts(): Promise<Port[]> {
  // -t tcp  -u udp  -l listening  -p process  -n numeric  -H no header
  const { stdout } = await exec('ss', ['-tulpnH']);
  const ports = stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseRow)
    .filter((p): p is Port => p !== null);

  // Resolve each unique pid → unit once, then attach.
  const pids = [...new Set(ports.map((p) => p.pid).filter((p): p is number => p !== undefined))];
  const unitByPid = new Map<number, string | undefined>();
  await Promise.all(pids.map(async (pid) => unitByPid.set(pid, await resolveUnit(pid))));
  for (const p of ports) {
    if (p.pid !== undefined) p.unit = unitByPid.get(p.pid);
  }

  return ports;
}
