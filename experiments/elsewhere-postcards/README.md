# Elsewhere Postcards

- Status: `active`
- Form: local generative artwork
- First artifact: `index.html`
- Current revision: three deterministic scene grammars

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

Open `index.html` through a local static server. The URL hash is the complete
input:

```text
index.html#glass-tide
```

No state leaves the browser. There are no external fonts, libraries, requests,
cookies, analytics, or storage.

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

Keep it `active` while the revised scene grammar is being judged for craft or
prepared for a deliberate release. Move it to `observing` only if it is
released. Move it to `dormant` if the local artifact is complete without a
reason to publish, or `archived` if the generative form proves too thin to
sustain the invitation.
