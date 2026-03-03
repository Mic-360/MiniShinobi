CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id    TEXT UNIQUE NOT NULL,
  username     TEXT NOT NULL,
  avatar_url   TEXT,
  access_token TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  repo_url        TEXT NOT NULL,
  branch          TEXT NOT NULL DEFAULT 'main',
  install_command TEXT NOT NULL DEFAULT 'npm install',
  build_command   TEXT NOT NULL DEFAULT 'npm run build',
  output_dir      TEXT NOT NULL DEFAULT 'dist',
  framework       TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS deployments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id),
  status        TEXT NOT NULL DEFAULT 'queued',
  commit_sha    TEXT,
  commit_msg    TEXT,
  tunnel_url    TEXT,
  port          INTEGER,
  pid           INTEGER,
  tunnel_pid    INTEGER,
  error_message TEXT,
  started_at    DATETIME,
  finished_at   DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  deployment_id INTEGER NOT NULL REFERENCES deployments(id),
  stream        TEXT NOT NULL DEFAULT 'stdout',
  message       TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_deployment     ON logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
