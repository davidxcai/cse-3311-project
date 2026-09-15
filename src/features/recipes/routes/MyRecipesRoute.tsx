import { Link } from 'react-router-dom'
import { useMyRecipesQuery, useSavedRecipeIds } from '@/features/recipes/queries'
import { useToggleSaveRecipe } from '@/features/recipes/mutations'
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid'
import { RecipeSectionNav } from '@/features/recipes/components/RecipeSectionNav'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'

export function MyRecipesRoute() {
  const mine = useMyRecipesQuery()
  const savedIds = useSavedRecipeIds()
  const toggleSave = useToggleSaveRecipe()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0 space-y-4">
        <RecipeSectionNav />

        <div className="flex justify-end">
          <Link to="/recipes/new" className={buttonVariants({ size: 'sm' })}>
            New recipe
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {mine.isLoading && <LoadingState />}
        {mine.data && mine.data.length === 0 && <EmptyState title="You haven't created any recipes yet." />}
        {mine.data && mine.data.length > 0 && (
          <RecipeGrid
            recipes={mine.data}
            savedIds={savedIds}
            onToggleSave={(recipe) => toggleSave.mutate({ recipeId: recipe.id, saved: savedIds.has(recipe.id) })}
          />
        )}
      </div>
    </div>
  )
}
