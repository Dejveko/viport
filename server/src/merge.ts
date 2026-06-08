import { collectPorts } from './collectors/ports';
import { collectServices } from './collectors/services';
import type { Overview } from './types';

/** One scan → the full snapshot the UI renders. */
export async function buildOverview(): Promise<Overview> {
  const [ports, services] = await Promise.all([collectPorts(), collectServices()]);
  return { ports, services, generatedAt: new Date().toISOString() };
}
