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

/** Curated quick-add suggestions for the disliked-ingredients field — names that exist in `ingredients`. */
export const COMMON_DISLIKED_INGREDIENTS = [
  'Beets',
  'Brussels Sprouts',
  'Cilantro',
  'Coconut',
  'Mayonnaise',
  'Mushrooms',
  'Tofu',
  'Turnips',
]

export type AllergenType =
  | 'Shellfish'
  | 'Fish'
  | 'Gluten'
  | 'Dairy'
  | 'Peanuts'
  | 'Tree Nuts'
  | 'Soy'
  | 'Eggs'
  | 'Sesame'
  | 'Mustard'
  | 'Sulfites'
  | 'Nightshades'

export const ALLERGY_TYPES: AllergenType[] = [
  'Shellfish',
  'Fish',
  'Gluten',
  'Dairy',
  'Peanuts',
  'Tree Nuts',
  'Soy',
  'Eggs',
  'Sesame',
  'Mustard',
  'Sulfites',
  'Nightshades',
]

export type Ingredient = {
  name: string
  description: string | null
  image_url: string | null
  type: string | null
  allergen_types: string[]
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
  /** categories from ALLERGY_TYPES; hard-excludes any recipe with an ingredient tagged with one */
  allergies: AllergenType[]
  /** specific ingredients (not tied to a category) the user is allergic to; same hard-exclude treatment as disliked_ingredients */
  allergy_ingredients: string[]
  created_at: string
}

export type PantryItem = { user_id: string; ingredient: string; created_at: string }

export type MealPlanEntry = {
  user_id: string
  /** ISO date (YYYY-MM-DD) this entry is planned for */
  plan_date: string
  is_active: boolean
  recipe_id: string | null
  updated_at: string
}

/** Append-only log of every recipe assigned to a plan day. Feeds Auto Plan's
 * "avoid recent repeats" / "haven't tried" logic — `meal_plan_entries` itself
 * is upserted per weekday and keeps no history. */
export type RecipePlanHistoryEntry = {
  recipe_id: string
  planned_date: string
}

export type GroceryItem = {
  user_id: string
  ingredient: string
  checked: boolean
  is_manual: boolean
  created_at: string
}

/** Parse a `YYYY-MM-DD` string as a local-midnight Date (avoids the UTC-parsing day-shift of `new Date(iso)`). */
export function parseDateOnly(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const DAY_LABELS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const
