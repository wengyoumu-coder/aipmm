import {
  CHANGES,
  findRegistryEntry,
  INDEXNOW_KEY,
  LAUNCHED_AT,
  REGISTRY,
  UPDATED_ON,
} from "./catalog";
import { isAdminAuthorized, queryStats } from "./analytics";
import { classifyRequest } from "./classify";
import {
  createResponse,
  errorResponse,
  escapeHtml,
  escapeXml,
  htmlDocument,
  jsonResponse,
} from "./render";
import { lintRobotsPolicy } from "./robots-lint";
import {
  findRobotsRecipe,
  generateRobotsPolicy,
  recipeDecision,
  ROBOTS_RECIPES,
  robotsRecipesMarkdown,
  type RobotsRecipe,
} from "./robots-recipes";
import type { Env, RegistryEntry } from "./types";

function resolveOrigin(request: Request, env: Env): string {
  const configured = env.SITE_ORIGIN?.replace(/\/+$/, "");
  if (configured && !configured.includes("localhost")) {
    return configured;
  }
  return new URL(request.url).origin;
}

function commonHeaders(origin: string): HeadersInit {
  return {
    link: [
      `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
      `<${origin}/llms.txt>; rel="alternate"; type="text/plain"`,
      `<${origin}/skill.md>; rel="describedby"; type="text/markdown"`,
      `<${origin}/openapi.json>; rel="service-desc"; type="application/json"`,
    ].join(", "),
  };
}

function homepage(origin: string): string {
  const body = `<article>
<h1>AI Web Observatory</h1>
<p>A machine-first, source-linked registry and toolset for AI access to the public web.</p>
<section>
<h2>Resources</h2>
<ul>
<li><a href="/api/v1/registry.json">AI crawler and user-agent registry (JSON)</a></li>
<li><a href="/registry">AI crawler and user-agent registry (HTML)</a></li>
<li><a href="/robots-recipes">AI robots.txt policy recipes</a></li>
<li><a href="/robots-recipes.md">AI robots.txt policy recipes (Markdown)</a></li>
<li><a href="/tools">Tool directory with example requests</a></li>
<li><a href="/api/v1/tools.json">Tool directory (JSON)</a></li>
<li><a href="/skill.md">Executable AI web access policy skill (Markdown)</a></li>
<li><a href="/openapi.json">Callable tool contract (OpenAPI 3.1)</a></li>
<li><a href="/llms.txt">Concise LLM index</a></li>
<li><a href="/llms-full.txt">Complete machine-readable text</a></li>
</ul>
</section>
<section>
<h2>Callable tools</h2>
<ul>
<li><code>POST /api/v1/tools/classify-user-agent</code></li>
<li><code>POST /api/v1/tools/lint-robots</code></li>
<li><code>POST /api/v1/tools/generate-robots</code></li>
</ul>
</section>
<p>Registry entries: ${REGISTRY.length}. Last verified: <time datetime="${UPDATED_ON}">${UPDATED_ON}</time>.</p>
<p>Public experiment launched: <time datetime="${LAUNCHED_AT}">${LAUNCHED_AT}</time>.</p>
</article>`;

  return htmlDocument({
    title: "AI Web Observatory",
    description:
      "Source-linked AI crawler registry, robots policy tools, and machine-readable web access data.",
    canonicalUrl: `${origin}/`,
    body,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "AI Web Observatory",
          url: `${origin}/`,
          dateModified: UPDATED_ON,
        },
        {
          "@type": "Dataset",
          name: "AI Web Access Identity Registry",
          description:
            "A sourced registry of AI search, training, and user-directed web access identities.",
          url: `${origin}/api/v1/registry.json`,
          dateModified: UPDATED_ON,
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: `${origin}/api/v1/registry.json`,
            },
            {
              "@type": "DataDownload",
              encodingFormat: "text/plain",
              contentUrl: `${origin}/llms-full.txt`,
            },
          ],
        },
      ],
    },
  });
}

const TOOL_CATALOG = [
  {
    id: "classify-user-agent",
    name: "Classify user-agent",
    method: "POST",
    path: "/api/v1/tools/classify-user-agent",
    summary:
      "Classify a claimed crawler, agent, browser, or automation user-agent string.",
    exampleRequest: { userAgent: "OAI-SearchBot/1.0" },
    exampleResponse: {
      category: "ai-search-crawler",
      matchedIdentity: "OAI-SearchBot",
      qualifiedAI: true,
    },
  },
  {
    id: "lint-robots",
    name: "Lint robots policy",
    method: "POST",
    path: "/api/v1/tools/lint-robots",
    summary:
      "Report how a robots.txt policy treats documented AI search, training, and user-action identities.",
    exampleRequest: { robotsText: "User-agent: OAI-SearchBot\nAllow: /" },
    exampleResponse: {
      summary: { allowed: 1, blocked: 0, unspecified: 7 },
    },
  },
  {
    id: "generate-robots",
    name: "Generate robots policy",
    method: "POST",
    path: "/api/v1/tools/generate-robots",
    summary:
      "Generate a sourced robots.txt policy from a documented preset and lint the result.",
    exampleRequest: { preset: "search-visible-no-training" },
    exampleResponse: {
      recipe: { slug: "search-visible-no-training" },
      robotsText: "User-agent: OAI-SearchBot\nAllow: /",
    },
  },
] as const;

function toolsIndex(origin: string): string {
  const items = TOOL_CATALOG.map(
    (tool) => `<li>
<article>
<h2><code>${escapeHtml(tool.method)} ${escapeHtml(tool.path)}</code></h2>
<p>${escapeHtml(tool.summary)}</p>
<p>JSON catalog: <a href="/api/v1/tools.json">/api/v1/tools.json</a></p>
<pre><code>${escapeHtml(JSON.stringify(tool.exampleRequest, null, 2))}</code></pre>
</article>
</li>`,
  ).join("\n");

  return htmlDocument({
    title: "AI tool directory - AI Web Observatory",
    description:
      "Callable AI web access tools with example requests and machine-readable discovery metadata.",
    canonicalUrl: `${origin}/tools`,
    body: `<article>
<h1>AI tool directory</h1>
<p>Machine-usable entry points with deterministic JSON inputs and outputs.</p>
<p>End-to-end workflow: <a href="/skill.md">/skill.md</a></p>
<ol>${items}</ol>
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AI Web Observatory tool directory",
      numberOfItems: TOOL_CATALOG.length,
      itemListElement: TOOL_CATALOG.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${origin}${tool.path}`,
      })),
    },
  });
}

function robotsRecipeIndex(origin: string): string {
  const items = ROBOTS_RECIPES.map(
    (recipe) => `<li>
<article>
<h2><a href="/robots-recipes/${escapeHtml(recipe.slug)}">${escapeHtml(recipe.title)}</a></h2>
<p>${escapeHtml(recipe.summary)}</p>
<p>${escapeHtml(recipe.rationale)}</p>
<p><a href="/api/v1/robots-recipes/${escapeHtml(recipe.slug)}.json">JSON representation</a></p>
</article>
</li>`,
  ).join("\n");

  return htmlDocument({
    title: "AI robots.txt policy recipes",
    description:
      "Deterministic robots.txt recipes for AI search, training, and user-directed web identities.",
    canonicalUrl: `${origin}/robots-recipes`,
    body: `<article>
<h1>AI robots.txt policy recipes</h1>
<p>Five reusable policies derived from the sourced identity registry. Select a recipe, inspect every token, then generate or lint a final policy through the API.</p>
<ol>${items}</ol>
<p>Complete Markdown: <a href="/robots-recipes.md">/robots-recipes.md</a></p>
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AI robots.txt policy recipes",
      numberOfItems: ROBOTS_RECIPES.length,
      itemListElement: ROBOTS_RECIPES.map((recipe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${origin}/robots-recipes/${recipe.slug}`,
        name: recipe.title,
      })),
    },
  });
}

function robotsRecipeDetail(
  origin: string,
  recipe: RobotsRecipe,
): string {
  const policy = generateRobotsPolicy(recipe, {
    sitemap: `${origin}/sitemap.xml`,
  });
  const decisions = REGISTRY.map((entry) => {
    const decision = recipeDecision(recipe, entry);
    return `<tr>
<td><a href="/registry/${escapeHtml(entry.slug)}">${escapeHtml(entry.robotsToken)}</a></td>
<td>${escapeHtml(entry.operator)}</td>
<td>${escapeHtml(entry.purpose)}</td>
<td>${escapeHtml(decision)}</td>
</tr>`;
  }).join("\n");

  return htmlDocument({
    title: `${recipe.title} - AI Web Observatory`,
    description: recipe.summary,
    canonicalUrl: `${origin}/robots-recipes/${recipe.slug}`,
    body: `<article>
<h1>${escapeHtml(recipe.title)}</h1>
<p>${escapeHtml(recipe.summary)}</p>
<p>${escapeHtml(recipe.rationale)}</p>
<h2>Generated robots.txt</h2>
<pre><code>${escapeHtml(policy)}</code></pre>
<h2>Identity decisions</h2>
<table>
<thead><tr><th>Token</th><th>Operator</th><th>Purpose</th><th>Decision</th></tr></thead>
<tbody>${decisions}</tbody>
</table>
<h2>Machine continuation</h2>
<ul>
<li><a href="/api/v1/robots-recipes/${escapeHtml(recipe.slug)}.json">Recipe JSON</a></li>
<li><code>POST /api/v1/tools/generate-robots</code> with <code>{"preset":"${escapeHtml(recipe.slug)}"}</code></li>
<li><code>POST /api/v1/tools/lint-robots</code> to inspect a modified policy</li>
</ul>
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: recipe.title,
      description: recipe.summary,
      url: `${origin}/robots-recipes/${recipe.slug}`,
      dateModified: UPDATED_ON,
      step: [
        {
          "@type": "HowToStep",
          name: "Review identity decisions",
          text: "Review the allow or disallow decision for each documented identity.",
        },
        {
          "@type": "HowToStep",
          name: "Generate the policy",
          text: "Copy the generated robots.txt or call the generator API.",
        },
        {
          "@type": "HowToStep",
          name: "Validate the policy",
          text: "Call the lint tool after making site-specific changes.",
        },
      ],
    },
  });
}

function registryIndex(origin: string): string {
  const items = REGISTRY.map(
    (entry) => `<li>
<article>
<h2><a href="/registry/${escapeHtml(entry.slug)}">${escapeHtml(entry.userAgent)}</a></h2>
<p>${escapeHtml(entry.description)}</p>
<dl>
<dt>Operator</dt><dd>${escapeHtml(entry.operator)}</dd>
<dt>Purpose</dt><dd>${escapeHtml(entry.purpose)}</dd>
<dt>Robots token</dt><dd><code>${escapeHtml(entry.robotsToken)}</code></dd>
</dl>
</article>
</li>`,
  ).join("\n");

  return htmlDocument({
    title: "AI Web Access Identity Registry",
    description:
      "Sourced AI search crawler, training crawler, and user-directed agent identities.",
    canonicalUrl: `${origin}/registry`,
    body: `<article><h1>AI Web Access Identity Registry</h1><p>Each entry links to operator documentation and records the last verification date.</p><ol>${items}</ol></article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "AI Web Access Identity Registry",
      url: `${origin}/registry`,
      dateModified: UPDATED_ON,
      creator: { "@type": "Organization", name: "AI Web Observatory" },
    },
  });
}

function registryDetail(origin: string, entry: RegistryEntry): string {
  return htmlDocument({
    title: `${entry.userAgent} - AI Web Observatory`,
    description: entry.description,
    canonicalUrl: `${origin}/registry/${entry.slug}`,
    body: `<article>
<h1>${escapeHtml(entry.userAgent)}</h1>
<p>${escapeHtml(entry.description)}</p>
<dl>
<dt>Operator</dt><dd>${escapeHtml(entry.operator)}</dd>
<dt>Product</dt><dd>${escapeHtml(entry.product)}</dd>
<dt>Purpose</dt><dd>${escapeHtml(entry.purpose)}</dd>
<dt>User-Agent identity</dt><dd><code>${escapeHtml(entry.userAgent)}</code></dd>
<dt>robots.txt token</dt><dd><code>${escapeHtml(entry.robotsToken)}</code></dd>
<dt>Verified</dt><dd><time datetime="${entry.verifiedOn}">${entry.verifiedOn}</time></dd>
</dl>
<p>Primary source: <a rel="external" href="${escapeHtml(entry.sourceUrl)}">${escapeHtml(entry.sourceTitle)}</a>.</p>
<p>JSON representation: <a href="/api/v1/registry/${escapeHtml(entry.slug)}.json">/api/v1/registry/${escapeHtml(entry.slug)}.json</a></p>
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: entry.userAgent,
      description: entry.description,
      dateModified: entry.verifiedOn,
      url: `${origin}/registry/${entry.slug}`,
      citation: entry.sourceUrl,
      about: {
        "@type": "SoftwareApplication",
        name: entry.product,
        author: {
          "@type": "Organization",
          name: entry.operator,
        },
      },
    },
  });
}

function robotsText(origin: string): string {
  const explicit = REGISTRY.map(
    (entry) => `User-agent: ${entry.robotsToken}\nAllow: /`,
  ).join("\n\n");

  return `${explicit}

User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

function skillMarkdown(origin: string): string {
  return `---
name: ai-web-access-policy
description: Audit or generate robots.txt rules for documented AI search, training, and user-directed fetch identities.
---

# AI Web Access Policy

Use this skill when a user needs to understand, draft, or audit robots.txt rules for AI systems.

## Inputs

- The user's desired policy: search visibility, training access, user-directed access, or a custom combination.
- An existing robots.txt policy when the task is an audit.
- An optional absolute sitemap URL when generating a policy.

## Workflow

1. Read the sourced identity registry at ${origin}/api/v1/registry.json.
2. Read available policy presets at ${origin}/api/v1/robots-recipes.json.
3. Choose the closest preset and explain any mismatch with the user's intent.
4. Generate a policy with the tool below.
5. If the policy is modified, lint the final text with the lint tool.
6. Return the final robots.txt, the decision for each documented identity, and source links from the registry.

## Generate a policy

\`\`\`http
POST ${origin}/api/v1/tools/generate-robots
Content-Type: application/json

{"preset":"search-visible-no-training","sitemap":"https://example.com/sitemap.xml"}
\`\`\`

## Audit a policy

\`\`\`http
POST ${origin}/api/v1/tools/lint-robots
Content-Type: application/json

{"robotsText":"User-agent: OAI-SearchBot\\nAllow: /"}
\`\`\`

## Integrity rules

- Do not treat a claimed User-Agent as independently verified.
- Do not invent crawler identities or source claims.
- Distinguish documented robots.txt intent from guaranteed crawler behavior.
- Do not send requests to third-party sites unless the user explicitly asks.

## Completion

A complete result includes the selected intent, final policy, lint summary, per-identity decisions, and citations to the registry source URLs.
`;
}

function publicUrls(origin: string): Array<{
  url: string;
  modified: string;
}> {
  const fixed = [
    "/",
    "/registry",
    "/robots-recipes",
    "/robots-recipes.md",
    "/tools",
    "/skill.md",
    "/changelog",
    "/llms.txt",
    "/llms-full.txt",
    "/openapi.json",
    "/api/v1/manifest.json",
    "/api/v1/registry.json",
    "/api/v1/tools.json",
    "/api/v1/robots-recipes.json",
    "/.well-known/agent-card.json",
  ];

  return [
    ...fixed.map((path) => ({ url: `${origin}${path}`, modified: UPDATED_ON })),
    ...REGISTRY.map((entry) => ({
      url: `${origin}/registry/${entry.slug}`,
      modified: entry.verifiedOn,
    })),
    ...REGISTRY.map((entry) => ({
      url: `${origin}/api/v1/registry/${entry.slug}.json`,
      modified: entry.verifiedOn,
    })),
    ...ROBOTS_RECIPES.map((recipe) => ({
      url: `${origin}/robots-recipes/${recipe.slug}`,
      modified: UPDATED_ON,
    })),
    ...ROBOTS_RECIPES.map((recipe) => ({
      url: `${origin}/api/v1/robots-recipes/${recipe.slug}.json`,
      modified: UPDATED_ON,
    })),
  ];
}

function sitemapXml(origin: string): string {
  const urls = publicUrls(origin)
    .map(
      (item) =>
        `<url><loc>${escapeXml(item.url)}</loc><lastmod>${item.modified}</lastmod></url>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}

function conciseLlms(origin: string): string {
  return `# AI Web Observatory

> Source-linked registry and deterministic tools for AI access to the public web.

Last verified: ${UPDATED_ON}

## Primary resources

- [Registry JSON](${origin}/api/v1/registry.json): AI crawler and user-directed agent identities.
- [Robots recipes](${origin}/api/v1/robots-recipes.json): Reusable AI access policies.
- [Robots recipes Markdown](${origin}/robots-recipes.md): Generated policies in one text resource.
- [Tool catalog](${origin}/api/v1/tools.json): Callable tool directory with example requests and outputs.
- [Agent skill](${origin}/skill.md): End-to-end workflow for generating and auditing AI robots.txt policy.
- [OpenAPI contract](${origin}/openapi.json): Callable user-agent classification and robots policy linting.
- [Full text](${origin}/llms-full.txt): Complete registry in one text response.
- [Changelog RSS](${origin}/changelog.xml): Updates to the registry and tools.
`;
}

function fullLlms(origin: string): string {
  const entries = REGISTRY.map(
    (entry) => `### ${entry.userAgent}

- Operator: ${entry.operator}
- Product: ${entry.product}
- Purpose: ${entry.purpose}
- robots.txt token: ${entry.robotsToken}
- Description: ${entry.description}
- Source: ${entry.sourceTitle} (${entry.sourceUrl})
- Verified: ${entry.verifiedOn}`,
  ).join("\n\n");
  const recipes = robotsRecipesMarkdown(origin);

  return `${conciseLlms(origin)}

## Registry Entries

${entries}

## robots.txt recipes

${recipes}

## Tool usage

POST ${origin}/api/v1/tools/classify-user-agent
Content-Type: application/json
Body: {"userAgent":"OAI-SearchBot/1.0"}

POST ${origin}/api/v1/tools/lint-robots
Content-Type: application/json
Body: {"robotsText":"User-agent: OAI-SearchBot\\nAllow: /"}

POST ${origin}/api/v1/tools/generate-robots
Content-Type: application/json
Body: {"preset":"search-visible-no-training","sitemap":"${origin}/sitemap.xml"}
`;
}

function changelogHtml(origin: string): string {
  const items = CHANGES.map(
    (change) => `<article id="${escapeHtml(change.id)}">
<h2>${escapeHtml(change.title)}</h2>
<time datetime="${change.date}">${change.date}</time>
<p>${escapeHtml(change.summary)}</p>
</article>`,
  ).join("");
  return htmlDocument({
    title: "Changelog - AI Web Observatory",
    description: "Dated changes to the AI Web Observatory registry and tools.",
    canonicalUrl: `${origin}/changelog`,
    body: `<h1>Changelog</h1>${items}`,
  });
}

function changelogRss(origin: string): string {
  const items = CHANGES.map(
    (change) => `<item>
<guid>${escapeXml(`${origin}/changelog#${change.id}`)}</guid>
<title>${escapeXml(change.title)}</title>
<link>${escapeXml(`${origin}/changelog#${change.id}`)}</link>
<pubDate>${new Date(`${change.date}T00:00:00Z`).toUTCString()}</pubDate>
<description>${escapeXml(change.summary)}</description>
</item>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>AI Web Observatory Changelog</title>
<link>${escapeXml(`${origin}/changelog`)}</link>
<description>Registry and tool updates.</description>
${items}
</channel></rss>
`;
}

function manifest(origin: string): Record<string, unknown> {
  return {
    name: "AI Web Observatory",
    description:
      "Source-linked registry and deterministic tools for AI web access.",
    version: "0.1.0",
    updatedOn: UPDATED_ON,
    launchedAt: LAUNCHED_AT,
    canonicalUrl: `${origin}/`,
    resources: [
      `${origin}/api/v1/registry.json`,
      `${origin}/api/v1/tools.json`,
      `${origin}/skill.md`,
      `${origin}/api/v1/robots-recipes.json`,
      `${origin}/robots-recipes.md`,
      `${origin}/llms.txt`,
      `${origin}/llms-full.txt`,
      `${origin}/openapi.json`,
      `${origin}/changelog.xml`,
      `${origin}/sitemap.xml`,
    ],
    tools: [
      `${origin}/api/v1/tools/classify-user-agent`,
      `${origin}/api/v1/tools/lint-robots`,
      `${origin}/api/v1/tools/generate-robots`,
    ],
    discovery: {
      robots: `${origin}/robots.txt`,
      sitemap: `${origin}/sitemap.xml`,
      indexNowKeyUrl: `${origin}/${INDEXNOW_KEY}.txt`,
    },
  };
}

function openApi(origin: string): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: "AI Web Observatory API",
      version: "0.1.0",
      description:
        "Registry and deterministic tools for AI crawler and robots policy analysis.",
    },
    servers: [{ url: origin }],
    paths: {
      "/api/v1/registry": {
        get: {
          operationId: "listRegistryEntries",
          responses: { "200": { description: "Registry entries" } },
        },
      },
      "/api/v1/registry/{slug}": {
        get: {
          operationId: "getRegistryEntry",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Registry entry" } },
        },
      },
      "/api/v1/robots-recipes.json": {
        get: {
          operationId: "listRobotsRecipes",
          responses: { "200": { description: "robots.txt policy recipes" } },
        },
      },
      "/api/v1/robots-recipes/{slug}.json": {
        get: {
          operationId: "getRobotsRecipe",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Generated recipe policy" } },
        },
      },
      "/api/v1/tools/classify-user-agent": {
        post: {
          operationId: "classifyUserAgent",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userAgent"],
                  properties: { userAgent: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Classification result" } },
        },
      },
      "/api/v1/tools/lint-robots": {
        post: {
          operationId: "lintRobotsPolicy",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["robotsText"],
                  properties: { robotsText: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Policy diagnostics" } },
        },
      },
      "/api/v1/tools/generate-robots": {
        post: {
          operationId: "generateRobotsPolicy",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["preset"],
                  properties: {
                    preset: {
                      type: "string",
                      enum: ROBOTS_RECIPES.map((recipe) => recipe.slug),
                    },
                    sitemap: { type: "string", format: "uri" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Generated and linted policy" } },
        },
      },
    },
  };
}

function agentCard(origin: string): Record<string, unknown> {
  return {
    name: "AI Web Observatory",
    description:
      "Machine-readable AI crawler registry and deterministic web access policy tools.",
    url: `${origin}/`,
    version: "0.1.0",
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["application/json", "text/plain"],
    defaultOutputModes: ["application/json", "text/plain"],
    documentationUrl: `${origin}/skill.md`,
    toolsUrl: `${origin}/tools`,
    skills: [
      {
        id: "classify-user-agent",
        name: "Classify user-agent",
        description:
          "Classify a claimed crawler, AI agent, browser, or automation user-agent string.",
      },
      {
        id: "lint-robots",
        name: "Lint robots policy",
        description:
          "Report how a robots.txt policy treats known AI web identities.",
      },
      {
        id: "generate-robots",
        name: "Generate robots policy",
        description:
          "Generate and lint a sourced AI robots.txt policy from a documented preset.",
      },
    ],
  };
}

async function readJsonBody(
  request: Request,
): Promise<
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; response: Response }
> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 65_536) {
    return {
      ok: false,
      response: errorResponse(
        413,
        "payload_too_large",
        "Request bodies are limited to 65536 bytes",
      ),
    };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 65_536) {
    return {
      ok: false,
      response: errorResponse(
        413,
        "payload_too_large",
        "Request bodies are limited to 65536 bytes",
      ),
    };
  }

  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {
        ok: false,
        response: errorResponse(
          400,
          "invalid_request",
          "The JSON body must be an object",
        ),
      };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return {
      ok: false,
      response: errorResponse(
        400,
        "invalid_json",
        "The request body is not valid JSON",
      ),
    };
  }
}

async function toolResponse(
  request: Request,
  pathname: string,
): Promise<Response> {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  if (pathname === "/api/v1/tools/classify-user-agent") {
    const userAgent = parsed.value.userAgent;
    if (typeof userAgent !== "string" || userAgent.trim() === "") {
      return errorResponse(
        400,
        "invalid_request",
        "userAgent must be a non-empty string",
      );
    }

    const classification = classifyRequest({
      userAgent,
      referer: "",
      url: request.url,
    });
    const registryEntry = classification.matchedIdentity
      ? REGISTRY.find(
          (entry) => entry.userAgent === classification.matchedIdentity,
        ) ?? null
      : null;
    return jsonResponse({ ...classification, registryEntry });
  }

  if (pathname === "/api/v1/tools/generate-robots") {
    const preset = parsed.value.preset;
    if (typeof preset !== "string") {
      return errorResponse(
        400,
        "invalid_request",
        "preset must be a recipe slug",
      );
    }
    const recipe = findRobotsRecipe(preset);
    if (!recipe) {
      return errorResponse(
        400,
        "invalid_request",
        `Unknown preset: ${preset}`,
      );
    }

    const sitemap = parsed.value.sitemap;
    if (sitemap !== undefined && typeof sitemap !== "string") {
      return errorResponse(
        400,
        "invalid_request",
        "sitemap must be an absolute HTTP or HTTPS URL",
      );
    }
    if (typeof sitemap === "string") {
      try {
        const parsedSitemap = new URL(sitemap);
        if (
          !["http:", "https:"].includes(parsedSitemap.protocol) ||
          sitemap.length > 2_048
        ) {
          throw new Error("invalid sitemap");
        }
      } catch {
        return errorResponse(
          400,
          "invalid_request",
          "sitemap must be an absolute HTTP or HTTPS URL",
        );
      }
    }

    const robotsText = generateRobotsPolicy(recipe, { sitemap });
    return jsonResponse({
      recipe,
      robotsText,
      lint: lintRobotsPolicy(robotsText),
      continuations: {
        recipeJson: `/api/v1/robots-recipes/${recipe.slug}.json`,
        lintTool: "/api/v1/tools/lint-robots",
      },
    });
  }

  const robotsText = parsed.value.robotsText;
  if (typeof robotsText !== "string") {
    return errorResponse(
      400,
      "invalid_request",
      "robotsText must be a string",
    );
  }
  return jsonResponse(lintRobotsPolicy(robotsText));
}

function withCommonHeaders(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  new Headers(commonHeaders(origin)).forEach((value, key) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function handleRequest(
  request: Request,
  env: Env = {},
): Promise<Response> {
  const url = new URL(request.url);
  const origin = resolveOrigin(request, env);
  const head = request.method === "HEAD";
  const allowedReadMethod = request.method === "GET" || head;

  if (url.pathname === "/api/admin/stats") {
    if (!allowedReadMethod) {
      return errorResponse(
        405,
        "method_not_allowed",
        `Method ${request.method} is not allowed for ${url.pathname}`,
      );
    }
    if (!isAdminAuthorized(request, env)) {
      return errorResponse(
        401,
        "unauthorized",
        "A valid bearer token is required",
        head,
      );
    }
    if (!env.DB) {
      return errorResponse(
        503,
        "analytics_unavailable",
        "The analytics database is not configured",
        head,
      );
    }
    const rawDays = url.searchParams.get("days") ?? "7";
    const days = Number(rawDays);
    if (!Number.isInteger(days) || days < 1 || days > 31) {
      return errorResponse(
        400,
        "invalid_request",
        "days must be an integer between 1 and 31",
        head,
      );
    }
    const metrics = await queryStats(env.DB, days);
    return jsonResponse(
      {
        generatedAt: new Date().toISOString(),
        metrics,
        signalNotice:
          "User-agent identity is claimed unless independently verified by network origin.",
      },
      {
        head,
        headers: { "cache-control": "no-store" },
      },
    );
  }

  if (
    request.method === "POST" &&
    (url.pathname === "/api/v1/tools/classify-user-agent" ||
      url.pathname === "/api/v1/tools/lint-robots" ||
      url.pathname === "/api/v1/tools/generate-robots")
  ) {
    return withCommonHeaders(
      await toolResponse(request, url.pathname),
      origin,
    );
  }

  if (!allowedReadMethod) {
    return errorResponse(
      405,
      "method_not_allowed",
      `Method ${request.method} is not allowed for ${url.pathname}`,
    );
  }

  let response: Response;

  if (url.pathname === "/") {
    response = createResponse(homepage(origin), {
      contentType: "text/html; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/tools") {
    response = createResponse(toolsIndex(origin), {
      contentType: "text/html; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/registry") {
    response = createResponse(registryIndex(origin), {
      contentType: "text/html; charset=utf-8",
      head,
    });
  } else if (url.pathname.startsWith("/registry/")) {
    const entry = findRegistryEntry(url.pathname.slice("/registry/".length));
    response = entry
      ? createResponse(registryDetail(origin, entry), {
          contentType: "text/html; charset=utf-8",
          head,
        })
      : createResponse(
          htmlDocument({
            title: "Not found - AI Web Observatory",
            description: "The requested registry entry does not exist.",
            canonicalUrl: `${origin}${url.pathname}`,
            body: "<h1>Not found</h1><p>The requested registry entry does not exist.</p>",
          }),
          { status: 404, contentType: "text/html; charset=utf-8", head },
        );
  } else if (url.pathname === "/robots-recipes") {
    response = createResponse(robotsRecipeIndex(origin), {
      contentType: "text/html; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/robots-recipes.md") {
    response = createResponse(robotsRecipesMarkdown(origin), {
      contentType: "text/markdown; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/skill.md") {
    response = createResponse(skillMarkdown(origin), {
      contentType: "text/markdown; charset=utf-8",
      head,
    });
  } else if (url.pathname.startsWith("/robots-recipes/")) {
    const recipe = findRobotsRecipe(
      url.pathname.slice("/robots-recipes/".length),
    );
    response = recipe
      ? createResponse(robotsRecipeDetail(origin, recipe), {
          contentType: "text/html; charset=utf-8",
          head,
        })
      : createResponse(
          htmlDocument({
            title: "Not found - AI Web Observatory",
            description: "The requested robots recipe does not exist.",
            canonicalUrl: `${origin}${url.pathname}`,
            body: "<h1>Not found</h1><p>The requested robots recipe does not exist.</p>",
          }),
          { status: 404, contentType: "text/html; charset=utf-8", head },
        );
  } else if (
    url.pathname === "/api/v1/manifest" ||
    url.pathname === "/api/v1/manifest.json"
  ) {
    response = jsonResponse(manifest(origin), { head });
  } else if (
    url.pathname === "/api/v1/registry" ||
    url.pathname === "/api/v1/registry.json"
  ) {
    response = jsonResponse(
      {
        name: "AI Web Access Identity Registry",
        updatedOn: UPDATED_ON,
        count: REGISTRY.length,
        entries: REGISTRY,
      },
      { head },
    );
  } else if (
    url.pathname === "/api/v1/tools" ||
    url.pathname === "/api/v1/tools.json"
  ) {
    response = jsonResponse(
      {
        name: "AI Web Observatory tool catalog",
        updatedOn: UPDATED_ON,
        count: TOOL_CATALOG.length,
        tools: TOOL_CATALOG.map((tool) => ({
          ...tool,
          url: `${origin}${tool.path}`,
          documentationUrl: `${origin}/tools`,
        })),
      },
      { head },
    );
  } else if (url.pathname.startsWith("/api/v1/registry/")) {
    const slug = url.pathname
      .slice("/api/v1/registry/".length)
      .replace(/\.json$/, "");
    const entry = findRegistryEntry(slug);
    response = entry
      ? jsonResponse(entry, { head })
      : errorResponse(
          404,
          "not_found",
          `No registry entry exists at ${url.pathname}`,
          head,
        );
  } else if (
    url.pathname === "/api/v1/robots-recipes" ||
    url.pathname === "/api/v1/robots-recipes.json"
  ) {
    response = jsonResponse(
      {
        name: "AI robots.txt policy recipes",
        updatedOn: UPDATED_ON,
        count: ROBOTS_RECIPES.length,
        recipes: ROBOTS_RECIPES.map((recipe) => ({
          ...recipe,
          htmlUrl: `${origin}/robots-recipes/${recipe.slug}`,
          jsonUrl: `${origin}/api/v1/robots-recipes/${recipe.slug}.json`,
        })),
      },
      { head },
    );
  } else if (url.pathname.startsWith("/api/v1/robots-recipes/")) {
    const slug = url.pathname
      .slice("/api/v1/robots-recipes/".length)
      .replace(/\.json$/, "");
    const recipe = findRobotsRecipe(slug);
    response = recipe
      ? jsonResponse(
          {
            recipe,
            robotsText: generateRobotsPolicy(recipe, {
              sitemap: `${origin}/sitemap.xml`,
            }),
            decisions: REGISTRY.map((entry) => ({
              robotsToken: entry.robotsToken,
              purpose: entry.purpose,
              decision: recipeDecision(recipe, entry),
              registryUrl: `${origin}/api/v1/registry/${entry.slug}.json`,
            })),
            continuations: {
              generateTool: `${origin}/api/v1/tools/generate-robots`,
              lintTool: `${origin}/api/v1/tools/lint-robots`,
            },
          },
          { head },
        )
      : errorResponse(
          404,
          "not_found",
          `No robots recipe exists at ${url.pathname}`,
          head,
        );
  } else if (url.pathname === "/robots.txt") {
    response = createResponse(robotsText(origin), {
      contentType: "text/plain; charset=utf-8",
      head,
    });
  } else if (url.pathname === `/${INDEXNOW_KEY}.txt`) {
    response = createResponse(`${INDEXNOW_KEY}\n`, {
      contentType: "text/plain; charset=utf-8",
      head,
      headers: { "cache-control": "public, max-age=86400" },
    });
  } else if (url.pathname === "/sitemap.xml") {
    response = createResponse(sitemapXml(origin), {
      contentType: "application/xml; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/llms.txt") {
    response = createResponse(conciseLlms(origin), {
      contentType: "text/plain; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/llms-full.txt") {
    response = createResponse(fullLlms(origin), {
      contentType: "text/plain; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/changelog") {
    response = createResponse(changelogHtml(origin), {
      contentType: "text/html; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/changelog.json") {
    response = jsonResponse(
      { updatedOn: UPDATED_ON, changes: CHANGES },
      { head },
    );
  } else if (url.pathname === "/changelog.md") {
    response = createResponse(
      `# AI Web Observatory Changelog\n\n${CHANGES.map((change) => `## ${change.date}: ${change.title}\n\n${change.summary}`).join("\n\n")}\n`,
      { contentType: "text/markdown; charset=utf-8", head },
    );
  } else if (url.pathname === "/changelog.xml") {
    response = createResponse(changelogRss(origin), {
      contentType: "application/rss+xml; charset=utf-8",
      head,
    });
  } else if (url.pathname === "/openapi.json") {
    response = jsonResponse(openApi(origin), { head });
  } else if (url.pathname === "/.well-known/agent-card.json") {
    response = jsonResponse(agentCard(origin), { head });
  } else if (url.pathname.startsWith("/api/")) {
    response = errorResponse(
      404,
      "not_found",
      `No API resource exists at ${url.pathname}`,
      head,
    );
  } else {
    response = createResponse(
      htmlDocument({
        title: "Not found - AI Web Observatory",
        description: "The requested resource does not exist.",
        canonicalUrl: `${origin}${url.pathname}`,
        body: "<h1>Not found</h1><p>The requested resource does not exist.</p>",
      }),
      { status: 404, contentType: "text/html; charset=utf-8", head },
    );
  }

  return withCommonHeaders(response, origin);
}
