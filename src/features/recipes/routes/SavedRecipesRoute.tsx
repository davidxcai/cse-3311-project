import { useMemo } from 'react'
import { useSavedRecipesQuery } from '@/features/recipes/queries'
import { useToggleSaveRecipe } from '@/features/recipes/mutations'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

export function SavedRecipesRoute() {
  const { data, isLoading, isError, error, refetch } = useSavedRecipesQuery()
  const savedIds = useMemo(() => new Set((data ?? []).map((r) => r.id)), [data])
  const toggleSave = useToggleSaveRecipe()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <RecipeSectionNav />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <LoadingState />}
        {isError && <ErrorState error={error} onRetry={() => refetch()} />}
        {data && data.length === 0 && <EmptyState title="Nothing saved yet." />}
        {data && data.length > 0 && (
          <RecipeGrid
            recipes={data}
            savedIds={savedIds}
            onToggleSave={(recipe) => toggleSave.mutate({ recipeId: recipe.id, saved: true })}
          />
        )}
      </div>
    </div>
  )
}
