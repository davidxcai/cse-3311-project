import { useNavigate, useParams } from 'react-router-dom'
import { RecipeForm } from '@/features/recipes/components/RecipeForm'
import { useRecipeQuery, useRecipeIngredientsQuery } from '@/features/recipes/queries'
import { useUpdateRecipe } from '@/features/recipes/mutations'
import type { RecipeDraft } from '@/features/recipes/api'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'

export function EditRecipeRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const recipe = useRecipeQuery(id)
  const ingredients = useRecipeIngredientsQuery(id)
  const update = useUpdateRecipe(id!)

  if (recipe.isLoading || ingredients.isLoading) return <LoadingState />
  if (recipe.isError || !recipe.data) return <ErrorState error={recipe.error} />

  const r = recipe.data
  const initial: RecipeDraft = {
    name: r.name,
    category: r.category,
    area: r.area,
    instructions: r.instructions,
    thumb_url: r.thumb_url,
    diet_tags: r.diet_tags,
    ingredients: (ingredients.data ?? []).map((ing) => ({
      ingredient: ing.ingredient,
      measure: ing.measure,
    })),
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Edit recipe</h1>
      {update.isError && <ErrorState error={update.error} />}
      <RecipeForm
        initial={initial}
        submitLabel="Save changes"
        busy={update.isPending}
        onSubmit={(draft) => update.mutate(draft, { onSuccess: () => navigate(`/recipes/${id}`) })}
      />
    </div>
  )
}
