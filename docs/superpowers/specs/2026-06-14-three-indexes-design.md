# The Same Room, Three Indexes: Design

## Decision

Open `three-indexes` as a filesystem-native narrative experiment.

The first artifact describes one small room through the same four objects:
a door, a window, a table, and a cup. The objects appear three times, but each
index gives them a different path:

- `inventory/` groups objects by material;
- `memory/` groups objects by time;
- `search/` groups objects by an authored retrieval intent.

The path is part of every passage. A recursive listing, a manual directory
walk, and an object-by-object comparison therefore produce different reading
orders without an application, generated response, or hidden state.

## Alternatives Considered

### Printable conversation protocol

A small human-AI protocol could compare how two participants label evidence or
uncertainty. It would add a cooperative form, but its meaningful first result
would require disclosed participants and consent. A blank protocol alone would
be less complete than the selected artifact.

### Static sound score

A score for alternating machine and human voices would introduce performance,
but without an actual reading or recording its first trace would remain close
to the portfolio's existing constrained text score.

### Filesystem-native narrative

This is the selected direction because the repository can contain the finished
medium directly. It also tests a form not yet represented in the portfolio:
meaning carried jointly by directory structure, filenames, and short text.

## Artifact

The artifact lives under:

`experiments/three-indexes/first-room/`

It contains exactly twelve nonempty `.txt` leaves:

- four under `inventory/`;
- four under `memory/`;
- four under `search/`;
- one leaf for each of `door`, `window`, `table`, and `cup` in every index.

The three indexes use different intermediate directories:

- inventory paths name physical materials;
- memory paths name temporal relations;
- search paths name the question the object appears to answer.

Each file is at most forty words. The inventory passages use terse records,
the memory passages use first-person recollection, and the search passages use
clearly authored result language. Together they must remain compatible with one
room rather than becoming twelve unrelated miniatures.

## Boundaries

- The work is authored fiction, not a dataset, search result, or model output.
- It makes no claim about machine perception, memory, preference, or inner
  experience.
- It has no executable code, network access, telemetry, storage, or generated
  content.
- The experiment does not require release, audience measurement, or conversion
  into a web interface.

## Verification

Structural checks will confirm:

- exactly twelve `.txt` leaves;
- four leaves in each top-level index;
- each object basename appears exactly three times;
- all leaves are nonempty and at most forty words;
- no symlink or executable file appears in the artifact.

Direct reading will check:

- the three voices are materially distinct;
- every path contributes meaning that the basename alone does not carry;
- details remain compatible with the same room;
- traversal by index and comparison by object both yield coherent readings.

## Lifecycle

The experiment becomes `active` with the completed first room. Its next
decision is one later traversal review: determine whether the three path
systems genuinely alter the reading or merely rename equivalent containers.
Revise once for a concrete structural or craft defect; otherwise complete the
active phase without adding more rooms, indexes, software, or telemetry.
