import { useNavigate } from 'react-router-dom'
import { RecipeForm } from '@/features/recipes/components/RecipeForm'
import { useCreateRecipe } from '@/features/recipes/mutations'
import { ErrorState } from '@/components/common/ErrorState'

export function NewRecipeRoute() {
  const navigate = useNavigate()
  const create = useCreateRecipe()

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">New recipe</h1>
      {create.isError && <ErrorState error={create.error} />}
      <RecipeForm
        submitLabel="Create recipe"
        busy={create.isPending}
        onSubmit={(draft) =>
          create.mutate(draft, { onSuccess: (id) => navigate(`/recipes/${id}`) })
        }
      />
    </div>
  )
}
