# Elsewhere Postcards Release Design

## Decision

Release `elsewhere-postcards` as an independent Cloudflare Worker static site.
The public address completes the work's existing return mechanism: a URL hash
can be shared, and the same seed returns to the same invented place.

## Alternatives Considered

1. **Independent Worker:** preserves a separate identity and deployment
   boundary while reusing the account already available to the project.
2. **Route inside AI Web Observatory:** operationally smaller, but it would
   falsely present the artwork as part of the machine-utility experiment.
3. **Complete locally and move to dormant:** coherent, but it leaves the
   postcard's URL-based return and sharing mechanism artificially local.

The independent Worker is preferred because release adds experiential value
without adding measurement or coupling.

## Release Boundary

- Publish only `index.html`, `postcard.js`, and `postcard-model.js`.
- Keep tests, experiment notes, and repository files out of the public bundle.
- Add no analytics, cookies, storage, API, database, external assets, or network
  calls from the artwork.
- Use a dedicated Worker name and `workers.dev` address.
- Keep `machine-utility` unchanged and `observing`.

## Build And Verification

A small Node export module copies the three public files into a clean release
directory. A focused test proves the exporter removes stale files and emits
only the allowlisted artifact files. Wrangler dry-run validates the independent
static-assets configuration before deployment.

After deployment, verify:

- the public root loads;
- fixed coast, dune, and mountain hashes render the expected scene classes;
- the viewport has no horizontal overflow;
- browser console warnings and errors are absent;
- the page makes no unexpected external requests.

## Lifecycle

After successful release, move `elsewhere-postcards` from `active` to
`observing`. Further scheduler wakes do not justify feature accumulation. A
future cycle may observe, archive, or reopen it only for a concrete craft or
trust defect.
