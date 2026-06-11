import { describe, expect, test } from "vitest";

import {
  buildWeeklyQueries,
  buildWranglerCommandPlans,
  parseWranglerJson,
} from "../scripts/export-weekly-analytics";

describe("weekly analytics export", () => {
  test("uses stable identities for cross-day repeats", () => {
    const queries = buildWeeklyQueries(
      7,
      new Date("2026-06-10T12:00:00Z"),
    );
    const metrics = queries.find((query) => query.name === "metrics");

    expect(metrics?.sql).toContain("stable_identity_hash");
    expect(metrics?.sql).toContain("COUNT(DISTINCT day) > 1");
    expect(metrics?.sql).toContain(
      "occurred_at >= '2026-06-03T12:00:00.000Z'",
    );
    expect(metrics?.sql).toContain(
      "occurred_at < '2026-06-10T12:00:00.000Z'",
    );
  });

  test("uses the same immutable time bounds for every query", () => {
    const queries = buildWeeklyQueries(
      7,
      new Date("2026-06-10T12:00:00Z"),
    );

    for (const query of queries) {
      expect(query.sql).toContain(
        "occurred_at >= '2026-06-03T12:00:00.000Z'",
      );
      expect(query.sql).toContain(
        "occurred_at < '2026-06-10T12:00:00.000Z'",
      );
      expect(query.sql).not.toContain("datetime('now'");
    }
  });

  test("includes decision-relevant breakdowns", () => {
    const names = buildWeeklyQueries(7).map((query) => query.name);

    expect(names).toEqual([
      "metrics",
      "top_paths",
      "claimed_identities",
      "identity_verification",
      "anonymous_journey_summary",
      "anonymous_transitions",
      "referrals",
      "countries",
      "daily_trend",
    ]);
  });

  test("separates verified requests from claimed identities", () => {
    const queries = buildWeeklyQueries(
      7,
      new Date("2026-06-10T12:00:00Z"),
    );
    const metrics = queries.find((query) => query.name === "metrics");
    const verification = queries.find(
      (query) => query.name === "identity_verification",
    );

    expect(metrics?.sql).toContain("AS verifiedAiRequests");
    expect(metrics?.sql).toContain(
      "network_verification_status = 'verified'",
    );
    expect(verification?.sql).toContain("network_verification_status");
    expect(verification?.sql).toContain("AS verificationStatus");
    expect(verification?.sql).not.toContain("stable_identity_hash AS");
    expect(verification?.sql).not.toContain("identity_hash AS");
  });

  test("reports anonymous journeys without exposing stable identity hashes", () => {
    const queries = buildWeeklyQueries(
      7,
      new Date("2026-06-10T12:00:00Z"),
    );
    const summary = queries.find(
      (query) => query.name === "anonymous_journey_summary",
    );
    const transitions = queries.find(
      (query) => query.name === "anonymous_transitions",
    );

    expect(summary?.sql).toContain("COUNT(DISTINCT stable_identity_hash)");
    expect(summary?.sql).toContain("AS anonymousIdentities");
    expect(summary?.sql).toContain("anonymousRepeatIdentities");
    expect(summary?.sql).toContain("workflowResourceIdentities");
    expect(summary?.sql).toContain("toolInteractionIdentities");
    expect(summary?.sql).not.toContain("stable_identity_hash AS");

    expect(transitions?.sql).toContain(
      "LAG(path) OVER (PARTITION BY stable_identity_hash ORDER BY occurred_at)",
    );
    expect(transitions?.sql).toContain(
      "COUNT(DISTINCT stable_identity_hash) AS coarseIdentities",
    );
    expect(transitions?.sql).toContain("qualified_ai = 0");
    expect(transitions?.sql).not.toContain("stable_identity_hash AS");
  });

  test("rejects reporting windows outside the supported range", () => {
    expect(() => buildWeeklyQueries(0)).toThrow();
    expect(() => buildWeeklyQueries(32)).toThrow();
  });

  test("extracts rows from Wrangler JSON output", () => {
    const rows = parseWranglerJson(
      JSON.stringify([
        {
          results: [{ requests: 3 }],
          success: true,
          meta: { rows_read: 3 },
        },
      ]),
    );

    expect(rows).toEqual([{ requests: 3 }]);
  });

  test("rejects unsuccessful Wrangler output", () => {
    expect(() =>
      parseWranglerJson(
        JSON.stringify([{ results: [], success: false }]),
      ),
    ).toThrow("D1 query was not successful");
  });

  test("adds a node 22 fallback for newer runtimes", () => {
    const plans = buildWranglerCommandPlans(
      "25.5.0",
      "ai-web-observatory",
      "SELECT COUNT(*) AS requests FROM request_events;",
    );

    expect(plans).toHaveLength(2);
    expect(plans[0]?.command).toBe("npx");
    expect(plans[0]?.args).toContain("wrangler");
    expect(plans[1]).toEqual({
      command: "npx",
      args: [
        "-p",
        "node@22",
        "-p",
        "wrangler@4.99.0",
        "wrangler",
        "d1",
        "execute",
        "ai-web-observatory",
        "--remote",
        "--json",
        "--command",
        "SELECT COUNT(*) AS requests FROM request_events;",
      ],
      description: "node22-wrangler-fallback",
    });
  });
});
