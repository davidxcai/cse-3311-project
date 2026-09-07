import { Link } from 'react-router-dom'
import { useSuggestedRecipes } from '@/features/discover/use-suggested-recipes'
import { SuggestionCard } from '@/features/discover/components/SuggestionCard'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'

export function DiscoverRoute() {
  const { data, isLoading, isError, error } = useSuggestedRecipes()

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Discover</h1>
      <p className="text-sm text-muted-foreground">
        Ranked by how much of each recipe your pantry already covers, honoring your diet tags and
        dislikes.
      </p>

      {isLoading && <LoadingState />}
      {isError && <ErrorState error={error} />}
      {!isLoading && !isError && data.length === 0 && (
        <EmptyState
          title="No suggestions yet."
          description="Add a few ingredients to your pantry to get ranked recipes."
          action={
            <Link to="/pantry" className={buttonVariants({ size: 'sm' })}>
              Go to pantry
            </Link>
          }
        />
      )}
      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((recipe) => (
            <SuggestionCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
