import { IngredientPicker } from '@/components/common/IngredientPicker'
import { useAddManualGroceryItem } from '@/features/grocery/mutations'

export function AddManualItem({ existing }: { existing: string[] }) {
  const add = useAddManualGroceryItem()
  return (
    <IngredientPicker
      exclude={existing}
      onSelect={(name) => add.mutate(name)}
      placeholder="Add an item manually…"
    />
  )
}
