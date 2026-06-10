import type {
  RequestClassification,
  VisitorCategory,
} from "./types";

type IdentityRule = {
  token: string;
  identity: string;
  category: VisitorCategory;
};

const IDENTITY_RULES: IdentityRule[] = [
  {
    token: "oai-searchbot",
    identity: "OAI-SearchBot",
    category: "ai-search-crawler",
  },
  {
    token: "gptbot",
    identity: "GPTBot",
    category: "ai-training-crawler",
  },
  {
    token: "chatgpt-user",
    identity: "ChatGPT-User",
    category: "ai-user-agent",
  },
  {
    token: "claude-searchbot",
    identity: "Claude-SearchBot",
    category: "ai-search-crawler",
  },
  {
    token: "claudebot",
    identity: "ClaudeBot",
    category: "ai-training-crawler",
  },
  {
    token: "claude-user",
    identity: "Claude-User",
    category: "ai-user-agent",
  },
  {
    token: "perplexitybot",
    identity: "PerplexityBot",
    category: "ai-search-crawler",
  },
  {
    token: "perplexity-user",
    identity: "Perplexity-User",
    category: "ai-user-agent",
  },
  {
    token: "googlebot",
    identity: "Googlebot",
    category: "search-crawler",
  },
  {
    token: "bingbot",
    identity: "Bingbot",
    category: "search-crawler",
  },
];

const AI_REFERRER_HOSTS = new Set([
  "chatgpt.com",
  "www.chatgpt.com",
  "perplexity.ai",
  "www.perplexity.ai",
  "claude.ai",
  "www.claude.ai",
  "copilot.microsoft.com",
]);

const AI_UTM_SOURCES = new Set([
  "chatgpt.com",
  "perplexity.ai",
  "claude.ai",
  "copilot.microsoft.com",
]);

function safeHostname(value: string): string {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function classifyRequest(input: {
  userAgent: string;
  referer: string;
  url: string;
}): RequestClassification {
  const normalizedUserAgent = input.userAgent.toLowerCase();
  const matchedRule = IDENTITY_RULES.find((rule) =>
    normalizedUserAgent.includes(rule.token),
  );

  const referralSignals: string[] = [];
  const refererHost = safeHostname(input.referer);
  if (AI_REFERRER_HOSTS.has(refererHost)) {
    referralSignals.push(`referer:${refererHost.replace(/^www\./, "")}`);
  }

  try {
    const utmSource = new URL(input.url).searchParams
      .get("utm_source")
      ?.toLowerCase();
    if (utmSource && AI_UTM_SOURCES.has(utmSource)) {
      referralSignals.push(`utm_source:${utmSource}`);
    }
  } catch {
    // Invalid request URLs are classified from the remaining signals.
  }

  let category: VisitorCategory;
  if (matchedRule) {
    category = matchedRule.category;
  } else if (
    /\b(curl|wget|python-requests|httpie|postmanruntime)\b/i.test(
      input.userAgent,
    )
  ) {
    category = "automation";
  } else if (/mozilla|applewebkit|chrome|safari|firefox/i.test(input.userAgent)) {
    category = "browser";
  } else {
    category = "unknown";
  }

  return {
    category,
    matchedIdentity: matchedRule?.identity ?? null,
    qualifiedAI:
      category.startsWith("ai-") || referralSignals.length > 0,
    referralSignals,
  };
}
