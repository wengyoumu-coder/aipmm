import { fileURLToPath } from "node:url";

import { INDEXNOW_KEY } from "../src/catalog";

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function extractSitemapUrls(sitemapXml: string): string[] {
  const urls = [
    ...sitemapXml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gis),
  ].map((match) => decodeXml(match[1] ?? "").trim());
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) {
    throw new Error("Sitemap contains no URLs");
  }
  return unique;
}

export async function submitIndexNow(input: {
  origin: string;
  fetchImpl?: typeof fetch;
}): Promise<{ status: number; submitted: number }> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const origin = new URL(input.origin).origin;
  const sitemapResponse = await fetchImpl(`${origin}/sitemap.xml`, {
    headers: { "user-agent": "AI-Web-Observatory-Smoke/1.0" },
  });
  if (!sitemapResponse.ok) {
    throw new Error(
      `Unable to fetch sitemap: HTTP ${sitemapResponse.status}`,
    );
  }
  const urlList = extractSitemapUrls(await sitemapResponse.text());
  if (urlList.length > 10_000) {
    throw new Error("IndexNow accepts at most 10000 URLs per request");
  }
  if (urlList.some((url) => new URL(url).origin !== origin)) {
    throw new Error("Sitemap contains a URL outside the configured origin");
  }

  const response = await fetchImpl("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(origin).host,
      key: INDEXNOW_KEY,
      keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(
      `IndexNow rejected ${urlList.length} URLs: HTTP ${response.status} ${await response.text()}`,
    );
  }

  return { status: response.status, submitted: urlList.length };
}

async function main(): Promise<void> {
  const origin =
    process.env.SITE_ORIGIN ??
    "https://ai-web-observatory.aipmm.workers.dev";
  const result = await submitIndexNow({ origin });
  console.log(
    `IndexNow accepted ${result.submitted} URLs with HTTP ${result.status}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
