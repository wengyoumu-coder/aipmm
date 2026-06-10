import { describe, expect, test } from "vitest";

import { classifyRequest } from "../src/classify";

describe("classifyRequest", () => {
  test.each([
    ["Mozilla/5.0 AppleWebKit/537.36; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot", "ai-search-crawler", "OAI-SearchBot"],
    ["Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot", "ai-training-crawler", "GPTBot"],
    ["Mozilla/5.0 AppleWebKit/537.36; compatible; ChatGPT-User/1.0; +https://openai.com/bot", "ai-user-agent", "ChatGPT-User"],
    ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "search-crawler", "Googlebot"],
    ["Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "search-crawler", "Bingbot"],
  ])("classifies %s", (userAgent, category, matchedIdentity) => {
    const result = classifyRequest({
      userAgent,
      referer: "",
      url: "https://example.com/registry",
    });

    expect(result.category).toBe(category);
    expect(result.matchedIdentity).toBe(matchedIdentity);
  });

  test("matches identities case-insensitively", () => {
    const result = classifyRequest({
      userAgent: "oai-searchbot/1.0",
      referer: "",
      url: "https://example.com/",
    });

    expect(result.matchedIdentity).toBe("OAI-SearchBot");
    expect(result.qualifiedAI).toBe(true);
  });

  test("classifies ordinary browsers without claiming AI traffic", () => {
    const result = classifyRequest({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/137 Safari/537.36",
      referer: "",
      url: "https://example.com/",
    });

    expect(result.category).toBe("browser");
    expect(result.matchedIdentity).toBeNull();
    expect(result.qualifiedAI).toBe(false);
  });

  test("classifies empty and unfamiliar clients as unknown", () => {
    const result = classifyRequest({
      userAgent: "",
      referer: "",
      url: "https://example.com/",
    });

    expect(result.category).toBe("unknown");
    expect(result.matchedIdentity).toBeNull();
  });

  test("detects ChatGPT referrals and utm attribution", () => {
    const result = classifyRequest({
      userAgent: "Mozilla/5.0",
      referer: "https://chatgpt.com/",
      url: "https://example.com/?utm_source=chatgpt.com&utm_medium=referral",
    });

    expect(result.referralSignals).toEqual([
      "referer:chatgpt.com",
      "utm_source:chatgpt.com",
    ]);
    expect(result.qualifiedAI).toBe(true);
  });
});
