ALTER TABLE request_events
  ADD COLUMN stable_identity_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_request_events_stable_identity
  ON request_events (stable_identity_hash, day)
  WHERE qualified_ai = 1;
