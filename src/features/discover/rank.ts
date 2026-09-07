/**
 * The suggestion algorithm — a pure, synchronous function. No React, no Supabase,
 * no SQL. This is the engineering hook; keep it covered by rank.test.ts.
 *
 * See brief.md § "Suggestion algorithm" and ARCHITECTURE.md § "Suggestion algorithm".
 */

export type RankRecipeInput = {
  id: string
  name: string
  /** diet tags the recipe satisfies (best-effort seed values) */
  diet_tags: string[]
  /** ingredient names, as stored in recipe_ingredients.ingredient */
  ingredients: string[]
}

export type RankInput = {
  recipes: RankRecipeInput[]
  /** ingredient names the user has on hand */
  pantry: string[]
  /** every one of these must appear in a recipe's diet_tags for it to qualify */
  restrictions: string[]
  /** exclude any recipe containing one of these ingredient names */
  disliked: string[]
}

export type RankedRecipe = {
  id: string
  name: string
  /** distinct recipe ingredients the user already has */
  haveCount: number
  /** distinct recipe ingredients the user lacks */
  missingCount: number
  /** haveCount / total distinct ingredients (0 when the recipe lists none) */
  coverage: number
  /** the missing ingredient names, original casing, recipe order */
  missing: string[]
}

/** Trimmed, lower-cased canonical form used for every name comparison. */
function canon(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * Rank `recipes` by how well the user's pantry covers them.
 *
 * 1. Exclude a recipe if it contains a disliked ingredient, or if any required
 *    restriction is missing from its diet_tags.
 * 2. For each survivor compute haveCount / missingCount / coverage over its
 *    distinct ingredients.
 * 3. Sort by coverage desc, then missingCount asc, then name asc.
 */
export function rankRecipes(input: RankInput): RankedRecipe[] {
  const pantry = new Set(input.pantry.map(canon))
  const disliked = new Set(input.disliked.map(canon))
  const restrictions = [...new Set(input.restrictions.map(canon))].filter(Boolean)

  const ranked: RankedRecipe[] = []

  for (const recipe of input.recipes) {
    const dietTags = new Set(recipe.diet_tags.map(canon))
    if (restrictions.some((tag) => !dietTags.has(tag))) continue

    // Distinct ingredients, keeping the first original spelling and recipe order.
    const distinct = new Map<string, string>()
    for (const raw of recipe.ingredients) {
      const key = canon(raw)
      if (!key) continue
      if (!distinct.has(key)) distinct.set(key, raw.trim())
    }

    if ([...distinct.keys()].some((key) => disliked.has(key))) continue

    const total = distinct.size
    const missing: string[] = []
    let haveCount = 0
    for (const [key, original] of distinct) {
      if (pantry.has(key)) haveCount++
      else missing.push(original)
    }

    ranked.push({
      id: recipe.id,
      name: recipe.name,
      haveCount,
      missingCount: missing.length,
      coverage: total === 0 ? 0 : haveCount / total,
      missing,
    })
  }

  ranked.sort(
    (a, b) =>
      b.coverage - a.coverage ||
      a.missingCount - b.missingCount ||
      a.name.localeCompare(b.name),
  )

  return ranked
}
