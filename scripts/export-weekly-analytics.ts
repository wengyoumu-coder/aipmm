import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type NamedQuery = {
  name: string;
  sql: string;
};

export type WranglerCommandPlan = {
  command: string;
  args: string[];
  description: string;
};

export function buildWeeklyQueries(
  days: number,
  windowEnd = new Date(),
): NamedQuery[] {
  if (!Number.isInteger(days) || days < 1 || days > 31) {
    throw new Error("days must be an integer between 1 and 31");
  }
  if (Number.isNaN(windowEnd.getTime())) {
    throw new Error("windowEnd must be a valid date");
  }
  const windowStart = new Date(
    windowEnd.getTime() - days * 24 * 60 * 60 * 1000,
  );
  const windowed = [
    `occurred_at >= '${windowStart.toISOString()}'`,
    `occurred_at < '${windowEnd.toISOString()}'`,
  ].join(" AND ");

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
  COALESCE(SUM(CASE
    WHEN network_verification_status = 'verified' THEN 1 ELSE 0
  END), 0) AS verifiedAiRequests,
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
      name: "identity_verification",
      sql: `SELECT
  matched_identity AS claimedIdentity,
  network_verification_status AS verificationStatus,
  network_verification_source AS verificationSource,
  network_verification_source_updated_at AS verificationSourceUpdatedAt,
  COUNT(*) AS requests,
  COUNT(DISTINCT day) AS activeDays
FROM request_events
WHERE ${windowed} AND matched_identity IS NOT NULL
GROUP BY
  matched_identity,
  network_verification_status,
  network_verification_source,
  network_verification_source_updated_at
ORDER BY requests DESC, claimedIdentity, verificationStatus;`,
    },
    {
      name: "anonymous_journey_summary",
      sql: `WITH anonymous_window AS (
  SELECT *
  FROM request_events
  WHERE ${windowed}
    AND qualified_ai = 0
    AND stable_identity_hash IS NOT NULL
),
per_identity AS (
  SELECT
    stable_identity_hash,
    COUNT(DISTINCT day) AS active_days,
    COUNT(DISTINCT path) AS unique_paths,
    MAX(CASE WHEN resource_kind = 'machine' THEN 1 ELSE 0 END)
      AS reached_machine_resource,
    MAX(CASE
      WHEN path IN (
        '/tools',
        '/skill.md',
        '/openapi.json',
        '/api/v1/tools.json',
        '/robots-recipes',
        '/robots-recipes.md',
        '/api/v1/robots-recipes.json'
      )
        OR path LIKE '/robots-recipes/%'
        OR path LIKE '/api/v1/robots-recipes/%'
      THEN 1 ELSE 0
    END) AS reached_workflow_resource,
    MAX(is_tool) AS used_tool,
    MAX(CASE WHEN referral_signal IS NOT NULL THEN 1 ELSE 0 END)
      AS had_referral
  FROM anonymous_window
  GROUP BY stable_identity_hash
)
SELECT
  (SELECT COUNT(DISTINCT stable_identity_hash) FROM anonymous_window)
    AS anonymousIdentities,
  COALESCE(SUM(CASE WHEN active_days > 1 THEN 1 ELSE 0 END), 0)
    AS anonymousRepeatIdentities,
  COALESCE(SUM(CASE WHEN unique_paths > 1 THEN 1 ELSE 0 END), 0)
    AS multiPathIdentities,
  COALESCE(SUM(reached_machine_resource), 0) AS machineResourceIdentities,
  COALESCE(SUM(reached_workflow_resource), 0) AS workflowResourceIdentities,
  COALESCE(SUM(used_tool), 0) AS toolInteractionIdentities,
  COALESCE(SUM(had_referral), 0) AS referralIdentities
FROM per_identity;`,
    },
    {
      name: "anonymous_transitions",
      sql: `WITH ordered_anonymous AS (
  SELECT
    stable_identity_hash,
    path AS to_path,
    LAG(path) OVER (PARTITION BY stable_identity_hash ORDER BY occurred_at)
      AS from_path
  FROM request_events
  WHERE ${windowed}
    AND qualified_ai = 0
    AND stable_identity_hash IS NOT NULL
    AND path != '/favicon.ico'
),
transitions AS (
  SELECT stable_identity_hash, from_path, to_path
  FROM ordered_anonymous
  WHERE from_path IS NOT NULL AND from_path != to_path
)
SELECT
  from_path AS fromPath,
  to_path AS toPath,
  COUNT(*) AS transitions,
  COUNT(DISTINCT stable_identity_hash) AS coarseIdentities
FROM transitions
GROUP BY from_path, to_path
ORDER BY coarseIdentities DESC, transitions DESC, fromPath, toPath
LIMIT 25;`,
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

export function buildWranglerCommandPlans(
  nodeVersion: string,
  database: string,
  sql: string,
): WranglerCommandPlan[] {
  const baseArgs = [
    "wrangler",
    "d1",
    "execute",
    database,
    "--remote",
    "--json",
    "--command",
    sql,
  ];
  const plans: WranglerCommandPlan[] = [
    {
      command: "npx",
      args: baseArgs,
      description: "default-wrangler-runtime",
    },
  ];
  const major = Number.parseInt(nodeVersion.split(".")[0] ?? "", 10);
  if (Number.isFinite(major) && major > 22) {
    plans.push({
      command: "npx",
      args: ["-p", "node@22", "-p", "wrangler@4.99.0", ...baseArgs],
      description: "node22-wrangler-fallback",
    });
  }
  return plans;
}

function queryRemoteD1(
  database: string,
  sql: string,
): Record<string, unknown>[] {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const failures: string[] = [];
  for (const plan of buildWranglerCommandPlans(
    process.versions.node,
    database,
    sql,
  )) {
    const command = spawnSync(plan.command, plan.args, {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    if (command.status === 0) {
      return parseWranglerJson(command.stdout);
    }
    const details = [command.stdout.trim(), command.stderr.trim()]
      .filter(Boolean)
      .join("\n");
    failures.push(
      `${plan.description}:\n${details || `exit status ${command.status}`}`,
    );
  }
  throw new Error(`D1 query failed:\n${failures.join("\n\n")}`);
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
  const windowEnd = new Date();
  const windowStart = new Date(
    windowEnd.getTime() - days * 24 * 60 * 60 * 1000,
  );
  const date = windowEnd.toISOString().slice(0, 10);
  const outputPath =
    argument("--output") ??
    join(projectRoot, "reports", "raw", `${date}-${days}d.json`);
  const queries = buildWeeklyQueries(days, windowEnd);
  const datasets = Object.fromEntries(
    queries.map((query) => [
      query.name,
      queryRemoteD1(database, query.sql),
    ]),
  );
  const report = {
    generatedAt: windowEnd.toISOString(),
    database,
    windowDays: days,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
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
