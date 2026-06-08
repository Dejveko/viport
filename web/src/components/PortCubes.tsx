import { useMemo } from 'react';
import type { Port } from '../types';
import { ServiceActions } from './ServiceActions';

export function PortCubes({ ports, onChanged }: { ports: Port[]; onChanged?: () => void }) {
  const sorted = useMemo(
    () => [...ports].sort((a, b) => a.port - b.port || a.protocol.localeCompare(b.protocol)),
    [ports],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-white/40">
        No ports match the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {sorted.map((p, i) => (
        <Cube key={`${p.protocol}-${p.localAddress}-${p.port}-${i}`} port={p} onChanged={onChanged} />
      ))}
    </div>
  );
}

function Cube({ port: p, onChanged }: { port: Port; onChanged?: () => void }) {
  const exposed = p.externallyReachable;
  return (
    <div
      className={`group flex aspect-square flex-col rounded-2xl border p-4 transition duration-150 hover:-translate-y-0.5 ${
        exposed
          ? 'border-red-500/30 bg-red-500/5 hover:border-red-400/60 hover:shadow-[0_0_28px_-8px] hover:shadow-red-500/50'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-3xl font-bold leading-none tracking-tight text-white">{p.port}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">{p.protocol}</span>
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <div className="truncate text-sm text-white/85">
          {p.processName || <span className="text-white/30">no owner</span>}
        </div>
        {p.unit ? <div className="truncate text-xs text-sky-300">{p.unit}</div> : null}
        <div className="mt-1 truncate font-mono text-[11px] text-white/40">{p.localAddress}</div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            exposed ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/50'
          }`}
        >
          {exposed ? 'exposed' : 'local'}
        </span>
        {p.unit ? <ServiceActions unit={p.unit} onChanged={onChanged} /> : null}
      </div>
    </div>
  );
}
