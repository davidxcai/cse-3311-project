import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

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
 * Optional `badge` renders inline on the right of the category/area line (e.g. pantry match).
 * Optional `saved`/`onToggleSave` render a heart button overlaid on the thumbnail.
 */
export function RecipeCard({
  recipe,
  footer,
  badge,
  saved,
  onToggleSave,
}: {
  recipe: RecipeCardData
  footer?: ReactNode
  badge?: ReactNode
  saved?: boolean
  onToggleSave?: () => void
}) {
  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden rounded-2xl">
        <Link to={`/recipes/${recipe.id}`} className="block">
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
        </Link>
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
      <Link to={`/recipes/${recipe.id}`} className="block">
        <div className="pt-2">
          <p className="line-clamp-2 text-sm font-medium">{recipe.name}</p>
          {(recipe.category || recipe.area || badge) && (
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="truncate text-xs text-muted-foreground">
                {[recipe.category, recipe.area].filter(Boolean).join(' · ')}
              </p>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
          )}
        </div>
      </Link>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  )
}
