import { useGroceryQuery } from '@/features/grocery/queries'
import { useGenerateGroceryList } from '@/features/grocery/mutations'
import { GroceryList } from '@/features/grocery/components/GroceryList'
import { AddManualItem } from '@/features/grocery/components/AddManualItem'
import { Button } from '@/components/ui/button'

export function GroceryRoute() {
  const { data = [] } = useGroceryQuery()
  const generate = useGenerateGroceryList()

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Grocery list</h1>
        <Button size="sm" disabled={generate.isPending} onClick={() => generate.mutate()}>
          {generate.isPending ? 'Generating…' : 'Generate from plan'}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Everything your active planned recipes need that your pantry lacks.
      </p>
      <AddManualItem existing={data.map((i) => i.ingredient)} />
      <GroceryList />
    </div>
  )
}
