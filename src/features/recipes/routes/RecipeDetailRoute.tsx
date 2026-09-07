import { Link, useParams } from 'react-router-dom'
import { useRecipeQuery, useRecipeIngredientsQuery } from '@/features/recipes/queries'
import { SaveRecipeButton } from '@/features/recipes/components/SaveRecipeButton'
import { useUser } from '@/features/auth/use-session'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { buttonVariants } from '@/components/ui/button'

export function RecipeDetailRoute() {
  const { id } = useParams()
  const user = useUser()
  const recipe = useRecipeQuery(id)
  const ingredients = useRecipeIngredientsQuery(id)

  if (recipe.isLoading) return <LoadingState />
  if (recipe.isError || !recipe.data) return <ErrorState error={recipe.error} onRetry={() => recipe.refetch()} />

  const r = recipe.data
  const mine = r.created_by && r.created_by === user?.id

  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{r.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[r.category, r.area].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <SaveRecipeButton recipeId={r.id} />
          {mine && (
            <Link
              to={`/recipes/${r.id}/edit`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {r.thumb_url && (
        <img src={r.thumb_url} alt={r.name} className="w-full max-w-md rounded-lg object-cover" />
      )}

      <section>
        <h2 className="text-sm font-semibold">Ingredients</h2>
        {ingredients.data && (
          <ul className="mt-2 space-y-1 text-sm">
            {ingredients.data.map((ing) => (
              <li key={ing.position}>
                <span className="text-muted-foreground">{ing.measure}</span> {ing.ingredient}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Instructions</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.instructions}</p>
      </section>
    </article>
  )
}
