import { useMemo } from 'react'
import { usePantryQuery } from '@/features/pantry/queries'
import { useProfileQuery } from '@/features/profile/queries'
import { useRecipesWithIngredientsQuery, useSavedRecipesQuery } from '@/features/recipes/queries'
import { usePlanHistoryQuery } from './queries'
import { buildAutoPlanCandidates, type AutoPlanCandidate, type CollectionScope } from './auto-plan'

type Options = {
  scope: CollectionScope
  newOnly: boolean
  cuisines: string[]
  minCount: number
}

type State = {
  candidates: AutoPlanCandidate[]
  relaxedNewOnly: boolean
  /** cuisines (recipe `area`) present in the scope+diet+dislike-filtered pool, before cuisine filtering */
  availableCuisines: string[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Composes pantry + profile + recipes-with-ingredients + saved recipes + plan
 * history and runs the pure `buildAutoPlanCandidates`. The composition is a
 * hook; the algorithm is not.
 */
export function useAutoPlanCandidates({ scope, newOnly, cuisines, minCount }: Options): State {
  const pantry = usePantryQuery()
  const profile = useProfileQuery()
  const recipes = useRecipesWithIngredientsQuery()
  const saved = useSavedRecipesQuery()
  const history = usePlanHistoryQuery()

  const result = useMemo(() => {
    if (!pantry.data || !profile.data || !recipes.data || !saved.data || !history.data) return null

    const savedIds = new Set(saved.data.map((r) => r.id))
    // history is ordered by planned_date desc, so the first row per recipe is the most recent.
    const lastPlanned: Record<string, string> = {}
    for (const row of history.data) {
      if (!(row.recipe_id in lastPlanned)) lastPlanned[row.recipe_id] = row.planned_date
    }

    const common = {
      recipes: recipes.data.map((r) => ({ ...r, isSaved: savedIds.has(r.id) })),
      pantry: pantry.data.map((p) => p.ingredient),
      restrictions: profile.data.dietary_restrictions,
      disliked: [...profile.data.disliked_ingredients, ...profile.data.allergy_ingredients],
      allergies: profile.data.allergies,
      history: lastPlanned,
      scope,
      today: new Date().toISOString().slice(0, 10),
    }

    // Scope+diet+dislike-filtered pool, ignoring cuisine/newOnly — used only to
    // enumerate which cuisines are worth showing as chips (see AutoPlanPanel).
    const basePool = buildAutoPlanCandidates({ ...common, cuisines: [], newOnly: false, minCount: 0 })
    const availableCuisines = [...new Set(basePool.candidates.map((c) => c.area).filter((a): a is string => !!a))].sort()

    const result = buildAutoPlanCandidates({ ...common, cuisines, newOnly, minCount })

    return { ...result, availableCuisines }
  }, [pantry.data, profile.data, recipes.data, saved.data, history.data, scope, newOnly, cuisines, minCount])

  return {
    candidates: result?.candidates ?? [],
    relaxedNewOnly: result?.relaxedNewOnly ?? false,
    availableCuisines: result?.availableCuisines ?? [],
    isLoading:
      pantry.isLoading || profile.isLoading || recipes.isLoading || saved.isLoading || history.isLoading,
    isError: pantry.isError || profile.isError || recipes.isError || saved.isError || history.isError,
    error: pantry.error ?? profile.error ?? recipes.error ?? saved.error ?? history.error,
  }
}
