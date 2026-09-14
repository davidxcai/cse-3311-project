import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const sections = [
  { to: '/recipes', label: 'All', end: true },
  { to: '/my-recipes', label: 'My Recipes' },
  { to: '/saved-recipes', label: 'Saved' },
  { to: '/discover', label: 'Discover' },
]

/** Segmented entry points into the recipe views absorbed under the Recipes nav item. */
export function RecipeSectionNav() {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-[3px]">
      {sections.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          end={s.end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {s.label}
        </NavLink>
      ))}
    </div>
  )
}
