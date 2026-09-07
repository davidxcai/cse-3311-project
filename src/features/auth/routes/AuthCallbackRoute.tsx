import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/features/auth/use-session'
import { LoadingState } from '@/components/common/LoadingState'

/**
 * OAuth redirect landing. supabase-js parses the URL hash on load
 * (detectSessionInUrl: true); we just wait for the session then route home.
 */
export function AuthCallbackRoute() {
  const { session, loading } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  useEffect(() => {
    if (!loading) navigate(session ? redirect : '/login', { replace: true })
  }, [loading, session, redirect, navigate])

  return <LoadingState label="Signing you in…" />
}
