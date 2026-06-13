import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

import { exportElsewherePostcards } from "./export-elsewhere-postcards";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("exportElsewherePostcards", () => {
  test("cleans the output and copies only the public artifact files", async () => {
    const root = await mkdtemp(join(tmpdir(), "elsewhere-postcards-"));
    temporaryDirectories.push(root);
    const sourceDir = join(root, "source");
    const outputDir = join(root, "output");

    await mkdir(sourceDir);
    await mkdir(outputDir);
    await Promise.all([
      writeFile(join(sourceDir, "index.html"), "<main>elsewhere</main>"),
      writeFile(join(sourceDir, "postcard.js"), "export const view = true;"),
      writeFile(
        join(sourceDir, "postcard-model.js"),
        "export const model = true;",
      ),
      writeFile(join(sourceDir, "postcard-model.test.js"), "private test"),
      writeFile(join(outputDir, "stale.txt"), "remove me"),
    ]);

    const result = await exportElsewherePostcards({ sourceDir, outputDir });

    expect(result.filesWritten).toBe(3);
    expect(await readdir(outputDir)).toEqual([
      "index.html",
      "postcard-model.js",
      "postcard.js",
    ]);
    expect(await readFile(join(outputDir, "index.html"), "utf8")).toBe(
      "<main>elsewhere</main>",
    );
  });

  test("labels the released artwork as a public artifact", async () => {
    const root = await mkdtemp(join(tmpdir(), "elsewhere-postcards-release-"));
    temporaryDirectories.push(root);
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

    await exportElsewherePostcards({
      sourceDir: join(projectRoot, "experiments", "elsewhere-postcards"),
      outputDir: root,
    });

    const html = await readFile(join(root, "index.html"), "utf8");
    expect(html).toContain("Experiment 002 · Public artifact");
    expect(html).not.toContain("Experiment 002 · Local artifact");
  });
});
