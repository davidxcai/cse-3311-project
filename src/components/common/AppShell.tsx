import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Nav, navLinks } from '@/components/common/Nav'
import { display } from '@/data/iteration'

/** Persistent chrome around every protected route: header, nav, content well. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <header className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
          <a href="/" className="flex items-center gap-2">
            <img src="/thyme-saver-logo.svg" alt="" className="h-7 w-auto" />
            <span className="hidden font-logo text-xl font-semibold text-foreground md:inline">
              Thyme Saver
            </span>
          </a>
          {display.iteration2 && (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <Nav />
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                >
                  <SettingsIcon className="size-4" />
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Menu"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
                >
                  <Menu className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto px-6 py-8 lg:px-10">{children}</main>
    </div>
  )
}
