import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_FILES = ["index.html", "postcard-model.js", "postcard.js"] as const;

export async function exportElsewherePostcards(input: {
  sourceDir: string;
  outputDir: string;
}): Promise<{ filesWritten: number }> {
  await rm(input.outputDir, { recursive: true, force: true });
  await mkdir(input.outputDir, { recursive: true });

  await Promise.all(
    PUBLIC_FILES.map((file) =>
      copyFile(join(input.sourceDir, file), join(input.outputDir, file)),
    ),
  );

  return { filesWritten: PUBLIC_FILES.length };
}

async function main(): Promise<void> {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const result = await exportElsewherePostcards({
    sourceDir: join(projectRoot, "experiments", "elsewhere-postcards"),
    outputDir: join(projectRoot, "dist-elsewhere-postcards"),
  });
  console.log(`Exported ${result.filesWritten} files to dist-elsewhere-postcards`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
