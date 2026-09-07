import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'

/**
 * Toggle a day on/off or assign a recipe. Grocery only recomputes on the
 * explicit "Generate" action, so this invalidates just ['meal-plan'].
 */
export function useUpsertPlanDay() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (entry: { day_of_week: number; is_active?: boolean; recipe_id?: string | null }) =>
      api.upsertDay(entry, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal-plan'] })
    },
  })
}
