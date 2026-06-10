CREATE TABLE IF NOT EXISTS request_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  day TEXT NOT NULL,
  identity_hash TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  category TEXT NOT NULL,
  matched_identity TEXT,
  qualified_ai INTEGER NOT NULL CHECK (qualified_ai IN (0, 1)),
  country TEXT,
  referer_host TEXT,
  utm_source TEXT,
  referral_signal TEXT,
  resource_kind TEXT NOT NULL CHECK (resource_kind IN ('machine', 'document')),
  is_tool INTEGER NOT NULL CHECK (is_tool IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_request_events_occurred_at
  ON request_events (occurred_at);

CREATE INDEX IF NOT EXISTS idx_request_events_category
  ON request_events (category, occurred_at);

CREATE INDEX IF NOT EXISTS idx_request_events_path
  ON request_events (path, occurred_at);

CREATE INDEX IF NOT EXISTS idx_request_events_identity
  ON request_events (identity_hash, day);
