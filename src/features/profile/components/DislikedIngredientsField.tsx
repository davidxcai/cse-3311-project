import { IngredientPicker } from '@/components/common/IngredientPicker'
import { Button } from '@/components/ui/button'

export function DislikedIngredientsField({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
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
      <IngredientPicker
        exclude={value}
        onSelect={(name) => onChange([...value, name])}
        placeholder="Add a disliked ingredient…"
      />
    </div>
  )
}
