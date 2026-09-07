import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export type RecipeCardData = {
  id: string
  name: string
  category?: string | null
  area?: string | null
  thumb_url?: string | null
}

/**
 * The one recipe list-row/card. Used by discover, browse, my-recipes, plan picker,
 * saved. Optional `footer` slot for context-specific content (match badge, add button).
 */
export function RecipeCard({
  recipe,
  footer,
}: {
  recipe: RecipeCardData
  footer?: ReactNode
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-background">
      <Link to={`/recipes/${recipe.id}`} className="block">
        {recipe.thumb_url ? (
          <img
            src={recipe.thumb_url}
            alt={recipe.name}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="aspect-video w-full bg-muted" />
        )}
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium">{recipe.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[recipe.category, recipe.area].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
      </Link>
      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </div>
  )
}
