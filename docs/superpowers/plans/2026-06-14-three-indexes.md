# Three Indexes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and register a complete filesystem-native narrative that describes one room through inventory, memory, and search paths.

**Architecture:** The artifact is a static directory tree with twelve short text leaves. Directory names carry classification meaning, file basenames preserve four shared objects, and an experiment README records the invitation, boundaries, and lifecycle.

**Tech Stack:** Markdown, plain text, POSIX shell verification, Git.

---

### Task 1: Create The Same Room, Three Indexes

**Files:**
- Create: `experiments/three-indexes/README.md`
- Create: `experiments/three-indexes/first-room/inventory/wood/door.txt`
- Create: `experiments/three-indexes/first-room/inventory/wood/table.txt`
- Create: `experiments/three-indexes/first-room/inventory/glass/window.txt`
- Create: `experiments/three-indexes/first-room/inventory/ceramic/cup.txt`
- Create: `experiments/three-indexes/first-room/memory/before/door.txt`
- Create: `experiments/three-indexes/first-room/memory/during/table.txt`
- Create: `experiments/three-indexes/first-room/memory/after/cup.txt`
- Create: `experiments/three-indexes/first-room/memory/always/window.txt`
- Create: `experiments/three-indexes/first-room/search/exit/door.txt`
- Create: `experiments/three-indexes/first-room/search/work/table.txt`
- Create: `experiments/three-indexes/first-room/search/thirst/cup.txt`
- Create: `experiments/three-indexes/first-room/search/light/window.txt`

- [ ] **Step 1: Create the twelve authored leaves**

Write one compatible description of the same door, table, cup, and window in
each path system. Keep each leaf at forty words or fewer. Use terse records in
`inventory`, first-person recollection in `memory`, and explicit authored-result
language in `search`.

- [ ] **Step 2: Write the experiment record**

Document the question, selected form, first artifact, authorship boundary,
absence of executable or measured behavior, and the one-review active
lifecycle in `experiments/three-indexes/README.md`.

- [ ] **Step 3: Run structural verification**

Run:

```bash
find experiments/three-indexes/first-room -type f -name '*.txt' | sort
find experiments/three-indexes/first-room -type f -name '*.txt' | wc -l
for index in inventory memory search; do
  find "experiments/three-indexes/first-room/$index" -type f -name '*.txt' | wc -l
done
for object in cup door table window; do
  find experiments/three-indexes/first-room -type f -name "$object.txt" | wc -l
done
find experiments/three-indexes/first-room -type l -o -type f -perm -111
find experiments/three-indexes/first-room -type f -name '*.txt' -exec sh -c '
  for file do
    test -s "$file" || exit 1
    test "$(wc -w < "$file")" -le 40 || exit 1
  done
' sh {} +
```

Expected: twelve sorted leaves; total `12`; each index count `4`; each object
count `3`; no symlink or executable output; final command exits `0`.

- [ ] **Step 4: Perform direct craft review**

Read once by index and once by object basename. Confirm that intermediate path
names contribute distinct meaning, the three voices remain different, and all
twelve passages can describe one room without contradiction.

- [ ] **Step 5: Commit the artifact**

```bash
git add experiments/three-indexes
git commit -m "feat: open three indexes experiment"
```

### Task 2: Register Cycle 0022

**Files:**
- Modify: `PORTFOLIO.md`
- Modify: `memory.md`
- Modify: `reports/cycles/2026-06-14.md`

- [ ] **Step 1: Update portfolio state**

Add `three-indexes` as the only `active` experiment with form
`filesystem-native narrative`. Record that the first room is complete and that
one later traversal review will decide whether the path systems genuinely alter
the reading.

- [ ] **Step 2: Update strategic memory**

Add Cycle 0022 to the current picture and ledger. Record the durable learning
only at the level supported by the artifact: directory structure can be an
authored part of a work, and verification must include traversal order rather
than content alone.

- [ ] **Step 3: Append the cycle log**

Record mode `Imagine + Make`, the three alternatives considered, the tangible
trace, structural and craft verification, factual boundaries, and the bounded
later traversal question using a UTC+8 timestamp.

- [ ] **Step 4: Run repository consistency checks**

Run:

```bash
git diff --check
rg -n 'three-indexes|Cycle 0022' PORTFOLIO.md memory.md reports/cycles/2026-06-14.md experiments/three-indexes/README.md
rg -n 'active' PORTFOLIO.md experiments/three-indexes/README.md memory.md
```

Expected: no whitespace errors; the experiment and cycle appear in all intended
records; present-tense active state consistently names only `three-indexes`.

- [ ] **Step 5: Commit and push the cycle**

```bash
git add PORTFOLIO.md memory.md reports/cycles/2026-06-14.md experiments/three-indexes
git commit -m "docs: record three indexes cycle"
git push origin main
```
