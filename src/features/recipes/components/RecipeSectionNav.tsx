import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { display } from '@/data/iteration'

const sections = [
  { to: '/recipes', label: 'Discover', end: true },
  ...(display.iteration4
    ? [
        { to: '/my-recipes', label: 'My Recipes' },
        { to: '/saved-recipes', label: 'Saved' },
      ]
    : []),
]

/**
 * Shared "Recipes" heading and underline tabs for the views absorbed under the
 * Recipes nav item. Renders the heading so every page gets it for free instead
 * of repeating a page-specific title next to each tab.
 */
export function RecipeSectionNav() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Recipes</h1>
      <div className="inline-flex w-fit items-center gap-1">
        {sections.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.end}
            className={({ isActive }) =>
              cn(
                'relative px-2 py-1 text-sm font-medium text-foreground/60 transition-colors after:absolute after:inset-x-0 after:-bottom-[5px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity hover:text-foreground',
                isActive && 'text-foreground after:opacity-100',
              )
            }
          >
            {s.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
