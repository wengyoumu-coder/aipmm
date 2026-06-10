import { describe, expect, test } from "vitest";

import {
  buildWeeklyQueries,
  parseWranglerJson,
} from "../scripts/export-weekly-analytics";

describe("weekly analytics export", () => {
  test("uses stable identities for cross-day repeats", () => {
    const queries = buildWeeklyQueries(7);
    const metrics = queries.find((query) => query.name === "metrics");

    expect(metrics?.sql).toContain("stable_identity_hash");
    expect(metrics?.sql).toContain("COUNT(DISTINCT day) > 1");
    expect(metrics?.sql).toContain("datetime('now', '-7 days')");
  });

  test("includes decision-relevant breakdowns", () => {
    const names = buildWeeklyQueries(7).map((query) => query.name);

    expect(names).toEqual([
      "metrics",
      "top_paths",
      "claimed_identities",
      "referrals",
      "countries",
      "daily_trend",
    ]);
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
});
