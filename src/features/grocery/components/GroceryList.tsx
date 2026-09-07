import { useGroceryQuery } from '@/features/grocery/queries'
import { useRemoveGroceryItem, useToggleGroceryItem } from '@/features/grocery/mutations'
import { GroceryItemRow } from './GroceryItemRow'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

export function GroceryList() {
  const { data, isLoading, isError, error, refetch } = useGroceryQuery()
  const toggle = useToggleGroceryItem()
  const remove = useRemoveGroceryItem()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return <EmptyState title="No items yet." description="Generate from your active plan or add one manually." />
  }

  return (
    <ul className="space-y-2">
      {data.map((item) => (
        <GroceryItemRow
          key={item.ingredient}
          item={item}
          onToggle={(checked) => toggle.mutate({ ingredient: item.ingredient, checked })}
          onRemove={() => remove.mutate(item.ingredient)}
        />
      ))}
    </ul>
  )
}
