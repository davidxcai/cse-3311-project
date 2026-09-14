import { Link } from 'react-router-dom'
import { useMyRecipesQuery } from '@/features/recipes/queries'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'

export function MyRecipesRoute() {
  const mine = useMyRecipesQuery()

  return (
    <div className="space-y-4">
      <RecipeSectionNav />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My recipes</h1>
        <Link to="/recipes/new" className={buttonVariants({ size: 'sm' })}>
          New recipe
        </Link>
      </div>
      {mine.isLoading && <LoadingState />}
      {mine.data && mine.data.length === 0 && <EmptyState title="You haven't created any recipes yet." />}
      {mine.data && mine.data.length > 0 && <RecipeGrid recipes={mine.data} />}
    </div>
  )
}
