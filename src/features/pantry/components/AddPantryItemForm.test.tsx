// src/features/pantry/components/AddPantryItemForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 1. Mock Supabase before module imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// 2. Mock mutations hook
vi.mock('../mutations', () => ({
  useAddPantryItem: vi.fn(),
}))

import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddPantryItemForm } from './AddPantryItemForm'
import { useAddPantryItem } from '../mutations'

// Helper function to create a fresh QueryClient for every test run
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('AddPantryItemForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAddPantryItem).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAddPantryItem>)
  })

  it('renders the form button', () => {
    renderWithQueryClient(<AddPantryItemForm />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('shows pending state when submitting', () => {
    vi.mocked(useAddPantryItem).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useAddPantryItem>)

    renderWithQueryClient(<AddPantryItemForm />)
    expect(screen.getByRole('button')).toHaveTextContent('Adding...')
  })
})