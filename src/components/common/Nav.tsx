import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pantry', label: 'Pantry' },
  { to: '/discover', label: 'Discover' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/my-recipes', label: 'My recipes' },
  { to: '/plan', label: 'Plan' },
  { to: '/grocery', label: 'Grocery' },
  { to: '/settings', label: 'Settings' },
]

export function Nav() {
  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
