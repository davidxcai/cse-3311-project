import type { ReactNode } from 'react'
import { RecipeCard, type RecipeCardData } from '@/components/common/RecipeCard'

/** Responsive grid of RecipeCards. `renderFooter` adds a per-card slot. */
export function RecipeGrid({
  recipes,
  renderFooter,
}: {
  recipes: RecipeCardData[]
  renderFooter?: (recipe: RecipeCardData) => ReactNode
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} footer={renderFooter?.(recipe)} />
      ))}
    </div>
  )
}
