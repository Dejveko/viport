import { useEffect, useRef, useState } from 'react';
import type { Overview } from './types';

interface OverviewState {
  data: Overview | null;
  error: string | null;
  loading: boolean;
}

/** Poll /api/overview on an interval and expose the latest snapshot. */
export function useOverview(intervalMs = 2000): OverviewState {
  const [state, setState] = useState<OverviewState>({ data: null, error: null, loading: true });
  const timer = useRef<number | undefined>(undefined);

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

    tick();
    timer.current = window.setInterval(tick, intervalMs);
    return () => {
      alive = false;
      window.clearInterval(timer.current);
    };
  }, [intervalMs]);

  return state;
}
