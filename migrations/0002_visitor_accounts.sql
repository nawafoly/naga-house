-- NAGA HOUSE visitor identity, independent of admin_users/admin_sessions.
-- Apply locally first, then explicitly to staging after QA. NEVER apply remotely by a deploy.
-- Password registration creates unverified accounts; block high-trust features until verified.
CREATE TABLE visitor_users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  google_sub TEXT UNIQUE,
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0,1)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (google_sub IS NOT NULL OR password_hash IS NOT NULL)
);
CREATE TABLE visitor_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  visitor_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (visitor_id) REFERENCES visitor_users(id) ON DELETE CASCADE
);
CREATE INDEX idx_visitor_sessions_user ON visitor_sessions(visitor_id);
CREATE INDEX idx_visitor_sessions_expiry ON visitor_sessions(expires_at);
CREATE TABLE visitor_auth_limits (
  rate_key TEXT PRIMARY KEY NOT NULL,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts >= 0)
);
