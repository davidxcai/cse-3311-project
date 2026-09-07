import { useQuery } from '@tanstack/react-query'
import * as api from './api'

export function useGroceryQuery() {
  return useQuery({
    queryKey: ['grocery'],
    queryFn: api.listGrocery,
  })
}
