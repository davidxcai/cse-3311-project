import { describe, expect, it } from 'vitest'
import { computeGroceryDiff } from './diff'
import type { GroceryItem } from '@/types/models'

const row = (over: Partial<GroceryItem> & { ingredient: string }): GroceryItem => ({
  user_id: 'u1',
  checked: false,
  is_manual: false,
  created_at: '2026-01-01',
  ...over,
})

describe('computeGroceryDiff', () => {
  it('inserts needed names not already present', () => {
    const diff = computeGroceryDiff(['Milk', 'Eggs'], [row({ ingredient: 'Milk' })])
    expect(diff.toInsert).toEqual(['Eggs'])
    expect(diff.toDelete).toEqual([])
  })

  it('deletes generated rows no longer needed', () => {
    const diff = computeGroceryDiff(['Milk'], [row({ ingredient: 'Milk' }), row({ ingredient: 'Flour' })])
    expect(diff.toDelete).toEqual(['Flour'])
    expect(diff.toInsert).toEqual([])
  })

  it('never deletes or duplicates manual rows', () => {
    const diff = computeGroceryDiff(
      ['Olive oil'],
      [row({ ingredient: 'Olive oil', is_manual: true }), row({ ingredient: 'Napkins', is_manual: true })],
    )
    expect(diff.toDelete).toEqual([])
    expect(diff.toInsert).toEqual([])
  })

  it('is idempotent when the list already matches', () => {
    const existing = [row({ ingredient: 'Milk', checked: true }), row({ ingredient: 'Eggs' })]
    const diff = computeGroceryDiff(['Milk', 'Eggs'], existing)
    expect(diff).toEqual({ toInsert: [], toDelete: [] })
  })

  it('compares names case-insensitively and de-dupes needed input', () => {
    const diff = computeGroceryDiff(['milk', ' MILK ', 'Eggs'], [row({ ingredient: 'Milk' })])
    expect(diff.toInsert).toEqual(['Eggs'])
    expect(diff.toDelete).toEqual([])
  })
})
