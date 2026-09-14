import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'
import { generateGroceryList } from '@/features/grocery/api'

/** Pantry affects what the grocery list needs, so re-derive it after every change. */
async function resyncGrocery(qc: ReturnType<typeof useQueryClient>, userId: string) {
  await generateGroceryList(userId)
  qc.invalidateQueries({ queryKey: ['grocery'] })
}

/** Add/remove invalidate both the pantry and the derived suggestions. */
export function useAddPantryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (ingredient: string) => api.addPantryItem(ingredient, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] })
      qc.invalidateQueries({ queryKey: ['suggestions'] })
      resyncGrocery(qc, user!.id)
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
      resyncGrocery(qc, user!.id)
    },
  })
}
