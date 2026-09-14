import { useQuery } from '@tanstack/react-query'
import * as api from './api'

export function useMealPlanQuery() {
  return useQuery({
    queryKey: ['meal-plan'],
    queryFn: api.getMealPlan,
  })
}

export function usePlanHistoryQuery() {
  return useQuery({
    queryKey: ['plan-history'],
    queryFn: api.getRecipePlanHistory,
  })
}
