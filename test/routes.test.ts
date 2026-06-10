import { describe, expect, test } from "vitest";

import { handleRequest } from "../src/router";

const origin = "https://observatory.example";

async function fetchPath(path: string, init?: RequestInit): Promise<Response> {
  return handleRequest(
    new Request(`${origin}${path}`, init),
    { SITE_ORIGIN: origin },
  );
}

describe("public routes", () => {
  test("serves a semantic machine-linked homepage", async () => {
    const response = await fetchPath("/");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("link")).toContain(
      `<${origin}/sitemap.xml>`,
    );
    expect(body).toContain("<h1>AI Web Observatory</h1>");
    expect(body).toContain('href="/llms.txt"');
    expect(body).toContain('type="application/ld+json"');
  });

  test("serves the registry as JSON with source metadata", async () => {
    const response = await fetchPath("/api/v1/registry.json");
    const body = await response.json<{
      count: number;
      entries: Array<{ slug: string; sourceUrl: string }>;
    }>();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.count).toBeGreaterThanOrEqual(8);
    expect(body.entries).toContainEqual(
      expect.objectContaining({
        slug: "openai-oai-searchbot",
        sourceUrl: "https://developers.openai.com/api/docs/bots",
      }),
    );
  });

  test("serves registry detail as HTML and JSON", async () => {
    const htmlResponse = await fetchPath("/registry/openai-oai-searchbot");
    const html = await htmlResponse.text();
    const jsonResponse = await fetchPath(
      "/api/v1/registry/openai-oai-searchbot.json",
    );
    const json = await jsonResponse.json<{ userAgent: string }>();

    expect(htmlResponse.status).toBe(200);
    expect(html).toContain("OAI-SearchBot");
    expect(html).toContain("developers.openai.com");
    expect(jsonResponse.status).toBe(200);
    expect(json.userAgent).toBe("OAI-SearchBot");
  });

  test("publishes an explicit permissive robots policy", async () => {
    const response = await fetchPath("/robots.txt");
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(body).toContain("User-agent: OAI-SearchBot\nAllow: /");
    expect(body).toContain("User-agent: GPTBot\nAllow: /");
    expect(body).toContain("User-agent: Claude-SearchBot\nAllow: /");
    expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  test("publishes a sitemap containing stable registry URLs", async () => {
    const response = await fetchPath("/sitemap.xml");
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(body).toContain(`<loc>${origin}/</loc>`);
    expect(body).toContain(
      `<loc>${origin}/registry/openai-oai-searchbot</loc>`,
    );
  });

  test("publishes concise and full LLM text resources", async () => {
    const concise = await fetchPath("/llms.txt");
    const full = await fetchPath("/llms-full.txt");

    expect(await concise.text()).toContain("# AI Web Observatory");
    expect(await full.text()).toContain("## Registry Entries");
  });

  test("publishes manifest, changelog feed, OpenAPI, and agent card", async () => {
    const manifest = await (await fetchPath("/api/v1/manifest.json")).json<{
      name: string;
      resources: string[];
    }>();
    const feed = await fetchPath("/changelog.xml");
    const openapi = await (await fetchPath("/openapi.json")).json<{
      openapi: string;
      paths: Record<string, unknown>;
    }>();
    const card = await (
      await fetchPath("/.well-known/agent-card.json")
    ).json<{ name: string; skills: Array<{ id: string }> }>();

    expect(manifest.name).toBe("AI Web Observatory");
    expect(manifest.resources).toContain(`${origin}/api/v1/registry.json`);
    expect(feed.headers.get("content-type")).toContain("application/rss+xml");
    expect(await feed.text()).toContain("<rss version=\"2.0\">");
    expect(openapi.openapi).toBe("3.1.0");
    expect(openapi.paths).toHaveProperty(
      "/api/v1/tools/classify-user-agent",
    );
    expect(card.name).toBe("AI Web Observatory");
    expect(card.skills).toContainEqual(
      expect.objectContaining({ id: "classify-user-agent" }),
    );
  });

  test("returns stable cache metadata and supports HEAD", async () => {
    const getResponse = await fetchPath("/api/v1/registry.json");
    const headResponse = await fetchPath("/api/v1/registry.json", {
      method: "HEAD",
    });

    expect(getResponse.headers.get("etag")).toMatch(/^W\//);
    expect(getResponse.headers.get("cache-control")).toContain("public");
    expect(headResponse.status).toBe(200);
    expect(await headResponse.text()).toBe("");
  });

  test("keeps extensionless JSON endpoints as compatibility aliases", async () => {
    const manifest = await fetchPath("/api/v1/manifest");
    const registry = await fetchPath("/api/v1/registry");
    const detail = await fetchPath(
      "/api/v1/registry/openai-oai-searchbot",
    );

    expect(manifest.status).toBe(200);
    expect(registry.status).toBe(200);
    expect(detail.status).toBe(200);
    expect(manifest.headers.get("content-type")).toContain("application/json");
  });

  test("returns structured JSON for unknown API routes", async () => {
    const response = await fetchPath("/api/v1/missing");
    const body = await response.json<{
      error: { code: string; message: string };
    }>();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("not_found");
    expect(body.error.message).toContain("/api/v1/missing");
  });
});
