/**
 * Auto Plan candidate scoring — a pure, synchronous function in the same style
 * as `discover/rank.ts`. No React, no Supabase, no SQL.
 *
 * See ARCHITECTURE.md § "Auto plan algorithm" and issue #3.
 */

export type AutoPlanRecipeInput = {
  id: string
  name: string
  /** diet tags the recipe satisfies */
  diet_tags: string[]
  /** ingredient names, as stored in recipe_ingredients.ingredient */
  ingredients: string[]
  source: 'system' | 'user'
  isSaved: boolean
  area: string | null
  thumb_url: string | null
}

/** Which collections to draw candidates from. Independent, OR'd together. */
export type CollectionScope = {
  system: boolean
  mine: boolean
  saved: boolean
}

export type AutoPlanInput = {
  recipes: AutoPlanRecipeInput[]
  /** ingredient names the user has on hand */
  pantry: string[]
  /** every one of these must appear in a recipe's diet_tags for it to qualify */
  restrictions: string[]
  /** exclude any recipe containing one of these ingredient names */
  disliked: string[]
  /** recipe id -> most recent planned_date (YYYY-MM-DD) it was assigned to a plan day */
  history: Record<string, string>
  scope: CollectionScope
  /** prefer recipes whose `area` is in this list (soft tiebreak, not a filter); empty = no preference */
  cuisines: string[]
  /** restrict to recipes absent from `history`, when enough of them qualify */
  newOnly: boolean
  /** number of days Auto Plan needs to fill; `newOnly` relaxes below this */
  minCount: number
  /** ISO date (YYYY-MM-DD) — injected rather than read from the clock, for deterministic tests */
  today: string
}

export type AutoPlanCandidate = {
  id: string
  name: string
  area: string | null
  thumb_url: string | null
  /** distinct ingredients the user's pantry covers */
  haveCount: number
  /** total distinct ingredients the recipe calls for */
  total: number
  /** haveCount / total distinct ingredients (0 when the recipe lists none) */
  coverage: number
  missingCount: number
  /** days since this recipe last appeared in history; Infinity if it never has */
  daysSincePlanned: number
}

export type AutoPlanResult = {
  candidates: AutoPlanCandidate[]
  /** true when `newOnly` was requested but relaxed because too few recipes qualified */
  relaxedNewOnly: boolean
}

function canon(name: string): string {
  return name.trim().toLowerCase()
}

function inScope(recipe: AutoPlanRecipeInput, scope: CollectionScope): boolean {
  return (
    (scope.system && recipe.source === 'system') ||
    (scope.mine && recipe.source === 'user') ||
    (scope.saved && recipe.isSaved)
  )
}

function daysBetween(today: string, date: string): number {
  const ms = new Date(`${today}T00:00:00Z`).getTime() - new Date(`${date}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

function matchesCuisine(candidate: AutoPlanCandidate, cuisines: string[]): boolean {
  return cuisines.length === 0 || (candidate.area != null && cuisines.includes(candidate.area))
}

/**
 * Ranks best grocery-trip match first, deterministically — no randomness.
 *
 * Two coarse tiers come first, each splitting the pool in two:
 * 1. Having *any* pantry ingredient beats having none, regardless of how
 *    short the shopping list for a zero-overlap recipe would be — "I own
 *    something for this" matters more than raw missing-ingredient count.
 * 2. Matching a requested cuisine beats not matching one — but only within
 *    an availability tier, so a cuisine match with zero ingredients still
 *    ranks below a non-matching recipe you can actually make headway on.
 *
 * Within each of the resulting four groups, rank by haveCount desc (uses up
 * the most pantry first), then missingCount asc (smaller trip breaks ties),
 * then name asc.
 */
function sortAutoPlan(list: AutoPlanCandidate[], cuisines: string[]): AutoPlanCandidate[] {
  return [...list].sort((a, b) => {
    const aHas = a.haveCount > 0
    const bHas = b.haveCount > 0
    if (aHas !== bHas) return aHas ? -1 : 1

    const aCuisine = matchesCuisine(a, cuisines)
    const bCuisine = matchesCuisine(b, cuisines)
    if (aCuisine !== bCuisine) return aCuisine ? -1 : 1

    return b.haveCount - a.haveCount || a.missingCount - b.missingCount || a.name.localeCompare(b.name)
  })
}

/**
 * Score and sort Auto Plan candidates.
 *
 * 1. Keep recipes in the requested `scope` (system / mine / saved — OR'd).
 * 2. Exclude a recipe if it contains a disliked ingredient, or if any required
 *    restriction is missing from its diet_tags (same rule as discover/rank.ts)
 *    — a recipe with no tags at all is excluded the same as one that's tagged
 *    against the restriction; an unlabeled recipe never gets the benefit of
 *    the doubt.
 * 3. Compute pantry coverage the same way discover does.
 * 4. Sort — see `sortAutoPlan` — by pantry availability, then cuisine match,
 *    then haveCount, then missingCount, then name. `cuisines` is a ranking
 *    preference here, not a filter: a non-matching recipe never gets dropped,
 *    only outranked.
 * 5. If `newOnly` is set, restrict to never-planned recipes — but only when
 *    that leaves at least `minCount` candidates; otherwise ignore the toggle
 *    rather than fail to fill the week.
 */
export function buildAutoPlanCandidates(input: AutoPlanInput): AutoPlanResult {
  const pantry = new Set(input.pantry.map(canon))
  const disliked = new Set(input.disliked.map(canon))
  const restrictions = [...new Set(input.restrictions.map(canon))].filter(Boolean)

  const scored: AutoPlanCandidate[] = []

  for (const recipe of input.recipes) {
    if (!inScope(recipe, input.scope)) continue

    const dietTags = new Set(recipe.diet_tags.map(canon))
    if (restrictions.some((tag) => !dietTags.has(tag))) continue

    const distinct = new Map<string, string>()
    for (const raw of recipe.ingredients) {
      const key = canon(raw)
      if (!key) continue
      if (!distinct.has(key)) distinct.set(key, raw.trim())
    }
    if ([...distinct.keys()].some((key) => disliked.has(key))) continue

    const total = distinct.size
    let haveCount = 0
    for (const key of distinct.keys()) {
      if (pantry.has(key)) haveCount++
    }

    const lastPlanned = input.history[recipe.id]
    const daysSincePlanned = lastPlanned ? daysBetween(input.today, lastPlanned) : Infinity

    scored.push({
      id: recipe.id,
      name: recipe.name,
      area: recipe.area,
      thumb_url: recipe.thumb_url,
      haveCount,
      total,
      coverage: total === 0 ? 0 : haveCount / total,
      missingCount: total - haveCount,
      daysSincePlanned,
    })
  }

  if (input.newOnly) {
    const neverPlanned = scored.filter((c) => c.daysSincePlanned === Infinity)
    if (neverPlanned.length >= input.minCount) {
      return { candidates: sortAutoPlan(neverPlanned, input.cuisines), relaxedNewOnly: false }
    }
  }

  return { candidates: sortAutoPlan(scored, input.cuisines), relaxedNewOnly: input.newOnly }
}

/**
 * Reads `count` items starting at rank `cursor` in `pool` (already ranked
 * best-first), wrapping around if `cursor + count` runs past the end. No
 * randomness: the first call (`cursor = 0`) is always the best-ranked items,
 * and advancing the cursor only ever moves further down the ranking — so
 * "re-roll" swaps in the next-best option instead of a random one, and never
 * re-shows something already-seen ranked higher.
 */
export function pickFromRank<T>(pool: T[], count: number, cursor: number): T[] {
  if (pool.length === 0 || count <= 0) return []
  return Array.from({ length: count }, (_, i) => pool[(cursor + i) % pool.length])
}
