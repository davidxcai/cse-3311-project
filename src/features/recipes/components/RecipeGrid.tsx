import type { ReactNode } from 'react'
import { RecipeCard, type RecipeCardData } from '@/components/common/RecipeCard'

/**
 * Responsive grid of RecipeCards. `renderFooter` adds a per-card slot; `renderBadge`
 * adds a per-card badge inline next to the category/area line.
 * `savedIds`/`onToggleSave` wire up the heart save button on each card.
 */
export function RecipeGrid({
  recipes,
  renderFooter,
  renderBadge,
  savedIds,
  onToggleSave,
}: {
  recipes: RecipeCardData[]
  renderFooter?: (recipe: RecipeCardData) => ReactNode
  renderBadge?: (recipe: RecipeCardData) => ReactNode
  savedIds?: Set<string>
  onToggleSave?: (recipe: RecipeCardData) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          footer={renderFooter?.(recipe)}
          badge={renderBadge?.(recipe)}
          saved={savedIds?.has(recipe.id)}
          onToggleSave={onToggleSave ? () => onToggleSave(recipe) : undefined}
        />
      ))}
    </div>
  )
}
