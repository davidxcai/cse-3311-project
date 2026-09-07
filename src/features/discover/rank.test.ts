import { describe, expect, it } from 'vitest'
import { rankRecipes, type RankRecipeInput } from './rank'

const recipe = (over: Partial<RankRecipeInput> & { id: string }): RankRecipeInput => ({
  name: over.id,
  diet_tags: [],
  ingredients: [],
  ...over,
})

describe('rankRecipes', () => {
  it('computes haveCount, missingCount, coverage and the missing list', () => {
    const [result] = rankRecipes({
      recipes: [recipe({ id: 'r1', ingredients: ['Eggs', 'Flour', 'Milk', 'Sugar'] })],
      pantry: ['eggs', 'flour'],
      restrictions: [],
      disliked: [],
    })

    expect(result.haveCount).toBe(2)
    expect(result.missingCount).toBe(2)
    expect(result.coverage).toBe(0.5)
    expect(result.missing).toEqual(['Milk', 'Sugar'])
  })

  it('compares names case-insensitively on the trimmed value', () => {
    const [result] = rankRecipes({
      recipes: [recipe({ id: 'r1', ingredients: ['  EGGS ', 'Flour'] })],
      pantry: ['eggs', '  flOUR  '],
      restrictions: [],
      disliked: [],
    })

    expect(result.coverage).toBe(1)
    expect(result.missing).toEqual([])
  })

  it('excludes a recipe containing a disliked ingredient', () => {
    const results = rankRecipes({
      recipes: [
        recipe({ id: 'has-cilantro', ingredients: ['Rice', 'Cilantro'] }),
        recipe({ id: 'clean', ingredients: ['Rice', 'Beans'] }),
      ],
      pantry: ['rice'],
      restrictions: [],
      disliked: ['Cilantro'],
    })

    expect(results.map((r) => r.id)).toEqual(['clean'])
  })

  it('excludes a recipe that does not cover every dietary restriction', () => {
    const results = rankRecipes({
      recipes: [
        recipe({ id: 'veg-only', diet_tags: ['vegetarian'], ingredients: ['Cheese'] }),
        recipe({ id: 'veg-and-gf', diet_tags: ['vegetarian', 'gluten_free'], ingredients: ['Cheese'] }),
      ],
      pantry: [],
      restrictions: ['vegetarian', 'gluten_free'],
      disliked: [],
    })

    expect(results.map((r) => r.id)).toEqual(['veg-and-gf'])
  })

  it('sorts by coverage desc, then missingCount asc, then name asc', () => {
    const results = rankRecipes({
      recipes: [
        // coverage 1.0, missing 0 — name tiebreak puts this after "Full"
        recipe({ id: 'x', name: 'X', ingredients: ['Egg', 'Milk'] }),
        // coverage 0.5, missing 2
        recipe({ id: 'c', name: 'C', ingredients: ['Egg', 'Milk', 'Salt', 'Pepper'] }),
        // coverage 0.5, missing 1 — name tiebreak puts this before "B"
        recipe({ id: 'a', name: 'A', ingredients: ['Egg', 'Butter'] }),
        // coverage 0.5, missing 1
        recipe({ id: 'b', name: 'B', ingredients: ['Milk', 'Flour'] }),
        // coverage 1.0, missing 0
        recipe({ id: 'full', name: 'Full', ingredients: ['Egg'] }),
      ],
      pantry: ['egg', 'milk'],
      restrictions: [],
      disliked: [],
    })

    expect(results.map((r) => r.id)).toEqual(['full', 'x', 'a', 'b', 'c'])
  })

  it('treats a recipe with no ingredients as coverage 0', () => {
    const [result] = rankRecipes({
      recipes: [recipe({ id: 'empty' })],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
    })

    expect(result.coverage).toBe(0)
    expect(result.missingCount).toBe(0)
  })

  it('counts duplicate ingredients once', () => {
    const [result] = rankRecipes({
      recipes: [recipe({ id: 'r1', ingredients: ['Egg', 'egg', ' EGG ', 'Flour'] })],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
    })

    expect(result.haveCount).toBe(1)
    expect(result.missingCount).toBe(1)
    expect(result.coverage).toBe(0.5)
  })
})
