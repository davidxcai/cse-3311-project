import { usePantryQuery } from '@/features/pantry/queries'
import { useRemovePantryItem } from '@/features/pantry/mutations'
import { PantryItemRow } from './PantryItemRow'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/utils'

export function PantryList({ className }: { className?: string }) {
  const { data, isLoading, isError, error, refetch } = usePantryQuery()
  const remove = useRemovePantryItem()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return <EmptyState title="Your pantry is empty." />
  }

  return (
    <ul className={cn('max-h-[60vh] divide-y divide-border/60 overflow-y-auto', className)}>
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
