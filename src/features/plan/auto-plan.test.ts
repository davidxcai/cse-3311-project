import { describe, expect, it } from 'vitest'
import { buildAutoPlanCandidates, pickRandom, type AutoPlanRecipeInput } from './auto-plan'

const recipe = (over: Partial<AutoPlanRecipeInput> & { id: string }): AutoPlanRecipeInput => ({
  name: over.id,
  diet_tags: [],
  ingredients: [],
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
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['ok'])
  })

  it('sorts never-planned first, then least-recently-planned, then coverage desc', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'planned-recent', ingredients: ['Egg'] }),
        recipe({ id: 'planned-old', ingredients: ['Egg'] }),
        recipe({ id: 'never', ingredients: ['Egg'] }),
      ],
      pantry: ['egg'],
      restrictions: [],
      disliked: [],
      history: {
        'planned-recent': '2026-09-10',
        'planned-old': '2026-08-01',
      },
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['never', 'planned-old', 'planned-recent'])
  })

  it('restricts to never-planned recipes when newOnly has enough candidates', () => {
    const { candidates, relaxedNewOnly } = buildAutoPlanCandidates({
      recipes: [recipe({ id: 'never' }), recipe({ id: 'planned' })],
      pantry: [],
      restrictions: [],
      disliked: [],
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

  it('keeps only recipes whose area is in cuisines, excluding recipes with no area', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'mexican', area: 'Mexican' }),
        recipe({ id: 'italian', area: 'Italian' }),
        recipe({ id: 'no-area', area: null }),
      ],
      pantry: [],
      restrictions: [],
      disliked: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: ['Mexican'],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates.map((c) => c.id)).toEqual(['mexican'])
  })

  it('passes a recipe area through onto the candidate', () => {
    const { candidates } = buildAutoPlanCandidates({
      recipes: [recipe({ id: 'a', area: 'Chinese' })],
      pantry: [],
      restrictions: [],
      disliked: [],
      history: {},
      scope: ALL_SCOPE,
      cuisines: [],
      newOnly: false,
      minCount: 0,
      today: '2026-09-13',
    })

    expect(candidates[0].area).toBe('Chinese')
  })

  it('relaxes newOnly against the cuisine-filtered count, not the full pool', () => {
    const { candidates, relaxedNewOnly } = buildAutoPlanCandidates({
      recipes: [
        recipe({ id: 'mexican-never', area: 'Mexican' }),
        recipe({ id: 'mexican-planned', area: 'Mexican' }),
        recipe({ id: 'italian-never', area: 'Italian' }),
      ],
      pantry: [],
      restrictions: [],
      disliked: [],
      history: { 'mexican-planned': '2026-09-01' },
      scope: ALL_SCOPE,
      cuisines: ['Mexican'],
      newOnly: true,
      minCount: 2,
      today: '2026-09-13',
    })

    // Only one never-planned Mexican recipe qualifies, below minCount of 2,
    // so newOnly relaxes — and the never-planned Italian recipe stays excluded
    // by the cuisine filter even during relaxation.
    expect(candidates.map((c) => c.id)).toEqual(['mexican-never', 'mexican-planned'])
    expect(relaxedNewOnly).toBe(true)
  })
})

describe('pickRandom', () => {
  it('returns count items drawn from the pool', () => {
    const picks = pickRandom(['a', 'b', 'c'], 2, () => 0)
    expect(picks).toHaveLength(2)
    picks.forEach((p) => expect(['a', 'b', 'c']).toContain(p))
  })

  it('cycles through the pool when count exceeds its size', () => {
    const picks = pickRandom(['a', 'b'], 5, () => 0)
    expect(picks).toHaveLength(5)
    picks.forEach((p) => expect(['a', 'b']).toContain(p))
  })

  it('returns an empty array for an empty pool', () => {
    expect(pickRandom([], 3)).toEqual([])
  })
})
