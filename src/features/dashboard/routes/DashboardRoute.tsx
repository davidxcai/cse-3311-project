import { Link } from 'react-router-dom'
import { useMealPlanQuery } from '@/features/plan/queries'
import { useGroceryQuery } from '@/features/grocery/queries'
import { LoadingState } from '@/components/common/LoadingState'
import { DAY_LABELS } from '@/types/models'
import { buttonVariants } from '@/components/ui/button'

export function DashboardRoute() {
  const plan = useMealPlanQuery()
  const grocery = useGroceryQuery()

  if (plan.isLoading || grocery.isLoading) return <LoadingState />

  const activeDays = (plan.data ?? []).filter((e) => e.is_active)
  const unchecked = (grocery.data ?? []).filter((i) => !i.checked)

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">This week</h1>
          <Link to="/plan" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit plan
          </Link>
        </div>
        {activeDays.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No days turned on yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {activeDays.map((e) => (
              <li key={e.day_of_week}>
                <span className="font-medium">{DAY_LABELS[e.day_of_week]}</span>{' '}
                <span className="text-muted-foreground">
                  {e.recipe_id ? 'recipe assigned' : 'no recipe yet'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Grocery list</h2>
          <Link to="/grocery" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Open
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {unchecked.length === 0 ? 'Nothing outstanding.' : `${unchecked.length} item(s) to buy.`}
        </p>
      </section>
    </div>
  )
}
