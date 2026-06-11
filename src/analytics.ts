import type {
  D1DatabaseLike,
  Env,
  RequestClassification,
} from "./types";

const INTERNAL_USER_AGENTS = new Set([
  "AI-Web-Observatory-Smoke/1.0",
  "AI-Web-Observatory-Internal/1.0",
]);

export function normalizeNetworkPrefix(ip: string): string {
  const ipv4 = ip.split(".");
  if (
    ipv4.length === 4 &&
    ipv4.every((part) => {
      const value = Number(part);
      return /^\d+$/.test(part) && value >= 0 && value <= 255;
    })
  ) {
    return `${ipv4[0]}.${ipv4[1]}.${ipv4[2]}.0/24`;
  }

  if (ip.includes(":")) {
    const halves = ip.toLowerCase().split("::");
    if (halves.length <= 2) {
      const left = halves[0]?.split(":").filter(Boolean) ?? [];
      const right = halves[1]?.split(":").filter(Boolean) ?? [];
      const missing = Math.max(0, 8 - left.length - right.length);
      const expanded = [
        ...left,
        ...Array.from({ length: missing }, () => "0"),
        ...right,
      ];
      if (
        expanded.length === 8 &&
        expanded.every((part) => /^[0-9a-f]{1,4}$/.test(part))
      ) {
        return `${expanded
          .slice(0, 4)
          .map((part) => Number.parseInt(part, 16).toString(16))
          .join(":")}::/64`;
      }
    }
  }

  return "unknown";
}

async function sha256(material: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashDailyIdentity(input: {
  ip: string;
  userAgent: string;
  day: string;
  salt: string;
}): Promise<string> {
  const prefix = normalizeNetworkPrefix(input.ip);
  return sha256([
    input.day,
    prefix,
    input.userAgent.trim().toLowerCase(),
    input.salt,
  ].join("|"));
}

export async function hashStableIdentity(input: {
  ip: string;
  userAgent: string;
  salt: string;
}): Promise<string> {
  const prefix = normalizeNetworkPrefix(input.ip);
  return sha256([
    "stable-v1",
    prefix,
    input.userAgent.trim().toLowerCase(),
    input.salt,
  ].join("|"));
}

function safeHostname(value: string): string | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function resourceKind(pathname: string): "machine" | "document" {
  return pathname.startsWith("/api/") ||
      pathname.startsWith("/.well-known/") ||
      pathname.endsWith(".txt") ||
      pathname.endsWith(".xml") ||
      pathname.endsWith(".json") ||
      pathname.endsWith(".md")
    ? "machine"
    : "document";
}

export async function recordRequest(input: {
  request: Request;
  response: Response;
  classification: RequestClassification;
  env: Env;
  now?: Date;
}): Promise<boolean> {
  if (!input.env.DB || !input.env.ANALYTICS_SALT) {
    return false;
  }

  try {
    const now = input.now ?? new Date();
    const day = now.toISOString().slice(0, 10);
    const url = new URL(input.request.url);
    const userAgent = input.request.headers.get("user-agent") ?? "";
    if (
      INTERNAL_USER_AGENTS.has(userAgent) ||
      url.pathname.startsWith("/api/admin/")
    ) {
      return false;
    }
    const ip = input.request.headers.get("cf-connecting-ip") ?? "unknown";
    const identityHash = await hashDailyIdentity({
      ip,
      userAgent,
      day,
      salt: input.env.ANALYTICS_SALT,
    });
    const stableIdentityHash = await hashStableIdentity({
      ip,
      userAgent,
      salt: input.env.ANALYTICS_SALT,
    });
    const country =
      (input.request as Request & { cf?: { country?: string } }).cf?.country ??
      input.request.headers.get("cf-ipcountry");
    const refererHost = safeHostname(
      input.request.headers.get("referer") ?? "",
    );
    const utmSource = url.searchParams.get("utm_source");
    const referralSignal = input.classification.referralSignals.join(",");
    const kind = resourceKind(url.pathname);
    const isTool = url.pathname.startsWith("/api/v1/tools/") ? 1 : 0;

    await input.env.DB.prepare(
      `INSERT INTO request_events (
        occurred_at, day, identity_hash, stable_identity_hash, path, method,
        status, content_type, category, matched_identity, qualified_ai, country,
        referer_host, utm_source, referral_signal, resource_kind, is_tool
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        now.toISOString(),
        day,
        identityHash,
        stableIdentityHash,
        url.pathname,
        input.request.method,
        input.response.status,
        input.response.headers.get("content-type") ?? "",
        input.classification.category,
        input.classification.matchedIdentity,
        input.classification.qualifiedAI ? 1 : 0,
        country,
        refererHost,
        utmSource,
        referralSignal || null,
        kind,
        isTool,
      )
      .run();

    return true;
  } catch {
    return false;
  }
}

export type StatsMetrics = {
  windowDays: number;
  requests: number;
  qualifiedAiRequests: number;
  qualifiedAiUniqueDaily: number;
  aiRepeat7d: number;
  machineResourceRequests: number;
  toolInteractions: number;
  citationReferrals: number;
  crawlDepth: number;
  aiPagesPerIdentity: number;
};

type StatsRow = Omit<StatsMetrics, "aiPagesPerIdentity">;

export async function queryStats(
  db: D1DatabaseLike,
  days: number,
): Promise<StatsMetrics> {
  const result = await db
    .prepare(
      `WITH windowed AS (
        SELECT *
        FROM request_events
        WHERE occurred_at >= datetime('now', ?)
      ),
      daily_identities AS (
        SELECT day, identity_hash, COUNT(DISTINCT path) AS path_count
        FROM windowed
        WHERE qualified_ai = 1
        GROUP BY day, identity_hash
      ),
      repeat_identities AS (
        SELECT stable_identity_hash
        FROM windowed
        WHERE qualified_ai = 1 AND stable_identity_hash IS NOT NULL
        GROUP BY stable_identity_hash
        HAVING COUNT(DISTINCT day) > 1
      )
      SELECT
        ? AS windowDays,
        COUNT(*) AS requests,
        COALESCE(SUM(qualified_ai), 0) AS qualifiedAiRequests,
        COUNT(DISTINCT CASE
          WHEN qualified_ai = 1 THEN day || ':' || identity_hash
        END) AS qualifiedAiUniqueDaily,
        (SELECT COUNT(*) FROM repeat_identities) AS aiRepeat7d,
        COALESCE(SUM(CASE
          WHEN qualified_ai = 1 AND resource_kind = 'machine' THEN 1 ELSE 0
        END), 0) AS machineResourceRequests,
        COALESCE(SUM(is_tool), 0) AS toolInteractions,
        COALESCE(SUM(CASE
          WHEN referral_signal IS NOT NULL THEN 1 ELSE 0
        END), 0) AS citationReferrals,
        COALESCE((SELECT AVG(path_count) FROM daily_identities), 0) AS crawlDepth
      FROM windowed`,
    )
    .bind(`-${days} days`, days)
    .all<StatsRow>();

  const row = result.results[0] ?? {
    windowDays: days,
    requests: 0,
    qualifiedAiRequests: 0,
    qualifiedAiUniqueDaily: 0,
    aiRepeat7d: 0,
    machineResourceRequests: 0,
    toolInteractions: 0,
    citationReferrals: 0,
    crawlDepth: 0,
  };

  return {
    ...row,
    aiPagesPerIdentity:
      row.qualifiedAiUniqueDaily === 0
        ? 0
        : row.qualifiedAiRequests / row.qualifiedAiUniqueDaily,
  };
}

export async function purgeOldEvents(
  db: D1DatabaseLike,
  now = new Date(),
  retentionDays = 45,
): Promise<boolean> {
  if (!Number.isInteger(retentionDays) || retentionDays < 7) {
    throw new Error("retentionDays must be an integer of at least 7");
  }
  const cutoff = new Date(
    now.getTime() - retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  try {
    await db
      .prepare("DELETE FROM request_events WHERE occurred_at < ?")
      .bind(cutoff)
      .run();
    return true;
  } catch {
    return false;
  }
}

export function isAdminAuthorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) {
    return false;
  }
  return request.headers.get("authorization") === `Bearer ${env.ADMIN_TOKEN}`;
}
