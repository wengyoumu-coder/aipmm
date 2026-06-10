import { describe, expect, test } from "vitest";

import { lintRobotsPolicy } from "../src/robots-lint";
import { handleRequest } from "../src/router";

const origin = "https://observatory.example";

async function postJson(path: string, body: unknown): Promise<Response> {
  return handleRequest(
    new Request(`${origin}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    { SITE_ORIGIN: origin },
  );
}

describe("robots policy linting", () => {
  test("reports specific allows, specific blocks, and wildcard access", () => {
    const result = lintRobotsPolicy(`User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Disallow: /private
`);

    expect(result.identities["OAI-SearchBot"]).toEqual(
      expect.objectContaining({ status: "allowed", source: "specific" }),
    );
    expect(result.identities.GPTBot).toEqual(
      expect.objectContaining({ status: "blocked", source: "specific" }),
    );
    expect(result.identities["Claude-SearchBot"]).toEqual(
      expect.objectContaining({ status: "allowed", source: "wildcard" }),
    );
    expect(result.summary.blocked).toBe(1);
  });

  test("reports identities as unspecified for an empty policy", () => {
    const result = lintRobotsPolicy("");

    expect(result.identities["OAI-SearchBot"]!.status).toBe("unspecified");
    expect(result.summary.unspecified).toBeGreaterThan(0);
  });
});

describe("callable tools", () => {
  test("classifies a submitted user-agent", async () => {
    const response = await postJson(
      "/api/v1/tools/classify-user-agent",
      { userAgent: "OAI-SearchBot/1.0" },
    );
    const body = await response.json<{
      category: string;
      matchedIdentity: string;
      registryEntry: { slug: string };
    }>();

    expect(response.status).toBe(200);
    expect(body.category).toBe("ai-search-crawler");
    expect(body.matchedIdentity).toBe("OAI-SearchBot");
    expect(body.registryEntry.slug).toBe("openai-oai-searchbot");
  });

  test("rejects an empty user-agent", async () => {
    const response = await postJson(
      "/api/v1/tools/classify-user-agent",
      { userAgent: " " },
    );
    const body = await response.json<{ error: { code: string } }>();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("invalid_request");
  });

  test("lints a submitted robots policy", async () => {
    const response = await postJson("/api/v1/tools/lint-robots", {
      robotsText: "User-agent: OAI-SearchBot\nDisallow: /",
    });
    const body = await response.json<{
      identities: Record<string, { status: string }>;
    }>();

    expect(response.status).toBe(200);
    expect(body.identities["OAI-SearchBot"]!.status).toBe("blocked");
  });

  test("rejects malformed JSON", async () => {
    const response = await handleRequest(
      new Request(`${origin}/api/v1/tools/lint-robots`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
      { SITE_ORIGIN: origin },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({ code: "invalid_json" }),
      }),
    );
  });

  test("rejects oversized tool requests", async () => {
    const response = await postJson("/api/v1/tools/lint-robots", {
      robotsText: "a".repeat(70_000),
    });

    expect(response.status).toBe(413);
  });
});
