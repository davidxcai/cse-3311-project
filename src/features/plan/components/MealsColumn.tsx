import { useMealPlanQuery } from '@/features/plan/queries'
import { useUpsertPlanDay } from '@/features/plan/mutations'
import { MealCard } from './MealCard'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'
import { DAY_LABELS } from '@/types/models'

/**
 * Compact day-of-week toggles (the only way to add/remove a cooking day, now that
 * empty days no longer render as their own slot) plus a card per active day.
 */
export function MealsColumn() {
  const { data, isLoading, isError, error, refetch } = useMealPlanQuery()
  const upsert = useUpsertPlanDay()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  const byDay = new Map((data ?? []).map((e) => [e.day_of_week, e]))
  const activeDays = Array.from({ length: 7 }, (_, day) => day).filter(
    (day) => byDay.get(day)?.is_active,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }, (_, day) => {
          const isActive = byDay.get(day)?.is_active ?? false
          return (
            <button
              key={day}
              type="button"
              onClick={() => upsert.mutate({ day_of_week: day, is_active: !isActive })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {DAY_LABELS[day]}
            </button>
          )
        })}
      </div>

      {activeDays.length === 0 ? (
        <EmptyState
          title="No days turned on yet."
          description="Tap a day above, or let Auto Plan pick your week."
        />
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          {activeDays.map((day) => (
            <MealCard key={day} day={day} entry={byDay.get(day)!} />
          ))}
        </div>
      )}
    </div>
  )
}
