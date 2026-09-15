import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export const navLinks = [
  { to: '/', label: 'Meal Plan', end: true },
  { to: '/recipes', label: 'Recipes' },
]

export function Nav() {
  return (
    <nav className="flex flex-wrap gap-1">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-muted',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
