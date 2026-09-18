import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRecipesQuery, useSavedRecipeIds } from '@/features/recipes/queries'
import { useToggleSaveRecipe } from '@/features/recipes/mutations'
import { useSuggestedRecipes } from '@/features/discover/use-suggested-recipes'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
import { display } from '@/data/iteration'
import type { DietTag } from '@/types/models'

export function RecipesRoute() {
  const [params, setParams] = useSearchParams()
  const filters = {
    category: params.get('category') || undefined,
    area: params.get('area') || undefined,
    dietTag: (params.get('diet') as DietTag) || undefined,
    search: params.get('q') || undefined,
  }
  const { data, isLoading, isError, error, refetch } = useRecipesQuery(filters)
  const savedIds = useSavedRecipeIds()
  const toggleSave = useToggleSaveRecipe()

  const suggested = useSuggestedRecipes()
  const matchById = useMemo(() => new Map(suggested.data.map((r) => [r.id, r])), [suggested.data])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <RecipeSectionNav />
      </div>

      <Input
        defaultValue={filters.search ?? ''}
        placeholder="Search"
        onChange={(e) => {
          const next = new URLSearchParams(params)
          if (e.target.value) next.set('q', e.target.value)
          else next.delete('q')
          setParams(next, { replace: true })
        }}
        className="w-56 shrink-0"
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <LoadingState />}
        {isError && <ErrorState error={error} onRetry={() => refetch()} />}
        {data && data.length === 0 && <EmptyState title="No recipes match those filters." />}
        {data && data.length > 0 && (
          <RecipeGrid
            recipes={data}
            savedIds={savedIds}
            onToggleSave={(recipe) => toggleSave.mutate({ recipeId: recipe.id, saved: savedIds.has(recipe.id) })}
            renderIngredients={
              display.iteration3
                ? (recipe) => {
                    const match = matchById.get(recipe.id)
                    if (!match) return undefined
                    return { have: match.haveCount, total: match.haveCount + match.missingCount }
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}
