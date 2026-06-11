import { describe, expect, test } from "vitest";

import {
  hashStableIdentity,
  hashDailyIdentity,
  normalizeNetworkPrefix,
  purgeOldEvents,
  queryStats,
  recordRequest,
} from "../src/analytics";
import { classifyRequest } from "../src/classify";
import { handleRequest } from "../src/router";
import type {
  D1PreparedStatementLike,
  D1RunResult,
} from "../src/types";

class StatementMock implements D1PreparedStatementLike {
  values: unknown[] = [];

  constructor(
    private readonly rows: Record<string, unknown>[] = [],
    private readonly shouldFail = false,
  ) {}

  bind(...values: unknown[]): D1PreparedStatementLike {
    this.values = values;
    return this;
  }

  async run(): Promise<D1RunResult> {
    if (this.shouldFail) {
      throw new Error("database unavailable");
    }
    return { success: true };
  }

  async all<T>(): Promise<{ success: boolean; results: T[] }> {
    if (this.shouldFail) {
      throw new Error("database unavailable");
    }
    return { success: true, results: this.rows as T[] };
  }
}

describe("privacy-preserving identity", () => {
  test("coarsens IPv4 and IPv6 addresses before hashing", () => {
    expect(normalizeNetworkPrefix("203.0.113.84")).toBe("203.0.113.0/24");
    expect(normalizeNetworkPrefix("2001:db8:abcd:12:1:2:3:4")).toBe(
      "2001:db8:abcd:12::/64",
    );
    expect(normalizeNetworkPrefix("invalid")).toBe("unknown");
  });

  test("uses a stable daily hash that rotates on a new day", async () => {
    const first = await hashDailyIdentity({
      ip: "203.0.113.84",
      userAgent: "OAI-SearchBot/1.0",
      day: "2026-06-10",
      salt: "test-salt",
    });
    const samePrefix = await hashDailyIdentity({
      ip: "203.0.113.99",
      userAgent: "OAI-SearchBot/1.0",
      day: "2026-06-10",
      salt: "test-salt",
    });
    const nextDay = await hashDailyIdentity({
      ip: "203.0.113.84",
      userAgent: "OAI-SearchBot/1.0",
      day: "2026-06-11",
      salt: "test-salt",
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(samePrefix).toBe(first);
    expect(nextDay).not.toBe(first);
  });

  test("uses a stable salted hash for cross-day repeat measurement", async () => {
    const first = await hashStableIdentity({
      ip: "203.0.113.84",
      userAgent: "OAI-SearchBot/1.0",
      salt: "test-salt",
    });
    const samePrefix = await hashStableIdentity({
      ip: "203.0.113.99",
      userAgent: "OAI-SearchBot/1.0",
      salt: "test-salt",
    });
    const differentAgent = await hashStableIdentity({
      ip: "203.0.113.84",
      userAgent: "GPTBot/1.0",
      salt: "test-salt",
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(samePrefix).toBe(first);
    expect(differentAgent).not.toBe(first);
  });
});

describe("request recording", () => {
  test("does not record internal checks or admin statistics reads", async () => {
    let prepares = 0;
    const env = {
      ANALYTICS_SALT: "test-salt",
      DB: {
        prepare: () => {
          prepares += 1;
          return new StatementMock();
        },
      },
    };

    const smokeRecorded = await recordRequest({
      request: new Request("https://observatory.example/robots.txt", {
        headers: { "user-agent": "AI-Web-Observatory-Smoke/1.0" },
      }),
      response: new Response("ok"),
      classification: classifyRequest({
        userAgent: "AI-Web-Observatory-Smoke/1.0",
        referer: "",
        url: "https://observatory.example/robots.txt",
      }),
      env,
    });
    const adminRecorded = await recordRequest({
      request: new Request(
        "https://observatory.example/api/admin/stats?days=7",
      ),
      response: new Response("ok"),
      classification: classifyRequest({
        userAgent: "curl/8.0",
        referer: "",
        url: "https://observatory.example/api/admin/stats?days=7",
      }),
      env,
    });
    const directCheckRecorded = await recordRequest({
      request: new Request("https://observatory.example/skill.md", {
        headers: { "user-agent": "AI-Web-Observatory-Internal/1.0" },
      }),
      response: new Response("ok"),
      classification: classifyRequest({
        userAgent: "AI-Web-Observatory-Internal/1.0",
        referer: "",
        url: "https://observatory.example/skill.md",
      }),
      env,
    });

    expect(smokeRecorded).toBe(false);
    expect(adminRecorded).toBe(false);
    expect(directCheckRecorded).toBe(false);
    expect(prepares).toBe(0);
  });

  test("writes classified metadata without writing the raw IP", async () => {
    const statement = new StatementMock();
    const request = new Request(
      "https://observatory.example/llms.txt?utm_source=chatgpt.com",
      {
        headers: {
          "user-agent": "OAI-SearchBot/1.0",
          "cf-connecting-ip": "104.210.140.130",
          referer: "https://chatgpt.com/",
        },
      },
    );
    const classification = classifyRequest({
      userAgent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
      url: request.url,
    });

    const recorded = await recordRequest({
      request,
      response: new Response("ok", {
        headers: { "content-type": "text/plain" },
      }),
      classification,
      env: {
        ANALYTICS_SALT: "test-salt",
        DB: { prepare: () => statement },
      },
      now: new Date("2026-06-10T12:00:00Z"),
      fetchImpl: async () =>
        Response.json({
          creationTime: "2026-01-02T11:00:00.000000",
          prefixes: [{ ipv4Prefix: "104.210.140.128/28" }],
        }),
    });

    expect(recorded).toBe(true);
    expect(statement.values).toContain("ai-search-crawler");
    expect(statement.values).toContain("OAI-SearchBot");
    expect(statement.values).toContain("machine");
    expect(statement.values).toContain("verified");
    expect(statement.values).toContain("https://openai.com/searchbot.json");
    expect(statement.values).toContain("2026-01-02T11:00:00.000000");
    expect(
      statement.values.filter(
        (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value),
      ),
    ).toHaveLength(2);
    expect(statement.values.join("|")).not.toContain("104.210.140.130");
  });

  test("isolates database failures from public request handling", async () => {
    const recorded = await recordRequest({
      request: new Request("https://observatory.example/"),
      response: new Response("ok"),
      classification: classifyRequest({
        userAgent: "",
        referer: "",
        url: "https://observatory.example/",
      }),
      env: {
        ANALYTICS_SALT: "test-salt",
        DB: { prepare: () => new StatementMock([], true) },
      },
    });

    expect(recorded).toBe(false);
  });
});

describe("aggregate measurement and retention", () => {
  test("measures repeats with the stable identity hash", async () => {
    let query = "";
    const db = {
      prepare: (sql: string) => {
        query = sql;
        return new StatementMock([
          {
            windowDays: 7,
            requests: 2,
            qualifiedAiRequests: 2,
            qualifiedAiUniqueDaily: 2,
            aiRepeat7d: 1,
            machineResourceRequests: 2,
            toolInteractions: 0,
            citationReferrals: 0,
            crawlDepth: 1,
          },
        ]);
      },
    };

    const metrics = await queryStats(db, 7);

    expect(query).toContain("stable_identity_hash");
    expect(query).not.toContain("GROUP BY identity_hash\n        HAVING");
    expect(metrics.aiRepeat7d).toBe(1);
  });

  test("deletes events older than the retention window", async () => {
    let query = "";
    const statement = new StatementMock();
    const db = {
      prepare: (sql: string) => {
        query = sql;
        return statement;
      },
    };

    const purged = await purgeOldEvents(
      db,
      new Date("2026-08-01T03:17:00Z"),
      45,
    );

    expect(purged).toBe(true);
    expect(query).toContain("DELETE FROM request_events");
    expect(statement.values).toEqual(["2026-06-17T03:17:00.000Z"]);
  });
});

describe("admin statistics", () => {
  test("requires a valid bearer token", async () => {
    const response = await handleRequest(
      new Request("https://observatory.example/api/admin/stats"),
      { ADMIN_TOKEN: "secret" },
    );

    expect(response.status).toBe(401);
  });

  test("returns bounded aggregate metrics", async () => {
    const row = {
      windowDays: 7,
      requests: 120,
      qualifiedAiRequests: 80,
      qualifiedAiUniqueDaily: 10,
      aiRepeat7d: 3,
      machineResourceRequests: 50,
      toolInteractions: 12,
      citationReferrals: 4,
      crawlDepth: 5.2,
    };
    const response = await handleRequest(
      new Request(
        "https://observatory.example/api/admin/stats?days=7",
        { headers: { authorization: "Bearer secret" } },
      ),
      {
        ADMIN_TOKEN: "secret",
        DB: { prepare: () => new StatementMock([row]) },
      },
    );
    const body = await response.json<{
      metrics: typeof row & { aiPagesPerIdentity: number };
    }>();

    expect(response.status).toBe(200);
    expect(body.metrics.qualifiedAiRequests).toBe(80);
    expect(body.metrics.aiPagesPerIdentity).toBe(8);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
