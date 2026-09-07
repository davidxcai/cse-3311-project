import { Button } from '@/components/ui/button'
import type { GroceryItem } from '@/types/models'

export function GroceryItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: GroceryItem
  onToggle: (checked: boolean) => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span className={item.checked ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>
        {item.ingredient}
      </span>
      {item.is_manual && <span className="text-xs text-muted-foreground">manual</span>}
      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </li>
  )
}
