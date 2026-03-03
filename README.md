<p align="center">
  <img src="frontend/public/mini-shinobi.png" alt="MiniShinobi" width="256" />
</p>

<h1 align="center">MiniShinobi</h1>
<p align="center">
  <strong>A self-hosted Vercel-like deployment platform running entirely on a rooted Android device.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#usage">Usage</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#deployment-flow">Deployment Flow</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## What is MiniShinobi?

MiniShinobi is a **mini-Vercel** that runs inside [Termux](https://termux.dev) on a rooted Android phone. Connect your GitHub repos, hit **Deploy**, and your projects go live via Cloudflare Tunnels — all from a device that fits in your pocket.

> **Zero native compilation.** The entire stack uses pure-JavaScript packages, which means no C++ addon compilation nightmares on ARM Termux.

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js (LTS) |
| Database | sql.js (WebAssembly SQLite) |
| Sessions | session-file-store (JSON files) |
| Auth | GitHub OAuth via Passport |
| Frontend | React + Vite + Tailwind CSS |
| Reverse Proxy | Nginx |
| Tunneling | Cloudflare Tunnels (`cloudflared`) |
| Process Manager | PM2 |

---

## Features

- **GitHub OAuth Login** — Sign in with your GitHub account
- **Project Management** — Import GitHub repos with custom build commands
- **One-Click Deploy** — Clone → Install → Build → Serve, fully automated
- **Live Build Logs** — Real-time streaming via Server-Sent Events (SSE)
- **Cloudflare Tunnels** — Every deployment gets a public URL
- **Named Subdomains** — Projects are deployed to `project-slug.yourdomain.com`
- **Build Queue** — Serialized builds to prevent OOM on resource-constrained devices
- **PM2 Integration** — Auto-restart, log rotation, and process monitoring
- **Static & Dynamic Apps** — Serves static builds with `serve` or Node apps with `npm start`
- **Mobile-First Architecture** — Optimized for low-resource ARM devices (Snapdragon 660, 4 GB RAM)

---

## Architecture

```
Internet
   │
   ▼
Cloudflare (yourdomain.com)
   │  DNS → Cloudflare Tunnel
   ▼
cloudflared daemon (Termux)  ◄────────────────────────────────┐
   │                                                           │
   ├── dashboard.yourdomain.com  → localhost:4000 (Nginx)     │
   ├── *.yourdomain.com          → localhost:PORT (apps)      │
                                                               │
Nginx (port 4000) ──► Express Backend (port 3000, Node.js)    │
                                                               │
Express Backend                                                │
   ├── GitHub OAuth (login)                                    │
   ├── sql.js SQLite DB                                        │
   ├── REST API (/api/*)                                       │
   ├── SSE stream (/api/deployments/:id/logs)                  │
   └── Deployment Engine                                       │
         ├── git clone                                         │
         ├── install command                                   │
         ├── build command                                     │
         ├── serve output                                      │
         └── cloudflared named tunnel ─────────────────────────┘
```

### Port Map

| Service | Port |
|---------|------|
| Nginx (reverse proxy) | 4000 |
| Express backend API | 3000 |
| Deployed apps | 5000–5999 (auto-assigned) |

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Android device** | Rooted, running Android 12+ |
| **Termux** | Latest from [F-Droid](https://f-droid.org/packages/com.termux/) |
| **Cloudflare account** | Free tier works — you need a domain added to Cloudflare |
| **GitHub OAuth App** | Create one at [GitHub Developer Settings](https://github.com/settings/developers) |

### Tested Hardware

- Snapdragon 660 · 4 GB RAM · PixelExperience Android 13

---

## Quick Start

### 1. Set up Termux

```bash
pkg update -y && pkg upgrade -y
termux-setup-storage

pkg install -y \
  nodejs-lts npm git nginx sqlite \
  curl wget unzip openssh which procps diffutils

npm install -g npm@latest pm2 serve pnpm yarn
```

### 2. Clone MiniShinobi

```bash
cd $HOME
git clone https://github.com/yourusername/MiniShinobi.git
cd MiniShinobi
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 4. Configure environment

```bash
cp backend/.env.example backend/.env
chmod 600 backend/.env
```

Edit `backend/.env` with your actual values:

```env
SESSION_SECRET=<output of: openssl rand -hex 32>

GITHUB_CLIENT_ID=<your GitHub OAuth Client ID>
GITHUB_CLIENT_SECRET=<your GitHub OAuth Client Secret>
GITHUB_CALLBACK_URL=https://dashboard.yourdomain.com/auth/github/callback
DASHBOARD_URL=https://dashboard.yourdomain.com

DB_PATH=$HOME/MiniShinobi/backend/db/minishinobi.sqlite
DEPLOYMENTS_DIR=$HOME/MiniShinobi/deployments
TUNNELS_DIR=$HOME/MiniShinobi/tunnels
LOGS_DIR=$HOME/MiniShinobi/logs
```

### 5. Set up directories

```bash
mkdir -p deployments tunnels logs
```

### 6. Set up Nginx

```bash
cp nginx/nginx.conf $PREFIX/etc/nginx/nginx.conf
nginx -t && nginx
```

### 7. Set up Cloudflare Tunnel

```bash
# Download cloudflared
wget -O cloudflared \
  "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
chmod +x cloudflared
mv cloudflared $PREFIX/bin/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create minishinobi-dashboard
TUNNEL_ID=$(cloudflared tunnel list | grep minishinobi-dashboard | awk '{print $1}')

# Configure — edit cloudflared/config.yml with your TUNNEL_ID and domain
cp cloudflared/config.yml $HOME/.cloudflared/config.yml
# Edit $HOME/.cloudflared/config.yml with real values

# Create DNS record
cloudflared tunnel route dns minishinobi-dashboard dashboard.yourdomain.com
```

### 8. Build the frontend

```bash
cd frontend
npm run build
cd ..
```

### 9. Start everything with PM2

```bash
pkill nginx 2>/dev/null; true
pm2 start ecosystem.config.js
pm2 status
```

### 10. Auto-start on Termux launch

```bash
pm2 save
echo 'pm2 resurrect --silent 2>/dev/null &' >> ~/.bashrc
```

---

## Configuration

### GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** MiniShinobi
   - **Homepage URL:** `https://dashboard.yourdomain.com`
   - **Authorization callback URL:** `https://dashboard.yourdomain.com/auth/github/callback`
3. Copy the **Client ID** and **Client Secret** into `backend/.env`

### Cloudflare SSL/TLS

In Cloudflare Dashboard:
1. **SSL/TLS** → Set mode to **Full (strict)**
2. **SSL/TLS → Edge Certificates** → Enable:
   - Always Use HTTPS
   - Minimum TLS Version: TLS 1.2

### Battery & Performance Tuning

For server-grade uptime:

```bash
# Keep Termux alive with screen off
termux-wake-lock

# ACC (Advanced Charging Controller) — if using Magisk
acc -s capacity=30-85
acc -s temperature_cooldown=40-45
acc -s temperature_max=50

# Add 1 GB swap (recommended for builds)
su -c "dd if=/dev/zero of=/data/swapfile bs=1M count=1024"
su -c "mkswap /data/swapfile"
su -c "swapon /data/swapfile"
```

Also go to **Android Settings → Apps → Termux → Battery → Unrestricted**.

---

## Usage

### Dashboard

Navigate to `https://dashboard.yourdomain.com` and sign in with GitHub.

### Creating a Project

1. Click **+ New Project**
2. Enter the GitHub repository URL (HTTPS)
3. Configure branch, install/build commands, and output directory
4. Click **Deploy**

### Deployment

When you click **Deploy Now**:
1. The repo is cloned with `git clone --depth 1`
2. Commit SHA and message are captured
3. Install command runs (e.g., `npm install`)
4. Build command runs (e.g., `npm run build`)
5. A free port is assigned (5000–5999)
6. The output is served (static via `serve`, or Node app via `npm start`)
7. A Cloudflare tunnel is created for the deployment
8. The deployment goes **live** at `project-slug.yourdomain.com`

### PM2 Commands

```bash
pm2 status                      # View all processes
pm2 logs minishinobi-backend    # View backend logs
pm2 logs minishinobi-tunnel     # View tunnel logs
pm2 restart minishinobi-backend # Restart backend
pm2 monit                       # Real-time monitoring
pm2 stop all                    # Stop everything
```

---

## Project Structure

```
minishinobi/
├── ecosystem.config.js          PM2 process manager config
├── nginx/
│   └── nginx.conf               Nginx reverse proxy config
├── cloudflared/
│   └── config.yml               Cloudflare tunnel config template
├── backend/
│   ├── .env                     Environment variables (gitignored)
│   ├── .env.example             Template for .env
│   ├── package.json
│   ├── db/
│   │   ├── schema.sql           SQLite schema (runs on every boot)
│   │   ├── minishinobi.sqlite   Database file (gitignored)
│   │   └── sessions/            Session files (gitignored)
│   └── src/
│       ├── app.js               Express entrypoint + boot sequence
│       ├── db.js                sql.js loader + disk persistence
│       ├── dbHelpers.js         prepare().get/all/run() wrapper
│       ├── deployer.js          Build + serve + tunnel engine
│       ├── portManager.js       Free port finder (5000–5999)
│       └── routes/
│           ├── auth.js          GitHub OAuth routes
│           ├── projects.js      CRUD for projects
│           └── deployments.js   Deploy, logs SSE, stop
├── frontend/
│   ├── package.json
│   ├── index.html               SPA entry point
│   ├── vite.config.js           Vite config with dev proxy
│   ├── public/
│   │   └── mini-shinobi.png     Logo
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              Router + auth guard
│       ├── api.js               Axios API client
│       ├── index.css            Tailwind + theme
│       ├── context/
│       │   └── AuthContext.jsx  Auth state provider
│       ├── components/
│       │   ├── Layout.jsx       App shell with nav
│       │   └── ui/
│       │       ├── Badge.jsx    Status badge component
│       │       ├── Button.jsx   Button variants
│       │       ├── Input.jsx    Form input component
│       │       └── Modal.jsx    Dialog modal
│       └── pages/
│           ├── Login.jsx        GitHub OAuth login
│           ├── Dashboard.jsx    Project list + create
│           ├── Project.jsx      Deployments list
│           └── Deployment.jsx   Live build logs
├── deployments/                 Git clones + build artifacts (gitignored)
├── tunnels/                     Tunnel state (gitignored)
└── logs/                        PM2 logs (gitignored)
```

---

## Deployment Flow

```
POST /api/deployments/project/:id/deploy
  │
  ├── INSERT deployments row (status: queued)
  ├── Return 202 { deploymentId } immediately
  └── queueDeploy(deploymentId) runs in the background
        │
        ├── [wait if another build is already running]
        ├── 1. git clone --depth 1 <repo_url> into buildDir
        ├── 2. read commit SHA and message, save to DB
        ├── 3. sh -c "<install_command>"
        ├── 4. sh -c "<build_command>"
        ├── 5. getFreePort() picks next open port in 5000–5999
        ├── 6a. output_dir exists → serve -s ./output -l PORT (static)
        │   6b. no output_dir    → npm start with PORT env var (Node app)
        ├── 7. cloudflared tunnel route dns + update config.yml
        └── 8. UPDATE deployments SET status='ready', tunnel_url=...
```

All stdout/stderr from every step is:
- Line-buffered and written to the `logs` table in real time
- Pushed live to all connected SSE clients (the log viewer in the dashboard)
- Replayed from DB for any client that connects after the build finishes

---

## API Reference

All API endpoints require authentication (GitHub OAuth session).

### Auth

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/github` | Initiate GitHub OAuth login |
| GET | `/auth/github/callback` | GitHub OAuth callback |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/logout` | Logout |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| DELETE | `/api/projects/:id` | Delete a project |

### Deployments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/deployments/project/:projectId` | List deployments for a project |
| POST | `/api/deployments/project/:projectId/deploy` | Trigger a new deployment |
| GET | `/api/deployments/:id` | Get deployment details |
| GET | `/api/deployments/:id/logs` | SSE stream of build logs |
| DELETE | `/api/deployments/:id` | Stop a running deployment |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check endpoint |

---

## Database Schema

MiniShinobi uses SQLite via `sql.js` (WebAssembly). The schema is applied on every boot with `CREATE TABLE IF NOT EXISTS`:

| Table | Purpose |
|-------|---------|
| `users` | GitHub OAuth users |
| `projects` | Imported repositories with build config |
| `deployments` | Build history, status, tunnel URLs, PIDs |
| `logs` | Build log lines (stdout/stderr/system) |

---

## Troubleshooting

### "DB not initialised" error

`app.js` must boot in this order: `await initDb()` → `await initHelpers()` → `app.listen()`.

```bash
pm2 logs minishinobi-backend --lines 50
```

### Session errors (ENOENT)

```bash
mkdir -p $HOME/MiniShinobi/backend/db/sessions
pm2 restart minishinobi-backend
```

### cloudflared not connecting

```bash
cloudflared tunnel info minishinobi-dashboard
ls ~/.cloudflared/
cloudflared tunnel login
```

### Port already in use

```bash
ss -tlnp | grep 5000
kill $(lsof -t -i:5000)
```

### Termux getting killed by Android

```bash
termux-wake-lock
# Settings → Apps → Termux → Battery → Unrestricted
```

### Build OOM (out of memory)

```bash
free -h
pkill -f 'node'
# Set up swap — see Battery & Performance Tuning section
```

### GitHub OAuth redirect mismatch

Both `GITHUB_CALLBACK_URL` in `.env` and the setting in the GitHub OAuth App must match exactly:
```
https://dashboard.yourdomain.com/auth/github/callback
```

### Nginx failing to start

```bash
nginx -t
cat $PREFIX/var/log/nginx/error.log
pkill nginx && nginx
```

### PM2 not surviving Termux restart

```bash
pm2 save
grep "pm2 resurrect" ~/.bashrc
# If missing:
echo 'pm2 resurrect --silent 2>/dev/null &' >> ~/.bashrc
```

### Inspect the database manually

```bash
sqlite3 $HOME/MiniShinobi/backend/db/minishinobi.sqlite ".tables"
sqlite3 $HOME/MiniShinobi/backend/db/minishinobi.sqlite \
  "SELECT id, status, tunnel_url FROM deployments ORDER BY id DESC LIMIT 5;"
```

---

## Why pure JavaScript?

Termux on ARM Android cannot reliably compile native Node.js addons. MiniShinobi avoids this entirely:

| Typical Dependency | MiniShinobi Alternative | Why |
|---|---|---|
| `better-sqlite3` | `sql.js` | WebAssembly SQLite — zero native compilation |
| `connect-sqlite3` | `session-file-store` | Pure JS, stores sessions as JSON files |
| `node-pty` | `child_process.spawn` | Built-in Node.js, no native deps |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Create a branch** for your feature: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feat/amazing-feature`
5. **Open a Pull Request**

### Development

For local development (not on Android):

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env
# Edit .env with your values
node src/app.js

# Terminal 2 — Frontend (with hot reload)
cd frontend
npm run dev
```

The Vite dev server proxies `/api` and `/auth` requests to `localhost:3000`.

---

## License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Built with ❤️ by bhaumic <br />on a Snapdragon 660 · 4 GB RAM · PixelExperience Android 13</sub><br />
  <sub>Zero native compilation: sql.js + session-file-store + child_process (built-in)</sub>
</p>
