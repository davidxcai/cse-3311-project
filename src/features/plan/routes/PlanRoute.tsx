import { useState } from 'react'
import { AutoPlanPanel } from '@/features/plan/components/AutoPlanPanel'
import { MealsColumn } from '@/features/plan/components/MealsColumn'
import { GroceryPantryPanel } from '@/features/plan/components/GroceryPantryPanel'
import { Button } from '@/components/ui/button'
import { useMealPlanQuery } from '@/features/plan/queries'

export function PlanRoute() {
  const [autoPlanOpen, setAutoPlanOpen] = useState(false)
  const { data } = useMealPlanQuery()
  const hasPlan = (data ?? []).some((e) => e.is_active)

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {autoPlanOpen && (
        <button
          type="button"
          onClick={() => setAutoPlanOpen(false)}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Back
        </button>
      )}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meal Plan</h1>
        {!autoPlanOpen && hasPlan && (
          <Button onClick={() => setAutoPlanOpen(true)}>Plan Recipes</Button>
        )}
      </div>

      {autoPlanOpen ? (
        <AutoPlanPanel onClose={() => setAutoPlanOpen(false)} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[7fr_5fr]">
          <section className="space-y-4">
            <MealsColumn onPlanRecipes={() => setAutoPlanOpen(true)} />
          </section>
          <GroceryPantryPanel />
        </div>
      )}
    </div>
  )
}
