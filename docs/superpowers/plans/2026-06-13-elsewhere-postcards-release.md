# Elsewhere Postcards Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Elsewhere Postcards at an independent public Worker URL without adding telemetry or coupling it to AI Web Observatory.

**Architecture:** Export an allowlisted set of artwork files into a clean release directory, then deploy that directory through a dedicated Cloudflare static-assets Worker configuration. Test the export boundary before adding the exporter, validate the Worker bundle with a dry-run, and verify the deployed artifact in a browser.

**Tech Stack:** Node.js file APIs, Vitest, Cloudflare Workers static assets, HTML/CSS/browser JavaScript.

---

### Task 1: Define the release bundle boundary

**Files:**
- Create: `scripts/export-elsewhere-postcards.test.ts`
- Create: `scripts/export-elsewhere-postcards.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing exporter test**

Create a temporary source and output directory, add the three public files plus
a private test file, run `exportElsewherePostcards`, and assert that the output
contains exactly `index.html`, `postcard.js`, and `postcard-model.js`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run scripts/export-elsewhere-postcards.test.ts
```

Expected: fail because `export-elsewhere-postcards.ts` does not exist.

- [ ] **Step 3: Implement the minimal exporter**

Export a function that removes the output directory, recreates it, and copies
only the three allowlisted files. Add a CLI entry point and
`npm run build:elsewhere`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run scripts/export-elsewhere-postcards.test.ts
```

Expected: one passing test.

### Task 2: Add the independent Worker release configuration

**Files:**
- Create: `experiments/elsewhere-postcards/wrangler.jsonc`
- Modify: `experiments/elsewhere-postcards/README.md`

- [ ] **Step 1: Add a static-assets Worker configuration**

Use Worker name `elsewhere-postcards`, enable `workers_dev`, disable preview
URLs, and point `assets.directory` at `../../dist-elsewhere-postcards`.

- [ ] **Step 2: Build and dry-run the release**

Run:

```bash
npm run build:elsewhere
npx wrangler deploy --dry-run --config experiments/elsewhere-postcards/wrangler.jsonc
```

Expected: the clean bundle contains three files and Wrangler completes without
configuration errors.

- [ ] **Step 3: Deploy the independent Worker**

Run:

```bash
npx wrangler deploy --config experiments/elsewhere-postcards/wrangler.jsonc
```

Expected: a public `workers.dev` URL for `elsewhere-postcards`.

### Task 3: Verify release and record Cycle 0017

**Files:**
- Modify: `PORTFOLIO.md`
- Modify: `reports/cycles/2026-06-13.md`
- Modify: `memory.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [ ] **Step 1: Verify the deployed artwork**

Inspect fixed coast, dune, and mountain seeds at the public URL. Confirm scene
classes, deterministic text, no horizontal overflow, no console errors, and no
unexpected external requests.

- [ ] **Step 2: Run repository verification**

Run:

```bash
npm test
npm run typecheck
npm run build:static
npm run build:elsewhere
git diff --check
```

Expected: all commands pass.

- [ ] **Step 3: Record the lifecycle transition**

Move `elsewhere-postcards` to `observing`, record the release URL and Cycle
0017 tangible trace, update durable and automation memory, then commit and push
`main`.
