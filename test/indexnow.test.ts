import { describe, expect, test } from "vitest";

import { extractSitemapUrls } from "../scripts/submit-indexnow";

describe("IndexNow submission", () => {
  test("extracts canonical URLs from a sitemap without duplicates", () => {
    const urls = extractSitemapUrls(`<?xml version="1.0"?>
<urlset>
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/registry</loc></url>
  <url><loc>https://example.com/registry</loc></url>
</urlset>`);

    expect(urls).toEqual([
      "https://example.com/",
      "https://example.com/registry",
    ]);
  });

  test("decodes XML entities in canonical URLs", () => {
    const urls = extractSitemapUrls(
      "<urlset><url><loc>https://example.com/data?a=1&amp;b=2</loc></url></urlset>",
    );

    expect(urls).toEqual(["https://example.com/data?a=1&b=2"]);
  });

  test("rejects a sitemap without URLs", () => {
    expect(() => extractSitemapUrls("<urlset></urlset>")).toThrow(
      "Sitemap contains no URLs",
    );
  });
});
