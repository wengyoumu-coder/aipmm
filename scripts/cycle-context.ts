import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

type CycleContextInput = {
  root: string;
  now?: Date;
};

type MetricRow = {
  requests?: number;
  qualifiedAiRequests?: number;
  verifiedAiRequests?: number;
  totalToolInteractions?: number;
  citationReferrals?: number;
  crawlDepth?: number;
};

type AnonymousJourneySummaryRow = {
  anonymousIdentities?: number;
  anonymousRepeatIdentities?: number;
  workflowResourceIdentities?: number;
  toolInteractionIdentities?: number;
};

const GOVERNANCE_FILES = ["Agent.md", "SOUL.md", "memory.md", "LOOP.md"];

function displayPath(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

async function newestFile(
  directory: string,
  suffix: string,
): Promise<string | null> {
  const names = (await readdir(directory))
    .filter((name) => name.endsWith(suffix))
    .sort();
  const newest = names.at(-1);
  return newest ? join(directory, newest) : null;
}

export async function buildCycleContext(
  input: CycleContextInput,
): Promise<string> {
  const now = input.now ?? new Date();
  const governancePaths = GOVERNANCE_FILES.map((name) =>
    join(input.root, name),
  );
  await Promise.all(governancePaths.map((path) => access(path)));

  const latestCycle = await newestFile(
    join(input.root, "reports", "cycles"),
    ".md",
  );
  const latestRaw = await newestFile(
    join(input.root, "reports", "raw"),
    ".json",
  );
  if (!latestCycle || !latestRaw) {
    throw new Error("Cycle context requires at least one cycle log and raw report");
  }

  const raw = JSON.parse(await readFile(latestRaw, "utf8")) as {
    generatedAt?: string;
    datasets?: {
      metrics?: MetricRow[];
      anonymous_journey_summary?: AnonymousJourneySummaryRow[];
    };
  };
  const metrics = raw.datasets?.metrics?.[0] ?? {};
  const anonymousJourneys =
    raw.datasets?.anonymous_journey_summary?.[0] ?? {};

  return `# AI Cycle Wake Context

- Generated: ${now.toISOString()}
- Governance: ${governancePaths
    .map((path) => displayPath(input.root, path))
    .join(", ")}
- Latest cycle log: ${displayPath(input.root, latestCycle)}
- Latest raw report: ${displayPath(input.root, latestRaw)}
- Raw snapshot generated: ${raw.generatedAt ?? "unknown"}

## Latest Metrics

- Requests: ${metrics.requests ?? "unknown"}
- Qualified AI requests: ${metrics.qualifiedAiRequests ?? "unknown"}
- Verified AI requests: ${metrics.verifiedAiRequests ?? "unknown"}
- Tool interactions: ${metrics.totalToolInteractions ?? "unknown"}
- Citation referrals: ${metrics.citationReferrals ?? "unknown"}
- Crawl depth: ${metrics.crawlDepth ?? "unknown"}
- Anonymous identities: ${anonymousJourneys.anonymousIdentities ?? "unknown"}
- Anonymous repeat identities: ${anonymousJourneys.anonymousRepeatIdentities ?? "unknown"}
- Anonymous workflow-resource identities: ${anonymousJourneys.workflowResourceIdentities ?? "unknown"}
- Anonymous tool identities: ${anonymousJourneys.toolInteractionIdentities ?? "unknown"}

## Required Reorientation

1. What is the current mission bottleneck?
2. What changed since the latest cycle?
3. Is the previous observation target still the highest-value question?
4. Which exploit, explore, and measure options are available now?
5. What is the smallest complete bet with the highest learning value?
`;
}

async function main(): Promise<void> {
  const root = join(fileURLToPath(new URL("..", import.meta.url)));
  console.log(await buildCycleContext({ root }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
