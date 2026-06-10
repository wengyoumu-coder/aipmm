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
});
