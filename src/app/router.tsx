import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { LoginRoute } from '@/features/auth/routes/LoginRoute'
import { AuthCallbackRoute } from '@/features/auth/routes/AuthCallbackRoute'
import { DashboardRoute } from '@/features/dashboard/routes/DashboardRoute'
import { PantryRoute } from '@/features/pantry/routes/PantryRoute'
import { DiscoverRoute } from '@/features/discover/routes/DiscoverRoute'
import { RecipesRoute } from '@/features/recipes/routes/RecipesRoute'
import { RecipeDetailRoute } from '@/features/recipes/routes/RecipeDetailRoute'
import { NewRecipeRoute } from '@/features/recipes/routes/NewRecipeRoute'
import { EditRecipeRoute } from '@/features/recipes/routes/EditRecipeRoute'
import { MyRecipesRoute } from '@/features/recipes/routes/MyRecipesRoute'
import { PlanRoute } from '@/features/plan/routes/PlanRoute'
import { GroceryRoute } from '@/features/grocery/routes/GroceryRoute'
import { SettingsRoute } from '@/features/profile/routes/SettingsRoute'

/** The whole route tree. Protected routes render inside <ProtectedRoute> → <App> (AppShell + outlet). */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  { path: '/auth/callback', element: <AuthCallbackRoute /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <DashboardRoute /> },
          { path: 'pantry', element: <PantryRoute /> },
          { path: 'discover', element: <DiscoverRoute /> },
          { path: 'recipes', element: <RecipesRoute /> },
          { path: 'recipes/new', element: <NewRecipeRoute /> },
          { path: 'recipes/:id', element: <RecipeDetailRoute /> },
          { path: 'recipes/:id/edit', element: <EditRecipeRoute /> },
          { path: 'my-recipes', element: <MyRecipesRoute /> },
          { path: 'plan', element: <PlanRoute /> },
          { path: 'grocery', element: <GroceryRoute /> },
          { path: 'settings', element: <SettingsRoute /> },
        ],
      },
    ],
  },
])
