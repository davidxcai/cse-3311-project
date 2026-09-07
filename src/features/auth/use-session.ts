import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthContext } from '@/features/auth/auth-context'
import { supabase } from '@/lib/supabase'

export function useSession() {
  return useContext(AuthContext)
}

export function useUser() {
  return useContext(AuthContext).user
}

/** Sign the current user out. The AuthProvider clears the query cache on SIGNED_OUT. */
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  })
}
