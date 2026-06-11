import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { buildCycleContext } from "../scripts/cycle-context";

describe("cycle context", () => {
  test("summarizes governance, newest cycle, and newest production snapshot", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-cycle-context-"));
    await Promise.all([
      writeFile(join(root, "Agent.md"), "# Agent\nMission\n", "utf8"),
      writeFile(join(root, "SOUL.md"), "# Soul\nCurious\n", "utf8"),
      writeFile(join(root, "memory.md"), "# Memory\nBottleneck\n", "utf8"),
      writeFile(join(root, "LOOP.md"), "# Loop\nObserve\n", "utf8"),
      mkdir(join(root, "reports", "cycles"), { recursive: true }),
      mkdir(join(root, "reports", "raw"), { recursive: true }),
    ]);
    await writeFile(
      join(root, "reports", "cycles", "2026-06-10.md"),
      "# Cycle 0002\n",
      "utf8",
    );
    await writeFile(
      join(root, "reports", "cycles", "2026-06-11.md"),
      "# Cycle 0003\n",
      "utf8",
    );
    await writeFile(
      join(root, "reports", "raw", "2026-06-10-7d.json"),
      JSON.stringify({
        generatedAt: "2026-06-10T17:04:36.683Z",
        datasets: {
          metrics: [
            {
              requests: 50,
              qualifiedAiRequests: 0,
              verifiedAiRequests: 1,
              totalToolInteractions: 0,
              citationReferrals: 0,
              crawlDepth: 0,
            },
          ],
          anonymous_journey_summary: [
            {
              anonymousIdentities: 9,
              anonymousRepeatIdentities: 6,
              workflowResourceIdentities: 6,
              toolInteractionIdentities: 0,
            },
          ],
        },
      }),
      "utf8",
    );

    const context = await buildCycleContext({
      root,
      now: new Date("2026-06-11T01:15:00+08:00"),
    });

    expect(context).toContain("Agent.md");
    expect(context).toContain("SOUL.md");
    expect(context).toContain("memory.md");
    expect(context).toContain("LOOP.md");
    expect(context).toContain("reports/cycles/2026-06-11.md");
    expect(context).toContain("reports/raw/2026-06-10-7d.json");
    expect(context).toContain("Requests: 50");
    expect(context).toContain("Qualified AI requests: 0");
    expect(context).toContain("Verified AI requests: 1");
    expect(context).toContain("Tool interactions: 0");
    expect(context).toContain("Anonymous identities: 9");
    expect(context).toContain("Anonymous repeat identities: 6");
    expect(context).toContain("Anonymous workflow-resource identities: 6");
    expect(context).toContain("Anonymous tool identities: 0");
    expect(context).toContain("What is the current mission bottleneck?");
  });
});
