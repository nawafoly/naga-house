-- NAGA HOUSE | Admin foundation | 0001
-- Target: Cloudflare D1 (SQLite)
-- Deploy policy: test locally first; do not apply to the remote D1 database without review.
-- No admin user is seeded here. Owner bootstrap must require verified Google OAuth identity.

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY NOT NULL,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor'
    CHECK (role IN ('owner', 'admin', 'editor')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  admin_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_sessions_user ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE events (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL CHECK (length(trim(title_ar)) > 0),
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL CHECK (length(trim(category)) > 0),
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  latitude REAL CHECK (latitude BETWEEN -90 AND 90),
  longitude REAL CHECK (longitude BETWEEN -180 AND 180),
  start_at TEXT,
  end_at TEXT,
  schedule_label TEXT,
  amount_from REAL CHECK (amount_from >= 0),
  currency TEXT NOT NULL DEFAULT 'SAR' CHECK (currency = 'SAR'),
  ticket_provider TEXT NOT NULL
    CHECK (ticket_provider IN ('webook', 'ticketmx', 'platinumlist', 'nofomo', 'direct', 'other')),
  ticket_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'sold_out', 'cancelled', 'ended')),
  published_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (start_at IS NOT NULL OR (schedule_label IS NOT NULL AND length(trim(schedule_label)) > 0))
);

CREATE INDEX idx_events_listing ON events(status, deleted_at, start_at);
CREATE INDEX idx_events_featured ON events(featured, status, deleted_at);
CREATE INDEX idx_events_category ON events(category, status, deleted_at);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  alt_text TEXT,
  uploaded_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE admin_audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  actor_admin_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (actor_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_audit_entity ON admin_audit_logs(entity_type, entity_id, created_at);
CREATE INDEX idx_admin_audit_actor ON admin_audit_logs(actor_admin_id, created_at);
