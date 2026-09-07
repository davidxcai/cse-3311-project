import { useQuery } from '@tanstack/react-query'
import * as api from './api'

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: api.getMyProfile,
  })
}
