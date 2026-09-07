import { RecipeCard } from '@/components/common/RecipeCard'
import type { RankedRecipe } from '@/features/discover/rank'
import { MatchBadge } from './MatchBadge'
import { MissingIngredients } from './MissingIngredients'

export function SuggestionCard({ recipe }: { recipe: RankedRecipe }) {
  const total = recipe.haveCount + recipe.missingCount
  return (
    <RecipeCard
      recipe={{ id: recipe.id, name: recipe.name }}
      footer={
        <div className="space-y-1">
          <MatchBadge have={recipe.haveCount} total={total} />
          <MissingIngredients missing={recipe.missing} />
        </div>
      }
    />
  )
}
