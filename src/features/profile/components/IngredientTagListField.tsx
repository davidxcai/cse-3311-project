import { IngredientPicker } from '@/components/common/IngredientPicker'
import { Button } from '@/components/ui/button'
import { canonicalName } from '@/lib/utils'

export function IngredientTagListField({
  value,
  onChange,
  placeholder,
  suggestions = [],
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  suggestions?: string[]
}) {
  const chosen = new Set(value.map(canonicalName))
  const remaining = suggestions.filter((s) => !chosen.has(canonicalName(s)))

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {value.map((name) => (
          <li key={name} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
            {name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-xs"
              onClick={() => onChange(value.filter((n) => n !== name))}
            >
              ×
            </Button>
          </li>
        ))}
      </ul>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange([...value, name])}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              + {name}
            </button>
          ))}
        </div>
      )}
      <IngredientPicker exclude={value} onSelect={(name) => onChange([...value, name])} placeholder={placeholder} />
    </div>
  )
}
