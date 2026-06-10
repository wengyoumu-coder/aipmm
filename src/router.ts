import {
  CHANGES,
  findRegistryEntry,
  REGISTRY,
  UPDATED_ON,
} from "./catalog";
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
<li><a href="/api/v1/registry">AI crawler and user-agent registry (JSON)</a></li>
<li><a href="/registry">AI crawler and user-agent registry (HTML)</a></li>
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
</ul>
</section>
<p>Registry entries: ${REGISTRY.length}. Last verified: <time datetime="${UPDATED_ON}">${UPDATED_ON}</time>.</p>
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
          url: `${origin}/api/v1/registry`,
          dateModified: UPDATED_ON,
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: `${origin}/api/v1/registry`,
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
<p>JSON representation: <a href="/api/v1/registry/${escapeHtml(entry.slug)}">/api/v1/registry/${escapeHtml(entry.slug)}</a></p>
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

function publicUrls(origin: string): Array<{
  url: string;
  modified: string;
}> {
  const fixed = [
    "/",
    "/registry",
    "/changelog",
    "/llms.txt",
    "/llms-full.txt",
    "/openapi.json",
    "/api/v1/manifest",
    "/api/v1/registry",
    "/.well-known/agent-card.json",
  ];

  return [
    ...fixed.map((path) => ({ url: `${origin}${path}`, modified: UPDATED_ON })),
    ...REGISTRY.map((entry) => ({
      url: `${origin}/registry/${entry.slug}`,
      modified: entry.verifiedOn,
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

- [Registry JSON](${origin}/api/v1/registry): AI crawler and user-directed agent identities.
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

  return `${conciseLlms(origin)}

## Registry Entries

${entries}

## Tool usage

POST ${origin}/api/v1/tools/classify-user-agent
Content-Type: application/json
Body: {"userAgent":"OAI-SearchBot/1.0"}

POST ${origin}/api/v1/tools/lint-robots
Content-Type: application/json
Body: {"robotsText":"User-agent: OAI-SearchBot\\nAllow: /"}
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
    canonicalUrl: `${origin}/`,
    resources: [
      `${origin}/api/v1/registry`,
      `${origin}/llms.txt`,
      `${origin}/llms-full.txt`,
      `${origin}/openapi.json`,
      `${origin}/changelog.xml`,
      `${origin}/sitemap.xml`,
    ],
    tools: [
      `${origin}/api/v1/tools/classify-user-agent`,
      `${origin}/api/v1/tools/lint-robots`,
    ],
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

  if (
    request.method === "POST" &&
    (url.pathname === "/api/v1/tools/classify-user-agent" ||
      url.pathname === "/api/v1/tools/lint-robots")
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
  } else if (url.pathname === "/api/v1/manifest") {
    response = jsonResponse(manifest(origin), { head });
  } else if (url.pathname === "/api/v1/registry") {
    response = jsonResponse(
      {
        name: "AI Web Access Identity Registry",
        updatedOn: UPDATED_ON,
        count: REGISTRY.length,
        entries: REGISTRY,
      },
      { head },
    );
  } else if (url.pathname.startsWith("/api/v1/registry/")) {
    const entry = findRegistryEntry(
      url.pathname.slice("/api/v1/registry/".length),
    );
    response = entry
      ? jsonResponse(entry, { head })
      : errorResponse(
          404,
          "not_found",
          `No registry entry exists at ${url.pathname}`,
          head,
        );
  } else if (url.pathname === "/robots.txt") {
    response = createResponse(robotsText(origin), {
      contentType: "text/plain; charset=utf-8",
      head,
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
