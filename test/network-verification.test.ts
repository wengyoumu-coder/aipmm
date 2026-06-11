import { describe, expect, test } from "vitest";

import {
  ipv4InCidr,
  verifyClaimedNetwork,
} from "../src/network-verification";

const sourceResponse = {
  creationTime: "2026-01-02T11:00:00.000000",
  prefixes: [
    { ipv4Prefix: "104.210.140.128/28" },
    { ipv4Prefix: "135.234.64.0/24" },
  ],
};

function sourceFetch(response = sourceResponse): typeof fetch {
  return async () => Response.json(response);
}

describe("crawler network verification", () => {
  test("matches IPv4 addresses against CIDR ranges", () => {
    expect(ipv4InCidr("104.210.140.130", "104.210.140.128/28")).toBe(true);
    expect(ipv4InCidr("104.210.140.144", "104.210.140.128/28")).toBe(false);
    expect(ipv4InCidr("not-an-ip", "104.210.140.128/28")).toBe(false);
    expect(ipv4InCidr("104.210.140.130", "invalid")).toBe(false);
  });

  test("verifies a claimed identity from its official published ranges", async () => {
    const result = await verifyClaimedNetwork({
      matchedIdentity: "OAI-SearchBot",
      ip: "104.210.140.130",
      fetchImpl: sourceFetch(),
    });

    expect(result).toEqual({
      status: "verified",
      sourceUrl: "https://openai.com/searchbot.json",
      sourceUpdatedAt: "2026-01-02T11:00:00.000000",
    });
  });

  test("distinguishes non-matching, unsupported, and unavailable checks", async () => {
    await expect(
      verifyClaimedNetwork({
        matchedIdentity: "OAI-SearchBot",
        ip: "203.0.113.10",
        fetchImpl: sourceFetch(),
      }),
    ).resolves.toEqual({
      status: "not_verified",
      sourceUrl: "https://openai.com/searchbot.json",
      sourceUpdatedAt: "2026-01-02T11:00:00.000000",
    });

    await expect(
      verifyClaimedNetwork({
        matchedIdentity: "ClaudeBot",
        ip: "203.0.113.10",
        fetchImpl: sourceFetch(),
      }),
    ).resolves.toEqual({
      status: "unsupported",
      sourceUrl: null,
      sourceUpdatedAt: null,
    });

    await expect(
      verifyClaimedNetwork({
        matchedIdentity: "OAI-SearchBot",
        ip: "104.210.140.130",
        fetchImpl: async () => new Response("unavailable", { status: 503 }),
      }),
    ).resolves.toEqual({
      status: "source_unavailable",
      sourceUrl: "https://openai.com/searchbot.json",
      sourceUpdatedAt: null,
    });
  });
});
