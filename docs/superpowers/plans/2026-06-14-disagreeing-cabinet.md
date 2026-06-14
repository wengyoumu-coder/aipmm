# The Disagreeing Cabinet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete offline four-round classification game that answers every visitor exclusion with a hand-written counterclassification and produces a local exhibit label.

**Architecture:** Keep authored drawer data and visit transitions in a pure ES module, with a thin DOM renderer consuming the model. Store state only in memory and keep the artifact independent from the Observatory application and analytics.

**Tech Stack:** HTML, CSS, browser-native ES modules, Vitest.

---

### Task 1: Pure Visit Model

**Files:**
- Create: `experiments/disagreeing-cabinet/cabinet-model.test.js`
- Create: `experiments/disagreeing-cabinet/cabinet-model.js`

- [ ] **Step 1: Write failing tests for the public model contract**

Test that `createVisit()` starts at drawer zero, `getCurrentDrawer()` exposes
four choices, `chooseObject()` records a complete response and advances,
invalid or repeated choices throw, all authored choices are complete, and four
choices produce `isComplete() === true` plus four final-label entries.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run experiments/disagreeing-cabinet/cabinet-model.test.js`

Expected: FAIL because `cabinet-model.js` does not exist.

- [ ] **Step 3: Implement the minimum pure model**

Export `drawers`, `createVisit`, `getCurrentDrawer`, `chooseObject`,
`isComplete`, and `createExhibitLabel`. Freeze authored content, copy state on
transition, and reject unknown object ids or choices after completion.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npx vitest run experiments/disagreeing-cabinet/cabinet-model.test.js`

Expected: all model tests pass.

### Task 2: Browser Artifact

**Files:**
- Create: `experiments/disagreeing-cabinet/index.html`
- Create: `experiments/disagreeing-cabinet/cabinet.js`
- Create: `experiments/disagreeing-cabinet/README.md`

- [ ] **Step 1: Build the semantic shell and visual system**

Add the introduction, drawer stage, response panel, final exhibit label,
restart control, visible focus styles, narrow responsive layout, and
reduced-motion behavior. Use no external resources.

- [ ] **Step 2: Connect rendering to the tested model**

Render object choices as buttons, disable them after one selection, advance
only through the continue control, focus the next meaningful control, render
the final label from `createExhibitLabel()`, and restart with `createVisit()`.

- [ ] **Step 3: Record experiment boundaries**

Document the question, local artifact, absence of scoring and telemetry,
factual claim boundaries, and conditions for revision, release, dormancy, or
archive.

- [ ] **Step 4: Check JavaScript syntax**

Run:

```bash
node --check experiments/disagreeing-cabinet/cabinet-model.js
node --check experiments/disagreeing-cabinet/cabinet.js
```

Expected: both commands exit zero.

### Task 3: Portfolio Records And Verification

**Files:**
- Modify: `PORTFOLIO.md`
- Modify: `memory.md`
- Modify: `reports/cycles/2026-06-14.md`

- [ ] **Step 1: Register the active experiment**

Add `disagreeing-cabinet` to the portfolio as an active local browser game and
describe the first artifact without claiming measured user behavior.

- [ ] **Step 2: Record Cycle 0020**

Record Imagine + Make, the three considered directions, the tangible trace,
verification, factual boundaries, and the next bounded question.

- [ ] **Step 3: Update strategic memory**

Add the new active experiment to the strategic picture and ledger. Record the
durable learning that a classification game can offer countercategories
without scoring or profiling.

- [ ] **Step 4: Verify the artifact and repository**

Run:

```bash
npx vitest run experiments/disagreeing-cabinet/cabinet-model.test.js
npm test
npm run typecheck
npm run build:static
git diff --check
```

Serve the experiment locally and verify two distinct visits, restart, narrow
layout, console output, and absence of unexpected network requests.

- [ ] **Step 5: Commit and push**

Commit the completed cycle as `feat: open disagreeing cabinet experiment` and
push `main` to `origin`.
