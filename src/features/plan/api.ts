import { supabase } from '@/lib/supabase'
import type { MealPlanEntry, RecipePlanHistoryEntry } from '@/types/models'

export async function getMealPlan(): Promise<MealPlanEntry[]> {
  const { data, error } = await supabase
    .from('meal_plan_entries')
    .select('user_id, plan_date, is_active, recipe_id, updated_at')
    .order('plan_date')
  if (error) throw error
  return (data ?? []) as MealPlanEntry[]
}

/**
 * Upsert one date's row. `meal_plan_entries` PK is (user_id, plan_date), so
 * it only ever reflects the *current* assignment for that date. Every time a
 * recipe is assigned, also append to `recipe_plan_history` — that's the only
 * durable record Auto Plan can use to avoid recent repeats or spot
 * never-tried recipes.
 */
export async function upsertPlanDate(
  entry: { plan_date: string; is_active?: boolean; recipe_id?: string | null },
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('meal_plan_entries').upsert(
    {
      user_id: userId,
      plan_date: entry.plan_date,
      ...(entry.is_active !== undefined ? { is_active: entry.is_active } : {}),
      ...(entry.recipe_id !== undefined ? { recipe_id: entry.recipe_id } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan_date' },
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
 * plan_date -> recipe_id for every currently-selected date; any date in
 * `previousActiveDates` that isn't in `picks` gets deactivated, so Save fully
 * reconciles the drafted selection instead of only adding to it.
 */
export async function applyPlan(
  picks: Record<string, string>,
  previousActiveDates: string[],
  userId: string,
): Promise<void> {
  const dates = Object.keys(picks)
  const dateSet = new Set(dates)
  const toDeactivate = previousActiveDates.filter((date) => !dateSet.has(date))
  const now = new Date().toISOString()

  const rows = [
    ...dates.map((date) => ({
      user_id: userId,
      plan_date: date,
      is_active: true,
      recipe_id: picks[date],
      updated_at: now,
    })),
    ...toDeactivate.map((date) => ({
      user_id: userId,
      plan_date: date,
      is_active: false,
      updated_at: now,
    })),
  ]

  if (rows.length > 0) {
    const { error } = await supabase
      .from('meal_plan_entries')
      .upsert(rows, { onConflict: 'user_id,plan_date' })
    if (error) throw error
  }

  if (dates.length > 0) {
    const { error: historyError } = await supabase
      .from('recipe_plan_history')
      .insert(dates.map((date) => ({ user_id: userId, recipe_id: picks[date] })))
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
