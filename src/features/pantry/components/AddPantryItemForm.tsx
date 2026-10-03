// src/features/pantry/components/AddPantryItemForm.tsx

/*Form component for adding a new ingredient to the user's pantry.
  Uses `useAddPantryItem` to insert items and invalidate query caches.*/

import { useState } from 'react'
import { useAddPantryItem } from '../mutations'
import { IngredientPicker } from '@/components/common/IngredientPicker'

export function AddPantryItemForm() {
  const [ingredient, setIngredient] = useState('')
  const addItem = useAddPantryItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ingredient.trim()) return

    //Reset the iinput field only after the server registers the item
    addItem.mutate(ingredient, {
      onSuccess: () => {
        setIngredient('')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="flex-1">
        <IngredientPicker 
          value={ingredient} 
          onChange={setIngredient} 
        />
      </div>
      <button
        type="submit"
        disabled={!ingredient.trim() || addItem.isPending}
        className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {addItem.isPending ? 'Adding...' : 'Add Item'}
      </button>
    </form>
  )
}