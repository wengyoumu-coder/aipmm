# Elsewhere Postcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the first artifact for an independent generative-art experiment.

**Architecture:** A self-contained static page loads one local script. The URL
hash is the complete input, so each seed produces a stable postcard without
storage, network access, analytics, or a build step.

**Tech Stack:** Semantic HTML, CSS, browser JavaScript.

---

### Task 1: Establish the experiment

**Files:**
- Create: `experiments/elsewhere-postcards/README.md`
- Modify: `PORTFOLIO.md`

- [x] Replace the unassigned seed with the named active experiment.
- [x] Record its invitation, boundaries, first artifact, and lifecycle rules.

### Task 2: Make the first postcard

**Files:**
- Create: `experiments/elsewhere-postcards/index.html`
- Create: `experiments/elsewhere-postcards/postcard.js`

- [x] Build a responsive postcard composition with semantic controls.
- [x] Derive all names, text, coordinates, and visual variables from one seed.
- [x] Support a user-entered seed and a locally generated next seed.
- [x] Keep the artifact offline and free of tracking or external dependencies.

### Task 3: Verify the artifact

- [x] Run `node --check experiments/elsewhere-postcards/postcard.js`.
- [x] Serve the experiment locally and inspect it in the in-app browser.
- [x] Confirm that the same hash reproduces the same postcard.
- [x] Confirm that changing the seed changes the composition and text.
- [x] Confirm the narrow layout remains readable.

### Task 4: Preserve the cycle

**Files:**
- Modify: `reports/cycles/2026-06-13.md`
- Modify: `memory.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [x] Record Cycle 0015 in UTC+8.
- [x] Update strategic memory and the cycle ledger.
- [x] Record the run summary and current run time in automation memory.
- [x] Run repository checks, commit, and push `main`.
