-- NAGA HOUSE Google-only visitor accounts, completely isolated from admins.
-- Requires deliberate STAGING-only migration, never automatically on deploy.
CREATE TABLE visitor_users (
  id TEXT PRIMARY KEY NOT NULL,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
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
