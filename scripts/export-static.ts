import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { INDEXNOW_KEY, REGISTRY } from "../src/catalog";
import { handleRequest } from "../src/router";
import { ROBOTS_RECIPES } from "../src/robots-recipes";

type StaticResource = {
  route: string;
  outputPath: string;
};

function resources(): StaticResource[] {
  return [
    { route: "/", outputPath: "index.html" },
    { route: "/registry", outputPath: "registry/index.html" },
    { route: "/robots-recipes", outputPath: "robots-recipes/index.html" },
    { route: "/tools", outputPath: "tools/index.html" },
    { route: "/skill.md", outputPath: "skill.md" },
    { route: "/robots-recipes.md", outputPath: "robots-recipes.md" },
    { route: "/changelog", outputPath: "changelog/index.html" },
    { route: "/api/v1/manifest.json", outputPath: "api/v1/manifest.json" },
    { route: "/api/v1/registry.json", outputPath: "api/v1/registry.json" },
    { route: "/api/v1/tools.json", outputPath: "api/v1/tools.json" },
    {
      route: "/api/v1/robots-recipes.json",
      outputPath: "api/v1/robots-recipes.json",
    },
    { route: "/robots.txt", outputPath: "robots.txt" },
    {
      route: `/${INDEXNOW_KEY}.txt`,
      outputPath: `${INDEXNOW_KEY}.txt`,
    },
    { route: "/sitemap.xml", outputPath: "sitemap.xml" },
    { route: "/llms.txt", outputPath: "llms.txt" },
    { route: "/llms-full.txt", outputPath: "llms-full.txt" },
    { route: "/changelog.json", outputPath: "changelog.json" },
    { route: "/changelog.md", outputPath: "changelog.md" },
    { route: "/changelog.xml", outputPath: "changelog.xml" },
    { route: "/openapi.json", outputPath: "openapi.json" },
    {
      route: "/.well-known/agent-card.json",
      outputPath: ".well-known/agent-card.json",
    },
    ...REGISTRY.flatMap((entry) => [
      {
        route: `/registry/${entry.slug}`,
        outputPath: `registry/${entry.slug}/index.html`,
      },
      {
        route: `/api/v1/registry/${entry.slug}.json`,
        outputPath: `api/v1/registry/${entry.slug}.json`,
      },
    ]),
    ...ROBOTS_RECIPES.flatMap((recipe) => [
      {
        route: `/robots-recipes/${recipe.slug}`,
        outputPath: `robots-recipes/${recipe.slug}/index.html`,
      },
      {
        route: `/api/v1/robots-recipes/${recipe.slug}.json`,
        outputPath: `api/v1/robots-recipes/${recipe.slug}.json`,
      },
    ]),
  ];
}

export async function exportStaticSite(input: {
  origin: string;
  outputDir: string;
}): Promise<{ filesWritten: number }> {
  const parsedOrigin = new URL(input.origin);
  if (parsedOrigin.pathname !== "/" || parsedOrigin.search || parsedOrigin.hash) {
    throw new Error("Static export origin must be an origin without a path");
  }
  const origin = parsedOrigin.origin;

  await rm(input.outputDir, { recursive: true, force: true });
  await mkdir(input.outputDir, { recursive: true });

  let filesWritten = 0;
  for (const resource of resources()) {
    const response = await handleRequest(
      new Request(`${origin}${resource.route}`),
      { SITE_ORIGIN: origin },
    );
    if (!response.ok) {
      throw new Error(
        `Static export failed for ${resource.route}: HTTP ${response.status}`,
      );
    }

    const destination = join(input.outputDir, resource.outputPath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, await response.text(), "utf8");
    filesWritten += 1;
  }

  await writeFile(join(input.outputDir, ".nojekyll"), "", "utf8");
  filesWritten += 1;

  const notFound = await handleRequest(
    new Request(`${origin}/static-export-not-found`),
    { SITE_ORIGIN: origin },
  );
  await writeFile(join(input.outputDir, "404.html"), await notFound.text(), "utf8");
  filesWritten += 1;

  return { filesWritten };
}

async function main(): Promise<void> {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const origin =
    process.env.STATIC_ORIGIN ?? "https://wengyoumu-coder.github.io";
  const outputDir =
    process.env.STATIC_OUTPUT_DIR ?? join(projectRoot, "dist-static");
  const result = await exportStaticSite({ origin, outputDir });
  console.log(`Exported ${result.filesWritten} files to ${outputDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
