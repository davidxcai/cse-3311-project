import { useSearchParams } from 'react-router-dom'
import { useRecipesQuery } from '@/features/recipes/queries'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
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

  return (
    <div className="space-y-4">
      <RecipeSectionNav />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Recipes</h1>
        <Input
          defaultValue={filters.search ?? ''}
          placeholder="Search by name…"
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value) next.set('q', e.target.value)
            else next.delete('q')
            setParams(next, { replace: true })
          }}
          className="w-56"
        />
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}
      {data && data.length === 0 && <EmptyState title="No recipes match those filters." />}
      {data && data.length > 0 && <RecipeGrid recipes={data} />}
    </div>
  )
}
