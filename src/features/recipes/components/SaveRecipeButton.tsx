import { Heart } from 'lucide-react'
import { useSavedRecipesQuery } from '@/features/recipes/queries'
import { useToggleSaveRecipe } from '@/features/recipes/mutations'
import { cn } from '@/lib/utils'

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: saved = [] } = useSavedRecipesQuery()
  const toggle = useToggleSaveRecipe()
  const isSaved = saved.some((r) => r.id === recipeId)

  return (
    <button
      type="button"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ recipeId, saved: isSaved })}
      aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
      aria-pressed={isSaved}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
    >
      <Heart className={cn('size-4', isSaved && 'fill-rose-500 text-rose-500')} />
    </button>
  )
}
