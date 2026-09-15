import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, X } from 'lucide-react'
import { useRecipeQuery } from '@/features/recipes/queries'
import { useUpsertPlanDay } from '@/features/plan/mutations'
import { RecipePickerDialog } from './RecipePickerDialog'
import type { MealPlanEntry } from '@/types/models'
import { DAY_LABELS_FULL } from '@/types/models'

/**
 * One assigned-day row in the Meals column. The thumbnail links straight to
 * the recipe; Swap and Remove are hover-only overlay buttons so the row
 * stays down to a name + a big photo instead of a row of buttons.
 */
export function MealCard({ day, entry }: { day: number; entry: MealPlanEntry }) {
  const [picking, setPicking] = useState(false)
  const upsert = useUpsertPlanDay()
  const recipe = useRecipeQuery(entry.recipe_id ?? undefined)

  return (
    <>
      <div className="group flex w-72 max-w-full items-start gap-3">
        <div className="relative h-24 w-24 shrink-0">
          {recipe.data ? (
            <Link
              to={`/recipes/${recipe.data.id}`}
              aria-label={`Open ${recipe.data.name}`}
              className="block h-full w-full overflow-hidden rounded-2xl bg-muted"
            >
              {recipe.data.thumb_url && (
                <img
                  src={recipe.data.thumb_url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              aria-label="Pick a recipe"
              className="h-full w-full cursor-pointer overflow-hidden rounded-2xl bg-muted"
            />
          )}
          {recipe.data && (
            <div className="absolute -right-2 -top-2 hidden gap-1 group-hover:flex group-focus-within:flex">
              <button
                type="button"
                onClick={() => setPicking(true)}
                aria-label={`Swap ${recipe.data.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:border-primary hover:text-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => upsert.mutate({ day_of_week: day, is_active: false })}
                aria-label={`Remove ${recipe.data.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:border-destructive hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {DAY_LABELS_FULL[day]}
          </p>
          {recipe.data ? (
            <Link to={`/recipes/${recipe.data.id}`} className="line-clamp-3 text-sm font-medium hover:underline">
              {recipe.data.name}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="text-sm text-muted-foreground hover:underline"
            >
              Pick a recipe
            </button>
          )}
        </div>
      </div>

      <RecipePickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(recipeId) => {
          upsert.mutate({ day_of_week: day, recipe_id: recipeId })
          setPicking(false)
        }}
      />
    </>
  )
}
