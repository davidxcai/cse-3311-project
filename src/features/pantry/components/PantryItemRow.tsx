import { Trash2 } from 'lucide-react'

export function PantryItemRow({
  ingredient,
  onRemove,
  removing,
}: {
  ingredient: string
  onRemove: () => void
  removing?: boolean
}) {
  return (
    <li className="group flex items-center justify-between py-3 text-sm">
      <span className={removing ? 'text-muted-foreground' : undefined}>{ingredient}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        aria-label={`Remove ${ingredient}`}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
