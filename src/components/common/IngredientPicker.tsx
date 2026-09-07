import { useMemo, useState } from 'react'
import { useIngredientsQuery } from '@/features/recipes/queries'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { canonicalName } from '@/lib/utils'

/**
 * Typeahead over the `ingredients` table. Used by pantry, recipe form,
 * profile disliked-ingredients, and grocery manual-add.
 *
 * `exclude` hides names already chosen by the caller.
 */
export function IngredientPicker({
  onSelect,
  exclude = [],
  placeholder = 'Search ingredients…',
}: {
  onSelect: (name: string) => void
  exclude?: string[]
  placeholder?: string
}) {
  const [term, setTerm] = useState('')
  const debounced = useDebouncedValue(term, 200)
  const { data: ingredients = [], isLoading } = useIngredientsQuery()

  const excluded = useMemo(() => new Set(exclude.map(canonicalName)), [exclude])

  const matches = useMemo(() => {
    const q = canonicalName(debounced)
    if (!q) return []
    return ingredients
      .filter((name) => !excluded.has(canonicalName(name)) && canonicalName(name).includes(q))
      .slice(0, 8)
  }, [ingredients, debounced, excluded])

  return (
    <div className="relative">
      <input
        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        value={term}
        placeholder={placeholder}
        onChange={(e) => setTerm(e.target.value)}
      />
      {debounced && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {isLoading && <li className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>}
          {!isLoading && matches.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
          )}
          {matches.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(name)
                  setTerm('')
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
