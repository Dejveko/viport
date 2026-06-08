import { useEffect, useRef, useState } from 'react';
import { controlService, type ServiceAction } from '../api';

/**
 * Restart + Stop controls for a systemd unit. Stop is a two-click confirm
 * (the button arms, then turns red) to avoid closing a port by accident.
 */
export function ServiceActions({ unit, onChanged }: { unit: string; onChanged?: () => void }) {
  const [busy, setBusy] = useState<ServiceAction | null>(null);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const armTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(armTimer.current), []);

  async function run(action: ServiceAction) {
    setBusy(action);
    setError(null);
    try {
      await controlService(unit, action);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
      setArmed(false);
    }
  }

  function armStop() {
    setArmed(true);
    window.clearTimeout(armTimer.current);
    armTimer.current = window.setTimeout(() => setArmed(false), 3000);
  }

  const btn = 'rounded-md px-2 py-1 text-xs font-medium transition disabled:opacity-50';

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {error && (
        <span className="max-w-[9rem] truncate text-[10px] text-red-400" title={error}>
          {error}
        </span>
      )}
      <button
        className={`${btn} border border-white/10 text-white/70 hover:bg-white/10`}
        disabled={busy !== null}
        onClick={() => run('restart')}
        title={`Restart ${unit}`}
      >
        {busy === 'restart' ? '…' : '⟳'}
      </button>
      {armed ? (
        <button
          className={`${btn} bg-red-500/80 text-white hover:bg-red-500`}
          disabled={busy !== null}
          onClick={() => run('stop')}
          title={`Confirm stop ${unit}`}
        >
          {busy === 'stop' ? '…' : 'Confirm'}
        </button>
      ) : (
        <button
          className={`${btn} border border-red-500/30 text-red-300 hover:bg-red-500/15`}
          disabled={busy !== null}
          onClick={armStop}
          title={`Stop ${unit}`}
        >
          Stop
        </button>
      )}
    </div>
  );
}
