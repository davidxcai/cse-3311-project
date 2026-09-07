import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { ProfileUpdate } from './api'
import { useUser } from '@/features/auth/use-session'

/** Changing restrictions/dislikes also changes the ranked suggestions. */
export function useUpdateProfile() {
  const qc = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => api.updateMyProfile(patch, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })
}
