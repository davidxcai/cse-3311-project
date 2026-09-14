import { useState } from 'react'
import { useMealPlanQuery } from '@/features/plan/queries'
import { useUpsertPlanDay } from '@/features/plan/mutations'
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
  review: 'Generate a plan and review',
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
 * Fills the currently-active plan days with a random pick from a pre-fetched,
 * scored candidate pool. "Re-roll" draws again from the same pool (no
 * refetch); "Apply" commits the preview via the normal upsertDay mutation,
 * which is also what appends to recipe_plan_history.
 */
export function AutoPlanPanel({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('pantry')
  const [scope, setScope] = useState<CollectionScope>({ system: true, mine: true, saved: true })
  const [newOnly, setNewOnly] = useState(false)
  const [cuisines, setCuisines] = useState<string[]>([])
  const [preview, setPreview] = useState<Record<number, AutoPlanCandidate> | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const meal = useMealPlanQuery()
  const activeDays = (meal.data ?? []).filter((e) => e.is_active).map((e) => e.day_of_week)

  const { candidates, relaxedNewOnly, availableCuisines, isLoading } = useAutoPlanCandidates({
    scope,
    newOnly,
    cuisines,
    minCount: activeDays.length,
  })
  const upsertDay = useUpsertPlanDay()
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
    const picks = pickRandom(candidates, activeDays.length)
    const picksByDay: Record<number, AutoPlanCandidate> = {}
    activeDays.forEach((day, i) => {
      picksByDay[day] = picks[i]
    })
    setPreview(picksByDay)
    setApplied(false)
  }

  async function apply() {
    if (!preview) return
    setApplying(true)
    try {
      await Promise.all(
        Object.entries(preview).map(([day, candidate]) =>
          upsertDay.mutateAsync({ day_of_week: Number(day), recipe_id: candidate.id }),
        ),
      )
      setApplied(true)
    } finally {
      setApplying(false)
    }
  }

  const noActiveDays = activeDays.length === 0
  const noCandidates = !isLoading && candidates.length === 0
  const isAllSources = scope.system && scope.mine && scope.saved

  const currentIndex = STEPS.indexOf(step) + 1

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <Stepper value={currentIndex} onValueChange={(value) => setStep(STEPS[value - 1])}>
        <div className="flex items-start justify-between gap-4">
          <StepperNav className="flex-1 gap-3">
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
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <h2 className="text-sm font-semibold">{STEP_TITLES[step]}</h2>

        <StepperPanel>
          <StepperContent value={1} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add what you have on hand so Auto Plan can favor recipes you already have
              ingredients for. Optional — skip if you'd rather not.
            </p>
            <IngredientPicker
              exclude={(pantry.data ?? []).map((i) => i.ingredient)}
              onSelect={(name) => addPantryItem.mutate(name)}
              placeholder="Add an ingredient…"
            />
            <PantryList />
          </StepperContent>

          <StepperContent value={2} className="space-y-3">
            {noActiveDays && (
              <p className="text-xs text-muted-foreground">Turn on the days you'll cook.</p>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 7 }, (_, day) => {
                const entry = (meal.data ?? []).find((e) => e.day_of_week === day)
                const isActive = entry?.is_active ?? false
                return (
                  <label
                    key={day}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) =>
                        upsertDay.mutate({ day_of_week: day, is_active: e.target.checked })
                      }
                    />
                    {DAY_LABELS[day]}
                  </label>
                )
              })}
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

            {applied && preview ? (
              <p className="text-sm text-muted-foreground">Added to your week.</p>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={roll} disabled={noActiveDays || noCandidates || isLoading}>
                  {preview ? 'Re-roll' : 'Generate'}
                </Button>
                {preview && (
                  <Button size="sm" variant="outline" onClick={apply} disabled={applying}>
                    {applying ? 'Applying…' : 'Apply to week'}
                  </Button>
                )}
              </div>
            )}

            {preview && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeDays.map((day) => {
                  const candidate = preview[day]
                  return (
                    <div key={day} className="space-y-1">
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

      <div className="flex items-center justify-between border-t border-border pt-3">
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
          {step === 'review' && applied && (
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
