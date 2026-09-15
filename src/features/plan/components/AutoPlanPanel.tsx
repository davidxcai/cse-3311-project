import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useMealPlanQuery } from '@/features/plan/queries'
import { useApplyPlan } from '@/features/plan/mutations'
import { useAutoPlanCandidates } from '@/features/plan/use-auto-plan'
import { pickFromRank, type AutoPlanCandidate, type CollectionScope } from '@/features/plan/auto-plan'
import { usePantryQuery } from '@/features/pantry/queries'
import { useAddPantryItem } from '@/features/pantry/mutations'
import { PantryList } from '@/features/pantry/components/PantryList'
import { IngredientPicker } from '@/components/common/IngredientPicker'
import { RecipeCard } from '@/components/common/RecipeCard'
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
import { DAY_LABELS, parseDateOnly } from '@/types/models'

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

function dayTileClass(active: boolean): string {
  return (
    'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition sm:h-12 sm:w-12 ' +
    (active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70')
  )
}

/** `YYYY-MM-DD`, computed from local date parts (avoids the UTC-conversion day-shift of `toISOString`). */
function formatISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** The 7 calendar dates starting `dayOffset` days from today (0 = today). */
function getWindowDates(dayOffset: number): Date[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + dayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return date
  })
}

function formatWindowHeader(dates: Date[]): string {
  const [first, last] = [dates[0], dates[dates.length - 1]]
  if (first.getMonth() === last.getMonth()) {
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(first)
  }
  const short = new Intl.DateTimeFormat('en-US', { month: 'short' })
  return `${short.format(first)} – ${short.format(last)}`
}

/**
 * Date selection lives in local state only — nothing is written to the
 * database until "Save". Fills the drafted dates with the best-ranked
 * options from a pre-fetched candidate pool (see `pickFromRank` —
 * deterministic, not random: best pantry match first). "Re-roll" advances a
 * cursor through that same ranking, so the whole batch (or a single date)
 * steps to the next-best option instead of jumping around; no refetch.
 * "Save" commits
 * everything in one batched write (meal_plan_entries + recipe_plan_history),
 * deactivating any previously-active date that's no longer selected, then
 * closes the panel back to the meal plan.
 */
export function AutoPlanPanel({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('pantry')
  const [scope, setScope] = useState<CollectionScope>({ system: true, mine: true, saved: true })
  const [newOnly, setNewOnly] = useState(false)
  const [cuisines, setCuisines] = useState<string[]>([])
  const [draftDates, setDraftDates] = useState<Set<string>>(new Set())
  const [dayOffset, setDayOffset] = useState(0)
  const [seededDays, setSeededDays] = useState(false)
  const [preview, setPreview] = useState<Record<string, AutoPlanCandidate> | null>(null)
  // How far into the ranked candidate list the next roll starts reading from.
  const [cursor, setCursor] = useState(0)
  const [applying, setApplying] = useState(false)

  function resetPreview() {
    setPreview(null)
    setCursor(0)
  }

  const meal = useMealPlanQuery()
  const persistedActiveDates = (meal.data ?? []).filter((e) => e.is_active).map((e) => e.plan_date)

  const windowDates = useMemo(() => getWindowDates(dayOffset), [dayOffset])

  // Seed the draft from the saved plan once it loads, so reopening the panel
  // continues from what's already active. Every toggle after that is local
  // only — nothing is written until "Save".
  useEffect(() => {
    if (!seededDays && meal.data) {
      setDraftDates(new Set(meal.data.filter((e) => e.is_active).map((e) => e.plan_date)))
      setSeededDays(true)
    }
  }, [meal.data, seededDays])

  const draftDatesList = Array.from(draftDates).sort()

  const { candidates, relaxedNewOnly, availableCuisines, isLoading } = useAutoPlanCandidates({
    scope,
    newOnly,
    cuisines,
    minCount: draftDatesList.length,
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
    resetPreview()
  }

  function skipSource() {
    setScope({ system: true, mine: true, saved: true })
    setNewOnly(false)
    setCuisines([])
    resetPreview()
    next()
  }

  function toggleSourceChip(key: 'mine' | 'saved') {
    setScope((s) => ({ ...s, system: false, [key]: !s[key] }))
    resetPreview()
  }

  function toggleCuisine(area: string) {
    setCuisines((c) => (c.includes(area) ? c.filter((a) => a !== area) : [...c, area]))
    resetPreview()
  }

  // Fills every day from the top of the ranking; "Re-roll" calls this again
  // with the cursor already advanced, so it steps to the next-best batch
  // (days 1-3, then 4-6, ...) instead of picking at random.
  function roll() {
    const picks = pickFromRank(candidates, draftDatesList.length, cursor)
    const picksByDate: Record<string, AutoPlanCandidate> = {}
    draftDatesList.forEach((date, i) => {
      picksByDate[date] = picks[i]
    })
    setPreview(picksByDate)
    setCursor(cursor + draftDatesList.length)
  }

  // Auto-generate as soon as the review step has a settled candidate pool to
  // draw from, so there's no separate "Generate" step for the user to click.
  useEffect(() => {
    if (step === 'review' && !preview && !isLoading && candidates.length > 0 && draftDatesList.length > 0) {
      roll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, preview, isLoading, candidates, draftDatesList])

  // Steps this one day to the next-best-ranked option after the cursor,
  // skipping anything already shown on another day this session.
  function rerollDay(date: string) {
    if (!preview || candidates.length === 0) return
    const usedIds = new Set(Object.values(preview).map((c) => c.id))
    let steps = 1
    while (steps <= candidates.length) {
      const [pick] = pickFromRank(candidates, 1, cursor + steps - 1)
      if (!usedIds.has(pick.id) || candidates.length <= draftDatesList.length) {
        setPreview({ ...preview, [date]: pick })
        setCursor(cursor + steps)
        return
      }
      steps++
    }
  }

  function toggleDate(date: string) {
    setDraftDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
    resetPreview()
  }

  async function apply() {
    if (!preview) return
    setApplying(true)
    try {
      const picks: Record<string, string> = {}
      for (const [date, candidate] of Object.entries(preview)) picks[date] = candidate.id
      await applyPlan.mutateAsync({ picks, previousActiveDates: persistedActiveDates })
      onClose()
    } finally {
      setApplying(false)
    }
  }

  const noActiveDays = draftDatesList.length === 0
  const noCandidates = !isLoading && candidates.length === 0
  const isAllSources = scope.system && scope.mine && scope.saved

  const currentIndex = STEPS.indexOf(step) + 1

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-lg bg-card p-4">
      <Stepper
        value={currentIndex}
        onValueChange={(value) => setStep(STEPS[value - 1])}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <StepperNav className="shrink-0 gap-3">
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

        <h2 className="shrink-0 text-sm font-semibold">{STEP_TITLES[step]}</h2>

        <StepperPanel className="min-h-0 flex-1 overflow-y-auto">
          <StepperContent value={1} className="flex h-full min-h-0 flex-col gap-3">
            <IngredientPicker
              exclude={(pantry.data ?? []).map((i) => i.ingredient)}
              onSelect={(name) => addPantryItem.mutate(name)}
              placeholder="Add an ingredient…"
            />
            <PantryList className="max-h-none flex-1" />
          </StepperContent>

          <StepperContent value={2} className="flex h-full min-h-0 flex-col items-center justify-center gap-3">
            <p className="text-xl font-semibold">{formatWindowHeader(windowDates)}</p>
            <div className="flex justify-center gap-1 sm:gap-2">
              {windowDates.map((date) => {
                const iso = formatISODate(date)
                return (
                  <div key={iso} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {DAY_LABELS[date.getDay()]}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDate(iso)}
                      className={dayTileClass(draftDates.has(iso))}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setDayOffset((o) => Math.max(0, o - 1))}
                disabled={dayOffset === 0}
                aria-label="Previous day"
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setDayOffset((o) => o + 1)}
                aria-label="Next day"
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              {dayOffset > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setDayOffset((o) => Math.max(0, o - 7))}>
                  Prev Week
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDayOffset((o) => o + 7)}>
                Next Week
              </Button>
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
                    resetPreview()
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
                {draftDatesList.map((iso) => {
                  const candidate = preview[iso]
                  const date = parseDateOnly(iso)
                  return (
                    <div key={iso} className="group relative">
                      {candidate ? (
                        <RecipeCard
                          recipe={{
                            id: candidate.id,
                            name: candidate.name,
                            area: candidate.area,
                            thumb_url: candidate.thumb_url,
                          }}
                          date={date}
                          ingredients={{ have: candidate.haveCount, total: candidate.total }}
                          disableLink
                        />
                      ) : (
                        <div className="aspect-square w-full rounded-2xl bg-muted" />
                      )}
                      <button
                        type="button"
                        onClick={() => rerollDay(iso)}
                        aria-label={`Re-roll ${DAY_LABELS[date.getDay()]} ${date.getDate()}`}
                        className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm group-hover:flex hover:border-primary hover:text-primary"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </StepperContent>
        </StepperPanel>
      </Stepper>

      <div className="flex shrink-0 items-center justify-between">
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
