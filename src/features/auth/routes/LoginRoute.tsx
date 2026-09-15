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
    <div className="grid min-h-svh w-full grid-cols-1 md:grid-cols-12">
      <div className="flex flex-col justify-center px-6 py-12 md:col-span-5 md:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-3">
            <img src="/thyme-saver-logo.svg" alt="" className="h-10 w-auto md:h-14" />
            <span className="font-logo text-2xl font-semibold text-foreground md:text-4xl">
              Thyme Saver
            </span>
          </div>
          <div className="mt-8">
            <SignInForm
              onSuccess={(mode) =>
                navigate(mode === 'signup' ? '/' : redirect, { replace: true })
              }
            />
          </div>
        </div>
      </div>
      <div className="hidden bg-card md:col-span-7 md:block" />
    </div>
  )
}
