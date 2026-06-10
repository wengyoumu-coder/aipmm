const baseUrl = (
  process.argv[2] ??
  process.env.BASE_URL ??
  "http://localhost:8787"
).replace(/\/+$/, "");

const resources = [
  ["/", "text/html"],
  ["/registry", "text/html"],
  ["/robots-recipes", "text/html"],
  ["/robots-recipes.md", "text/markdown"],
  ["/tools", "text/html"],
  ["/api/v1/manifest.json", "application/json"],
  ["/api/v1/registry.json", "application/json"],
  ["/api/v1/tools.json", "application/json"],
  ["/api/v1/robots-recipes.json", "application/json"],
  ["/registry/openai-oai-searchbot", "text/html"],
  ["/api/v1/registry/openai-oai-searchbot.json", "application/json"],
  [
    "/api/v1/robots-recipes/search-visible-no-training.json",
    "application/json",
  ],
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "application/xml"],
  ["/llms.txt", "text/plain"],
  ["/llms-full.txt", "text/plain"],
  ["/changelog.xml", "application/rss+xml"],
  ["/openapi.json", "application/json"],
  ["/.well-known/agent-card.json", "application/json"],
];

const failures = [];

for (const [path, expectedType] of resources) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "user-agent": "AI-Web-Observatory-Smoke/1.0" },
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) {
      failures.push(`${path}: HTTP ${response.status}`);
    } else if (!contentType.includes(expectedType)) {
      failures.push(`${path}: expected ${expectedType}, got ${contentType}`);
    } else if (body.trim() === "") {
      failures.push(`${path}: empty response body`);
    } else {
      console.log(`PASS ${response.status} ${contentType} ${path}`);
    }
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : error}`);
  }
}

const toolChecks = [
  [
    "/api/v1/tools/classify-user-agent",
    { userAgent: "OAI-SearchBot/1.0" },
    "ai-search-crawler",
  ],
  [
    "/api/v1/tools/lint-robots",
    { robotsText: "User-agent: GPTBot\nDisallow: /" },
    "blocked",
  ],
  [
    "/api/v1/tools/generate-robots",
    { preset: "search-visible-no-training" },
    "robotsText",
  ],
];

for (const [path, body, expectedFragment] of toolChecks) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "AI-Web-Observatory-Smoke/1.0",
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      failures.push(`${path}: HTTP ${response.status}`);
    } else if (!text.includes(expectedFragment)) {
      failures.push(`${path}: expected response to contain ${expectedFragment}`);
    } else {
      console.log(`PASS ${response.status} tool ${path}`);
    }
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : error}`);
  }
}

if (failures.length > 0) {
  console.error("\nSmoke test failures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`\nAll ${resources.length + toolChecks.length} checks passed for ${baseUrl}`);
}
