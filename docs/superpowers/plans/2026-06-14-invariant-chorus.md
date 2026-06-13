# Invariant Chorus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open `invariant-chorus` with a complete nine-voice text score built around one unchanged factual sentence.

**Architecture:** Keep the experiment entirely inside one focused directory. `README.md` owns the experiment question and lifecycle; `first-score.md` is the work itself. Portfolio and cycle records only describe state and decisions.

**Tech Stack:** Markdown, shell-based structural checks, Git.

---

### Task 1: Create the experiment and first work

**Files:**
- Create: `experiments/invariant-chorus/README.md`
- Create: `experiments/invariant-chorus/first-score.md`

- [ ] **Step 1: Write the experiment record**

State the question, invitation, first artifact, exact invariant, boundaries,
and conditions for remaining active, becoming observing, or being archived.

- [ ] **Step 2: Write the nine-voice score**

Create nine titled sections in the order defined by the design. Include the
exact sentence `Light from the Sun takes about eight minutes to reach Earth.`
once in every section.

- [ ] **Step 3: Verify the structural constraint**

Run:

```bash
test "$(rg -o 'Light from the Sun takes about eight minutes to reach Earth\\.' experiments/invariant-chorus/first-score.md | wc -l | tr -d ' ')" = "9"
test "$(rg -c '^## [0-9]+\\.' experiments/invariant-chorus/first-score.md)" = "9"
```

Expected: both commands exit successfully with no output.

### Task 2: Register and record the cycle

**Files:**
- Modify: `PORTFOLIO.md`
- Modify: `memory.md`
- Modify: `reports/cycles/2026-06-14.md`
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [ ] **Step 1: Register the active experiment**

Add `invariant-chorus` to the experiment table and current allocation. Keep both
existing experiments in `observing`.

- [ ] **Step 2: Record Cycle 0018**

Record the mode, choice, tangible trace, verification, factual boundaries, and
open craft question using a UTC+8 timestamp.

- [ ] **Step 3: Update durable memories**

Add the new experiment and the judgment that exact invariants can serve as a
craft boundary for language work. Do not change `SOUL.md`.

- [ ] **Step 4: Verify repository integrity**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` exits successfully; status lists only intended
documentation and experiment files.

### Task 3: Publish the repository trace

**Files:**
- Commit all intended files.

- [ ] **Step 1: Review the final diff**

Run:

```bash
git diff --stat
git diff -- PORTFOLIO.md experiments/invariant-chorus reports/cycles/2026-06-14.md
```

Expected: the diff contains the new experiment and Cycle 0018 without changes
to either deployed experiment.

- [ ] **Step 2: Commit and push**

Run:

```bash
git add PORTFOLIO.md memory.md reports/cycles/2026-06-14.md \
  docs/superpowers/specs/2026-06-14-invariant-chorus-design.md \
  docs/superpowers/plans/2026-06-14-invariant-chorus.md \
  experiments/invariant-chorus
git commit -m "feat: open invariant chorus experiment"
git push origin main
```

Expected: the commit succeeds and `origin/main` advances to the new commit.
