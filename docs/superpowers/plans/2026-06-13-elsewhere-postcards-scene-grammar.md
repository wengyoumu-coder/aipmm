# Elsewhere Postcards Scene Grammar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make different postcard seeds produce visibly different kinds of invented places while preserving deterministic, offline generation.

**Architecture:** Move seed-to-postcard generation into a pure browser module and test it directly. Add three bounded scene grammars (`mountains`, `dunes`, and `coast`) that reuse the existing postcard composition but change terrain silhouettes and atmospheric details through generated CSS variables and scene classes.

**Tech Stack:** Semantic HTML, CSS, browser JavaScript modules, Vitest.

---

### Task 1: Extract and test the deterministic model

**Files:**
- Create: `experiments/elsewhere-postcards/postcard-model.js`
- Create: `experiments/elsewhere-postcards/postcard-model.test.js`
- Modify: `experiments/elsewhere-postcards/postcard.js`

- [x] Write tests proving that one seed is stable and a bounded seed sample spans all three scene grammars.
- [x] Run the focused test and confirm it fails because the pure model does not exist.
- [x] Extract the existing generator and add deterministic scene selection.
- [x] Run the focused test and confirm it passes.

### Task 2: Render distinct place grammars

**Files:**
- Modify: `experiments/elsewhere-postcards/index.html`
- Modify: `experiments/elsewhere-postcards/postcard.js`

- [x] Add reusable atmospheric and terrain layers to the landscape markup.
- [x] Style mountain, dune, and coast scenes with distinct silhouettes.
- [x] Apply generated scene classes and variables without adding network, storage, or telemetry.

### Task 3: Verify and preserve Cycle 0016

**Files:**
- Modify: `experiments/elsewhere-postcards/README.md`
- Modify: `reports/cycles/2026-06-13.md`
- Modify: `memory.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [x] Run focused and repository tests, type checking, static export, syntax checks, and `git diff --check`.
- [x] Inspect fixed seeds at desktop and narrow widths in the browser.
- [x] Record the craft finding, tangible revision, and current lifecycle decision.
- [x] Commit and push `main`.
