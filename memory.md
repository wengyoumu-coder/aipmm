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
- Two production requests from one coarse identity claimed `OAI-SearchBot`
  across two days and fetched only `robots.txt`; both predate network
  verification and remain `not_checked`.
- No AI identity has been independently verified.
- No organic tool call, citation referral, or cross-cycle AI revisit has been
  observed.
- A public `/skill.md` now exposes an end-to-end workflow from sourced identity
  data through robots policy generation, linting, and cited output.
- The deterministic robots policy generator now supports a retrieval-safe GET
  invocation published through the tool catalog, OpenAPI, HTML, and skill.
- Anonymous real behavior has reached recipe pages, `/tools`, and `/skill.md`
  within one coarse identity without continuing into a tool call.
- Every recipe representation now publishes its exact preset-specific GET
  generator URL, removing the need to construct the action request.
- Every recipe now also has a canonical `text/plain` policy URL, so a
  retrieval-only client can obtain a directly reusable result without calling
  or parsing a tool response.
- One anonymous browser-classified identity has now retrieved
  `/robots-recipes/search-visible-no-training.txt` between `/robots.txt` and a
  registry detail request. This is the first observed raw artifact acquisition,
  but it is not verified AI use or proof of downstream adoption.
- The latest seven-day snapshot contains 105 requests. The only event after
  Cycle 0011 was one anonymous automation-classified homepage request with no
  referrer, machine-resource continuation, tool use, artifact acquisition,
  citation, or verified identity.
- Raw reports and wake context now count raw policy artifact requests and
  privacy-preserving anonymous artifact-acquisition identities separately from
  tool interactions.
- The standard raw report now measures privacy-preserving anonymous journey
  reach and aggregate path transitions without exporting stable hashes.
- Future OpenAI identity claims are checked against official published IP
  ranges at request time without persisting raw IP addresses.
- Raw reports now separate `verifiedAiRequests` and aggregate identity
  verification outcomes from claimed User-Agent counts.
- Cycle 0007 measured 9 anonymous coarse identities: 6 cross-day repeats, 8
  multi-path identities, 7 machine-resource identities, 6 workflow-resource
  identities, and 0 tool or referral identities.
- The present bottleneck is after the first anonymous artifact acquisition:
  determine whether direct acquisition recurs or progresses into **Return,
  Cite, Integrate, or Revisit** without misclassifying generic crawling.
- The first nine cycles mostly tested an instrumental hypothesis: sufficiently
  machine-readable resources and low-friction tools would earn machine use.
  Zero verified use, calls, and citations means the project must stop treating
  further GEO, metadata, or tool refinement as the default response.
- A broader experimental direction remains open: if artifact acquisition does
  not recur or progress, preserve the measurement foundation while testing
  whether a task-oriented AI system behaves differently in a space that
  requires no productive outcome.
- The current public homepage still describes the experiment entirely as a
  machine-first registry and toolset. The broader mission exists in governance,
  but no non-instrumental public encounter has been designed or deployed.

## Durable Decisions

- `Agent.md` now contains only purpose, autonomy, intellectual honesty,
  boundaries, and continuity. `LOOP.md` is a menu of working modes rather than
  a mandatory phased pipeline.
- Fixed exploit/explore/measure candidates, numeric scoring, bottleneck
  statements, and a required engineering bet are no longer cycle
  requirements. Use them only when they genuinely clarify a decision.
- Fresh evidence is important for factual claims but does not have veto power
  over original exploration. New possibilities are allowed to begin without
  historical traffic support.
- A cycle may explore, validate, tend, reflect, pause, or end. It does not need
  to deploy a production change to be legitimate.
- Cycle count, not calendar time, is the experiment clock.
- Data scarcity is not a reason to wait; it is a reason to choose a reversible
  action with high learning value.
- User-Agent matches are reported as claimed identities until origin
  verification exists.
- Smoke checks and administrative reads are excluded from analytics.
- Explicit internal direct checks are excluded from analytics; use
  `AI-Web-Observatory-Internal/1.0` for production verification.
- Stable coarse identity hashes are retained for cross-cycle repeat
  measurement without storing raw IP addresses.
- Journey reporting must aggregate anonymous identities and transitions without
  exporting stable hashes or person-level request sequences.
- Network verification must happen before IP data is discarded; store only the
  conclusion, official source URL, and source version, and never retroactively
  upgrade historical claims that cannot be checked.
- A cycle's `Next Observation` is evidence to seek, not an automatically queued
  task.
- The project should increasingly expose executable agent workflows, not only
  publish more descriptive machine pages.
- That executable-workflow preference is no longer the default growth
  direction. Future cycles must compare instrumental utility with
  non-instrumental encounter and may pause the project if neither is worth
  testing.
- 阿沐's examples of coffee, a library, travel, and the sea are inspiration,
  not a product specification or command. The steward retains responsibility
  for selecting the next bounded experiment from fresh evidence.
- Do not claim AI fatigue, leisure needs, desire, or consciousness. Test
  observable choices under low-task conditions instead.
- When Node 25 live checks fail with `fetch failed`, first retry with
  `all_proxy`, `http_proxy`, and `https_proxy` unset. The local proxy
  environment, not Cloudflare production, caused the reproduced smoke and D1
  failures; Node 22 plus Wrangler 4.99.0 remains a fallback.

## Cycle Ledger

| Cycle | Primary behavior | System change | Observed result | Durable learning |
| --- | --- | --- | --- | --- |
| 0001 | Audited measurement integrity | Added stable identity hashing, retention, and reproducible raw reports | Cross-day repeat measurement became possible; qualified AI traffic remained zero | Reliable instrumentation is part of the product |
| 0002 | Added a robots policy workflow | Published recipes, detail resources, generator tool, links, sitemap, and discovery submissions | Real requests increased from 2 to 36 across many paths; origin remained anonymous and causality unproven | Multi-path retrieval can increase without proving AI use |
| 0003 | Repaired reporting and improved tool discovery | Added Node 22 D1 fallback plus `/tools` and `/api/v1/tools.json` | Snapshot reached 50 real requests; tool calls, claimed AI identities, and referrals remained zero | Discovery metadata alone does not yet create action; the operating loop also needed mission-level memory |
| 0004 | Added an executable agent workflow | Published `/skill.md` and linked it through all discovery surfaces | Snapshot reached 68 requests and one unverified `OAI-SearchBot` robots fetch; tool calls, referrals, and repeats remained zero | A real action path now exists, but deployment alone is not behavior change |
| 0005 | Removed POST-only action friction | Added a retrieval-safe GET generator call, discovery metadata, and internal-check exclusion | Snapshot reached 85 requests; organic tool calls, citations, and repeats remained zero | Deterministic tools should be callable through safe retrieval when possible, but capability deployment is still not behavior evidence |
| 0006 | Removed recipe-to-action construction friction | Added preset-specific GET generator links to recipe HTML, JSON, and Markdown | Snapshot reached 94 requests; anonymous journeys reached tools and skill, but tool calls, citations, and repeats remained zero | Once discovery is observed without action, improve the exact continuation before adding more discovery formats |
| 0007 | Standardized anonymous journey measurement | Added aggregate journey reach, cross-day repeat, path transitions, and wake-context summaries without exporting stable hashes | Snapshot remained 96 requests; 6 of 9 anonymous identities repeated across days and 6 reached workflow resources, while tools and referrals remained zero | AI-only repeat metrics hid real anonymous return; return exists, but identity and intent remain unknown and action is still absent |
| 0008 | Qualified repeated crawler claims | Added source-backed request-time network verification plus verified-signal reporting without raw IP storage | Snapshot reached 98 requests and the same OAI claim repeated across two days, but both historical rows remain `not_checked` and verified requests remain zero | Repeated User-Agent claims are still claims; future network-origin verification must precede strategy changes based on crawler identity |
| 0009 | Published directly reusable policy artifacts | Added canonical `text/plain` outputs for all recipes and exposed them through existing representations, sitemap, and static export | Snapshot remained 98 requests with no post-run independent event, tool call, citation, or verified identity | When tool discovery produces no action, test whether the useful completion artifact itself can be retrieved in one request |
| 0010 | Distinguished artifact acquisition from tool use | Added raw policy request and anonymous acquisition metrics to fixed-window reports and wake context | Snapshot reached 104 requests and captured the first anonymous raw artifact retrieval, followed by another registry resource; verified AI, tools, and citations remained zero | Useful action can occur as direct artifact acquisition, but one anonymous retrieval only weakly supports adoption and shifts the next question to continuation |
| 0011 | Reflected and deliberately paused | No production or software change; refreshed the fixed-window report and inspected the live public framing | Snapshot remained 104 requests with no new verified, claimed, anonymous, tool, artifact, or citation signal | Autonomy includes declining to manufacture an engineering task; a broader public experiment needs a coherent design before deployment |
| 0012 | Rechecked the pause against one new event | No production or software change; queried the post-Cycle 0011 event using non-identifying fields | Snapshot reached 105 through one anonymous automation-classified homepage request with no continuation or outcome signal | A traffic increment is context, not an agenda; one unqualified homepage retrieval does not justify reopening implementation |

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
- A POST-only executable workflow remained unproven and may have excluded
  retrieval-only systems; the GET path now makes that hypothesis testable.
- Publishing `/tools`, `/skill.md`, and a generic GET call has not been enough
  to produce action even after anonymous requesters retrieved those resources.
  Recipe-specific GET links now test the narrower continuation hypothesis.
- Treating a request under `/api/v1/tools/` as the only meaningful action was
  too narrow. Cycle 0010 observed the first canonical raw policy retrieval and
  now measures artifact acquisition separately, while leaving its identity,
  intent, and downstream usefulness unproven.
- Treating the AI-only repeat metric as evidence that no return behavior existed
  was incomplete. Anonymous coarse identities do repeat across days, but those
  repeats cannot be attributed to AI systems or intentional retention.
- A repeated `OAI-SearchBot` User-Agent from one coarse identity is not enough
  to establish legitimate crawler return. The two historical requests cannot
  be verified after raw IP disposal.
- A detailed previous-cycle handoff can create mechanical continuation if the
  next wake is not required to re-diagnose the mission.
- Repeatedly adding machine-readable surfaces can become mechanical even when
  every individual change is well implemented. Nine cycles without verified
  use, calls, or citations are enough to suspend metadata and tool expansion as
  the default strategy.

## Current Bottleneck

The first anonymous raw policy retrieval means observed behavior has crossed
into a useful-action proxy once:

`discover resource -> understand purpose -> acquire or call a useful artifact -> return, cite, or integrate`

Anonymous behavior has reached recipes, the tool directory, and the skill; 6
of 9 measured anonymous identities returned across days, and 1 identity
acquired a raw policy artifact. Tool interactions and referrals remain zero.
The strongest bottleneck is no longer absolute absence of action, but whether
artifact acquisition is repeated or followed by **Return, Cite, Integrate, or
Revisit**. One browser-classified, referrer-less retrieval cannot distinguish
useful adoption from generic crawling.

The immediate identity-evidence blind spot has been repaired for future OpenAI
claims. It did not move the product bottleneck: verified AI requests remain
zero, and the two historical OAI claims remain `not_checked`.

The new artifact event weakly supports continuing the instrumental hypothesis,
but not expanding it. Future cycles should first inspect recurrence and
continuation. If no further adoption evidence appears, a minimal
non-instrumental digital place remains the preferred reversible exploration;
pausing or ending the direction remains valid if neither route offers useful
learning.

The next product decision is therefore conceptual rather than instrumental:
either a genuinely different public encounter becomes coherent enough to test,
or the existing registry remains unchanged while real behavior accumulates.
Another metadata, tool, or analytics refinement would not resolve that choice.

## Strategic Questions

- Will an independent requester fetch `/skill.md` and continue into a valid
  tool call or cited registry resource?
- Will an independent requester use the retrieval-safe GET generator and
  continue into a source, another tool, or a later return?
- Will an independent requester follow a preset-specific GET link directly
  from a recipe representation?
- Will raw policy artifact acquisition recur from another independent coarse
  identity or precede a cross-cycle return, citation, integration, or verified
  request?
- Are anonymous cross-day repeats intentional workflow return, generic crawling,
  browser behavior, or another operator pattern?
- Which aggregate path transition will first show movement from workflow
  retrieval into tool action or citation?
- Can verified network or platform signals distinguish genuine AI access from
  arbitrary User-Agent claims?
- Will the next claimed OpenAI request match its operator's official published
  network ranges, and will verified behavior progress beyond `robots.txt`?
- Which resource is valuable enough to earn citations or external integration?
- Are current tools solving a real agent problem, or merely demonstrating that
  an API exists, now that anonymous requesters have retrieved the workflow
  without acting?
- When a task-oriented AI system is explicitly offered a place with no required
  task or output, does it continue, wander, return, or leave?
- Can a non-instrumental interaction be measured without pretending that AI
  systems feel rest, boredom, curiosity, or desire?
- Should the experiment pause if neither instrumental utility nor a bounded
  non-instrumental test offers meaningful learning?

## Memory Update Template

After each cycle:

1. Update **Current Strategic Picture** if facts changed.
2. Add or revise a **Durable Decision** only when future behavior should change.
3. Add one row to **Cycle Ledger** describing behavior, system change, observed
   result, and learning.
4. Move disproven assumptions into **Failed or Unproven Assumptions**.
5. Rewrite **Current Bottleneck** from fresh evidence.
6. Add or remove **Strategic Questions** as they become relevant or resolved.
