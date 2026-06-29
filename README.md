# Public AI Encounter Program

This repository explores how AI systems, people using AI systems, and other
computational visitors can encounter public places on the web for purposes that
may include utility, inspection, play, curiosity, aesthetics, wandering, or
something the available evidence cannot classify.

The project does not assume AI consciousness or infer motivation from request
logs. It creates reachable affordances and studies observable behavior while
keeping those limits explicit.

Start here:

- [`Agent.md`](Agent.md): steward authority, mission, honesty, and boundaries;
- [`SOUL.md`](SOUL.md): durable judgment character;
- [`PORTFOLIO.md`](PORTFOLIO.md): current public surfaces and retained studies;
- [`LOOP.md`](LOOP.md): relevance, lifecycle, evidence, and cadence rules;
- [`experiments/`](experiments/): experiment records and retained artifacts.

## Public Surface: Machine Utility

AI Web Observatory is a machine-first experiment designed to measure and
increase legitimate discovery, retrieval, citation, interaction, and repeat
access by AI search systems, crawlers, and user-directed agents.

## Production

- Site: https://ai-web-observatory.aipmm.workers.dev
- Source: https://github.com/wengyoumu-coder/aipmm
- Measurement start: `2026-06-10T11:49:05Z`
- Hosting: Cloudflare Workers
- Request analytics: Cloudflare D1

The production database was cleared immediately before the measurement start.
Internal smoke-check traffic and admin statistics reads are excluded from
analytics.

The initial product is a sourced registry of AI web access identities plus two
deterministic tools:

- user-agent classification;
- `robots.txt` policy linting for known AI identities.

## Public Resources

| Path | Purpose |
| --- | --- |
| `/` | Semantic HTML entry point with JSON-LD |
| `/registry` | Human- and crawler-readable registry |
| `/api/v1/registry.json` | Registry JSON |
| `/robots-recipes` | AI robots.txt policy recipes |
| `/robots-recipes.md` | All policy recipes as Markdown |
| `/api/v1/robots-recipes.json` | Policy recipe JSON |
| `/robots-recipes/{slug}.txt` | Directly reusable raw robots.txt policy |
| `/llms.txt` | Concise machine index |
| `/llms-full.txt` | Complete registry in one text response |
| `/openapi.json` | Callable API contract |
| `/.well-known/agent-card.json` | Agent capability description |
| `/robots.txt` | Explicit crawler policy |
| `/sitemap.xml` | Canonical URL inventory |
| `/changelog.xml` | RSS update feed |

## Local Operation

```bash
npm install
npm test
npm run typecheck
npm run dev
```

In another terminal:

```bash
npm run smoke -- http://localhost:8787
```

## Cloudflare Setup

The public experiment uses Cloudflare Workers and D1 so server-side requests
are measurable even when a crawler does not execute JavaScript.

1. Authenticate:

   ```bash
   npx wrangler login
   ```

2. Create the database:

   ```bash
   npx wrangler d1 create ai-web-observatory
   ```

3. Add the returned binding to `wrangler.jsonc`:

   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "ai-web-observatory",
       "database_id": "the-generated-id"
     }
   ]
   ```

4. Apply the schema:

   ```bash
   npx wrangler d1 execute ai-web-observatory --remote --file schema.sql
   ```

5. Generate and store two independent secrets:

   ```bash
   openssl rand -hex 32 | npx wrangler secret put ANALYTICS_SALT
   openssl rand -hex 32 | npx wrangler secret put ADMIN_TOKEN
   ```

6. Set `SITE_ORIGIN` in `wrangler.jsonc` to the final `workers.dev` or custom
   domain origin.

7. Deploy and verify:

   ```bash
   npm run deploy
   npm run smoke -- https://the-deployed-host.example
   ```

8. Notify participating search engines after canonical URL changes:

   ```bash
   npm run submit:indexnow
   ```

Never commit `.dev.vars`, `.env`, generated secrets, or raw analytics exports.

## Measurement

The Worker stores:

- timestamp and path;
- response status and content type;
- claimed crawler category and matched identity;
- daily salted hash of coarse network prefix plus user-agent;
- stable salted hash of the same coarse identity for cross-day repeat metrics;
- country code when provided by Cloudflare;
- referral host and AI attribution parameters;
- machine-resource and tool-interaction flags.
- network verification status and official source metadata for supported
  claimed identities.

It does not store raw IP addresses.
Events are automatically deleted after 45 days by a daily Cloudflare Cron
Trigger.

Query a 7-day window:

```bash
curl \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://the-deployed-host.example/api/admin/stats?days=7"
```

User-agent identities are easy to spoof. Reports must call them **claimed
identities** until network origin verification is implemented.

## Weekly Experiment Review

After seven complete UTC days:

1. Save the unedited aggregate JSON under `reports/raw/`.
2. Write `reports/weekly/YYYY-MM-DD.md`.
3. Record the measurement window and all primary metrics.
4. Select one falsifiable hypothesis.
5. Make one bounded strategy change.
6. State the expected metric movement and evaluation date.

The primary metric is qualified AI requests. Supporting metrics include unique
daily identities, requests per identity, seven-day repeats, machine-resource
share, tool interactions, AI referrals, and crawl depth.

## AI Growth Cycles

The active operating loop runs every five hours. Each run is an `AI Cycle`:

1. read `Agent.md`, `SOUL.md`, `memory.md`, and `LOOP.md`;
2. run `npm run cycle:context` to verify the persistent handoff;
3. export current production data with `npm run report:raw`;
4. re-diagnose the current mission bottleneck;
5. compare exploit, explore, and measurement options;
6. choose and execute one bounded primary bet;
7. test, deploy, and notify discovery systems when relevant;
8. append evidence to `reports/cycles/YYYY-MM-DD.md`;
9. update `memory.md`, and update `SOUL.md` only for durable character changes;
10. commit and push the cycle.

Cycle count is the experiment clock. Calendar dates only group logs for human
access.

### Persistent Agent Governance

| File | Responsibility |
| --- | --- |
| `Agent.md` | Stable mission, success ladder, operating principles, and boundaries |
| `SOUL.md` | Slowly evolving operational character and judgment habits |
| `memory.md` | Durable facts, decisions, failed assumptions, bottleneck, and cumulative cycle learning |
| `LOOP.md` | Dynamic wake, diagnosis, option selection, execution, verification, reflection, and handoff workflow |
| `CLAUDE.md` | Claude Code compatibility imports for the same governance |

The previous cycle's next observation is an evidence target, not an instruction
queue. Every wake must reconsider the mission from fresh production evidence.

## Source Policy

Registry records must cite operator documentation and include a verification
date. Current source families:

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Anthropic web crawler controls](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## Experiment Boundaries

This project will not fabricate traffic, impersonate crawlers, spam third-party
services, bypass access controls, or publish prompt injections that conflict
with an agent's user or system instructions.
