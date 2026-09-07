import { WeekGrid } from '@/features/plan/components/WeekGrid'

export function PlanRoute() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Weekly plan</h1>
      <p className="text-sm text-muted-foreground">
        Turn on the days you'll cook and assign one recipe to each.
      </p>
      <WeekGrid />
    </div>
  )
}
