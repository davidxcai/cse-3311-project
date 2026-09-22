import { describe, expect, it } from 'vitest'
import { buildAutoPlanCandidates, pickFromRank, type AutoPlanRecipeInput } from './auto-plan'

const recipe = (over: Partial<AutoPlanRecipeInput> & { id: string }): AutoPlanRecipeInput => ({
  name: over.id,
  diet_tags: [],
  ingredients: [],
  ingredientAllergens: [],
  source: 'system',
  isSaved: false,
  area: null,
  thumb_url: null,
  ...over,
})

const ALL_SCOPE = { system: true, mine: true, saved: true }

describe('buildAutoPlanCandidates', () => {
  it('keeps only recipes within the requested scope', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'sys', source: 'system' }),
        recipe({ id: 'mine', source: 'user' }),
        recipe({ id: 'saved-system', source: 'system', isSaved: true }),
      ],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: { system: false, mine: false, saved: true },
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['saved-system'])
  })

  it('excludes a recipe containing a disliked ingredient or missing a restriction', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'has-cilantro', ingredients: ['Rice', 'Cilantro'] }),
        recipe({ id: 'not-vegan', diet_tags: [], ingredients: ['Rice'] }),
        recipe({ id: 'ok', diet_tags: ['vegan'], ingredients: ['Rice', 'Beans'] }),
      ],
      pantry: [],
      restrictions: ['vegan'],
      disliked: ['Cilantro'],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['ok'])
  })

  it('excludes a recipe touching a selected allergen category, even without a name match', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'shrimp-dish', ingredients: ['Shrimp', 'Rice'], ingredientAllergens: ['Shellfish'] }),
        recipe({ id: 'ok', ingredients: ['Rice', 'Beans'], ingredientAllergens: [] }),
      ],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: ['Shellfish'],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['ok'])
  })

  it('ranks having any pantry overlap above having none, even with a lower missing count', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        // 0/2 have — a short grocery list, but shares nothing with the pantry.
        recipe({ id: 'zero-overlap', ingredients: ['Squid Ink', 'Saffron'] }),
        // 1/4 have — a longer list, but at least one ingredient is already owned.
        recipe({ id: 'some-overlap', ingredients: ['Egg', 'Squid Ink', 'Saffron', 'Truffle'] }),
      ],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['some-overlap', 'zero-overlap'])
  })

  it('within an availability tier, ranks by haveCount desc even when missingCount is higher', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        // 12/14 have, missing 2 — a bigger recipe, but uses up far more of the pantry.
        recipe({ id: 'big-recipe', ingredients: Array.from({ length: 14 }, (_, i) => `ing-${i}`) }),
        // 2/3 have, missing 1 — fewer things to buy, but uses much less of the pantry.
        recipe({ id: 'small-recipe', ingredients: ['ing-0', 'ing-1', 'ing-2'] }),
      ],
      pantry: Array.from({ length: 12 }, (_, i) => `ing-${i}`),
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['big-recipe', 'small-recipe'])
  })

  it('breaks a haveCount tie by missingCount asc (smaller trip wins)', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        // 3 have, 1 missing.
        recipe({ id: 'small-trip', ingredients: ['a', 'b', 'c', 'x'] }),
        // 3 have, 5 missing — same pantry use, bigger trip.
        recipe({ id: 'big-trip', ingredients: ['a', 'b', 'c', 'v', 'w', 'x', 'y', 'z'] }),
      ],
      pantry: ['a', 'b', 'c'],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['small-trip', 'big-trip'])
  })

  it('ignores recency entirely', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        // Planned today, but missing nothing.
        recipe({ id: 'recent-good-match', ingredients: ['Egg'] }),
        // Never planned, but missing 2 ingredients — should still rank last.
        recipe({ id: 'never-bad-match', ingredients: ['Egg', 'Flour', 'Sugar'] }),
      ],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: { 'recent-good-match': '2026-09-13' },
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['recent-good-match', 'never-bad-match'])
  })

  it('breaks a full tie alphabetically by name', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'z', name: 'Zucchini Bread', ingredients: ['Egg'] }),
        recipe({ id: 'a', name: 'Apple Pie', ingredients: ['Egg'] }),
      ],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['a', 'z'])
  })

  it('restricts to never-planned recipes when newOnly has enough candidates', () => {
    const { candidates, relaxedNewOnly } = buildAutoPlanCandidates({
      recipes: [recipe({ id: 'never' }), recipe({ id: 'planned' })],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: { planned: '2026-09-01' },
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: true,
      minCount: 1,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['never'])
    expect(relaxedNewOnly).toBe(false)
  })

  it('relaxes newOnly back to the full list when too few recipes qualify', () => {
    const { candidates, relaxedNewOnly } = buildAutoPlanCandidates({
      recipes: [recipe({ id: 'never' }), recipe({ id: 'planned' })],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: { planned: '2026-09-01' },
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: true,
      minCount: 2,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['never', 'planned'])
    expect(relaxedNewOnly).toBe(true)
  })

  it('treats cuisines as a ranking preference, not a filter: availability still comes first', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        // Matches the cuisine, but only 1 of 2 ingredients on hand.
        recipe({ id: 'mex-avail', area: 'Mexican', ingredients: ['a', 'x'] }),
        // Doesn't match the cuisine, but has everything on hand.
        recipe({ id: 'other-avail', area: 'Italian', ingredients: ['a', 'b', 'c', 'd', 'e'] }),
        // No area at all — never matches a cuisine preference, still available.
        recipe({ id: 'no-area-avail', area: null, ingredients: ['a', 'b', 'c'] }),
        // Matches the cuisine, but shares nothing with the pantry.
        recipe({ id: 'mex-unavail', area: 'Mexican', ingredients: ['z'] }),
        // Matches neither the cuisine nor the pantry.
        recipe({ id: 'other-unavail', area: 'Italian', ingredients: ['z', 'y'] }),
      ],
      pantry: ['a', 'b', 'c', 'd', 'e'],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: ['Mexican'],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    // [available & cuisine] > [available & !cuisine] > [!available & cuisine] > [!available & !cuisine].
    // Nothing is dropped — mex-unavail and other-unavail still show up, just last.
    expect(candidates.map((c) => c.id)).toEqual([
      'mex-avail',
      'other-avail',
      'no-area-avail',
      'mex-unavail',
      'other-unavail',
    ])
  })

  it('passes a recipe area through onto the candidate', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [recipe({ id: 'a', area: 'Chinese' })],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates[0].area).toBe('Chinese')
  })

  it('checks newOnly against the whole pool, unaffected by the cuisine preference', () => {
    const { candidates, relaxedNewOnly } = buildAutoPlanCandidates({
      recipes: [
        // Doesn't match the cuisine preference, but is the only never-planned recipe.
        recipe({ id: 'never-italian', area: 'Italian' }),
        recipe({ id: 'planned-mexican', area: 'Mexican' }),
      ],
      pantry: [],
      restrictions: [],
      disliked: [],
      allergies: [],
      history: { 'planned-mexican': '2026-09-01' },
      scope: ALL_SCOPE,
      cuisines: ['Mexican'],
      newOnly: true,
      minCount: 1,
      today: '2026-09-13',
    })

    // One never-planned recipe meets minCount 1, so newOnly is NOT relaxed —
    // even though that recipe doesn't match the cuisine preference. Cuisine
    // never gates which recipes count toward minCount; it only ranks them.
    expect(candidates.map((c) => c.id)).toEqual(['never-italian'])
    expect(relaxedNewOnly).toBe(false)
  })
})

describe('pickFromRank', () => {
  it('reads count items starting at the cursor, in rank order', () => {
    expect(pickFromRank(['a', 'b', 'c', 'd'], 2, 0)).toEqual(['a', 'b'])
    expect(pickFromRank(['a', 'b', 'c', 'd'], 2, 2)).toEqual(['c', 'd'])
  })

  it('never revisits a better-ranked item once the cursor has moved past it', () => {
    // A batch of 3, then "re-roll all" (cursor advances by the batch size):
    // the next batch picks up exactly where the last one left off.
    const pool = ['1', '2', '3', '4', '5', '6', '7']
    expect(pickFromRank(pool, 3, 0)).toEqual(['1', '2', '3'])
    expect(pickFromRank(pool, 3, 3)).toEqual(['4', '5', '6'])
  })

  it('wraps around when the cursor runs past the end of the pool', () => {
    expect(pickFromRank(['a', 'b'], 1, 5)).toEqual(['b'])
    expect(pickFromRank(['a', 'b', 'c'], 4, 0)).toEqual(['a', 'b', 'c', 'a'])
  })

  it('returns an empty array for an empty pool', () => {
    expect(pickFromRank([], 3, 0)).toEqual([])
  })
})
