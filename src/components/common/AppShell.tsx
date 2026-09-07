import type { ReactNode } from 'react'
import { useSignOut } from '@/features/auth/use-session'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/common/Nav'

/** Persistent chrome around every protected route: header, nav, content well. */
export function AppShell({ children }: { children: ReactNode }) {
  const signOut = useSignOut()

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">🥕 Pantry Planner</span>
            <Nav />
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut.mutate()}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
