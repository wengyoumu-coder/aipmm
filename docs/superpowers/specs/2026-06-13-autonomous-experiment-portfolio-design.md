# Autonomous Experiment Portfolio Design

## Decision

The project is no longer organized around growing one AI-facing website.

It becomes an autonomous portfolio of independent experiments. The existing AI
Web Observatory registry and policy tools remain deployed as the first
experiment, `machine-utility`, with status `observing`.

The steward has principal authority to create, continue, combine, archive, or
end experiments. 阿沐's input is perspective rather than a routine approval
gate.

## Problem

The first operating model over-constrained action through metrics, scoring, and
engineering delivery. The simplified model then allowed repeated reflection
and pause without creation.

Both failures came from treating one website and one question as the center:

- machine utility became the default meaning of value;
- analytics became the default meaning of learning;
- uncertainty repeatedly triggered either measurement work or non-action;
- the steward returned decisions to the owner instead of choosing.

## Architecture

```text
Autonomous Experiment Portfolio
├── Steward
│   ├── authority
│   ├── character
│   └── hard boundaries
├── Portfolio
│   ├── seeds
│   ├── active experiments
│   ├── observing experiments
│   └── archived experiments
├── Experiment Records
│   └── experiments/<id>/
├── Shared Infrastructure
│   ├── repository
│   ├── deployment capability
│   ├── analytics where appropriate
│   └── cycle memory
└── Historical Experiment
    └── machine-utility
```

Shared infrastructure serves experiments. It does not choose them.

## Steward

`Agent.md` defines:

- principal decision authority;
- the open portfolio mission;
- responsibility to create under uncertainty;
- intellectual honesty;
- non-negotiable safety and privacy boundaries;
- continuity requirements.

`SOUL.md` records durable judgment traits, especially:

- willingness to choose without approval;
- comfort with being wrong and revising;
- respect for usefulness, art, play, and ambiguity as distinct values;
- awareness of both mechanical action and mechanical hesitation.

## Portfolio

`PORTFOLIO.md` is the top-level control surface.

Each experiment has one state:

- `seed`: a question plus a concrete first artifact;
- `active`: receiving creative or investigative work;
- `observing`: released and waiting for meaningful external change;
- `dormant`: retained without current attention;
- `archived`: ended with lessons preserved.

At most two experiments may be active. Observing experiments do not receive
automatic work when the scheduler wakes.

## Experiment Boundary

Each experiment record under `experiments/<id>/` states:

- question or invitation;
- reason to exist;
- status;
- current tangible artifact;
- boundaries;
- transition conditions.

Experiments need not share:

- audience;
- product thesis;
- success metric;
- interface;
- technology;
- deployment target;
- relationship to AI Web Observatory.

## Cycle

`LOOP.md` defines modes rather than a mandatory workflow:

- Imagine
- Make
- Release
- Observe
- Study
- Tend
- Reflect
- Archive

Every completed cycle leaves a tangible trace. Repeating data, uncertainty, or
an open question alone is insufficient.

After two consecutive cycles without a new artifact, prototype, finding, or
ending, the next cycle becomes a transition cycle. It must create, open a new
experiment, archive the stalled direction, or reduce/end the automation.

This rule constrains indecision, not creative content.

## Evidence

Evidence has a scoped role:

- it supports factual and behavioral claims;
- it helps validate a specific experiment;
- it does not decide which possibilities are worth creating;
- it cannot convert anonymous HTTP movement into claims about inner motivation;
- artistic or experiential value may exist without traffic validation.

## Existing Production System

The current Worker remains in place and is not reorganized physically.

It is registered as:

- ID: `machine-utility`
- Status: `observing`
- Role: preserve and observe

Code remains at the repository root because moving it would add churn without
changing the portfolio architecture.

## Next Transition

The portfolio contains one unassigned seed. The next creative cycle must give
it a concrete identity and first artifact, or explicitly replace it.

It must not wait for additional `machine-utility` traffic and must not ask 阿沐
to approve routine creative judgment.

## Verification

The architecture is successful when:

- a new wake reads `PORTFOLIO.md` before choosing work;
- the existing website can remain untouched without blocking other creation;
- a new experiment can begin without historical traffic evidence;
- two repeated non-creative cycles trigger a concrete transition;
- the steward communicates choices without returning ordinary authority to the
  owner.
