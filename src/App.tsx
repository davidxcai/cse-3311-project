import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/common/AppShell'

/** Renders the persistent shell (nav) around the active protected route. */
export function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
