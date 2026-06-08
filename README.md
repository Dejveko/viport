# Viport

Systemd/systemctl service control & port visualiser. **Phase 1: read-only visualization.**

See every listening TCP/UDP port on the machine — which process and systemd
service owns it, and whether it's exposed to the network — live, sortable, and
filterable.

## Run (dev)

```bash
npm install

# backend — run as root so it can see EVERY port's owner
sudo npm run dev:server     # http://localhost:4399

# frontend (separate terminal, normal user)
npm run dev:web             # http://localhost:5173
```

Then open http://localhost:5173.

> **Why sudo?** `ss` only reveals the PID/process for *your own* sockets unless
> you're root — without it, root-owned services show a port but a blank owner.
> `GET /api/health` reports the backend's uid (`0` = root).

## How it works

- `ss -tulpnH` → listening ports + owning PID — [server/src/collectors/ports.ts](server/src/collectors/ports.ts)
- `/proc/<pid>/cgroup` → owning `*.service` — [server/src/collectors/link.ts](server/src/collectors/link.ts)
- `systemctl list-units --type=service --output=json` → services — [server/src/collectors/services.ts](server/src/collectors/services.ts)
- Fastify serves `/api/overview`; the React UI polls it every 2 s.

## Roadmap

- **Phase 2** — one-click stop/start/restart (with a guard so you can't kill your own SSH/session).
- **Phase 3** — dedicated external-services view + firewall (ufw/nftables) awareness.
