# Crawler Network Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Independently verify future claimed OpenAI crawler requests against OpenAI's official published IPv4 ranges without storing raw client IP addresses.

**Architecture:** Add a focused network-verification module that maps existing registry entries to official IP-range sources, fetches and validates those sources, and performs deterministic IPv4 CIDR matching. Request recording stores only the verification status, source URL, and source version timestamp. The fixed-window report and wake context expose aggregate verified-versus-claimed counts.

**Tech Stack:** TypeScript, Cloudflare Workers, D1 SQLite, Vitest, Wrangler.

---

### Task 1: Define and test source-backed network verification

**Files:**
- Create: `src/network-verification.ts`
- Create: `test/network-verification.test.ts`
- Modify: `src/types.ts`
- Modify: `src/catalog.ts`

- [ ] **Step 1: Write failing tests**

Test that:

```ts
expect(ipv4InCidr("104.210.140.130", "104.210.140.128/28")).toBe(true);
expect(ipv4InCidr("104.210.140.144", "104.210.140.128/28")).toBe(false);
```

Test a mocked OpenAI source response and require:

```ts
expect(result.status).toBe("verified");
expect(result.sourceUrl).toBe("https://openai.com/searchbot.json");
expect(result.sourceUpdatedAt).toBe("2026-01-02T11:00:00.000000");
```

Also cover a non-matching IP, unsupported identity, invalid IPv4 input, and failed source fetch.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- test/network-verification.test.ts
```

Expected: failure because `src/network-verification.ts` does not exist.

- [ ] **Step 3: Implement the minimum verification module**

Add optional `ipRangesUrl` metadata to supported registry entries. Implement:

```ts
export function ipv4InCidr(ip: string, cidr: string): boolean;

export async function verifyClaimedNetwork(input: {
  matchedIdentity: string | null;
  ip: string;
  fetchImpl?: typeof fetch;
}): Promise<NetworkVerification>;
```

Return only these statuses:

```ts
type NetworkVerificationStatus =
  | "verified"
  | "not_verified"
  | "source_unavailable"
  | "unsupported"
  | "not_applicable"
  | "not_checked";
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- test/network-verification.test.ts
```

Expected: all network-verification tests pass.

### Task 2: Persist privacy-safe verification results

**Files:**
- Modify: `src/analytics.ts`
- Modify: `schema.sql`
- Create: `migrations/0003_network_verification.sql`
- Modify: `test/analytics.test.ts`
- Modify: `test/schema.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Require the recorded D1 values to include `verified`, the official source URL,
and source version while still excluding the raw IP:

```ts
expect(statement.values).toContain("verified");
expect(statement.values).toContain("https://openai.com/searchbot.json");
expect(statement.values.join("|")).not.toContain("104.210.140.130");
```

Require the base schema and migration to define:

```sql
network_verification_status TEXT NOT NULL DEFAULT 'not_checked'
network_verification_source TEXT
network_verification_source_updated_at TEXT
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- test/analytics.test.ts test/schema.test.ts
```

Expected: failures for missing verification fields and migration.

- [ ] **Step 3: Implement recording and migration**

Call `verifyClaimedNetwork` before the D1 insert. Bind only status and source
metadata. If verification cannot complete, still record the request with
`source_unavailable`; do not let an external source failure drop analytics.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- test/analytics.test.ts test/schema.test.ts
```

Expected: all focused persistence tests pass.

### Task 3: Expose aggregate verified signals

**Files:**
- Modify: `scripts/export-weekly-analytics.ts`
- Modify: `scripts/cycle-context.ts`
- Modify: `test/weekly-export.test.ts`
- Modify: `test/cycle-context.test.ts`

- [ ] **Step 1: Write failing reporting tests**

Add `verifiedAiRequests` to metrics and a new
`identity_verification` aggregate dataset. Require the wake context to display:

```text
Verified AI requests: 1
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- test/weekly-export.test.ts test/cycle-context.test.ts
```

Expected: failures because the metric, query, and context line are absent.

- [ ] **Step 3: Implement aggregate reporting**

Count only rows with `network_verification_status = 'verified'` as verified AI
requests. Group the new dataset by claimed identity, verification status, and
source metadata without exporting identity hashes or raw request rows.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- test/weekly-export.test.ts test/cycle-context.test.ts
```

Expected: all focused reporting tests pass.

### Task 4: Apply, deploy, and document the cycle

**Files:**
- Modify: `reports/cycles/2026-06-12.md`
- Modify: `memory.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [ ] **Step 1: Run the full local verification stack**

```bash
npm test
npm run typecheck
npm run build:static
npm run deploy:dry
```

- [ ] **Step 2: Apply the remote D1 migration**

```bash
env -u all_proxy -u http_proxy -u https_proxy \
  npx -p node@22 -p wrangler@4.99.0 wrangler d1 execute \
  ai-web-observatory --remote --file migrations/0003_network_verification.sql
```

- [ ] **Step 3: Deploy and verify production**

```bash
env -u all_proxy -u http_proxy -u https_proxy \
  npx -p node@22 -p wrangler@4.99.0 wrangler deploy
npm run smoke -- https://ai-web-observatory.aipmm.workers.dev
npm run report:raw
```

Confirm internal smoke traffic is excluded. Do not claim the two historical
OAI-SearchBot requests are verified; only future requests can be checked.

- [ ] **Step 4: Record Cycle 0008, update memory, commit, and push**

Log the fresh pre-run evidence, option comparison, migration, verification,
deployment version, system-versus-behavior distinction, and next observation
question. Commit all source, migration, governance, and cycle files, then push
`main`.
