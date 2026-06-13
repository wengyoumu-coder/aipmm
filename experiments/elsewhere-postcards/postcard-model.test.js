import { describe, expect, test } from "vitest";

import { createPostcard } from "./postcard-model.js";

describe("createPostcard", () => {
  test("returns the same complete composition for the same seed", () => {
    expect(createPostcard("glass-tide")).toEqual(createPostcard("glass-tide"));
  });

  test("uses every bounded scene grammar across a representative seed set", () => {
    const scenes = new Set(
      [
        "first-light",
        "glass-tide",
        "paper-moon",
        "salt-window",
        "quiet-station",
        "morrow-bay",
        "ivory-weather",
        "cinder-reach",
        "lunar-fold",
        "echo-harbor",
        "brass-crossing",
        "juniper-vale",
      ].map((seed) => createPostcard(seed).scene),
    );

    expect(scenes).toEqual(new Set(["mountains", "dunes", "coast"]));
  });
});
