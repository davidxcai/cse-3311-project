import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/features/auth/use-session'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { SignUpFlow } from '@/features/auth/components/SignUpFlow'
import { LoadingState } from '@/components/common/LoadingState'
import { useRecipesQuery } from '@/features/recipes/queries'
import { display } from '@/data/iteration'

export function LoginRoute() {
  const { session, loading } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const defaultHome = display.iteration2 ? '/' : '/settings'
  const redirect = display.iteration2 ? params.get('redirect') || defaultHome : defaultHome
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [recipes, setRecipes] = useState<Array<{ thumb_url: string | null }>>([])
  const { data: allRecipes } = useRecipesQuery()

  useEffect(() => {
    if (allRecipes && allRecipes.length > 0) {
      const systemRecipes = allRecipes.filter((r) => r.source === 'system' && r.thumb_url)
      const shuffled = [...systemRecipes].sort(() => Math.random() - 0.5).slice(0, 4)
      setRecipes(shuffled)
    }
  }, [allRecipes])

  if (loading) return <LoadingState />
  if (session) return <Navigate to={redirect} replace />

  return mode === 'signup' ? (
    <SignUpFlow
      onSuccess={() => navigate(defaultHome, { replace: true })}
      onSwitchToLogin={() => setMode('login')}
    />
  ) : (
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
              onSuccess={() => navigate(redirect, { replace: true })}
              onSwitchToSignup={() => setMode('signup')}
            />
          </div>
        </div>
      </div>
      <div className="hidden items-center justify-center bg-card p-10 md:col-span-7 md:flex">
        {recipes.length > 0 && (
          <div className="grid w-full max-w-md grid-cols-2 gap-4">
            {recipes.map((recipe, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                {recipe.thumb_url && (
                  <img src={recipe.thumb_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
