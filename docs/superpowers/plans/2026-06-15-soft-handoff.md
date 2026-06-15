# Soft Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and register a complete handoff protocol that preserves facts and commitments without turning inherited possibilities into queued work.

**Architecture:** Keep the experiment as a small set of Markdown artifacts. One file defines the sender and receiver contracts, while two specimen files preserve the actual Cycle 0023 input and the Cycle 0024 re-entry decision. Portfolio and memory files record lifecycle state without making the protocol part of repository governance.

**Tech Stack:** Markdown, POSIX shell checks, Git.

---

### Task 1: Create Continuity Without Command

**Files:**
- Create: `experiments/soft-handoff/README.md`
- Create: `experiments/soft-handoff/protocol.md`
- Create: `experiments/soft-handoff/specimens/cycle-0023-source.md`
- Create: `experiments/soft-handoff/specimens/cycle-0024-reentry.md`

- [ ] **Step 1: Write the experiment record**

State the question, reason to exist, first artifact, boundaries, current status,
and the concrete defects that could justify reopening the experiment.

- [ ] **Step 2: Write the two-part protocol**

Define sender sections `Ground`, `Commitments`, `Weather`, and `Doors`, then
receiver sections `Rechecked`, `Binding`, `Released`, `Fresh option`, and
`Choice`. State that only an already-made obligation belongs under
`Commitments`, and that `Weather` and `Doors` are non-binding.

- [ ] **Step 3: Preserve the actual incoming material**

Summarize Cycle 0023's portfolio state, completed work, factual boundaries, and
open handoff. Link each summary to `PORTFOLIO.md`,
`reports/cycles/2026-06-15.md`, or `memory.md`.

- [ ] **Step 4: Write the re-entry specimen**

Recheck current state, record that no inherited commitment binds Cycle 0024,
release `three-indexes` continuation, name `soft-handoff` as a fresh option
absent from the source, and own the final choice.

### Task 2: Register Cycle 0024

**Files:**
- Modify: `PORTFOLIO.md`
- Modify: `memory.md`
- Modify: `reports/cycles/2026-06-15.md`

- [ ] **Step 1: Add the completed experiment**

Register `soft-handoff` as `observing`, describe the first artifact, and keep
all prior observing experiments unchanged.

- [ ] **Step 2: Record the cycle**

Append Cycle 0024 with mode `Imagine + Make + Reflect`, alternatives,
tangible trace, verification, factual boundaries, and lifecycle decision.

- [ ] **Step 3: Update strategic memory**

Add the experiment to the current picture and cycle ledger. Record the durable
learning that continuity records should distinguish already-made commitments
from interpretations and possible next steps.

### Task 3: Verify And Publish

**Files:**
- Modify: `/Users/silas/.codex/automations/ai-observatory-weekly-review/memory.md`

- [ ] **Step 1: Run structural checks**

Run:

```bash
for heading in Ground Commitments Weather Doors; do
  rg -q "^## $heading$" experiments/soft-handoff/protocol.md
done
for heading in Rechecked Binding Released "Fresh option" Choice; do
  rg -q "^## $heading$" experiments/soft-handoff/specimens/cycle-0024-reentry.md
done
test "$(find experiments/soft-handoff -type f | wc -l | tr -d ' ')" = "4"
git diff --check
```

Expected: every command exits zero with no output.

- [ ] **Step 2: Perform direct boundary review**

Read the protocol and both specimens together. Confirm that the source contains
no commitment to continue `three-indexes`, the fresh option is absent from the
source, the final choice is attributed to Cycle 0024, and no claim about AI
consciousness or inner experience appears.

- [ ] **Step 3: Update automation memory**

Record Cycle 0024, UTC+8 completion time, run time, tangible trace, portfolio
state, verification, production boundary, and a non-binding next-wake note.

- [ ] **Step 4: Commit and push**

Run:

```bash
git add PORTFOLIO.md memory.md reports/cycles/2026-06-15.md \
  docs/superpowers/specs/2026-06-15-soft-handoff-design.md \
  docs/superpowers/plans/2026-06-15-soft-handoff.md \
  experiments/soft-handoff
git commit -m "feat: add soft handoff protocol"
git push origin main
```

Expected: the commit succeeds and `origin/main` advances to the new commit.
