import { useState } from 'react';
import { CheckIcon, GearIcon, GridIcon, ListIcon } from './icons';

export type ViewMode = 'list' | 'cubes';

const OPTIONS: { mode: ViewMode; label: string; hint: string }[] = [
  { mode: 'list', label: 'List', hint: 'Sortable table' },
  { mode: 'cubes', label: 'Cubes', hint: 'Port tiles' },
];

export function Settings({ view, onView }: { view: ViewMode; onView: (next: ViewMode) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        aria-expanded={open}
        className={`rounded-lg border p-2 transition ${
          open
            ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
            : 'border-white/10 text-white/60 hover:bg-white/5 hover:text-white/90'
        }`}
      >
        <GearIcon />
      </button>

      {open && (
        <>
          {/* click-catcher to dismiss */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#12121a] shadow-xl shadow-black/40">
            <div className="px-3 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wide text-white/40">View</div>
            <div className="p-1">
              {OPTIONS.map((o) => {
                const active = view === o.mode;
                return (
                  <button
                    key={o.mode}
                    onClick={() => {
                      onView(o.mode);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                      active ? 'bg-emerald-500/15 text-emerald-200' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {o.mode === 'list' ? <ListIcon /> : <GridIcon />}
                    <span className="flex-1">
                      <span className="block text-sm">{o.label}</span>
                      <span className="block text-[11px] text-white/40">{o.hint}</span>
                    </span>
                    {active && <CheckIcon />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
