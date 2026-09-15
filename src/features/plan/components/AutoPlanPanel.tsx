import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useMealPlanQuery } from '@/features/plan/queries'
import { useApplyPlan } from '@/features/plan/mutations'
import { useAutoPlanCandidates } from '@/features/plan/use-auto-plan'
import { pickRandom, type AutoPlanCandidate, type CollectionScope } from '@/features/plan/auto-plan'
import { usePantryQuery } from '@/features/pantry/queries'
import { useAddPantryItem } from '@/features/pantry/mutations'
import { PantryList } from '@/features/pantry/components/PantryList'
import { IngredientPicker } from '@/components/common/IngredientPicker'
import { Button } from '@/components/ui/button'
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper'
import { DAY_LABELS } from '@/types/models'

type Step = 'pantry' | 'days' | 'source' | 'review'
const STEPS: Step[] = ['pantry', 'days', 'source', 'review']
const STEP_TITLES: Record<Step, string> = {
  pantry: 'Update your pantry',
  days: 'Pick the days you want to cook',
  source: 'Pick where the recipes come from',
  review: 'Review your meals',
}
const STEP_LABELS: Record<Step, string> = {
  pantry: 'Pantry',
  days: 'Days',
  source: 'Source',
  review: 'Review',
}

const SOURCE_CHIPS: Array<{ key: 'all' | 'mine' | 'saved'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'My recipes' },
  { key: 'saved', label: 'Saved' },
]

function chipClass(active: boolean): string {
  return (
    'rounded-full border px-3 py-1 text-xs ' +
    (active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')
  )
}

/**
 * Day selection lives in local state only — nothing is written to the
 * database until "Save". Fills the drafted days with a random pick
 * from a pre-fetched, scored candidate pool; "Re-roll" (whole week or a
 * single day) draws again from the same pool, no refetch. "Save" commits
 * everything in one batched write (meal_plan_entries + recipe_plan_history),
 * deactivating any previously-active day that's no longer selected, then
 * closes the panel back to the meal plan.
 */
export function AutoPlanPanel({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('pantry')
  const [scope, setScope] = useState<CollectionScope>({ system: true, mine: true, saved: true })
  const [newOnly, setNewOnly] = useState(false)
  const [cuisines, setCuisines] = useState<string[]>([])
  const [draftDays, setDraftDays] = useState<Set<number>>(new Set())
  const [seededDays, setSeededDays] = useState(false)
  const [preview, setPreview] = useState<Record<number, AutoPlanCandidate> | null>(null)
  const [applying, setApplying] = useState(false)

  const meal = useMealPlanQuery()
  const persistedActiveDays = (meal.data ?? []).filter((e) => e.is_active).map((e) => e.day_of_week)

  // Seed the draft from the saved plan once it loads, so reopening the panel
  // continues from what's already active. Every toggle after that is local
  // only — nothing is written until "Save".
  useEffect(() => {
    if (!seededDays && meal.data) {
      setDraftDays(new Set(meal.data.filter((e) => e.is_active).map((e) => e.day_of_week)))
      setSeededDays(true)
    }
  }, [meal.data, seededDays])

  const draftDaysList = Array.from(draftDays).sort((a, b) => a - b)

  const { candidates, relaxedNewOnly, availableCuisines, isLoading } = useAutoPlanCandidates({
    scope,
    newOnly,
    cuisines,
    minCount: draftDaysList.length,
  })
  const applyPlan = useApplyPlan()
  const pantry = usePantryQuery()
  const addPantryItem = useAddPantryItem()

  function next() {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
  }

  function back() {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  function selectAllSources() {
    setScope({ system: true, mine: true, saved: true })
    setPreview(null)
  }

  function skipSource() {
    setScope({ system: true, mine: true, saved: true })
    setNewOnly(false)
    setCuisines([])
    setPreview(null)
    next()
  }

  function toggleSourceChip(key: 'mine' | 'saved') {
    setScope((s) => ({ ...s, system: false, [key]: !s[key] }))
    setPreview(null)
  }

  function toggleCuisine(area: string) {
    setCuisines((c) => (c.includes(area) ? c.filter((a) => a !== area) : [...c, area]))
    setPreview(null)
  }

  function roll() {
    const picks = pickRandom(candidates, draftDaysList.length)
    const picksByDay: Record<number, AutoPlanCandidate> = {}
    draftDaysList.forEach((day, i) => {
      picksByDay[day] = picks[i]
    })
    setPreview(picksByDay)
  }

  // Auto-generate as soon as the review step has a settled candidate pool to
  // draw from, so there's no separate "Generate" step for the user to click.
  useEffect(() => {
    if (step === 'review' && !preview && !isLoading && candidates.length > 0 && draftDaysList.length > 0) {
      roll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, preview, isLoading, candidates, draftDaysList])

  function rerollDay(day: number) {
    if (!preview) return
    const usedIds = new Set(Object.values(preview).map((c) => c.id))
    const pool = candidates.filter((c) => c.id !== preview[day]?.id)
    const fresh = pool.filter((c) => !usedIds.has(c.id))
    const [pick] = pickRandom(fresh.length > 0 ? fresh : pool, 1)
    if (pick) setPreview({ ...preview, [day]: pick })
  }

  function toggleDay(day: number) {
    setDraftDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
    setPreview(null)
  }

  async function apply() {
    if (!preview) return
    setApplying(true)
    try {
      const picks: Record<number, string> = {}
      for (const [day, candidate] of Object.entries(preview)) picks[Number(day)] = candidate.id
      await applyPlan.mutateAsync({ picks, previousActiveDays: persistedActiveDays })
      onClose()
    } finally {
      setApplying(false)
    }
  }

  const noActiveDays = draftDaysList.length === 0
  const noCandidates = !isLoading && candidates.length === 0
  const isAllSources = scope.system && scope.mine && scope.saved

  const currentIndex = STEPS.indexOf(step) + 1

  return (
    <div className="space-y-4 rounded-lg bg-card p-4">
      <Stepper
        value={currentIndex}
        onValueChange={(value) => setStep(STEPS[value - 1])}
        className="space-y-4"
      >
        <StepperNav className="gap-3">
          {STEPS.map((s, index) => (
            <StepperItem
              key={s}
              step={index + 1}
              disabled={index + 1 > currentIndex}
              className="relative flex-1 items-start"
            >
              <StepperTrigger className="flex grow flex-col items-start justify-center gap-2">
                <StepperIndicator className="bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary h-1 w-full rounded-full">
                  <span className="sr-only">{STEP_TITLES[s]}</span>
                </StepperIndicator>
                <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-xs font-medium">
                  {STEP_LABELS[s]}
                </StepperTitle>
              </StepperTrigger>
            </StepperItem>
          ))}
        </StepperNav>

        <h2 className="text-sm font-semibold">{STEP_TITLES[step]}</h2>

        <StepperPanel>
          <StepperContent value={1} className="space-y-3">
            <IngredientPicker
              exclude={(pantry.data ?? []).map((i) => i.ingredient)}
              onSelect={(name) => addPantryItem.mutate(name)}
              placeholder="Add an ingredient…"
            />
            <PantryList />
          </StepperContent>

          <StepperContent value={2} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 7 }, (_, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={chipClass(draftDays.has(day))}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </StepperContent>

          <StepperContent value={3} className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {SOURCE_CHIPS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      opt.key === 'all' ? selectAllSources() : toggleSourceChip(opt.key)
                    }
                    className={chipClass(opt.key === 'all' ? isAllSources : scope[opt.key])}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={newOnly}
                  onChange={(e) => {
                    setNewOnly(e.target.checked)
                    setPreview(null)
                  }}
                />
                Only recipes I haven't tried
              </label>
              {relaxedNewOnly && (
                <p className="text-xs text-muted-foreground">
                  Not enough new recipes — showing everything.
                </p>
              )}
            </div>

            {availableCuisines.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Cuisine (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleCuisine(area)}
                      className={chipClass(cuisines.includes(area))}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </StepperContent>

          <StepperContent value={4} className="space-y-3">
            {noCandidates && (
              <p className="text-xs text-muted-foreground">No recipes match these filters yet.</p>
            )}

            {preview && (
              <Button size="sm" onClick={roll} disabled={noActiveDays || noCandidates || isLoading}>
                Re-roll
              </Button>
            )}

            {preview && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {draftDaysList.map((day) => {
                  const candidate = preview[day]
                  return (
                    <div key={day} className="group space-y-1">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        {candidate?.thumb_url ? (
                          <img
                            src={candidate.thumb_url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                          {DAY_LABELS[day]}
                        </span>
                        <button
                          type="button"
                          onClick={() => rerollDay(day)}
                          aria-label={`Re-roll ${DAY_LABELS[day]}`}
                          className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm group-hover:flex hover:border-primary hover:text-primary"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="line-clamp-2 text-xs text-foreground">{candidate?.name}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </StepperContent>
        </StepperPanel>
      </Stepper>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={back} disabled={step === 'pantry'}>
          Back
        </Button>
        <div className="flex gap-2">
          {step === 'pantry' && (
            <Button size="sm" onClick={next}>
              Skip
            </Button>
          )}
          {step === 'days' && (
            <Button size="sm" onClick={next} disabled={noActiveDays}>
              Next
            </Button>
          )}
          {step === 'source' && (
            <>
              <Button variant="ghost" size="sm" onClick={skipSource}>
                Skip
              </Button>
              <Button size="sm" onClick={next}>
                Next
              </Button>
            </>
          )}
          {step === 'review' && (
            <Button size="sm" onClick={apply} disabled={applying || !preview}>
              {applying ? 'Saving…' : 'Save'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
