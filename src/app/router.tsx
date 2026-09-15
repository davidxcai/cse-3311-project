import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from '@/App'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { LoginRoute } from '@/features/auth/routes/LoginRoute'
import { RecipesRoute } from '@/features/recipes/routes/RecipesRoute'
import { RecipeDetailRoute } from '@/features/recipes/routes/RecipeDetailRoute'
import { NewRecipeRoute } from '@/features/recipes/routes/NewRecipeRoute'
import { EditRecipeRoute } from '@/features/recipes/routes/EditRecipeRoute'
import { MyRecipesRoute } from '@/features/recipes/routes/MyRecipesRoute'
import { SavedRecipesRoute } from '@/features/recipes/routes/SavedRecipesRoute'
import { PlanRoute } from '@/features/plan/routes/PlanRoute'
import { SettingsRoute } from '@/features/profile/routes/SettingsRoute'

/**
 * The whole route tree. Protected routes render inside <ProtectedRoute> → <App> (AppShell + outlet).
 * The index route ("Meal Plan" in the nav) is PlanRoute, which now also holds Grocery and Pantry
 * inline — those no longer have standalone routes.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <PlanRoute /> },
          { path: 'discover', element: <Navigate to="/recipes" replace /> },
          { path: 'recipes', element: <RecipesRoute /> },
          { path: 'recipes/new', element: <NewRecipeRoute /> },
          { path: 'recipes/:id', element: <RecipeDetailRoute /> },
          { path: 'recipes/:id/edit', element: <EditRecipeRoute /> },
          { path: 'my-recipes', element: <MyRecipesRoute /> },
          { path: 'saved-recipes', element: <SavedRecipesRoute /> },
          { path: 'settings', element: <SettingsRoute /> },
        ],
      },
    ],
  },
])
