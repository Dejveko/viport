import { useEffect, useRef, useState } from 'react';
import type { Overview } from './types';

export type ServiceAction = 'start' | 'stop' | 'restart';

interface OverviewState {
  data: Overview | null;
  error: string | null;
  loading: boolean;
}

/** Poll /api/overview on an interval; also expose a manual refresh(). */
export function useOverview(intervalMs = 2000): OverviewState & { refresh: () => void } {
  const [state, setState] = useState<OverviewState>({ data: null, error: null, loading: true });
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const res = await fetch('/api/overview');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Overview;
        if (alive) setState({ data: json, error: null, loading: false });
      } catch (e) {
        if (alive) {
          setState((prev) => ({
            data: prev.data,
            error: e instanceof Error ? e.message : String(e),
            loading: false,
          }));
        }
      }
    }

    tickRef.current = tick;
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return { ...state, refresh: () => tickRef.current() };
}

/** POST a control action for a systemd unit; throws with the server's message on failure. */
export async function controlService(unit: string, action: ServiceAction): Promise<void> {
  const res = await fetch(`/api/services/${encodeURIComponent(unit)}/${action}`, { method: 'POST' });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
}
