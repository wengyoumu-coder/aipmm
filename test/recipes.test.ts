import { describe, expect, test } from "vitest";

import {
  findRobotsRecipe,
  generateRobotsPolicy,
  ROBOTS_RECIPES,
} from "../src/robots-recipes";
import { lintRobotsPolicy } from "../src/robots-lint";
import { handleRequest } from "../src/router";

const origin = "https://observatory.example";

async function fetchPath(path: string, init?: RequestInit): Promise<Response> {
  return handleRequest(
    new Request(`${origin}${path}`, init),
    { SITE_ORIGIN: origin },
  );
}

describe("robots recipes", () => {
  test("publishes distinct reusable presets", () => {
    expect(ROBOTS_RECIPES.map((recipe) => recipe.slug)).toEqual([
      "search-visible-no-training",
      "search-crawlers-only",
      "user-actions-only",
      "full-ai-access",
      "block-known-ai",
    ]);
  });

  test("generates a search-visible policy that blocks training crawlers", () => {
    const recipe = findRobotsRecipe("search-visible-no-training");
    expect(recipe).toBeDefined();

    const robotsText = generateRobotsPolicy(recipe!);
    const lint = lintRobotsPolicy(robotsText);

    expect(lint.identities["OAI-SearchBot"]?.status).toBe("allowed");
    expect(lint.identities["ChatGPT-User"]?.status).toBe("allowed");
    expect(lint.identities.GPTBot?.status).toBe("blocked");
    expect(lint.identities["Claude-SearchBot"]?.status).toBe("allowed");
    expect(lint.identities.ClaudeBot?.status).toBe("blocked");
  });

  test("adds a canonical sitemap when requested", () => {
    const recipe = findRobotsRecipe("full-ai-access")!;
    const robotsText = generateRobotsPolicy(recipe, {
      sitemap: "https://example.com/sitemap.xml",
    });

    expect(robotsText).toContain(
      "Sitemap: https://example.com/sitemap.xml",
    );
  });
});

describe("robots recipe routes", () => {
  test("serves HTML, JSON, and Markdown recipe collections", async () => {
    const html = await fetchPath("/robots-recipes");
    const json = await fetchPath("/api/v1/robots-recipes.json");
    const markdown = await fetchPath("/robots-recipes.md");
    const jsonBody = await json.json<{
      count: number;
      recipes: Array<{ slug: string }>;
    }>();

    expect(html.status).toBe(200);
    expect(await html.text()).toContain("AI robots.txt policy recipes");
    expect(jsonBody.count).toBe(5);
    expect(jsonBody.recipes).toContainEqual(
      expect.objectContaining({ slug: "search-visible-no-training" }),
    );
    expect(markdown.headers.get("content-type")).toContain("text/markdown");
    expect(await markdown.text()).toContain(
      "## Search visibility without training crawlers",
    );
  });

  test("serves recipe detail with generated policy and registry links", async () => {
    const html = await fetchPath(
      "/robots-recipes/search-visible-no-training",
    );
    const json = await fetchPath(
      "/api/v1/robots-recipes/search-visible-no-training.json",
    );
    const htmlBody = await html.text();
    const jsonBody = await json.json<{
      recipe: { slug: string };
      robotsText: string;
    }>();

    expect(htmlBody).toContain("User-agent: OAI-SearchBot");
    expect(htmlBody).toContain("/registry/openai-oai-searchbot");
    expect(jsonBody.recipe.slug).toBe("search-visible-no-training");
    expect(jsonBody.robotsText).toContain("User-agent: GPTBot");
  });

  test("generates and lints a selected policy through the API tool", async () => {
    const response = await fetchPath(
      "/api/v1/tools/generate-robots",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          preset: "search-visible-no-training",
          sitemap: "https://example.com/sitemap.xml",
        }),
      },
    );
    const body = await response.json<{
      recipe: { slug: string };
      robotsText: string;
      lint: { summary: { blocked: number } };
    }>();

    expect(response.status).toBe(200);
    expect(body.recipe.slug).toBe("search-visible-no-training");
    expect(body.robotsText).toContain(
      "Sitemap: https://example.com/sitemap.xml",
    );
    expect(body.lint.summary.blocked).toBeGreaterThan(0);
  });

  test("rejects unknown presets and invalid sitemap URLs", async () => {
    const unknown = await fetchPath("/api/v1/tools/generate-robots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ preset: "missing" }),
    });
    const invalidSitemap = await fetchPath(
      "/api/v1/tools/generate-robots",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          preset: "full-ai-access",
          sitemap: "javascript:alert(1)",
        }),
      },
    );

    expect(unknown.status).toBe(400);
    expect(invalidSitemap.status).toBe(400);
  });
});
