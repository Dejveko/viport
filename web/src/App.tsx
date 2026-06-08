import { useMemo, useState } from 'react';
import { useOverview } from './api';
import { Filters, type FilterState } from './components/Filters';
import { PortTable } from './components/PortTable';
import type { Port } from './types';

const DEFAULT_FILTERS: FilterState = {
  proto: 'all',
  listeningOnly: false,
  reachableOnly: false,
  search: '',
};

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-2xl font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
    </div>
  );
}

export default function App() {
  const { data, error, loading } = useOverview();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const ports: Port[] = data?.ports ?? [];

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return ports.filter((p) => {
      if (filters.proto !== 'all' && p.protocol !== filters.proto) return false;
      if (filters.listeningOnly && p.state !== 'LISTEN') return false;
      if (filters.reachableOnly && !p.externallyReachable) return false;
      if (q) {
        const hay = `${p.port} ${p.protocol} ${p.localAddress} ${p.processName ?? ''} ${p.unit ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ports, filters]);

  const exposed = ports.filter((p) => p.externallyReachable).length;
  const activeServices = data?.services.filter((s) => s.active === 'active').length ?? 0;

  return (
    <div className="min-h-full text-white/90">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vi<span className="text-emerald-400">port</span>
            </h1>
            <p className="text-sm text-white/50">Live ports &amp; systemd services</p>
          </div>
          <div className="text-right text-xs text-white/40">
            {error ? (
              <span className="text-red-400">⚠ {error}</span>
            ) : loading ? (
              'connecting…'
            ) : (
              <>
                updated {new Date(data!.generatedAt).toLocaleTimeString()}
                <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400 align-middle" />
              </>
            )}
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Open ports" value={ports.length} />
          <StatCard label="Exposed to network" value={exposed} accent={exposed ? '#f87171' : undefined} />
          <StatCard label="Active services" value={activeServices} accent="#34d399" />
          <StatCard label="Showing" value={filtered.length} />
        </section>

        <Filters value={filters} onChange={setFilters} />

        {!data && !error ? (
          <div className="mt-10 text-center text-white/40">Loading…</div>
        ) : (
          <PortTable ports={filtered} />
        )}

        <footer className="mt-8 text-center text-xs text-white/30">
          Phase 1 · read-only · run the API with sudo to see every owner
        </footer>
      </div>
    </div>
  );
}
