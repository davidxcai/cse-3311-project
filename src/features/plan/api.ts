import { supabase } from '@/lib/supabase'
import type { MealPlanEntry, RecipePlanHistoryEntry } from '@/types/models'

export async function getMealPlan(): Promise<MealPlanEntry[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('user_id, day_of_week, is_active, recipe_id, updated_at')
    .order('day_of_week')
  if (error) throw error
  return (data ?? []) as MealPlanEntry[]
}

/**
 * Upsert one weekday row. `meal_plan_entries` PK is (user_id, day_of_week), so
 * it only ever reflects the *current* assignment. Every time a recipe is
 * assigned, also append to `recipe_plan_history` — that's the only durable
 * record Auto Plan can use to avoid recent repeats or spot never-tried recipes.
 */
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

  if (entry.recipe_id) {
    const { error: historyError } = await supabase
      .from('recipe_plan_history')
      .insert({ user_id: userId, recipe_id: entry.recipe_id })
    if (historyError) throw historyError
  }
}

/**
 * Commit a whole Auto Plan draft in one batched write. `picks` maps
 * day_of_week -> recipe_id for every currently-selected day; any day in
 * `previousActiveDays` that isn't in `picks` gets deactivated, so Save fully
 * reconciles the drafted selection instead of only adding to it.
 */
export async function applyPlan(
  picks: Record<number, string>,
  previousActiveDays: number[],
  userId: string,
): Promise<void> {
  const days = Object.keys(picks).map(Number)
  const daySet = new Set(days)
  const toDeactivate = previousActiveDays.filter((day) => !daySet.has(day))
  const now = new Date().toISOString()

  const rows = [
    ...days.map((day) => ({
      user_id: userId,
      day_of_week: day,
      is_active: true,
      recipe_id: picks[day],
      updated_at: now,
    })),
    ...toDeactivate.map((day) => ({
      user_id: userId,
      day_of_week: day,
      is_active: false,
      updated_at: now,
    })),
  ]

  if (rows.length > 0) {
    const { error } = await supabase
      .from('meal_plan_entries')
      .upsert(rows, { onConflict: 'user_id,day_of_week' })
    if (error) throw error
  }

  if (days.length > 0) {
    const { error: historyError } = await supabase
      .from('recipe_plan_history')
      .insert(days.map((day) => ({ user_id: userId, recipe_id: picks[day] })))
    if (historyError) throw historyError
  }
}

/** Most recent `planned_date` per recipe is derived client-side; this returns every row. */
export async function getRecipePlanHistory(): Promise<RecipePlanHistoryEntry[]> {
  const { data, error } = await supabase
    .from('recipe_plan_history')
    .select('recipe_id, planned_date')
    .order('planned_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as RecipePlanHistoryEntry[]
}
