# Viport

**Systemd service control & port visualiser.** See every open TCP/UDP port on a
Linux machine — which process and systemd service owns it, and whether it's
exposed to the network — then **stop / restart the owning service in one click**.

A focused, fast alternative to digging through `ss`, `lsof`, and `systemctl` by hand.

## What it does

- 📋 **Lists every listening port** (TCP + UDP) with its process and systemd unit.
- 🧊 **Two views** — a sortable table or a grid of port "cubes" (pick from the ⚙ menu; your choice is remembered).
- 🔎 **Filter & search** by protocol, listening-only, exposed-only, or free text.
- 🚨 **Flags network-exposed ports** (anything not bound to loopback) in red.
- 🛑 **Stop / restart services** straight from the UI, with a confirm step and a
  guard that refuses to touch protected units (sshd, your login session, dbus…).
- 🔄 **Live** — refreshes every 2 seconds.

## Requirements

- **Linux with systemd** (uses `systemctl`)
- **iproute2** — provides `ss` (preinstalled on most distros)
- **Node.js ≥ 20** (developed on Node 24)
- **root / sudo** — needed to see the owner of *every* port and to start/stop
  services. Without it you still see all ports, but owners of other users'
  processes show blank and control actions are denied.

## Quick start

```bash
git clone <your-repo-url> viport
cd viport
npm install
npm run build                  # build the web UI

sudo npm run start -w server   # serves UI + API at http://localhost:4399
```

Then open **http://localhost:4399**.

### Dev mode (hot reload, two terminals)

```bash
sudo npm run dev:server        # API on :4399
npm run dev:web                # UI on http://localhost:5173 (proxies /api)
```

### Configuration

- `PORT` — backend port (default `4399`), e.g. `sudo PORT=8080 npm run start -w server`.

## How it works

- `ss -tulpnH` → listening ports + owning PID
- `/proc/<pid>/cgroup` → the owning `*.service`
- `systemctl list-units --type=service --output=json` → services
- `systemctl {start,stop,restart} <unit>` → control actions (guarded)

A Fastify API exposes `/api/overview`; a React + Tailwind UI renders it.

## Roadmap

- **Phase 3** — dedicated external-services view + firewall (ufw/nftables) awareness.

---

> ⚠️ Viport can stop real services. It blocks the obviously dangerous ones, but
> run it on machines you administer and know what a unit does before stopping it.
