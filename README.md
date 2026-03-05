<p align="center">
  <img src="frontend/public/mini-shinobi.png" alt="MiniShinobi" width="220" />
</p>

<h1 align="center">MiniShinobi</h1>
<p align="center">
  <strong>Self-hosted micro-PaaS for Git-based deployments on low-resource devices.</strong>
</p>

---

## Overview

MiniShinobi is a lightweight deployment platform that runs in Termux (or any Linux-like host) and supports:

- Dashboard-triggered deployments
- Webhook-triggered Git deployments
- Multi-project runtime isolation using `child_process.spawn`
- Dynamic Nginx reverse-proxy routing per deployed app
- Cloudflare Tunnel in front of Nginx for internet exposure
- Deployment logs with SSE streaming

---

## Architecture

```text
Internet
  -> Cloudflare
  -> cloudflared tunnel
  -> Nginx (host-based routing)
  -> MiniShinobi backend (controller + deployment engine)
  -> Process manager (isolated child processes)
  -> Apps (/apps/<project>)
```

### Runtime model

- One backend API service (`backend/src/app.js`)
- One global deployment queue (serialized builds)
- Multiple app processes running concurrently
- Runtime metadata persisted in `/runtime/projects.json`
- Per-project nginx vhost file generated in `nginx/sites-enabled/*.conf`

---

## Key Features

- GitHub OAuth dashboard login
- Project CRUD and manual deployment from dashboard
- `POST /deploy` webhook deployments (HMAC verified)
- Git clone on first deploy, git pull on redeploy
- Automatic framework detection (Next/Vite/Node/Static)
- Optional `.minishinobi.json` command override
- Automatic app port allocation/reuse
- Process lifecycle controls: start/stop/restart
- Nginx route generation + reload on deploy
- SSE deployment logs and deployment history in SQLite

---

## Requirements

- Node.js 18+ (LTS recommended)
- Git
- Nginx
- cloudflared
- PM2 (recommended for process supervision)

For Android/Termux, install packages as needed (`nodejs-lts`, `git`, `nginx`, etc.).

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Mic-360/MiniShinobi.git
cd MiniShinobi

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure backend env

```bash
cp backend/.env.example backend/.env
```

Set values in `backend/.env`.

### 3. Build frontend

```bash
cd frontend
npm run build
cd ..
```

### 4. Prepare directories

```bash
mkdir -p apps runtime runtime/logs nginx/sites-enabled logs
```

### 5. Configure Nginx

Use `nginx/nginx.conf` and ensure it includes:

```nginx
include /data/data/com.termux/files/home/MiniShinobi/nginx/sites-enabled/*.conf;
```

### 6. Configure Cloudflare Tunnel

Route both dashboard and wildcard app hosts to Nginx:

```yaml
ingress:
  - hostname: dashboard.<yourdomain.com>
    service: http://localhost:4000
  - hostname: '*.<yourdomain.com>'
    service: http://localhost:4000
  - service: http_status:404
```

### 7. Start services (example with PM2)

```bash
pm2 start ecosystem.config.js
pm2 status
```

---

## Environment Variables

`backend/.env.example` defines all required keys.

### Core

- `PORT` backend listen port (default `3000`)
- `NODE_ENV` runtime mode
- `SESSION_SECRET` session signing secret
- `DASHBOARD_URL` frontend URL used for auth redirect

### OAuth

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

### Storage/Runtime

- `DB_PATH` SQLite file path
- `LOGS_DIR` backend/platform log path
- `APPS_DIR` deployed repo root (default `/apps` under project root)
- `RUNTIME_DIR` runtime metadata root (default `/runtime` under project root)

### Routing/Deploy

- `BASE_DOMAIN` app hostname suffix (default `minishinobi.dev`)
- `NGINX_SITES_ENABLED_DIR` generated nginx vhost target directory
- `NGINX_RELOAD_CMD` nginx reload command (default `nginx -s reload`)
- `WEBHOOK_SECRET` HMAC secret for `POST /deploy`

### Port allocation

- `APP_PORT_START`
- `APP_PORT_END`

---

## Deployment Flows

### A) Dashboard deployment (existing flow)

1. Create project in dashboard (`/api/projects`)
2. Trigger deploy (`/api/deployments/project/:projectId/deploy`)
3. Deployment enters queue and runs in background
4. Logs stream over SSE (`/api/deployments/:id/logs`)

### B) Webhook deployment (new)

`POST /deploy`

Payload:

```json
{
  "repository": {
    "clone_url": "https://github.com/org/repo.git"
  },
  "ref": "refs/heads/main"
}
```

Headers:

- `x-hub-signature-256: sha256=<hmac>`

HMAC input is raw request body, key is `WEBHOOK_SECRET`.

### Pipeline behavior

1. Resolve project name from repo URL
2. Ensure repo exists in `/apps/<project-name>`
3. Clone if missing; else fetch/checkout/pull
4. Load `.minishinobi.json` if present
5. Detect framework when needed
6. Resolve build/start commands
7. Run build
8. Allocate/reuse port
9. Restart isolated process
10. Upsert nginx route and reload nginx
11. Persist runtime metadata (`/runtime/projects.json`) and deployment DB state

---

## Framework Detection

Used when `.minishinobi.json` does not override commands.

- `next.config.js` -> Next.js
- `vite.config.js` -> Vite
- `package.json` -> Node app
- `index.html` without `package.json` -> Static

Preset commands:

- `next`: `npm install && npm run build`, `npm start`
- `vite`: `npm install && npm run build`, `npx serve dist`
- `node`: `npm install`, `npm start`
- `static`: no build, `npx serve .`

---

## `.minishinobi.json`

Optional project-level overrides in repo root:

```json
{
  "build": "npm install && npm run build",
  "start": "npm start"
}
```

When present, these commands take precedence.

---

## Runtime Registry

`/runtime/projects.json` is the runtime source of truth.

Example:

```json
{
  "blog": {
    "name": "blog",
    "path": "/apps/blog",
    "port": 5100,
    "host": "blog.minishinobi.dev",
    "status": "running",
    "pid": 12345,
    "framework": "vite",
    "buildCommand": "npm install && npm run build",
    "startCommand": "npx serve dist",
    "updatedAt": "2026-03-05T12:00:00.000Z",
    "createdAt": "2026-03-05T11:30:00.000Z"
  }
}
```

---

## API Reference

### Auth

- `GET /auth/github`
- `GET /auth/github/callback`
- `GET /auth/me`
- `POST /auth/logout`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `DELETE /api/projects/:id`

### Deployments

- `GET /api/deployments/project/:projectId`
- `POST /api/deployments/project/:projectId/deploy`
- `GET /api/deployments/:id`
- `GET /api/deployments/:id/logs`
- `DELETE /api/deployments/:id`

### Webhook

- `POST /deploy`

### Health

- `GET /health`

---

## Repository Structure

```text
MiniShinobi/
├─ backend/
│  ├─ db/schema.sql
│  └─ src/
│     ├─ app.js
│     ├─ deployer.js
│     ├─ controllers/
│     │  └─ deploymentController.js
│     ├─ services/
│     │  ├─ buildRunner.js
│     │  ├─ frameworkDetector.js
│     │  ├─ gitManager.js
│     │  ├─ nginxManager.js
│     │  ├─ processManager.js
│     │  └─ runtimeRegistry.js
│     └─ routes/
│        ├─ auth.js
│        ├─ deploy.js
│        ├─ deployments.js
│        └─ projects.js
├─ cloudflared/config.yml
├─ nginx/
│  ├─ nginx.conf
│  └─ sites-enabled/
├─ apps/               # runtime clones (gitignored)
├─ runtime/            # runtime metadata/logs (gitignored)
└─ logs/               # platform logs (gitignored)
```

---

## Troubleshooting

### Webhook rejected (401)

- Verify `WEBHOOK_SECRET`
- Verify signature header and raw payload usage

### Nginx route not updated

- Check generated file in `nginx/sites-enabled/`
- Verify `NGINX_SITES_ENABLED_DIR` and `NGINX_RELOAD_CMD`
- Run `nginx -t`

### App not reachable

- Check `/runtime/projects.json` for status/port
- Check project log in `/runtime/logs/<project>.log`
- Confirm cloudflared wildcard route points to nginx

### Deploy fails during build

- Inspect deployment SSE logs
- Verify build/start commands or `.minishinobi.json`
- Ensure system has enough memory and disk

---

## License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Built with ❤️ by bhaumic <br />on a Snapdragon 660 · 4 GB RAM · PixelExperience Android 13</sub><br />
  <sub>Zero native compilation: sql.js + session-file-store + child_process (built-in)</sub>
</p>
