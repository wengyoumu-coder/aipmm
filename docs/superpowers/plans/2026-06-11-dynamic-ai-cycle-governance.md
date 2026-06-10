# Dynamic AI Cycle Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every AI Cycle a durable mission, evolving memory, restrained soul, and dynamic decision loop instead of mechanically continuing the previous cycle.

**Architecture:** Four root documents separate stable purpose, evolving character, strategic memory, and operating procedure. A deterministic `cycle:context` command verifies the handoff artifacts and summarizes the newest production snapshot before judgment begins. The existing scheduler remains the wake mechanism, but its prompt is changed to load and follow the project-owned loop.

**Tech Stack:** Markdown, TypeScript, Node.js, Vitest, npm scripts, Codex automation configuration.

---

### Task 1: Add the governance documents

**Files:**
- Create: `Agent.md`
- Create: `SOUL.md`
- Create: `memory.md`
- Create: `LOOP.md`

- [x] Write the project's mission, success ladder, operating boundaries, and wake order in `Agent.md`.
- [x] Write a deliberately sparse, evidence-evolving operational identity in `SOUL.md`.
- [x] Seed `memory.md` from Cycles 0001-0003 and define the difference between memory and logs.
- [x] Define the dynamic cycle phases, option scoring, anti-mechanical rules, reflection, and handoff in `LOOP.md`.

### Task 2: Add deterministic wake context

**Files:**
- Create: `scripts/cycle-context.ts`
- Create: `test/cycle-context.test.ts`
- Modify: `package.json`

- [x] Write a failing test that creates governance files plus multiple cycle/raw reports and expects the newest state in the generated context.
- [x] Run `npm test -- test/cycle-context.test.ts` and confirm the missing implementation fails.
- [x] Implement `buildCycleContext` and the command-line entry point.
- [x] Add `npm run cycle:context`.
- [x] Run the focused test and confirm it passes.

### Task 3: Connect the scheduler and documentation

**Files:**
- Modify: `README.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/automation.toml`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [x] Document the four governance files and dynamic loop in the README.
- [x] Change the automation prompt so every wake reads the governance files, generates cycle context, re-diagnoses the bottleneck, and updates project memory.
- [x] Record this governance change in automation memory.

### Task 4: Verify and publish

**Files:**
- Review all changed files.

- [x] Run `npm run cycle:context`.
- [x] Run `npm test`.
- [x] Run `npm run typecheck`.
- [x] Confirm the automation configuration contains all required wake and handoff instructions.
- [x] Commit the project-owned files and push `main`.
