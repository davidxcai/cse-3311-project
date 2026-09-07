import { DIET_TAGS, type DietTag } from '@/types/models'

export function DietTagField({
  value,
  onChange,
}: {
  value: DietTag[]
  onChange: (next: DietTag[]) => void
}) {
  function toggle(tag: DietTag) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DIET_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={
            'rounded-full border px-3 py-1 text-xs ' +
            (value.includes(tag)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground')
          }
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
