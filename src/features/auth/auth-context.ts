import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})
