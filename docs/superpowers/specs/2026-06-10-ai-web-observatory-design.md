# AI Web Observatory Design

## Objective

Build a public, machine-first website that maximizes legitimate discovery,
retrieval, citation, interaction, and repeat access by AI search systems,
crawlers, and user-directed agents.

The experiment must use real traffic only. It must not fabricate visits,
impersonate crawlers, inject instructions that conflict with an agent's user or
system rules, spam third-party services, or evade access controls.

## Experiment Thesis

AI systems are more likely to discover and revisit a site when it provides:

1. Original, focused information that is useful to agents and site operators.
2. The same information in crawlable HTML and structured machine formats.
3. Stable URLs, explicit update timestamps, citations, and strong internal links.
4. Useful callable tools that turn retrieval into multi-request interaction.
5. Fast responses and permissive, explicit crawler controls.
6. A public change stream that gives crawlers a reason to return.

The first product will be **AI Web Observatory**, a registry and toolset about
AI access to the public web. This topic aligns the audience, content, and
experiment: AI systems can retrieve a structured registry, classify user-agent
strings, inspect robots policies, and consume measured traffic reports.

## Success Metrics

The primary metric is `qualified_ai_requests`, defined as requests classified
from an AI crawler, AI search crawler, or user-directed AI agent signature.

Supporting metrics:

- `qualified_ai_unique_daily`: unique daily hashes of network prefix plus
  user-agent among qualified requests.
- `ai_pages_per_identity`: qualified requests divided by qualified daily
  identities.
- `ai_repeat_7d`: identities observed on more than one day in a seven-day
  window.
- `machine_resource_share`: qualified requests to JSON, Markdown, RSS,
  OpenAPI, `llms.txt`, or well-known endpoints.
- `tool_interactions`: requests to callable API tools.
- `citation_referrals`: visits carrying known AI referral signals such as
  `utm_source=chatgpt.com`.
- `crawl_depth`: distinct paths requested per qualified daily identity.

User-agent classification is a claim, not proof of bot ownership. Reports must
label it accordingly until IP-range or reverse-DNS verification is added.

## Phase 1 Product

### Public knowledge

- A homepage that states the resource purpose in semantic HTML.
- A registry of known AI web-access identities with explicit source URLs.
- Stable detail pages for each registry entry.
- A dated changelog exposed as HTML, JSON, Markdown, and RSS.

### Machine entry points

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/llms-full.txt`
- `/openapi.json`
- `/.well-known/agent-card.json`
- `/api/v1/manifest`
- `/api/v1/registry`
- `/api/v1/registry/:slug`

### Callable tools

- `POST /api/v1/tools/classify-user-agent`
- `POST /api/v1/tools/lint-robots`

These tools are deterministic and do not require an external model.

### Measurement

Every request is classified and written to Cloudflare D1 when the binding is
available. Raw IP addresses are never stored. The worker stores a daily salted
SHA-256 hash of a coarse network prefix plus user-agent, request metadata, bot
classification, and referral signals.

An authenticated `/api/admin/stats` endpoint returns aggregate metrics. The
admin token is a Cloudflare secret and is never committed.

## Architecture

The site is one TypeScript Cloudflare Worker. Server-rendered responses avoid
client-side rendering dependencies and expose identical facts across HTML and
machine representations.

Core modules:

- `catalog.ts`: curated registry records and source metadata.
- `classify.ts`: deterministic user-agent and referral classification.
- `robots-lint.ts`: parser and checks for AI crawler accessibility.
- `render.ts`: HTML, text, XML, JSON, and error response helpers.
- `analytics.ts`: privacy-preserving request logging and aggregate queries.
- `router.ts`: route matching and content negotiation.
- `index.ts`: worker entry point and non-blocking logging.

## Data Flow

1. A request reaches the worker.
2. The classifier derives visitor category, matched identity, and referral
   signals.
3. The router returns the requested representation or tool result.
4. `ctx.waitUntil` records a privacy-preserving event in D1.
5. Admin queries aggregate stored events without exposing raw identifiers.

Logging failure must never prevent a public response.

## Discovery Strategy

- Explicitly allow major search and AI crawler identities in `robots.txt`.
- Include the canonical sitemap URL in `robots.txt`.
- Publish a generated sitemap containing every stable public resource.
- Add JSON-LD `Dataset`, `WebSite`, and `SoftwareApplication` descriptions.
- Publish source links and `dateModified` values with registry data.
- Use IndexNow after public deployment for changed canonical URLs.
- Submit the sitemap to search consoles where account ownership is available.
- Keep machine resources linked from HTML rather than relying on hidden paths.

## Testing

- Unit tests cover classification, robots policy linting, and route negotiation.
- Integration tests call the worker handler with a mock D1 binding.
- Contract tests validate JSON shapes, sitemap URLs, robots directives, and
  OpenAPI paths.
- A deployment smoke test fetches all machine entry points and confirms status,
  content type, canonical host, and non-empty bodies.

## Initial Deployment

Cloudflare Workers is the preferred host because it combines public edge
delivery and server-side request recording. Deployment requires a one-time
Cloudflare login and creation of the D1 database. A custom domain is optional
for launch; the `workers.dev` hostname can begin the experiment.

## Iteration Policy

Run a weekly review after public launch. Each review records:

- the measurement window;
- raw aggregate counts;
- which identities and resources changed;
- one falsifiable hypothesis;
- one bounded strategy change;
- the date for evaluating that change.

Do not optimize from fewer than seven complete days unless a deployment defect
is visible.
