# MiniShinobi CLI Guide

This guide explains how to install, configure, and use the `minishinobi` CLI.

## 1. What the CLI does

The CLI is a thin client over the MiniShinobi controller HTTP API.

Flow:

CLI -> HTTP API -> MiniShinobi Controller -> Process Manager -> Apps

It supports:

- Deploying repositories
- Listing deployed apps
- Streaming logs
- Restarting/stopping apps
- Removing apps

## 2. Prerequisites

- Node.js 18+
- npm
- A running MiniShinobi backend server (default: `http://localhost:3000`)

## 3. Install the CLI

From the project root:

```bash
cd cli
npm install
npm install -g .
```

Verify install:

```bash
minishinobi --help
```

## 4. Configure the server

Default server is `http://localhost:3000`.

Set custom server:

```bash
minishinobi config set-server http://your-server:3000
```

Show active config:

```bash
minishinobi config show
```

Config file location:

`~/.minishinobi/config.json`

Example:

```json
{
  "server": "http://localhost:3000"
}
```

## 5. Authentication notes

`POST /deploy` supports CLI mode with body `{ "repo": "..." }`.

If MiniShinobi server has `WEBHOOK_SECRET` configured, CLI deploy requests should include it via environment variable:

```bash
export MINISHINOBI_SECRET="your-secret"
```

On Windows PowerShell:

```powershell
$env:MINISHINOBI_SECRET = "your-secret"
```

## 6. Commands

### Deploy a repository

```bash
minishinobi deploy https://github.com/user/project
```

Options:

- `--ref <git-ref>` (default: `refs/heads/main`)
- `--no-follow` (queue deployment without log streaming)

Examples:

```bash
minishinobi deploy https://github.com/user/project --ref refs/heads/develop
minishinobi deploy https://github.com/user/project --no-follow
```

### List apps

```bash
minishinobi apps
```

Shows project, port, status, and host.

### Stream logs

```bash
minishinobi logs <project>
```

Optional:

```bash
minishinobi logs <project> --deployment-id <id>
```

Press `Ctrl+C` to stop streaming.

### Restart app

```bash
minishinobi restart <project>
```

### Stop app

```bash
minishinobi stop <project>
```

### Remove app

```bash
minishinobi remove <project>
```

Remove performs:

- Stop process
- Remove app directory
- Remove generated Nginx config
- Reload Nginx
- Remove runtime registry entry

## 7. Environment variables

- `MINISHINOBI_HOST`: override server URL (takes priority over config file)
- `MINISHINOBI_SECRET`: sends `x-minishinobi-secret` header for CLI deploy mode

Examples:

```bash
MINISHINOBI_HOST=http://10.0.0.5:3000 minishinobi apps
MINISHINOBI_HOST=http://10.0.0.5:3000 MINISHINOBI_SECRET=abc123 minishinobi deploy https://github.com/user/project
```

## 8. Typical workflow

1. `minishinobi deploy https://github.com/user/project`
2. `minishinobi apps`
3. `minishinobi logs project`
4. `minishinobi restart project` (if needed)
5. `minishinobi remove project` (when decommissioning)

## 9. Troubleshooting

### Server unreachable

- Check backend is running
- Confirm `minishinobi config show`
- Override explicitly with `MINISHINOBI_HOST`

### Deploy returns 401

- Set `MINISHINOBI_SECRET` to match server `WEBHOOK_SECRET`

### Project not found

- Verify project name from `minishinobi apps`
- Ensure deployment completed before using `restart/stop/remove`

### No logs appear

- Ensure at least one deployment exists for that project
- Try `minishinobi logs <project> --deployment-id <id>`

### CLI command not found

- Ensure global install completed: `npm install -g .` from `cli/`
- Check npm global bin path is in your `PATH`

## 10. Developer notes

CLI source layout:

```text
cli/
├── index.js
├── commands/
│   ├── deploy.js
│   ├── apps.js
│   ├── logs.js
│   ├── restart.js
│   ├── stop.js
│   └── remove.js
└── utils/
    ├── apiClient.js
    └── config.js
```

