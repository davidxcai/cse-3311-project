import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'
import { generateGroceryList } from '@/features/grocery/api'

/**
 * Toggle a day on/off or assign a recipe as a single explicit edit (used by
 * MealCard's Remove/Swap, outside the Auto Plan draft flow). Assigning a
 * recipe also appends to `recipe_plan_history` (see api.upsertDay), so
 * invalidate that too. The plan drives the grocery list, so every change
 * re-derives it automatically.
 */
export function useUpsertPlanDay() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (entry: { day_of_week: number; is_active?: boolean; recipe_id?: string | null }) =>
      api.upsertDay(entry, user!.id),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['meal-plan'] })
      qc.invalidateQueries({ queryKey: ['plan-history'] })
      await generateGroceryList(user!.id)
      qc.invalidateQueries({ queryKey: ['grocery'] })
    },
  })
}

/**
 * Commits a whole Auto Plan draft in one batched write: upserts every
 * selected day's recipe, deactivates any previously-active day that's no
 * longer selected, and appends one row per pick to `recipe_plan_history`.
 * Day selection and re-rolling before this point are local-only — this is
 * the single point where the draft touches the database.
 */
export function useApplyPlan() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: ({
      picks,
      previousActiveDays,
    }: {
      picks: Record<number, string>
      previousActiveDays: number[]
    }) => api.applyPlan(picks, previousActiveDays, user!.id),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['meal-plan'] })
      qc.invalidateQueries({ queryKey: ['plan-history'] })
      await generateGroceryList(user!.id)
      qc.invalidateQueries({ queryKey: ['grocery'] })
    },
  })
}
