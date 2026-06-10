import { describe, expect, test } from "vitest";

import {
  hashDailyIdentity,
  normalizeNetworkPrefix,
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
});

describe("request recording", () => {
  test("writes classified metadata without writing the raw IP", async () => {
    const statement = new StatementMock();
    const request = new Request(
      "https://observatory.example/llms.txt?utm_source=chatgpt.com",
      {
        headers: {
          "user-agent": "OAI-SearchBot/1.0",
          "cf-connecting-ip": "203.0.113.84",
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
    });

    expect(recorded).toBe(true);
    expect(statement.values).toContain("ai-search-crawler");
    expect(statement.values).toContain("OAI-SearchBot");
    expect(statement.values).toContain("machine");
    expect(statement.values.join("|")).not.toContain("203.0.113.84");
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
