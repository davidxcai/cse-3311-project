import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/features/auth/use-session'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { GoogleButton } from '@/features/auth/components/GoogleButton'
import { LoadingState } from '@/components/common/LoadingState'

export function LoginRoute() {
  const { session, loading } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  if (loading) return <LoadingState />
  if (session) return <Navigate to={redirect} replace />

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-lg font-semibold">🥕 Pantry Planner</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to plan your week.</p>
      <div className="mt-6 space-y-4">
        <SignInForm onSuccess={() => navigate(redirect, { replace: true })} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton redirectPath={redirect} />
      </div>
    </div>
  )
}
