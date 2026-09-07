import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import { useUser } from '@/features/auth/use-session'

export function useGenerateGroceryList() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: () => api.generateGroceryList(user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grocery'] }),
  })
}

export function useToggleGroceryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: ({ ingredient, checked }: { ingredient: string; checked: boolean }) =>
      api.setChecked(ingredient, checked, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grocery'] }),
  })
}

export function useAddManualGroceryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (ingredient: string) => api.addManualItem(ingredient, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grocery'] }),
  })
}

export function useRemoveGroceryItem() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (ingredient: string) => api.removeItem(ingredient, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grocery'] }),
  })
}
