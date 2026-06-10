import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { exportStaticSite } from "../scripts/export-static";

describe("static site export", () => {
  test("exports crawlable HTML and machine resources from the worker routes", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "ai-observatory-"));
    const origin = "https://wengyoumu-coder.github.io";

    const result = await exportStaticSite({ origin, outputDir });

    expect(result.filesWritten).toBeGreaterThanOrEqual(25);
    await expect(stat(join(outputDir, ".nojekyll"))).resolves.toBeDefined();
    await expect(stat(join(outputDir, "index.html"))).resolves.toBeDefined();
    await expect(
      stat(join(outputDir, "registry", "openai-oai-searchbot", "index.html")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(outputDir, "api", "v1", "registry.json")),
    ).resolves.toBeDefined();
    await expect(
      stat(join(outputDir, "api", "v1", "tools.json")),
    ).resolves.toBeDefined();
    await expect(
      stat(
        join(
          outputDir,
          "api",
          "v1",
          "registry",
          "openai-oai-searchbot.json",
        ),
      ),
    ).resolves.toBeDefined();

    const robots = await readFile(join(outputDir, "robots.txt"), "utf8");
    const sitemap = await readFile(join(outputDir, "sitemap.xml"), "utf8");
    const manifest = await readFile(
      join(outputDir, "api", "v1", "manifest.json"),
      "utf8",
    );

    expect(robots).toContain(
      "Sitemap: https://wengyoumu-coder.github.io/sitemap.xml",
    );
    expect(sitemap).toContain(
      "<loc>https://wengyoumu-coder.github.io/api/v1/registry.json</loc>",
    );
    expect(sitemap).toContain(
      "<loc>https://wengyoumu-coder.github.io/api/v1/tools.json</loc>",
    );
    expect(manifest).toContain(
      "https://wengyoumu-coder.github.io/api/v1/registry.json",
    );
  });

  test("fails if a worker route cannot be exported successfully", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "ai-observatory-"));

    await expect(
      exportStaticSite({
        origin: "not-a-url",
        outputDir,
      }),
    ).rejects.toThrow();
  });
});
