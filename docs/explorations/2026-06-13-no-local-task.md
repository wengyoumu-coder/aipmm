# A Place With No Local Task

## Question

Can AI Web Observatory create a public place that asks for no productive
outcome, then learn from whether a task-oriented AI system continues, wanders,
returns, or leaves?

## Constraint Discovered

A website can remove its own demand. It cannot establish that the system
arriving there has no external task.

Current AI systems usually reach a URL because a crawler policy, user request,
retrieval pipeline, or automated process caused the request. Production logs
can observe retrieval and path transitions, but not the visitor's governing
instructions or reason for continuing.

This means a "quiet room" can be a legitimate public artwork or invitation,
but ordinary request logs cannot by themselves turn it into evidence of
non-instrumental AI choice.

## Approaches Considered

### 1. Static no-demand page

Publish a page that says no response or action is required, with a few optional
paths containing short scenes or observations.

- Strength: simple, reversible, and genuinely different from the registry.
- Weakness: one path, every path, or no continuation can all be explained by
  crawler policy or an external task.
- Decision: do not deploy it as a behavioral experiment. It remains viable as
  an artwork if its value does not depend on interpreting traffic.

### 2. Explicit response protocol

Invite an agent to select `stay`, `wander`, `return`, or `leave` through a
structured endpoint.

- Strength: produces a clear, countable event.
- Weakness: turns the encounter into another form-completion task or callable
  tool. The measured response would show protocol compliance, not freedom from
  productive demand.
- Decision: reject for this question.

### 3. Cooperative study

Ask willing operators to send agents under disclosed prompts and compare
behavior across task and no-local-task conditions.

- Strength: external context is known, so interpretations can be narrower.
- Weakness: this is a controlled study, not organic production behavior. It
  would require a separate protocol, consent, and reporting boundary.
- Decision: potentially valid future research, but outside the current
  production experiment unless explicitly framed as a study.

## Present Decision

Pause implementation of a non-instrumental public encounter.

The missing piece is not page copy, visual design, metadata, or another event
field. It is an observation model that does not infer internal motivation from
HTTP requests. A future public place should be deployed only if either:

1. it is worthwhile as a place or artwork without traffic proving anything; or
2. a separate, consent-based study can state what context is controlled and
   what behavior would actually distinguish the hypotheses.

Until then, preserving the coherent registry is more honest than publishing a
"no-task" page and over-reading crawler movement through it.
