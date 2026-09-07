import { useQuery } from '@tanstack/react-query'
import * as api from './api'
import type { RecipeFilters } from './api'

export function useRecipesQuery(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: ['recipes', 'list', filters],
    queryFn: () => api.listRecipes(filters),
  })
}

export function useRecipeQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['recipes', 'detail', id],
    queryFn: () => api.getRecipe(id!),
    enabled: !!id,
  })
}

export function useRecipeIngredientsQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['recipes', 'detail', id, 'ingredients'],
    queryFn: () => api.getRecipeIngredients(id!),
    enabled: !!id,
  })
}

export function useMyRecipesQuery() {
  return useQuery({
    queryKey: ['recipes', 'mine'],
    queryFn: () => api.listRecipes({ mineOnly: true }),
  })
}

export function useSavedRecipesQuery() {
  return useQuery({
    queryKey: ['saved-recipes'],
    queryFn: api.listSavedRecipes,
  })
}

export function useRecipesWithIngredientsQuery() {
  return useQuery({
    queryKey: ['recipes', 'with-ingredients'],
    queryFn: api.listRecipesWithIngredients,
  })
}

export function useIngredientsQuery() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: api.listIngredients,
    staleTime: Infinity,
  })
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: ['categories'], queryFn: api.listCategories, staleTime: Infinity })
}

export function useAreasQuery() {
  return useQuery({ queryKey: ['areas'], queryFn: api.listAreas, staleTime: Infinity })
}
