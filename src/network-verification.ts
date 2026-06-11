import { REGISTRY } from "./catalog";
import type { NetworkVerification } from "./types";

const IP_RANGE_SOURCES: Record<string, string> = {
  "OAI-SearchBot": "https://openai.com/searchbot.json",
  GPTBot: "https://openai.com/gptbot.json",
  "ChatGPT-User": "https://openai.com/chatgpt-user.json",
};

type IpRangeDocument = {
  creationTime?: unknown;
  prefixes?: Array<{ ipv4Prefix?: unknown }>;
};

function ipv4ToInteger(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const octet = Number(part);
    if (octet < 0 || octet > 255) {
      return null;
    }
    value = ((value << 8) | octet) >>> 0;
  }
  return value;
}

export function ipv4InCidr(ip: string, cidr: string): boolean {
  const [networkText, prefixText, ...extra] = cidr.split("/");
  if (!networkText || !prefixText || extra.length > 0) {
    return false;
  }

  const address = ipv4ToInteger(ip);
  const network = ipv4ToInteger(networkText);
  const prefix = Number(prefixText);
  if (
    address === null ||
    network === null ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32
  ) {
    return false;
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (address & mask) === (network & mask);
}

export async function verifyClaimedNetwork(input: {
  matchedIdentity: string | null;
  ip: string;
  fetchImpl?: typeof fetch;
}): Promise<NetworkVerification> {
  if (!input.matchedIdentity) {
    return {
      status: "not_applicable",
      sourceUrl: null,
      sourceUpdatedAt: null,
    };
  }

  const entry = REGISTRY.find(
    (candidate) => candidate.userAgent === input.matchedIdentity,
  );
  const sourceUrl = entry
    ? IP_RANGE_SOURCES[entry.userAgent]
    : undefined;
  if (!sourceUrl) {
    return {
      status: "unsupported",
      sourceUrl: null,
      sourceUpdatedAt: null,
    };
  }

  try {
    const response = await (input.fetchImpl ?? fetch)(sourceUrl, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`IP range source returned HTTP ${response.status}`);
    }

    const document = await response.json<IpRangeDocument>();
    const sourceUpdatedAt =
      typeof document.creationTime === "string"
        ? document.creationTime
        : null;
    const ranges = (document.prefixes ?? [])
      .map((prefix) => prefix.ipv4Prefix)
      .filter((prefix): prefix is string => typeof prefix === "string");
    if (ranges.length === 0) {
      throw new Error("IP range source did not contain IPv4 prefixes");
    }

    return {
      status: ranges.some((range) => ipv4InCidr(input.ip, range))
        ? "verified"
        : "not_verified",
      sourceUrl,
      sourceUpdatedAt,
    };
  } catch {
    return {
      status: "source_unavailable",
      sourceUrl,
      sourceUpdatedAt: null,
    };
  }
}
