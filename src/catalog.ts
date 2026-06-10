import type { RegistryEntry } from "./types";

export const UPDATED_ON = "2026-06-10";

export const REGISTRY: RegistryEntry[] = [
  {
    slug: "openai-oai-searchbot",
    operator: "OpenAI",
    product: "ChatGPT search",
    userAgent: "OAI-SearchBot",
    purpose: "search",
    robotsToken: "OAI-SearchBot",
    description:
      "Search crawler used to surface websites in ChatGPT search results.",
    sourceUrl: "https://developers.openai.com/api/docs/bots",
    sourceTitle: "Overview of OpenAI Crawlers",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "openai-gptbot",
    operator: "OpenAI",
    product: "OpenAI model development",
    userAgent: "GPTBot",
    purpose: "training",
    robotsToken: "GPTBot",
    description:
      "Crawler controlled separately from OAI-SearchBot for potential model training use.",
    sourceUrl: "https://developers.openai.com/api/docs/bots",
    sourceTitle: "Overview of OpenAI Crawlers",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "openai-chatgpt-user",
    operator: "OpenAI",
    product: "ChatGPT user actions",
    userAgent: "ChatGPT-User",
    purpose: "user-action",
    robotsToken: "ChatGPT-User",
    description:
      "User-directed fetch identity used when a ChatGPT user requests access to a page.",
    sourceUrl: "https://developers.openai.com/api/docs/bots",
    sourceTitle: "Overview of OpenAI Crawlers",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "anthropic-claude-searchbot",
    operator: "Anthropic",
    product: "Claude search",
    userAgent: "Claude-SearchBot",
    purpose: "search",
    robotsToken: "Claude-SearchBot",
    description:
      "Crawler that navigates the web to improve relevance and accuracy of Claude search responses.",
    sourceUrl:
      "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    sourceTitle: "Anthropic web crawler controls",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "anthropic-claudebot",
    operator: "Anthropic",
    product: "Claude model development",
    userAgent: "ClaudeBot",
    purpose: "training",
    robotsToken: "ClaudeBot",
    description:
      "Crawler used to collect web content that may contribute to model training.",
    sourceUrl:
      "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    sourceTitle: "Anthropic web crawler controls",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "anthropic-claude-user",
    operator: "Anthropic",
    product: "Claude user actions",
    userAgent: "Claude-User",
    purpose: "user-action",
    robotsToken: "Claude-User",
    description:
      "Identity used when Claude accesses a website in response to an individual user request.",
    sourceUrl:
      "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    sourceTitle: "Anthropic web crawler controls",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "perplexity-perplexitybot",
    operator: "Perplexity",
    product: "Perplexity search index",
    userAgent: "PerplexityBot",
    purpose: "search",
    robotsToken: "PerplexityBot",
    description:
      "Crawler identity used by Perplexity for web indexing and search retrieval.",
    sourceUrl:
      "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
    sourceTitle: "Perplexity Crawlers",
    verifiedOn: UPDATED_ON,
  },
  {
    slug: "perplexity-perplexity-user",
    operator: "Perplexity",
    product: "Perplexity user actions",
    userAgent: "Perplexity-User",
    purpose: "user-action",
    robotsToken: "Perplexity-User",
    description:
      "User-directed fetch identity documented separately from PerplexityBot.",
    sourceUrl:
      "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
    sourceTitle: "Perplexity Crawlers",
    verifiedOn: UPDATED_ON,
  },
];

export type ChangeRecord = {
  date: string;
  id: string;
  title: string;
  summary: string;
};

export const CHANGES: ChangeRecord[] = [
  {
    date: UPDATED_ON,
    id: "initial-registry",
    title: "Initial AI web identity registry",
    summary:
      "Published eight sourced search, training, and user-action identities from OpenAI, Anthropic, and Perplexity.",
  },
];

export function findRegistryEntry(slug: string): RegistryEntry | undefined {
  return REGISTRY.find((entry) => entry.slug === slug);
}
