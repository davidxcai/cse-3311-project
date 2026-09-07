import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

/** Starts the Google OAuth redirect flow. Lands back on /auth/callback. */
export function GoogleButton({ redirectPath = '/' }: { redirectPath?: string }) {
  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
      },
    })
  }

  return (
    <Button variant="outline" className="w-full" onClick={signIn}>
      Continue with Google
    </Button>
  )
}
