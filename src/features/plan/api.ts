import { supabase } from '@/lib/supabase'
import type { MealPlanEntry } from '@/types/models'

export async function getMealPlan(): Promise<MealPlanEntry[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('user_id, day_of_week, is_active, recipe_id, updated_at')
    .order('day_of_week')
  if (error) throw error
  return (data ?? []) as MealPlanEntry[]
}

/** Upsert one weekday row. `meal_plan_entries` PK is (user_id, day_of_week). */
export async function upsertDay(
  entry: { day_of_week: number; is_active?: boolean; recipe_id?: string | null },
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('meal_plan_entries').upsert(
    {
      user_id: userId,
      day_of_week: entry.day_of_week,
      ...(entry.is_active !== undefined ? { is_active: entry.is_active } : {}),
      ...(entry.recipe_id !== undefined ? { recipe_id: entry.recipe_id } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day_of_week' },
  )
  if (error) throw error
}
