import { useState } from 'react'
import { useAddPantryItem } from '../mutations'
import { IngredientPicker } from '@/components/common/IngredientPicker'

interface AddPantryItemFormProps {
  /** Optional list of existing pantry item names to prevent adding duplicates */
  existingItems?: string[]
}

export function AddPantryItemForm({ existingItems = [] }: AddPantryItemFormProps) {
  const [ingredient, setIngredient] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const addItem = useAddPantryItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanedName = ingredient.trim()

    // 1. Empty/whitespace validation
    if (!cleanedName) {
      setErrorMessage('Please select or type an ingredient.')
      return
    }

    // 2. Duplicate item check
    const isDuplicate = existingItems.some(
      (item) => item.toLowerCase() === cleanedName.toLowerCase()
    )

    if (isDuplicate) {
      setErrorMessage(`${cleanedName} is already in your pantry.`)
      return
    }

    // 3. Trigger database insert
    addItem.mutate(cleanedName, {
      onSuccess: () => {
        setIngredient('')
        setErrorMessage(null)
      },
      onError: (err) => {
        setErrorMessage(err.message || 'Failed to add item. Please try again.')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <IngredientPicker 
            onSelect={(name) => {
              setIngredient(name)
              if (errorMessage) setErrorMessage(null)
            }} 
          />
        </div>
        <button
          type="submit"
          disabled={addItem.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {addItem.isPending ? 'Adding...' : 'Add Item'}
        </button>
      </div>

      {/* Error Feedback Display */}
      {errorMessage && (
        <p className="text-sm text-destructive font-medium" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  )
}