import { REGISTRY } from "./catalog";

type Directive = {
  kind: "allow" | "disallow";
  path: string;
};

type Group = {
  agents: string[];
  directives: Directive[];
};

export type RobotsIdentityResult = {
  status: "allowed" | "blocked" | "unspecified";
  source: "specific" | "wildcard" | "none";
  matchedRule: string | null;
};

export type RobotsLintResult = {
  identities: Record<string, RobotsIdentityResult>;
  summary: {
    allowed: number;
    blocked: number;
    unspecified: number;
  };
  diagnostics: string[];
};

function parseGroups(robotsText: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) {
      continue;
    }

    const separator = line.indexOf(":");
    if (separator < 0) {
      continue;
    }

    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!current || current.directives.length > 0) {
        current = { agents: [], directives: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (
      current &&
      (field === "allow" || field === "disallow")
    ) {
      current.directives.push({ kind: field, path: value });
    }
  }

  return groups;
}

function appliesToRoot(directive: Directive): boolean {
  if (directive.path === "") {
    return false;
  }
  return "/".startsWith(directive.path.replace(/\$$/, ""));
}

function evaluate(
  groups: Group[],
  robotsToken: string,
): RobotsIdentityResult {
  const normalized = robotsToken.toLowerCase();
  const specific = groups.filter((group) =>
    group.agents.includes(normalized),
  );
  const wildcard = groups.filter((group) => group.agents.includes("*"));
  const selected = specific.length > 0 ? specific : wildcard;
  const source = specific.length > 0
    ? "specific"
    : wildcard.length > 0
      ? "wildcard"
      : "none";

  if (selected.length === 0) {
    return {
      status: "unspecified",
      source: "none",
      matchedRule: null,
    };
  }

  const matching = selected
    .flatMap((group) => group.directives)
    .filter(appliesToRoot)
    .sort((left, right) => {
      const lengthDifference = right.path.length - left.path.length;
      if (lengthDifference !== 0) {
        return lengthDifference;
      }
      if (left.kind === right.kind) {
        return 0;
      }
      return left.kind === "allow" ? -1 : 1;
    });

  const winner = matching[0];
  if (!winner) {
    return {
      status: "allowed",
      source,
      matchedRule: null,
    };
  }

  return {
    status: winner.kind === "allow" ? "allowed" : "blocked",
    source,
    matchedRule: `${winner.kind[0]?.toUpperCase()}${winner.kind.slice(1)}: ${winner.path}`,
  };
}

export function lintRobotsPolicy(robotsText: string): RobotsLintResult {
  const groups = parseGroups(robotsText);
  const identities: Record<string, RobotsIdentityResult> = {};

  for (const token of new Set(REGISTRY.map((entry) => entry.robotsToken))) {
    identities[token] = evaluate(groups, token);
  }

  const values = Object.values(identities);
  const summary = {
    allowed: values.filter((value) => value.status === "allowed").length,
    blocked: values.filter((value) => value.status === "blocked").length,
    unspecified: values.filter((value) => value.status === "unspecified")
      .length,
  };

  const diagnostics: string[] = [];
  if (robotsText.trim() === "") {
    diagnostics.push(
      "The policy is empty. Crawlers are generally allowed, but no AI identity is addressed explicitly.",
    );
  }
  if (summary.blocked > 0) {
    diagnostics.push(
      `${summary.blocked} known AI web identities are blocked at the site root.`,
    );
  }
  if (summary.unspecified > 0) {
    diagnostics.push(
      `${summary.unspecified} known AI web identities have no matching policy group.`,
    );
  }

  return { identities, summary, diagnostics };
}
