import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'
import { generateGroceryList } from '@/features/grocery/api'

/**
 * Toggle a day on/off or assign a recipe. Assigning a recipe also appends to
 * `recipe_plan_history` (see api.upsertDay), so invalidate that too. The
 * plan drives the grocery list, so every change re-derives it automatically.
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
