# AI Web Observatory Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a machine-first AI web access registry with callable tools and
privacy-preserving request analytics.

**Architecture:** A dependency-light TypeScript Cloudflare Worker performs
server-side routing, renders all public formats, and records request events to
D1 without storing raw IP addresses. Pure modules hold the catalog,
classification, robots linting, and rendering logic so behavior can be tested
with Vitest outside the Cloudflare runtime.

**Tech Stack:** TypeScript, Cloudflare Workers, Cloudflare D1, Vitest, Wrangler.

---

## File Map

- `package.json`: scripts and pinned development dependencies.
- `tsconfig.json`: strict TypeScript configuration.
- `wrangler.jsonc`: Worker configuration and D1 binding.
- `schema.sql`: D1 request-event schema and indexes.
- `src/types.ts`: shared registry, classification, and environment types.
- `src/catalog.ts`: authoritative initial registry and changelog.
- `src/classify.ts`: user-agent and AI referral classification.
- `src/robots-lint.ts`: robots policy parser and diagnostics.
- `src/render.ts`: response and representation helpers.
- `src/analytics.ts`: hashing, event writes, and aggregate stats.
- `src/router.ts`: all public and admin routes.
- `src/index.ts`: Worker entry point.
- `test/*.test.ts`: behavior and contract tests.
- `scripts/smoke.mjs`: deployed-host smoke test.
- `README.md`: operation, deployment, measurement, and experiment workflow.

### Task 1: Project Foundation

- [ ] Create `package.json`, `tsconfig.json`, and `wrangler.jsonc`.
- [ ] Install exact dependencies with `npm install`.
- [ ] Add `npm test`, `npm run typecheck`, `npm run dev`, `npm run deploy`, and
  `npm run smoke` scripts.
- [ ] Run `npm test` and confirm the empty suite succeeds before behavior tests.
- [ ] Commit the foundation.

### Task 2: Request Classification

- [ ] Write failing tests for OAI-SearchBot, GPTBot, ChatGPT-User, common search
  crawlers, ordinary browsers, unknown clients, and ChatGPT referral signals.
- [ ] Run `npm test -- test/classify.test.ts` and confirm failure because
  `classifyRequest` does not exist.
- [ ] Implement typed, case-insensitive deterministic matching in
  `src/classify.ts`.
- [ ] Run the focused test and full suite; confirm both pass.
- [ ] Commit classification.

The public API is:

```ts
export function classifyRequest(input: {
  userAgent: string;
  referer: string;
  url: string;
}): RequestClassification;
```

### Task 3: Registry and Public Representations

- [ ] Write failing contract tests for manifest, registry list, detail,
  `robots.txt`, sitemap, `llms.txt`, full text, RSS, OpenAPI, and agent card.
- [ ] Run `npm test -- test/routes.test.ts` and confirm missing-route failures.
- [ ] Implement the typed catalog and format renderers.
- [ ] Implement route handling with correct content types, canonical URLs,
  `ETag`, cache headers, and JSON error shapes.
- [ ] Run focused and full tests; confirm pass.
- [ ] Commit public resources.

Every registry record contains:

```ts
type RegistryEntry = {
  slug: string;
  operator: string;
  product: string;
  userAgent: string;
  purpose: "search" | "training" | "user-action" | "search-control";
  robotsToken: string;
  description: string;
  sourceUrl: string;
  sourceTitle: string;
  verifiedOn: string;
};
```

### Task 4: Callable Agent Tools

- [ ] Write failing tests for valid and invalid user-agent classifier requests.
- [ ] Write failing tests for robots policies that allow, block, or omit
  OAI-SearchBot and GPTBot.
- [ ] Run focused tests and confirm behavior failures.
- [ ] Implement `POST /api/v1/tools/classify-user-agent`.
- [ ] Implement `POST /api/v1/tools/lint-robots` with bounded body size and
  structured diagnostics.
- [ ] Re-run focused and full tests; confirm pass.
- [ ] Commit tools.

Tool errors use:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "userAgent must be a non-empty string"
  }
}
```

### Task 5: Privacy-Preserving Analytics

- [ ] Write failing tests for daily identity hashing, event writes, logging
  failure isolation, and admin authorization.
- [ ] Run focused tests and confirm missing analytics behavior.
- [ ] Add `schema.sql` with `request_events` and indexes on timestamp,
  classification, path, and identity hash.
- [ ] Implement coarse IP-prefix normalization and daily salted SHA-256 hashes.
- [ ] Implement D1 inserts through `ctx.waitUntil`.
- [ ] Implement bearer-protected aggregate stats for 1-31 day windows.
- [ ] Re-run focused and full tests; confirm pass.
- [ ] Commit analytics.

The stored event excludes raw IP and contains:

```ts
{
  occurredAt: string;
  day: string;
  identityHash: string;
  path: string;
  method: string;
  status: number;
  contentType: string;
  category: string;
  matchedIdentity: string | null;
  country: string | null;
  refererHost: string | null;
  utmSource: string | null;
}
```

### Task 6: Documentation and Local Verification

- [ ] Add deployment, D1 migration, secret setup, smoke testing, and weekly
  reporting instructions to `README.md`.
- [ ] Add `scripts/smoke.mjs` to fetch every public machine endpoint and fail
  on status, content-type, or empty-body errors.
- [ ] Run `npm test`, `npm run typecheck`, and Wrangler dry-run.
- [ ] Start the local worker and run the smoke script against it.
- [ ] Commit documentation and verification.

### Task 7: Public Launch

- [ ] Authenticate Wrangler with the owner's Cloudflare account.
- [ ] Create the D1 database and replace the generated database ID in
  `wrangler.jsonc`.
- [ ] Apply `schema.sql` remotely.
- [ ] Add randomly generated `ANALYTICS_SALT` and `ADMIN_TOKEN` secrets.
- [ ] Deploy to the assigned `workers.dev` hostname.
- [ ] Run the smoke script against production.
- [ ] Submit canonical URLs through IndexNow.
- [ ] Create a public GitHub repository and push the verified source.
- [ ] Record the launch timestamp and production URL in `README.md`.

### Task 8: First Measurement Loop

- [ ] After seven complete UTC days, query `/api/admin/stats?days=7`.
- [ ] Save the unedited aggregate response under `reports/raw/`.
- [ ] Write a dated Markdown report under `reports/weekly/`.
- [ ] Select exactly one strategy change based on observed data.
- [ ] Record the hypothesis, expected metric movement, and evaluation date.

## Self-Review

- The plan covers every Phase 1 design requirement.
- No unresolved feature decisions remain before implementation.
- Cloudflare authentication is the only unavoidable owner action.
- D1 identifiers and secrets are generated during deployment and must not be
  represented by committed placeholder credentials.
