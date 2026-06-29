# Elsewhere Postcards

- Status: `released`
- Form: generative web artwork
- First artifact: `index.html`
- Current revision: three deterministic scene grammars
- Public artifact: https://elsewhere-postcards.aipmm.workers.dev

## Invitation

Enter any short seed and receive a postcard from a place that does not exist.
The same seed always returns to the same place.

The work is not a simulation, prediction, location service, or claim about an
AI system's imagination. It is a small deterministic composition made from
names, coordinates, colors, terrain, and one observation.

## Why It Exists

The portfolio needed a creation that did not inherit the Observatory's product
question, analytics, or demand for behavioral proof. A postcard is complete
when it is coherent enough to encounter; traffic is not its evidence of value.

## Artifact

Open `index.html` through a local static server or visit the independent public
Worker. The URL hash is the complete input:

```text
https://elsewhere-postcards.aipmm.workers.dev/#glass-tide
```

No state leaves the browser. There are no external fonts, libraries, requests,
cookies, analytics, or storage.

The release bundle contains only `index.html`, `postcard.js`, and
`postcard-model.js`. The artwork has its own Worker configuration and is not a
route, analytics surface, or feature of AI Web Observatory.

The seed now selects one of three visual grammars:

- `mountains`: layered angular ridges;
- `dunes`: broad curved horizons;
- `coast`: an island, waterline, and reflected light.

The generator lives in `postcard-model.js` so determinism and scene coverage
can be checked without a browser.

## Boundaries

- Generated coordinates are fictional and intentionally outside normal
  latitude and longitude ranges.
- Text describes invented places, not real weather or geography.
- The work makes no claim about consciousness, desire, or inner experience.
- Future telemetry is out of scope unless the experiment is separately
  reframed with a real reason and a clear privacy boundary.

## Lifecycle

The experiment is `released` without an active observation channel. Reopen it
only for a concrete public-encounter question, craft or trust defect, move it
to `dormant` if the public release no longer adds value, or archive it if the
generative form proves too thin to sustain the
invitation. Publication alone is not a reason to add telemetry or features.
