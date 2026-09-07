import { Link } from 'react-router-dom'
import { useMyRecipesQuery, useSavedRecipesQuery } from '@/features/recipes/queries'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'

export function MyRecipesRoute() {
  const mine = useMyRecipesQuery()
  const saved = useSavedRecipesQuery()

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">My recipes</h1>
          <Link to="/recipes/new" className={buttonVariants({ size: 'sm' })}>
            New recipe
          </Link>
        </div>
        {mine.isLoading && <LoadingState />}
        {mine.data && mine.data.length === 0 && (
          <EmptyState title="You haven't created any recipes yet." />
        )}
        {mine.data && mine.data.length > 0 && <RecipeGrid recipes={mine.data} />}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Saved</h2>
        {saved.isLoading && <LoadingState />}
        {saved.data && saved.data.length === 0 && <EmptyState title="Nothing saved yet." />}
        {saved.data && saved.data.length > 0 && <RecipeGrid recipes={saved.data} />}
      </section>
    </div>
  )
}
