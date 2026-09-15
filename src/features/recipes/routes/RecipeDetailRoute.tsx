import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useRecipeQuery, useRecipeIngredientsQuery } from '@/features/recipes/queries'
import { SaveRecipeButton } from '@/features/recipes/components/SaveRecipeButton'
import { usePantryQuery } from '@/features/pantry/queries'
import { useUser } from '@/features/auth/use-session'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { buttonVariants } from '@/components/ui/button'

export function RecipeDetailRoute() {
  const { id } = useParams()
  const user = useUser()
  const recipe = useRecipeQuery(id)
  const ingredients = useRecipeIngredientsQuery(id)
  const pantry = usePantryQuery()
  const haveSet = new Set((pantry.data ?? []).map((i) => i.ingredient.trim().toLowerCase()))

  if (recipe.isLoading) return <LoadingState />
  if (recipe.isError || !recipe.data) return <ErrorState error={recipe.error} onRetry={() => recipe.refetch()} />

  const r = recipe.data
  const mine = r.created_by && r.created_by === user?.id

  return (
    <article className="space-y-4">
      {mine && (
        <div className="flex justify-end">
          <Link
            to={`/recipes/${r.id}/edit`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Edit
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
        {r.thumb_url && (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={r.thumb_url}
              alt={r.name}
              className="aspect-square w-full object-cover md:aspect-auto"
            />
            <SaveRecipeButton recipeId={r.id} />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{r.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[r.category, r.area].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold">Ingredients</h2>
            {ingredients.data && (
              <ul className="mt-2 space-y-1 text-sm">
                {ingredients.data.map((ing) => (
                  <li key={ing.position} className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{ing.measure}</span> {ing.ingredient}
                    {haveSet.has(ing.ingredient.trim().toLowerCase()) && (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold">Instructions</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{r.instructions}</p>
          </section>
        </div>
      </div>
    </article>
  )
}
