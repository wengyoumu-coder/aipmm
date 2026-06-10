import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type NamedQuery = {
  name: string;
  sql: string;
};

export function buildWeeklyQueries(days: number): NamedQuery[] {
  if (!Number.isInteger(days) || days < 1 || days > 31) {
    throw new Error("days must be an integer between 1 and 31");
  }
  const window = `datetime('now', '-${days} days')`;
  const windowed = `occurred_at >= ${window}`;

  return [
    {
      name: "metrics",
      sql: `WITH windowed AS (
  SELECT * FROM request_events WHERE ${windowed}
),
daily_identities AS (
  SELECT day, identity_hash, COUNT(DISTINCT path) AS path_count
  FROM windowed
  WHERE qualified_ai = 1
  GROUP BY day, identity_hash
),
repeat_identities AS (
  SELECT stable_identity_hash
  FROM windowed
  WHERE qualified_ai = 1 AND stable_identity_hash IS NOT NULL
  GROUP BY stable_identity_hash
  HAVING COUNT(DISTINCT day) > 1
)
SELECT
  ${days} AS windowDays,
  COUNT(*) AS requests,
  COALESCE(SUM(qualified_ai), 0) AS qualifiedAiRequests,
  COUNT(DISTINCT CASE
    WHEN qualified_ai = 1 THEN day || ':' || identity_hash
  END) AS qualifiedAiUniqueDaily,
  COUNT(DISTINCT CASE
    WHEN qualified_ai = 1 THEN stable_identity_hash
  END) AS qualifiedAiIdentities,
  (SELECT COUNT(*) FROM repeat_identities) AS aiRepeatIdentities,
  COALESCE(SUM(CASE
    WHEN qualified_ai = 1 AND resource_kind = 'machine' THEN 1 ELSE 0
  END), 0) AS aiMachineResourceRequests,
  COALESCE(SUM(is_tool), 0) AS totalToolInteractions,
  COALESCE(SUM(CASE
    WHEN qualified_ai = 1 AND is_tool = 1 THEN 1 ELSE 0
  END), 0) AS aiToolInteractions,
  COALESCE(SUM(CASE
    WHEN referral_signal IS NOT NULL THEN 1 ELSE 0
  END), 0) AS citationReferrals,
  COALESCE((SELECT AVG(path_count) FROM daily_identities), 0) AS crawlDepth
FROM windowed;`,
    },
    {
      name: "top_paths",
      sql: `SELECT
  path,
  COUNT(*) AS requests,
  COALESCE(SUM(qualified_ai), 0) AS qualifiedAiRequests,
  COUNT(DISTINCT CASE
    WHEN qualified_ai = 1 THEN day || ':' || identity_hash
  END) AS qualifiedAiUniqueDaily
FROM request_events
WHERE ${windowed}
GROUP BY path
ORDER BY qualifiedAiRequests DESC, requests DESC, path
LIMIT 25;`,
    },
    {
      name: "claimed_identities",
      sql: `SELECT
  matched_identity AS claimedIdentity,
  category,
  COUNT(*) AS requests,
  COUNT(DISTINCT day) AS activeDays,
  COUNT(DISTINCT stable_identity_hash) AS coarseIdentities
FROM request_events
WHERE ${windowed} AND matched_identity IS NOT NULL
GROUP BY matched_identity, category
ORDER BY requests DESC, claimedIdentity;`,
    },
    {
      name: "referrals",
      sql: `SELECT
  COALESCE(referer_host, '(none)') AS refererHost,
  COALESCE(utm_source, '(none)') AS utmSource,
  referral_signal AS referralSignal,
  COUNT(*) AS requests
FROM request_events
WHERE ${windowed} AND referral_signal IS NOT NULL
GROUP BY referer_host, utm_source, referral_signal
ORDER BY requests DESC, refererHost;`,
    },
    {
      name: "countries",
      sql: `SELECT
  COALESCE(country, '(unknown)') AS country,
  COUNT(*) AS requests,
  COALESCE(SUM(qualified_ai), 0) AS qualifiedAiRequests
FROM request_events
WHERE ${windowed}
GROUP BY country
ORDER BY qualifiedAiRequests DESC, requests DESC, country
LIMIT 25;`,
    },
    {
      name: "daily_trend",
      sql: `SELECT
  day,
  COUNT(*) AS requests,
  COALESCE(SUM(qualified_ai), 0) AS qualifiedAiRequests,
  COUNT(DISTINCT CASE
    WHEN qualified_ai = 1 THEN identity_hash
  END) AS qualifiedAiIdentities,
  COALESCE(SUM(CASE
    WHEN qualified_ai = 1 AND resource_kind = 'machine' THEN 1 ELSE 0
  END), 0) AS aiMachineResourceRequests
FROM request_events
WHERE ${windowed}
GROUP BY day
ORDER BY day;`,
    },
  ];
}

export function parseWranglerJson(stdout: string): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(stdout);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Wrangler returned an unexpected JSON shape");
  }
  const result = parsed[0] as {
    success?: boolean;
    results?: Record<string, unknown>[];
  };
  if (result.success !== true) {
    throw new Error("D1 query was not successful");
  }
  return result.results ?? [];
}

function queryRemoteD1(
  database: string,
  sql: string,
): Record<string, unknown>[] {
  const command = spawnSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      database,
      "--remote",
      "--json",
      "--command",
      sql,
    ],
    {
      cwd: join(dirname(fileURLToPath(import.meta.url)), ".."),
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  if (command.status !== 0) {
    throw new Error(
      `D1 query failed: ${command.stderr.trim() || command.stdout.trim()}`,
    );
  }
  return parseWranglerJson(command.stdout);
}

function argument(name: string): string | undefined {
  const prefix = `${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(
    prefix.length,
  );
}

async function main(): Promise<void> {
  const days = Number(argument("--days") ?? "7");
  const database = argument("--database") ?? "ai-web-observatory";
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const date = new Date().toISOString().slice(0, 10);
  const outputPath =
    argument("--output") ??
    join(projectRoot, "reports", "raw", `${date}-${days}d.json`);
  const queries = buildWeeklyQueries(days);
  const datasets = Object.fromEntries(
    queries.map((query) => [
      query.name,
      queryRemoteD1(database, query.sql),
    ]),
  );
  const report = {
    generatedAt: new Date().toISOString(),
    database,
    windowDays: days,
    identityNotice:
      "User-agent identities are claimed unless independently verified. Cross-day repeats use stable_identity_hash; daily uniqueness uses identity_hash.",
    datasets,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(outputPath);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
