import { useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { canonicalName } from '@/lib/utils'

/** Free-text tag picker backed by a curated suggestion list — not tied to the ingredients table. */
export function TagListField({
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
  const [term, setTerm] = useState('')
  const chosen = new Set(value.map(canonicalName))
  const remaining = suggestions.filter((s) => !chosen.has(canonicalName(s)))

  function add(name: string) {
    const trimmed = name.trim()
    if (!trimmed || chosen.has(canonicalName(trimmed))) return
    onChange([...value, trimmed])
    setTerm('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      add(term)
    }
  }

  return (
    <div className="space-y-3">
      <Input value={term} placeholder={placeholder} onChange={(e) => setTerm(e.target.value)} onKeyDown={handleKeyDown} />
      {remaining.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {remaining.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => add(name)}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary"
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {value.map((name) => (
            <li
              key={name}
              className="flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-xs text-primary-foreground"
            >
              {name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-xs text-primary-foreground hover:bg-transparent"
                onClick={() => onChange(value.filter((n) => n !== name))}
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
