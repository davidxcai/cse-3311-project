import { Button } from '@/components/ui/button'

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
    <li className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <span>{ingredient}</span>
      <Button variant="ghost" size="sm" onClick={onRemove} disabled={removing}>
        Remove
      </Button>
    </li>
  )
}
