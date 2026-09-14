import { Trash2 } from 'lucide-react'
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
    <li
      onClick={() => onToggle(!item.checked)}
      className="group flex cursor-pointer items-center gap-3 py-3 text-sm"
    >
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => onToggle(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="h-5 w-5 shrink-0 accent-primary"
      />
      <span className={item.checked ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>
        {item.ingredient}
      </span>
      {item.is_manual && <span className="text-xs text-muted-foreground">manual</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${item.ingredient}`}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
