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

// 3. Mock IngredientPicker so fireEvent.change triggers onSelect in tests
vi.mock('@/components/common/IngredientPicker', () => ({
  IngredientPicker: ({ onSelect }: { onSelect: (val: string) => void }) => (
    <input
      role="textbox"
      placeholder="Search ingredients…"
      onChange={(e) => onSelect(e.target.value)}
    />
  ),
}))

import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddPantryItemForm } from './AddPantryItemForm'
import { useAddPantryItem } from '../mutations'

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

  it('prevents submitting duplicate items', () => {
    renderWithQueryClient(
      <AddPantryItemForm existingItems={['Tomatoes', 'Garlic']} />
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Tomatoes' } })

    const button = screen.getByRole('button', { name: /add/i })
    fireEvent.click(button)

    expect(mockMutate).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Tomatoes is already in your pantry.')
  })

  it('displays an error message if the mutation fails', () => {
    renderWithQueryClient(<AddPantryItemForm />)

    vi.mocked(useAddPantryItem).mockReturnValue({
      mutate: (_item: string, options?: { onError?: (err: Error) => void }) => {
        options?.onError?.(new Error('Network connection lost'))
      },
      isPending: false,
    } as unknown as ReturnType<typeof useAddPantryItem>)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Onions' } })

    const button = screen.getByRole('button', { name: /add/i })
    fireEvent.click(button)

    expect(screen.getByRole('alert')).toHaveTextContent('Network connection lost')
  })
})