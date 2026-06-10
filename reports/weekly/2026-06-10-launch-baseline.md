# AI Web Observatory Launch Baseline

## Status

- Production URL: https://ai-web-observatory.aipmm.workers.dev
- Measurement start: `2026-06-10T11:49:05Z`
- Initial deployed version: `0f3dcf52-9dc3-4a45-ac13-62b0ce71417d`
- Launch documentation version: `1d2cd5a9-ca40-4eff-b822-c967d561790d`
- Corrected analytics version: `bc593727-92c0-45d6-a6a1-af3361e6364f`
- Database: Cloudflare D1 `ai-web-observatory`

## Verification

- 45 automated tests passed.
- TypeScript strict type checking passed.
- Worker production bundle validation passed.
- 15 production smoke checks passed.
- D1 request writes and aggregate statistics were verified before launch.
- The initial analytics implementation rotated its only identity hash daily,
  making cross-day repeat measurement impossible. The implementation was
  corrected before the first reporting window.
- All events written before the corrected measurement start were deleted.
- Internal smoke checks and admin statistics reads are excluded from logging.
- Events now retain a daily pseudonymous hash for daily uniqueness and a
  stable salted coarse-identity hash for cross-day repeats.
- A daily Cron Trigger deletes events older than 45 days.

## Discovery

- `robots.txt` explicitly allows documented AI search, training, and
  user-directed identities.
- `sitemap.xml` lists 25 canonical URLs.
- `llms.txt`, `llms-full.txt`, OpenAPI, RSS, JSON registry, JSON-LD, and an
  agent card are public.
- IndexNow accepted all 25 canonical URLs with HTTP `202` on
  `2026-06-10`.
- The GitHub repository homepage points to production.

## Baseline Data

The production event table was empty at `2026-06-10T11:49:05Z` immediately
after the corrected analytics deployment. No AI or search traffic is claimed
at the corrected measurement start.

All future user-agent matches remain explicitly labelled as claimed identities
until network-origin verification is added.

## First Review

The first review is scheduled for `2026-06-17 21:00` UTC+8, after seven full
days. It will not make a strategy change unless the data is sufficient to
evaluate one.
