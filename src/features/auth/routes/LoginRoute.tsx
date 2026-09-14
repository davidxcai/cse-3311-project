import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/features/auth/use-session'
import { SignInForm } from '@/features/auth/components/SignInForm'
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
      <div className="flex items-center gap-2">
        <img src="/thyme-saver-logo.svg" alt="" className="h-6 w-auto" />
        <span className="font-logo text-lg font-semibold text-foreground">Thyme Saver</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your herbs and spices.</p>
      <div className="mt-6">
        <SignInForm onSuccess={() => navigate(redirect, { replace: true })} />
      </div>
    </div>
  )
}
