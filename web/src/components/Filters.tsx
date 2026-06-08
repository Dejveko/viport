export interface FilterState {
  proto: 'all' | 'tcp' | 'udp';
  listeningOnly: boolean;
  reachableOnly: boolean;
  search: string;
}

const PROTOS: FilterState['proto'][] = ['all', 'tcp', 'udp'];

export function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex overflow-hidden rounded-lg border border-white/10">
        {PROTOS.map((p) => (
          <button
            key={p}
            onClick={() => set({ proto: p })}
            className={`px-3 py-1.5 text-sm capitalize transition ${
              value.proto === p
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Toggle label="Listening only" checked={value.listeningOnly} onChange={(v) => set({ listeningOnly: v })} />
      <Toggle label="Exposed only" checked={value.reachableOnly} onChange={(v) => set({ reachableOnly: v })} />

      <input
        value={value.search}
        onChange={(e) => set({ search: e.target.value })}
        placeholder="Search port, process, service…"
        className="ml-auto w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-emerald-400/50"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        checked
          ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
          : 'border-white/10 text-white/60 hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}
