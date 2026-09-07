import { useMemo } from 'react'
import { usePantryQuery } from '@/features/pantry/queries'
import { useProfileQuery } from '@/features/profile/queries'
import { useRecipesWithIngredientsQuery } from '@/features/recipes/queries'
import { rankRecipes, type RankedRecipe } from './rank'

type State = {
  data: RankedRecipe[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Composes pantry + profile + recipes-with-ingredients and runs the pure
 * `rankRecipes`. The composition is a hook; the algorithm is not.
 */
export function useSuggestedRecipes(): State {
  const pantry = usePantryQuery()
  const profile = useProfileQuery()
  const recipes = useRecipesWithIngredientsQuery()

  const data = useMemo(() => {
    if (!pantry.data || !profile.data || !recipes.data) return []
    return rankRecipes({
      recipes: recipes.data,
      pantry: pantry.data.map((p) => p.ingredient),
      restrictions: profile.data.dietary_restrictions,
      disliked: profile.data.disliked_ingredients,
    })
  }, [pantry.data, profile.data, recipes.data])

  return {
    data,
    isLoading: pantry.isLoading || profile.isLoading || recipes.isLoading,
    isError: pantry.isError || profile.isError || recipes.isError,
    error: pantry.error ?? profile.error ?? recipes.error,
  }
}
