import { useEffect, useState } from 'react'
import { useProfileQuery } from '@/features/profile/queries'
import { useUpdateProfile } from '@/features/profile/mutations'
import { useSignOut } from '@/features/auth/use-session'
import { DietTagField } from '@/features/profile/components/DietTagField'
import { DislikedIngredientsField } from '@/features/profile/components/DislikedIngredientsField'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DietTag } from '@/types/models'

export function SettingsRoute() {
  const { data, isLoading, isError, error, refetch } = useProfileQuery()
  const update = useUpdateProfile()
  const signOut = useSignOut()

  const [displayName, setDisplayName] = useState('')
  const [restrictions, setRestrictions] = useState<DietTag[]>([])
  const [disliked, setDisliked] = useState<string[]>([])

  useEffect(() => {
    if (!data) return
    setDisplayName(data.display_name ?? '')
    setRestrictions(data.dietary_restrictions)
    setDisliked(data.disliked_ingredients)
  }, [data])

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold">Settings</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          update.mutate({
            display_name: displayName || null,
            dietary_restrictions: restrictions,
            disliked_ingredients: disliked,
          })
        }}
      >
        <div className="mt-6 space-y-3 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account</p>
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Eating preferences
          </p>

          <div>
            <p className="text-sm font-medium">Dietary restrictions</p>
            <p className="mb-2 text-xs text-muted-foreground">
              A recipe qualifies only if it carries every tag you select.
            </p>
            <DietTagField value={restrictions} onChange={setRestrictions} />
          </div>

          <div>
            <p className="text-sm font-medium">Disliked ingredients</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Recipes containing any of these are hidden from Discover.
            </p>
            <DislikedIngredientsField value={disliked} onChange={setDisliked} />
          </div>
        </div>

        {update.isError && <ErrorState error={update.error} />}
        <div className="mt-6 border-t border-border pt-4">
          <Button type="submit" disabled={update.isPending}>
            {update.isSuccess ? 'Saved' : 'Save settings'}
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={() => signOut.mutate()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
