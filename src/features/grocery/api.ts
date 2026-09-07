import { supabase } from '@/lib/supabase'
import type { GroceryItem } from '@/types/models'
import { computeGroceryDiff } from './diff'

export async function listGrocery(): Promise<GroceryItem[]> {
  const { data, error } = await supabase
    .from('grocery_items')
    .select('user_id, ingredient, checked, is_manual, created_at')
    .order('is_manual')
    .order('ingredient')
  if (error) throw error
  return (data ?? []) as GroceryItem[]
}

export async function setChecked(ingredient: string, checked: boolean, userId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .update({ checked })
    .eq('ingredient', ingredient)
    .eq('user_id', userId)
  if (error) throw error
}

export async function addManualItem(ingredient: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .insert({ ingredient, user_id: userId, is_manual: true })
  if (error) throw error
}

export async function removeItem(ingredient: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('ingredient', ingredient)
    .eq('user_id', userId)
  if (error) throw error
}

/**
 * The "Generate list" action. Reads the active plan's recipe ingredients,
 * subtracts the pantry, diffs against the current list, and applies the diff.
 * Manual rows are left untouched. Idempotent.
 */
export async function generateGroceryList(userId: string): Promise<void> {
  const plan = await supabase
    .from('meal_plan_entries')
    .select('recipe_id, is_active')
    .eq('is_active', true)
  if (plan.error) throw plan.error

  const recipeIds = (plan.data ?? [])
    .map((e: { recipe_id: string | null }) => e.recipe_id)
    .filter((id): id is string => !!id)

  let neededNames: string[] = []
  if (recipeIds.length > 0) {
    const ings = await supabase
      .from('recipe_ingredients')
      .select('ingredient')
      .in('recipe_id', recipeIds)
    if (ings.error) throw ings.error

    const pantry = await supabase.from('pantry_items').select('ingredient')
    if (pantry.error) throw pantry.error
    const have = new Set((pantry.data ?? []).map((p: { ingredient: string }) => p.ingredient.toLowerCase()))

    neededNames = [...new Set((ings.data ?? []).map((r: { ingredient: string }) => r.ingredient))].filter(
      (name) => !have.has(name.toLowerCase()),
    )
  }

  const existing = await listGrocery()
  const { toInsert, toDelete } = computeGroceryDiff(neededNames, existing)

  if (toDelete.length > 0) {
    const del = await supabase
      .from('grocery_items')
      .delete()
      .eq('user_id', userId)
      .eq('is_manual', false)
      .in('ingredient', toDelete)
    if (del.error) throw del.error
  }

  if (toInsert.length > 0) {
    const ins = await supabase
      .from('grocery_items')
      .insert(toInsert.map((ingredient) => ({ ingredient, user_id: userId, is_manual: false })))
    if (ins.error) throw ins.error
  }
}
