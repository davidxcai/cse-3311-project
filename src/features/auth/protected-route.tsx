import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/features/auth/use-session'
import { LoadingState } from '@/components/common/LoadingState'

/** Gate for every authenticated route. Redirects to /login with a return path. */
export function ProtectedRoute() {
  const { session, loading } = useSession()
  const location = useLocation()

  if (loading) return <LoadingState label="Checking your session…" />
  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <Outlet />
}
