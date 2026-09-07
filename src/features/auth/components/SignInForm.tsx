import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

/** Email/password sign-in and sign-up in one form (toggle at the bottom). */
export function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const fn =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </Button>
      <button
        type="button"
        className="w-full text-center text-xs text-muted-foreground hover:underline"
        onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </form>
  )
}
