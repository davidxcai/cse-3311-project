import { useState } from 'react'
import type { RecipeDraft } from '@/features/recipes/api'
import { DIET_TAGS, type DietTag } from '@/types/models'
import { IngredientPicker } from '@/components/common/IngredientPicker'
import { Button } from '@/components/ui/button'

const EMPTY: RecipeDraft = {
  name: '',
  category: null,
  area: null,
  instructions: null,
  thumb_url: null,
  diet_tags: [],
  ingredients: [],
}

/** Shared by /recipes/new and /recipes/:id/edit. */
export function RecipeForm({
  initial = EMPTY,
  submitLabel,
  busy,
  onSubmit,
}: {
  initial?: RecipeDraft
  submitLabel: string
  busy?: boolean
  onSubmit: (draft: RecipeDraft) => void
}) {
  const [draft, setDraft] = useState<RecipeDraft>(initial)

  function set<K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function toggleTag(tag: DietTag) {
    set(
      'diet_tags',
      draft.diet_tags.includes(tag)
        ? draft.diet_tags.filter((t) => t !== tag)
        : [...draft.diet_tags, tag],
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(draft)
      }}
    >
      <label className="block text-sm font-medium">
        Name
        <input
          required
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Category
          <input
            value={draft.category ?? ''}
            onChange={(e) => set('category', e.target.value || null)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Area
          <input
            value={draft.area ?? ''}
            onChange={(e) => set('area', e.target.value || null)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Image URL
        <input
          value={draft.thumb_url ?? ''}
          onChange={(e) => set('thumb_url', e.target.value || null)}
          className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      </label>

      <label className="block text-sm font-medium">
        Instructions
        <textarea
          rows={6}
          value={draft.instructions ?? ''}
          onChange={(e) => set('instructions', e.target.value || null)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Diet tags</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={
                'rounded-full border px-3 py-1 text-xs ' +
                (draft.diet_tags.includes(tag)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground')
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="text-sm font-medium">Ingredients</p>
        <ul className="mt-2 space-y-2">
          {draft.ingredients.map((ing, i) => (
            <li key={`${ing.ingredient}-${i}`} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{ing.ingredient}</span>
              <input
                placeholder="measure"
                value={ing.measure ?? ''}
                onChange={(e) => {
                  const next = [...draft.ingredients]
                  next[i] = { ...next[i], measure: e.target.value || null }
                  set('ingredients', next)
                }}
                className="h-8 w-32 rounded-md border border-border bg-background px-2 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set('ingredients', draft.ingredients.filter((_, j) => j !== i))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <IngredientPicker
            exclude={draft.ingredients.map((i) => i.ingredient)}
            onSelect={(name) => set('ingredients', [...draft.ingredients, { ingredient: name, measure: null }])}
          />
        </div>
      </div>

      <Button type="submit" disabled={busy}>
        {submitLabel}
      </Button>
    </form>
  )
}
