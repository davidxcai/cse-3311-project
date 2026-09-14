import type { ReactNode } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Nav } from '@/components/common/Nav'
import { SettingsRoute } from '@/features/profile/routes/SettingsRoute'

/** Persistent chrome around every protected route: header, nav, content well. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
          <a href="/" className="flex items-center gap-2">
            <img src="/thyme-saver-logo.svg" alt="" className="h-7 w-auto" />
            <span className="font-logo text-xl font-semibold text-foreground">Thyme Saver</span>
          </a>
          <div className="flex items-center gap-3">
            <Nav />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <SettingsIcon className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <SettingsRoute />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{children}</main>
    </div>
  )
}
