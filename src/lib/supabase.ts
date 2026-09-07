import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
// New Supabase projects issue a "publishable" key (sb_publishable_…); older ones
// issue a JWT "anon" key. Accept either so the client works on both.
const clientKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!url || !clientKey) {
  // Fail loud in dev rather than making cryptic 401s later.
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env',
  )
}

/** The one shared Supabase client. Never construct another. */
export const supabase = createClient<Database>(url, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
