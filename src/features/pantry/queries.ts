import { useQuery } from '@tanstack/react-query'
import * as api from './api'

export function usePantryQuery() {
  return useQuery({
    queryKey: ['pantry'],
    queryFn: api.listPantry,
  })
}
