/** Generic fixed-option toggle-chip picker. Backs both dietary restrictions and allergies. */
export function ToggleChipField<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T[]
  onChange: (next: T[]) => void
}) {
  function toggle(tag: T) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
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
