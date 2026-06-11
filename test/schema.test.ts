import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

describe("analytics schema", () => {
  test("stores daily and stable pseudonymous identities", async () => {
    const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");

    expect(schema).toContain("identity_hash TEXT NOT NULL");
    expect(schema).toContain("stable_identity_hash TEXT NOT NULL");
    expect(schema).toContain(
      "idx_request_events_stable_identity",
    );
  });

  test("includes the production migration", async () => {
    const migration = await readFile(
      new URL("../migrations/0002_stable_identity.sql", import.meta.url),
      "utf8",
    );

    expect(migration).toContain(
      "ADD COLUMN stable_identity_hash TEXT",
    );
    expect(migration).toContain(
      "idx_request_events_stable_identity",
    );
  });

  test("stores network verification conclusions without raw IP addresses", async () => {
    const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
    const migration = await readFile(
      new URL("../migrations/0003_network_verification.sql", import.meta.url),
      "utf8",
    );

    for (const sql of [schema, migration]) {
      expect(sql).toContain("network_verification_status");
      expect(sql).toContain("network_verification_source");
      expect(sql).toContain("network_verification_source_updated_at");
    }
    expect(schema).not.toContain("raw_ip");
    expect(migration).not.toContain("raw_ip");
  });
});
