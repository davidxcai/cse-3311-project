import { usePantryQuery } from '@/features/pantry/queries'
import { useAddPantryItem } from '@/features/pantry/mutations'
import { PantryList } from '@/features/pantry/components/PantryList'
import { IngredientPicker } from '@/components/common/IngredientPicker'

export function PantryRoute() {
  const { data = [] } = usePantryQuery()
  const add = useAddPantryItem()

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-lg font-semibold">Pantry</h1>
      <p className="text-sm text-muted-foreground">
        Record what you have on hand. Discover ranks recipes against this list.
      </p>
      <IngredientPicker
        exclude={data.map((i) => i.ingredient)}
        onSelect={(name) => add.mutate(name)}
        placeholder="Add an ingredient…"
      />
      <PantryList />
    </div>
  )
}
