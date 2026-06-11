export type VisitorCategory =
  | "ai-search-crawler"
  | "ai-training-crawler"
  | "ai-user-agent"
  | "search-crawler"
  | "automation"
  | "browser"
  | "unknown";

export type RequestClassification = {
  category: VisitorCategory;
  matchedIdentity: string | null;
  qualifiedAI: boolean;
  referralSignals: string[];
};

export type RegistryPurpose =
  | "search"
  | "training"
  | "user-action"
  | "search-control";

export type RegistryEntry = {
  slug: string;
  operator: string;
  product: string;
  userAgent: string;
  purpose: RegistryPurpose;
  robotsToken: string;
  description: string;
  sourceUrl: string;
  sourceTitle: string;
  verifiedOn: string;
};

export type NetworkVerificationStatus =
  | "verified"
  | "not_verified"
  | "source_unavailable"
  | "unsupported"
  | "not_applicable"
  | "not_checked";

export type NetworkVerification = {
  status: NetworkVerificationStatus;
  sourceUrl: string | null;
  sourceUpdatedAt: string | null;
};

export type D1RunResult = {
  success: boolean;
  meta?: Record<string, unknown>;
};

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  run(): Promise<D1RunResult>;
  all<T = Record<string, unknown>>(): Promise<{
    success: boolean;
    results: T[];
  }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

export type Env = {
  DB?: D1DatabaseLike;
  SITE_ORIGIN?: string;
  ANALYTICS_SALT?: string;
  ADMIN_TOKEN?: string;
};

export type ExecutionContextLike = {
  waitUntil(promise: Promise<unknown>): void;
};
