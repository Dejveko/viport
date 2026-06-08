import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { collectPorts } from './collectors/ports';
import { collectServices } from './collectors/services';
import { ControlError, controlService, type ServiceAction } from './control';
import { buildOverview } from './merge';

const PORT = Number(process.env.PORT ?? 4399);
const app = Fastify({ logger: true });

app.get('/api/health', async () => ({ ok: true, uid: process.getuid?.() ?? null }));
app.get('/api/overview', async () => buildOverview());
app.get('/api/ports', async () => ({ ports: await collectPorts() }));
app.get('/api/services', async () => ({ services: await collectServices() }));

// Phase 2 — control: start | stop | restart a systemd unit.
app.post<{ Params: { unit: string; action: string } }>('/api/services/:unit/:action', async (req, reply) => {
  try {
    return await controlService(req.params.unit, req.params.action as ServiceAction);
  } catch (e) {
    const status = e instanceof ControlError ? e.status : 500;
    reply.code(status);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
});

async function main() {
  // Serve the built frontend when present (production). In dev, Vite proxies /api.
  const dist = join(dirname(fileURLToPath(import.meta.url)), '../../web/dist');
  if (existsSync(dist)) {
    const { default: fastifyStatic } = await import('@fastify/static');
    await app.register(fastifyStatic, { root: dist });
    app.setNotFoundHandler((_req, reply) => reply.sendFile('index.html'));
  }

  await app.listen({ port: PORT, host: '0.0.0.0' });
  const uid = process.getuid?.() ?? -1;
  if (uid !== 0) {
    app.log.warn('Not running as root — ports owned by other users will show a blank owner. Re-run with sudo.');
  }
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
