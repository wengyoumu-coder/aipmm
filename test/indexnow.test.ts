import { describe, expect, test, vi } from "vitest";

import {
  extractSitemapUrls,
  submitIndexNow,
} from "../scripts/submit-indexnow";

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

  test("marks its sitemap fetch as an internal smoke check", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          "<urlset><url><loc>https://example.com/</loc></url></urlset>",
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 202 }));

    await submitIndexNow({
      origin: "https://example.com",
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://example.com/sitemap.xml",
      expect.objectContaining({
        headers: expect.objectContaining({
          "user-agent": "AI-Web-Observatory-Smoke/1.0",
        }),
      }),
    );
  });
});
