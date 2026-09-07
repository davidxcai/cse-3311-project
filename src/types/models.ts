/**
 * Hand-written app-facing shapes. Once the Supabase schema is live, prefer the
 * generated row types from `@/types/database` and keep these as view models.
 */

export type DietTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'low_carb'

export const DIET_TAGS: DietTag[] = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'nut_free',
  'pescatarian',
  'halal',
  'kosher',
  'low_carb',
]

export type Ingredient = {
  name: string
  description: string | null
  image_url: string | null
  type: string | null
}

export type RecipeSource = 'system' | 'user'

export type Recipe = {
  id: string
  source: RecipeSource
  created_by: string | null
  name: string
  category: string | null
  area: string | null
  country: string | null
  instructions: string | null
  thumb_url: string | null
  youtube_url: string | null
  source_url: string | null
  diet_tags: DietTag[]
  created_at: string
}

export type RecipeIngredient = {
  recipe_id: string
  position: number
  ingredient: string
  measure: string | null
}

export type Profile = {
  id: string
  display_name: string | null
  dietary_restrictions: DietTag[]
  disliked_ingredients: string[]
  created_at: string
}

export type PantryItem = { user_id: string; ingredient: string; created_at: string }

export type MealPlanEntry = {
  user_id: string
  day_of_week: number
  is_active: boolean
  recipe_id: string | null
  updated_at: string
}

export type GroceryItem = {
  user_id: string
  ingredient: string
  checked: boolean
  is_manual: boolean
  created_at: string
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
