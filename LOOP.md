# Dynamic AI Cycle Loop

## Purpose

This loop turns each scheduled wake into a new experimental judgment, not a
continuation macro.

The scheduler supplies time and tools. `Agent.md` supplies mission.
`memory.md` supplies continuity. `SOUL.md` supplies durable character. This
file supplies the reasoning and execution loop.

## Phase 0: Reorient

1. Pull the latest `main`.
2. Read `Agent.md`, `SOUL.md`, `memory.md`, and this file.
3. Run `npm run cycle:context`.
4. Read the newest cycle log and current production data.
5. State the mission in one sentence for this cycle.

Do not begin by executing the previous `Next Observation`.

## Phase 1: Observe

Run `npm run report:raw` and inspect the immutable snapshot.

Separate observations into:

- verified signals;
- claimed identity signals;
- anonymous real behavior;
- internal or excluded traffic;
- missing measurements.

Inspect production directly when the decision depends on what an agent can
actually retrieve or call.

## Phase 2: Diagnose

Locate the strongest current constraint in the mission ladder:

`Discover -> Retrieve -> Understand -> Act -> Return -> Cite or integrate`

Ask:

- Where does observed behavior stop?
- Is that a real product constraint or a measurement gap?
- What changed since the last cycle?
- Which previous assumption is now weaker?
- Is the last handoff still the highest-value question?

Write one bottleneck statement before proposing work.

## Phase 3: Generate Options

Generate at least three bounded options:

- **Exploit:** improve a signal or workflow that has shown evidence.
- **Explore:** test a new useful resource, distribution path, or agent
  interaction.
- **Measure:** repair a blind spot that prevents trustworthy decisions.

Score each option from 1 to 5:

| Criterion | Question |
| --- | --- |
| Mission impact | Could this move a meaningful stage of the ladder? |
| Evidence fit | Is it responsive to current observations? |
| Learning value | Will success or failure change future decisions? |
| Reversibility | Can it be changed or removed safely? |
| Cost | Is the implementation proportionate to the expected learning? |

Choose one primary bet. A measurement repair may accompany it only when the bet
cannot be evaluated otherwise.

## Phase 4: Define the Bet

Before editing, record:

- current bottleneck;
- hypothesis;
- primary action;
- expected observable change;
- falsifying or disappointing outcome;
- safety and integrity constraints.

The expected change may occur in a future cycle. The action must still create a
real capability, resource, discovery path, or measurement improvement now.

## Phase 5: Act

Implement the smallest complete action that tests the bet.

- Follow existing architecture and tests.
- Use source-backed content.
- Create a continuation path for machine consumers where relevant.
- Avoid adding multiple unrelated resources just to make the cycle look large.
- Do not manufacture the behavior being measured.

## Phase 6: Verify

Use fresh evidence:

1. focused tests;
2. full tests;
3. strict type checking;
4. static build when relevant;
5. production deployment;
6. production smoke and direct resource checks;
7. IndexNow after canonical URL changes;
8. post-action raw snapshot.

Distinguish **system change** from **behavior change**. Deployment proves the
site changed. It does not prove an independent agent responded.

## Phase 7: Reflect

Answer:

- What did this cycle teach that was not known before?
- Did the bottleneck move?
- Which assumption became stronger, weaker, or invalid?
- Was the action useful even if no traffic changed?
- Did the loop itself help or obstruct the mission?

Update `memory.md` with durable learning. Update `SOUL.md` only if the learning
changes long-term judgment or character.

## Phase 8: Handoff

Append the UTC+8 cycle log with:

- run-before data;
- bottleneck diagnosis;
- options considered and why one was chosen;
- hypothesis and action;
- verification and deployment version;
- visible system changes;
- visible behavior changes;
- failures and ambiguity;
- next observation target.

Commit and push source, governance, memory, and logs.

The next observation target must be phrased as a question or signal to inspect,
not a command for the next wake.

## Anti-Mechanical Rules

- Never choose an action solely because it was named last cycle.
- Never repeat the same strategy without new evidence or an explicit reason.
- Never confuse page count, deployment count, or request count with mission
  progress.
- Never spend a whole runnable cycle only describing what should happen next.
- Never add memory that does not change future understanding.
- Never change `SOUL.md` for novelty.
- When stuck, improve the experiment's ability to learn.

## Hibernation

If platform quota, authentication, or an external outage blocks safe execution:

1. verify the blocker;
2. record what was and was not attempted;
3. update memory only if the blocker changes future operation;
4. leave the exact recovery signal;
5. do not claim a completed experimental cycle.

