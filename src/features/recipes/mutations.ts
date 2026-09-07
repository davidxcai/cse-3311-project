import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { RecipeDraft } from './api'
import { useUser } from '@/features/auth/use-session'

export function useCreateRecipe() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (draft: RecipeDraft) => api.createRecipe(draft, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useUpdateRecipe(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: RecipeDraft) => api.updateRecipe(id, draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteRecipe(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useToggleSaveRecipe() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: ({ recipeId, saved }: { recipeId: string; saved: boolean }) =>
      saved ? api.unsaveRecipe(recipeId, user!.id) : api.saveRecipe(recipeId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-recipes'] })
    },
  })
}
