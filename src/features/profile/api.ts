import { supabase } from '@/lib/supabase'
import type { DietTag, Profile } from '@/types/models'

export async function getMyProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, dietary_restrictions, disliked_ingredients, created_at')
    .single()
  if (error) throw error
  return data as Profile
}

export type ProfileUpdate = {
  display_name?: string | null
  dietary_restrictions?: DietTag[]
  disliked_ingredients?: string[]
}

export async function updateMyProfile(patch: ProfileUpdate, userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}
