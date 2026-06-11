import { REGISTRY } from "./catalog";
import type { RegistryEntry, RegistryPurpose } from "./types";

export type RobotsDecision = "allow" | "disallow";

export type RobotsRecipe = {
  slug: string;
  title: string;
  summary: string;
  rationale: string;
  decisions: Record<RegistryPurpose, RobotsDecision>;
};

export const ROBOTS_RECIPES: RobotsRecipe[] = [
  {
    slug: "search-visible-no-training",
    title: "Search visibility without training crawlers",
    summary:
      "Allow AI search and user-directed retrieval while blocking documented training crawlers.",
    rationale:
      "Use this when citation and retrieval visibility are desired but model-training collection is not.",
    decisions: {
      search: "allow",
      training: "disallow",
      "user-action": "allow",
      "search-control": "allow",
    },
  },
  {
    slug: "search-crawlers-only",
    title: "AI search crawlers only",
    summary:
      "Allow documented AI search crawlers while blocking training and user-directed fetch identities.",
    rationale:
      "Use this when automated search indexing is acceptable but interactive agent retrieval is not.",
    decisions: {
      search: "allow",
      training: "disallow",
      "user-action": "disallow",
      "search-control": "allow",
    },
  },
  {
    slug: "user-actions-only",
    title: "User-directed AI actions only",
    summary:
      "Allow documented user-directed fetch identities while blocking search and training crawlers.",
    rationale:
      "Use this when pages may be fetched for an explicit user request but should not be broadly crawled.",
    decisions: {
      search: "disallow",
      training: "disallow",
      "user-action": "allow",
      "search-control": "disallow",
    },
  },
  {
    slug: "full-ai-access",
    title: "Full documented AI access",
    summary:
      "Allow every documented AI search, training, and user-directed identity in the registry.",
    rationale:
      "Use this when broad AI discovery and reuse are intentional.",
    decisions: {
      search: "allow",
      training: "allow",
      "user-action": "allow",
      "search-control": "allow",
    },
  },
  {
    slug: "block-known-ai",
    title: "Block documented AI identities",
    summary:
      "Block every documented AI identity in the registry without changing the wildcard policy for other crawlers.",
    rationale:
      "Use this as an explicit baseline when known AI access should be denied.",
    decisions: {
      search: "disallow",
      training: "disallow",
      "user-action": "disallow",
      "search-control": "disallow",
    },
  },
];

export function findRobotsRecipe(slug: string): RobotsRecipe | undefined {
  return ROBOTS_RECIPES.find((recipe) => recipe.slug === slug);
}

export function recipeDecision(
  recipe: RobotsRecipe,
  entry: RegistryEntry,
): RobotsDecision {
  return recipe.decisions[entry.purpose];
}

export function generateRobotsPolicy(
  recipe: RobotsRecipe,
  options: { sitemap?: string } = {},
): string {
  const directives = REGISTRY.map((entry) => {
    const directive =
      recipeDecision(recipe, entry) === "allow" ? "Allow" : "Disallow";
    return `User-agent: ${entry.robotsToken}\n${directive}: /`;
  }).join("\n\n");

  const sitemap = options.sitemap
    ? `\n\nSitemap: ${options.sitemap}`
    : "";

  return `# AI Web Observatory recipe: ${recipe.slug}
# ${recipe.summary}

${directives}

User-agent: *
Allow: /${sitemap}
`;
}

export function robotsRecipeGeneratePath(recipe: RobotsRecipe): string {
  return `/api/v1/tools/generate-robots?preset=${encodeURIComponent(recipe.slug)}`;
}

export function robotsRecipesMarkdown(origin: string): string {
  const recipes = ROBOTS_RECIPES.map((recipe) => {
    const policy = generateRobotsPolicy(recipe);
    const generateUrl = `${origin}${robotsRecipeGeneratePath(recipe)}`;
    return `## ${recipe.title}

- Slug: \`${recipe.slug}\`
- Summary: ${recipe.summary}
- Rationale: ${recipe.rationale}
- HTML: ${origin}/robots-recipes/${recipe.slug}
- JSON: ${origin}/api/v1/robots-recipes/${recipe.slug}.json
- Generate: GET ${generateUrl}

\`\`\`text
${policy.trim()}
\`\`\``;
  }).join("\n\n");

  return `# AI robots.txt policy recipes

Deterministic policies derived from the sourced AI web identity registry.

${recipes}
`;
}
