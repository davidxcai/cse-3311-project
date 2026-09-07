import { useState } from 'react'
import { useRecipeQuery } from '@/features/recipes/queries'
import { useUpsertPlanDay } from '@/features/plan/mutations'
import { RecipePickerDialog } from './RecipePickerDialog'
import { Button } from '@/components/ui/button'
import type { MealPlanEntry } from '@/types/models'
import { DAY_LABELS } from '@/types/models'

export function DaySlot({ day, entry }: { day: number; entry?: MealPlanEntry }) {
  const [picking, setPicking] = useState(false)
  const upsert = useUpsertPlanDay()
  const isActive = entry?.is_active ?? false
  const recipe = useRecipeQuery(entry?.recipe_id ?? undefined)

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => upsert.mutate({ day_of_week: day, is_active: e.target.checked })}
          />
          Cook
        </label>
      </div>

      {isActive && (
        <div className="mt-2">
          {recipe.data ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{recipe.data.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setPicking(true)}>
                Swap
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setPicking(true)}>
              Pick a recipe
            </Button>
          )}
        </div>
      )}

      <RecipePickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(recipeId) => {
          upsert.mutate({ day_of_week: day, recipe_id: recipeId })
          setPicking(false)
        }}
      />
    </div>
  )
}
