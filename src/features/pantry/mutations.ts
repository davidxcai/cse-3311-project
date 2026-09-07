import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'

/** Add/remove invalidate both the pantry and the derived suggestions. */
export function useAddPantryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (ingredient: string) => api.addPantryItem(ingredient, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] })
      qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })
}

export function useRemovePantryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (ingredient: string) => api.removePantryItem(ingredient, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] })
      qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })
}
