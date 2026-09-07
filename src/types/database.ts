/**
 * Placeholder until the Supabase project exists.
 *
 * Regenerate with:  npm run db:types
 * (`supabase gen types typescript --linked > src/types/database.ts`)
 *
 * Keep this file committed and regenerate it after every migration. Until then
 * every table is typed loosely so `supabase.from(...)` calls compile; feature
 * `api.ts` files cast `.select()` results to the hand-written shapes in
 * `@/types/models`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/* eslint-disable @typescript-eslint/no-explicit-any */
type LooseTable = {
  Row: Record<string, any>
  Insert: Record<string, any>
  Update: Record<string, any>
  Relationships: []
}

type TableName =
  | 'categories'
  | 'areas'
  | 'ingredients'
  | 'recipes'
  | 'recipe_ingredients'
  | 'profiles'
  | 'pantry_items'
  | 'saved_recipes'
  | 'meal_plan_entries'
  | 'grocery_items'

export type Database = {
  public: {
    Tables: Record<TableName, LooseTable>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      diet_tag:
        | 'vegetarian'
        | 'vegan'
        | 'gluten_free'
        | 'dairy_free'
        | 'nut_free'
        | 'pescatarian'
        | 'halal'
        | 'kosher'
        | 'low_carb'
    }
    CompositeTypes: Record<string, never>
  }
}
