import { useEffect, useState } from 'react'
import { useProfileQuery } from '@/features/profile/queries'
import { useUpdateProfile } from '@/features/profile/mutations'
import { useSignOut } from '@/features/auth/use-session'
import { ToggleChipField } from '@/features/profile/components/ToggleChipField'
import { IngredientTagListField } from '@/features/profile/components/IngredientTagListField'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ALLERGY_TYPES, COMMON_DISLIKED_INGREDIENTS, DIET_TAGS, type DietTag } from '@/types/models'

const SECTIONS = ['account', 'eating-preferences'] as const
type Section = (typeof SECTIONS)[number]

const SECTION_LABELS: Record<Section, string> = {
  account: 'Account',
  'eating-preferences': 'Eating Preferences',
}

/** Settings page: same 5:7 two-column layout as Meal Plan / Recipes, sub-nav left, content right. */
export function SettingsRoute() {
  const { data, isLoading, isError, error, refetch } = useProfileQuery()
  const update = useUpdateProfile()
  const signOut = useSignOut()

  const [section, setSection] = useState<Section>('account')
  const [displayName, setDisplayName] = useState('')
  const [restrictions, setRestrictions] = useState<DietTag[]>([])
  const [disliked, setDisliked] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])

  useEffect(() => {
    if (!data) return
    setDisplayName(data.display_name ?? '')
    setRestrictions(data.dietary_restrictions)
    setDisliked(data.disliked_ingredients)
    setAllergies(data.allergies)
  }, [data])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[5fr_7fr]">
        <Card className="border-0 bg-popover shadow-none">
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          </CardHeader>
          <CardContent>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s)}
                  className={cn(
                    'rounded-md px-4 py-2 text-left text-sm font-medium transition-colors',
                    section === s
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/60',
                  )}
                >
                  {SECTION_LABELS[s]}
                </button>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <button
                  type="button"
                  onClick={() => signOut.mutate()}
                  className="w-full rounded-md px-4 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-background/60"
                >
                  Sign out
                </button>
              </div>
            </nav>
          </CardContent>
        </Card>

        <Card className="border-0 bg-popover shadow-none">
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">{SECTION_LABELS[section]}</h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  update.mutate({
                    display_name: displayName || null,
                    dietary_restrictions: restrictions,
                    disliked_ingredients: disliked,
                    allergies,
                  })
                }}
                className="space-y-6"
              >
                {section === 'account' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                )}

                {section === 'eating-preferences' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Dietary restrictions</p>
                      <ToggleChipField options={DIET_TAGS} value={restrictions} onChange={setRestrictions} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Allergies</p>
                      <ToggleChipField options={ALLERGY_TYPES} value={allergies} onChange={setAllergies} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Disliked ingredients</p>
                      <IngredientTagListField
                        value={disliked}
                        onChange={setDisliked}
                        placeholder="Add a disliked ingredient…"
                        suggestions={COMMON_DISLIKED_INGREDIENTS}
                      />
                    </div>
                  </>
                )}

                {update.isError && <ErrorState error={update.error} />}
                <div className="border-t border-border pt-4">
                  <Button type="submit" disabled={update.isPending}>
                    {update.isSuccess ? 'Saved' : 'Save settings'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
