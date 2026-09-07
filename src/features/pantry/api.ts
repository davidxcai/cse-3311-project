import { supabase } from '@/lib/supabase'
import type { PantryItem } from '@/types/models'

export async function listPantry(): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('user_id, ingredient, created_at')
    .order('ingredient')
  if (error) throw error
  return (data ?? []) as PantryItem[]
}

export async function addPantryItem(ingredient: string, userId: string): Promise<void> {
  const { error } = await supabase.from('pantry_items').insert({ ingredient, user_id: userId })
  if (error) throw error
}

export async function removePantryItem(ingredient: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('ingredient', ingredient)
    .eq('user_id', userId)
  if (error) throw error
}
