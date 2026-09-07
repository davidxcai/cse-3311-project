import { useSavedRecipesQuery } from '@/features/recipes/queries'
import { useToggleSaveRecipe } from '@/features/recipes/mutations'
import { Button } from '@/components/ui/button'

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: saved = [] } = useSavedRecipesQuery()
  const toggle = useToggleSaveRecipe()
  const isSaved = saved.some((r) => r.id === recipeId)

  return (
    <Button
      variant={isSaved ? 'outline' : 'default'}
      size="sm"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ recipeId, saved: isSaved })}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}
