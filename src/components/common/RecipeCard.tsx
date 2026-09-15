import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DAY_LABELS } from '@/types/models'

export type RecipeCardData = {
  id: string
  name: string
  category?: string | null
  area?: string | null
  thumb_url?: string | null
}

/**
 * The one recipe list-row/card. Used by discover, browse, my-recipes, plan picker,
 * saved. Optional `footer` slot for context-specific content (add button, etc).
 * Optional `badge` renders inline on the right of the category/area line (e.g. pantry
 * match) — `ingredients` is a shorthand for the common "n of m Ingredients" case and
 * is ignored when `badge` is also given. Optional `saved`/`onToggleSave` render a heart
 * button overlaid on the thumbnail. Optional `date` overlays a weekday + day-of-month
 * badge on the thumbnail (e.g. for the plan review step). `disableLink` renders a
 * static card instead of navigating, for use inside an in-progress flow (e.g. the
 * Auto Plan stepper).
 */
export function RecipeCard({
  recipe,
  footer,
  badge,
  ingredients,
  saved,
  onToggleSave,
  date,
  disableLink,
}: {
  recipe: RecipeCardData
  footer?: ReactNode
  badge?: ReactNode
  ingredients?: { have: number; total: number }
  saved?: boolean
  onToggleSave?: () => void
  date?: Date
  disableLink?: boolean
}) {
  const resolvedBadge =
    badge ??
    (ingredients ? (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {ingredients.have}/{ingredients.total} Ingredients
      </span>
    ) : undefined)

  const thumb = (
    <>
      {recipe.thumb_url ? (
        <img
          src={recipe.thumb_url}
          alt={recipe.name}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="aspect-square w-full bg-muted" />
      )}
      {date && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          {DAY_LABELS[date.getDay()]} {date.getDate()}
        </span>
      )}
    </>
  )

  const info = (
    <div className="pt-2">
      <p className="line-clamp-2 text-sm font-medium">{recipe.name}</p>
      {(recipe.category || recipe.area || resolvedBadge) && (
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {[recipe.category, recipe.area].filter(Boolean).join(' · ')}
          </p>
          {resolvedBadge && <span className="shrink-0">{resolvedBadge}</span>}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden rounded-2xl">
        {disableLink ? (
          thumb
        ) : (
          <Link to={`/recipes/${recipe.id}`} className="block">
            {thumb}
          </Link>
        )}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave()
            }}
            aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
            aria-pressed={saved}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
          >
            <Heart className={cn('size-4', saved && 'fill-rose-500 text-rose-500')} />
          </button>
        )}
      </div>
      {disableLink ? (
        info
      ) : (
        <Link to={`/recipes/${recipe.id}`} className="block">
          {info}
        </Link>
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  )
}
