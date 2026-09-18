import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useGenerateGroceryList } from '@/features/grocery/mutations'
import { GroceryList } from '@/features/grocery/components/GroceryList'
import { usePantryQuery } from '@/features/pantry/queries'
import { useAddPantryItem } from '@/features/pantry/mutations'
import { PantryList } from '@/features/pantry/components/PantryList'
import { IngredientPicker } from '@/components/common/IngredientPicker'

/** Iteration 2: pantry only, no grocery list/meal plan yet. */
export function PantryOnlyPanel() {
  const pantry = usePantryQuery()
  const addPantryItem = useAddPantryItem()

  return (
    <div className="flex max-w-md flex-col gap-4">
      <h1 className="text-2xl font-semibold">Pantry</h1>
      <IngredientPicker
        exclude={(pantry.data ?? []).map((i) => i.ingredient)}
        onSelect={(name) => addPantryItem.mutate(name)}
        placeholder="Add an ingredient…"
      />
      <PantryList className="max-h-none" />
    </div>
  )
}

/** Right-column panel: Groceries (default) and Pantry as in-panel tabs, no separate routes. */
export function GroceryPantryPanel() {
  const generate = useGenerateGroceryList()
  const pantry = usePantryQuery()
  const addPantryItem = useAddPantryItem()

  // Plan/pantry changes elsewhere in the session already re-derive the list;
  // this catches the list being stale on first load of the panel.
  useEffect(() => {
    generate.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="h-fit border-0 bg-popover shadow-none">
      <Tabs defaultValue="groceries">
        <CardHeader className="px-6">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="groceries">Groceries</TabsTrigger>
            <TabsTrigger value="pantry">Pantry</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="groceries" className="space-y-4">
            <GroceryList />
          </TabsContent>
          <TabsContent value="pantry" className="flex max-h-[60vh] flex-col gap-4">
            <IngredientPicker
              exclude={(pantry.data ?? []).map((i) => i.ingredient)}
              onSelect={(name) => addPantryItem.mutate(name)}
              placeholder="Add an ingredient…"
            />
            <PantryList className="max-h-none flex-1" />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
