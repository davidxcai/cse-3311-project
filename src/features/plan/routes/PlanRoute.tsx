import { useState } from 'react'
import { AutoPlanPanel } from '@/features/plan/components/AutoPlanPanel'
import { MealsColumn } from '@/features/plan/components/MealsColumn'
import { GroceryPantryPanel } from '@/features/plan/components/GroceryPantryPanel'
import { Button } from '@/components/ui/button'

export function PlanRoute() {
  const [autoPlanOpen, setAutoPlanOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meal Plan</h1>
        {!autoPlanOpen && <Button onClick={() => setAutoPlanOpen(true)}>Plan Recipes</Button>}
      </div>

      {autoPlanOpen ? (
        <AutoPlanPanel onClose={() => setAutoPlanOpen(false)} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[7fr_5fr]">
          <section className="space-y-4">
            <MealsColumn />
          </section>
          <GroceryPantryPanel />
        </div>
      )}
    </div>
  )
}
