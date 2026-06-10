const BASE_HEADERS: HeadersInit = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300, s-maxage=3600",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

function weakEtag(body: string): string {
  let hash = 2166136261;
  for (let index = 0; index < body.length; index += 1) {
    hash ^= body.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `W/"${body.length.toString(16)}-${(hash >>> 0).toString(16)}"`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeXml(value: string): string {
  return escapeHtml(value);
}

export function createResponse(
  body: string,
  options: {
    status?: number;
    contentType: string;
    head?: boolean;
    headers?: HeadersInit;
  },
): Response {
  const headers = new Headers(BASE_HEADERS);
  headers.set("content-type", options.contentType);
  headers.set("etag", weakEtag(body));
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return new Response(options.head ? null : body, {
    status: options.status ?? 200,
    headers,
  });
}

export function jsonResponse(
  value: unknown,
  options: {
    status?: number;
    head?: boolean;
    headers?: HeadersInit;
  } = {},
): Response {
  return createResponse(`${JSON.stringify(value, null, 2)}\n`, {
    ...options,
    contentType: "application/json; charset=utf-8",
  });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  head = false,
): Response {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    { status, head, headers: { "cache-control": "no-store" } },
  );
}

export function htmlDocument(input: {
  title: string;
  description: string;
  canonicalUrl: string;
  body: string;
  jsonLd?: unknown;
}): string {
  const jsonLd = input.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(input.jsonLd).replaceAll("<", "\\u003c")}</script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.title)}</title>
<meta name="description" content="${escapeHtml(input.description)}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<link rel="canonical" href="${escapeHtml(input.canonicalUrl)}">
<link rel="alternate" type="application/rss+xml" href="/changelog.xml" title="AI Web Observatory changelog">
${jsonLd}
</head>
<body>
<header>
<a href="/">AI Web Observatory</a>
<nav>
<a href="/registry">Registry</a>
<a href="/changelog">Changelog</a>
<a href="/llms.txt">LLM index</a>
<a href="/openapi.json">OpenAPI</a>
</nav>
</header>
<main>${input.body}</main>
<footer>
<p>Machine resources: <a href="/api/v1/manifest.json">manifest</a> · <a href="/api/v1/registry.json">registry JSON</a> · <a href="/sitemap.xml">sitemap</a> · <a href="/llms-full.txt">full text</a></p>
</footer>
</body>
</html>`;
}
