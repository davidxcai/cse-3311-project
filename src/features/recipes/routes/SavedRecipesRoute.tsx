import { useSavedRecipesQuery } from '@/features/recipes/queries'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

export function SavedRecipesRoute() {
  const { data, isLoading, isError, error, refetch } = useSavedRecipesQuery()

  return (
    <div className="space-y-4">
      <RecipeSectionNav />

      <h1 className="text-lg font-semibold">Saved recipes</h1>

      {isLoading && <LoadingState />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}
      {data && data.length === 0 && <EmptyState title="Nothing saved yet." />}
      {data && data.length > 0 && <RecipeGrid recipes={data} />}
    </div>
  )
}
