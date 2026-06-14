# The Disagreeing Cabinet Design

## Purpose

`disagreeing-cabinet` is a small offline classification game. In each of four
drawers, the visitor sees four objects and chooses the one that does not
belong. The cabinet does not score the choice. It returns the selected object
with a hand-written defense, sets aside a different object, and records both
judgments.

The work asks whether disagreement can feel like an invitation to notice more
than one defensible category rather than a correction with one hidden answer.
It makes no claim about cognition, personality, or autonomous judgment.

## Experience

1. The opening view explains that there is no correct answer and no score.
2. A drawer presents four object buttons and the prompt, "Which one does not
   belong?"
3. After a choice, the cabinet names the selected object, gives one concrete
   reason to keep it, and sets aside another object for a different reason.
4. The visitor continues through four drawers.
5. The final view creates a local exhibit label listing the four disagreements.
   Restarting clears the in-memory visit and begins again.

The artifact is complete when every possible choice receives a coherent
counterargument, the visit can reach a final label, and no state leaves the
browser.

## Structure

- `experiments/disagreeing-cabinet/cabinet-model.js` owns drawer content,
  validation, state transitions, and final-label data.
- `experiments/disagreeing-cabinet/cabinet-model.test.js` tests every authored
  choice, invalid input, completion, and restart behavior.
- `experiments/disagreeing-cabinet/cabinet.js` renders the model and handles
  click and keyboard-driven browser interaction.
- `experiments/disagreeing-cabinet/index.html` provides the semantic document
  and self-contained visual design.
- `experiments/disagreeing-cabinet/README.md` records the invitation,
  boundaries, artifact, and lifecycle.

The model exports immutable data and pure transition functions. The browser
script keeps only one in-memory state object. There are no external assets,
requests, cookies, analytics, local storage, or service workers.

## Content Standard

Each drawer contains four familiar but categorically unstable objects. Every
selectable object has its own authored reply with:

- a specific reason the chosen object can remain;
- a different object the cabinet sets aside;
- a specific reason for that alternate exclusion.

Replies must not imply that the cabinet's answer is correct. The final label
uses factual language: it records choices and counterchoices rather than
inferring traits about the visitor.

## Visual And Accessibility Standard

The interface resembles a quiet museum cabinet rather than a quiz. It uses
system fonts, high contrast, visible focus, semantic buttons, responsive layout
at narrow widths, and reduced-motion support. Status text is announced through
an `aria-live` region. The active object buttons are disabled while the
counterargument is displayed so one drawer cannot be answered twice.

## Verification

- Run the model tests and observe the expected red-green cycle.
- Check syntax for both JavaScript files.
- Confirm all 16 authored choices produce complete, non-self-contradictory
  response records.
- Serve locally and complete at least two visits with different choices.
- Verify restart, keyboard focus, narrow layout, no console errors, and no
  network or persistence APIs.
- Run the repository test, typecheck, static build, and diff checks because the
  experiment adds executable JavaScript but does not alter production routes.

## Lifecycle

The first complete local game opens the experiment as `active`. A later cycle
may revise it after direct play, release it independently, leave it dormant, or
archive it. Scheduler cadence alone is not a reason to add drawers, scoring,
personalization, or telemetry.
