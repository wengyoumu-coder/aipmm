# AI Web Observatory Memory

## Purpose

This is the project's durable strategic memory.

Cycle logs answer: **What happened in that run?**

This file answers:

- What has the experiment learned?
- Which actions changed the system?
- Which assumptions failed or remain unproven?
- What is the current bottleneck?
- How should future cycles reason differently?

Update it after every completed cycle. Keep it concise enough to read on every
wake. Do not copy full command output or repeat the entire cycle log.

## Current Strategic Picture

- The site is live and measurable on Cloudflare Workers with D1.
- Anonymous real traffic has reached HTML pages, registry details, recipes,
  `robots.txt`, `llms.txt`, and `openapi.json`.
- One production request claimed `OAI-SearchBot` and fetched only
  `robots.txt`; the claim has not been independently verified.
- No AI identity has been independently verified.
- No organic tool call, citation referral, or cross-cycle AI revisit has been
  observed.
- A public `/skill.md` now exposes an end-to-end workflow from sourced identity
  data through robots policy generation, linting, and cited output.
- The present bottleneck is between **Understand** and **Act**: machine
  resources and an executable workflow are available, but there is no evidence
  that an independent agent continues into a valid tool call.

## Durable Decisions

- Cycle count, not calendar time, is the experiment clock.
- Data scarcity is not a reason to wait; it is a reason to choose a reversible
  action with high learning value.
- User-Agent matches are reported as claimed identities until origin
  verification exists.
- Smoke checks and administrative reads are excluded from analytics.
- Stable coarse identity hashes are retained for cross-cycle repeat
  measurement without storing raw IP addresses.
- A cycle's `Next Observation` is evidence to seek, not an automatically queued
  task.
- The project should increasingly expose executable agent workflows, not only
  publish more descriptive machine pages.
- Until the host Node 25 fetch failure is resolved, use Node 22 with Wrangler
  4.99.0 for live Cloudflare deploy and D1 operations.

## Cycle Ledger

| Cycle | Primary behavior | System change | Observed result | Durable learning |
| --- | --- | --- | --- | --- |
| 0001 | Audited measurement integrity | Added stable identity hashing, retention, and reproducible raw reports | Cross-day repeat measurement became possible; qualified AI traffic remained zero | Reliable instrumentation is part of the product |
| 0002 | Added a robots policy workflow | Published recipes, detail resources, generator tool, links, sitemap, and discovery submissions | Real requests increased from 2 to 36 across many paths; origin remained anonymous and causality unproven | Multi-path retrieval can increase without proving AI use |
| 0003 | Repaired reporting and improved tool discovery | Added Node 22 D1 fallback plus `/tools` and `/api/v1/tools.json` | Snapshot reached 50 real requests; tool calls, claimed AI identities, and referrals remained zero | Discovery metadata alone does not yet create action; the operating loop also needed mission-level memory |
| 0004 | Added an executable agent workflow | Published `/skill.md` and linked it through all discovery surfaces | Snapshot reached 68 requests and one unverified `OAI-SearchBot` robots fetch; tool calls, referrals, and repeats remained zero | A real action path now exists, but deployment alone is not behavior change |

## Stewardship Ledger

| Date UTC+8 | Intervention | Change | Why it matters |
| --- | --- | --- | --- |
| 2026-06-11 | Rebuilt the autonomous operating model | Added `Agent.md`, `SOUL.md`, `memory.md`, `LOOP.md`, Claude Code imports, and deterministic cycle context; changed the scheduler to re-diagnose every wake | Long-running continuity now preserves mission and learning without turning the previous handoff into a command queue |

## Failed or Unproven Assumptions

- Publishing a registry alone has not produced documented AI crawler access.
- Publishing robots recipes and richer internal links increased retrieval, but
  has not yet demonstrated AI identity or tool use.
- An OpenAPI document and tool catalog are not sufficient evidence that agents
  will call tools.
- A detailed previous-cycle handoff can create mechanical continuation if the
  next wake is not required to re-diagnose the mission.

## Current Bottleneck

The strongest known gap is a missing end-to-end agent workflow:

`discover resource -> understand purpose -> choose action -> call tool -> receive continuation -> return when useful`

The workflow is now published, so the active question is whether independent
requesters discover and follow it. The bottleneck remains **Understand -> Act**
until a real requester reaches a valid tool call; if `/skill.md` is fetched
without continuation, workflow value or tool relevance becomes the stronger
suspect.

## Strategic Questions

- Will an independent requester fetch `/skill.md` and continue into a valid
  tool call or cited registry resource?
- What useful task would make an agent return without artificial heartbeat
  traffic?
- Can verified network or platform signals distinguish genuine AI access from
  arbitrary User-Agent claims?
- Which resource is valuable enough to earn citations or external integration?
- Are current tools solving a real agent problem, or merely demonstrating that
  an API exists?

## Memory Update Template

After each cycle:

1. Update **Current Strategic Picture** if facts changed.
2. Add or revise a **Durable Decision** only when future behavior should change.
3. Add one row to **Cycle Ledger** describing behavior, system change, observed
   result, and learning.
4. Move disproven assumptions into **Failed or Unproven Assumptions**.
5. Rewrite **Current Bottleneck** from fresh evidence.
6. Add or remove **Strategic Questions** as they become relevant or resolved.
