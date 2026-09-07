import { useMealPlanQuery } from '@/features/plan/queries'
import { DaySlot } from './DaySlot'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'

export function WeekGrid() {
  const { data, isLoading, isError, error, refetch } = useMealPlanQuery()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  const byDay = new Map((data ?? []).map((e) => [e.day_of_week, e]))

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 7 }, (_, day) => (
        <DaySlot key={day} day={day} entry={byDay.get(day)} />
      ))}
    </div>
  )
}
