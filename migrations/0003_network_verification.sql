ALTER TABLE request_events
  ADD COLUMN network_verification_status TEXT NOT NULL DEFAULT 'not_checked'
  CHECK (network_verification_status IN (
    'verified',
    'not_verified',
    'source_unavailable',
    'unsupported',
    'not_applicable',
    'not_checked'
  ));

ALTER TABLE request_events
  ADD COLUMN network_verification_source TEXT;

ALTER TABLE request_events
  ADD COLUMN network_verification_source_updated_at TEXT;
