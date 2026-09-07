import { usePantryQuery } from '@/features/pantry/queries'
import { useRemovePantryItem } from '@/features/pantry/mutations'
import { PantryItemRow } from './PantryItemRow'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

export function PantryList() {
  const { data, isLoading, isError, error, refetch } = usePantryQuery()
  const remove = useRemovePantryItem()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return <EmptyState title="Your pantry is empty." description="Add what you have on hand above." />
  }

  return (
    <ul className="space-y-2">
      {data.map((item) => (
        <PantryItemRow
          key={item.ingredient}
          ingredient={item.ingredient}
          removing={remove.isPending && remove.variables === item.ingredient}
          onRemove={() => remove.mutate(item.ingredient)}
        />
      ))}
    </ul>
  )
}
