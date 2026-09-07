import { useState } from 'react'
import { useRecipesQuery } from '@/features/recipes/queries'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Button } from '@/components/ui/button'

/** Modal list to pick one recipe for a day slot. */
export function RecipePickerDialog({
  open,
  onPick,
  onClose,
}: {
  open: boolean
  onPick: (recipeId: string) => void
  onClose: () => void
}) {
  const [term, setTerm] = useState('')
  const search = useDebouncedValue(term, 200)
  const { data = [] } = useRecipesQuery({ search: search || undefined, limit: 30 })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search recipes…"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {data.map((recipe) => (
            <li key={recipe.id}>
              <button
                className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => onPick(recipe.id)}
              >
                {recipe.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
