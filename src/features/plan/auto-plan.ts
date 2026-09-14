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
  /** restrict to recipes whose `area` is in this list; empty = no restriction */
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

function sortByRecencyThenCoverage(list: AutoPlanCandidate[]): AutoPlanCandidate[] {
  return [...list].sort(
    (a, b) =>
      b.daysSincePlanned - a.daysSincePlanned ||
      b.coverage - a.coverage ||
      a.name.localeCompare(b.name),
  )
}

/**
 * Score and sort Auto Plan candidates.
 *
 * 1. Keep recipes in the requested `scope` (system / mine / saved — OR'd).
 * 2. Exclude a recipe if it contains a disliked ingredient, or if any required
 *    restriction is missing from its diet_tags (same rule as discover/rank.ts).
 * 3. Exclude a recipe if `cuisines` is non-empty and its `area` isn't in it.
 * 4. Compute pantry coverage the same way discover does.
 * 5. Sort by recency desc (never-planned first), then coverage desc, then name
 *    asc — "avoid recent repeats" is a soft ranking signal, not a hard cutoff,
 *    so the pool never runs dry: worst case it resurfaces the
 *    least-recently-cooked recipe instead of blocking the week.
 * 6. If `newOnly` is set, restrict to never-planned recipes — but only when
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

    if (input.cuisines.length > 0 && (!recipe.area || !input.cuisines.includes(recipe.area))) continue

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
      coverage: total === 0 ? 0 : haveCount / total,
      missingCount: total - haveCount,
      daysSincePlanned,
    })
  }

  if (input.newOnly) {
    const neverPlanned = scored.filter((c) => c.daysSincePlanned === Infinity)
    if (neverPlanned.length >= input.minCount) {
      return { candidates: sortByRecencyThenCoverage(neverPlanned), relaxedNewOnly: false }
    }
  }

  return { candidates: sortByRecencyThenCoverage(scored), relaxedNewOnly: input.newOnly }
}

/**
 * Pick `count` items at random from `pool` (Fisher-Yates shuffle). Cycles
 * through the shuffled pool if `count` exceeds its size, so Auto Plan can
 * always fill every day even with a small recipe library.
 */
export function pickRandom<T>(pool: T[], count: number, rng: () => number = Math.random): T[] {
  if (pool.length === 0 || count <= 0) return []
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length])
}
