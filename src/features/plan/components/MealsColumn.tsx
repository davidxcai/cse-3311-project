import { useMealPlanQuery } from '@/features/plan/queries'
import { MealCard } from './MealCard'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

/**
 * A card per active cooking day. Which days are active is chosen in the
 * "Plan Recipes" stepper (AutoPlanPanel), not here — the days are already
 * implied by which cards are showing, so a second day toggle here would
 * just be redundant.
 */
export function MealsColumn({ onPlanRecipes }: { onPlanRecipes: () => void }) {
  const { data, isLoading, isError, error, refetch } = useMealPlanQuery()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  const activeEntries = (data ?? [])
    .filter((e) => e.is_active)
    .sort((a, b) => a.plan_date.localeCompare(b.plan_date))

  return activeEntries.length === 0 ? (
    <EmptyState
      title="No Meal Plan"
      action={<Button onClick={onPlanRecipes}>Plan Recipes</Button>}
    />
  ) : (
    <div className="flex flex-wrap gap-x-6 gap-y-4">
      {activeEntries.map((entry) => (
        <MealCard key={entry.plan_date} entry={entry} />
      ))}
    </div>
  )
}
