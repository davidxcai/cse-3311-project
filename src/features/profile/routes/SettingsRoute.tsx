import { useEffect, useState } from 'react'
import { useProfileQuery } from '@/features/profile/queries'
import { useUpdateProfile } from '@/features/profile/mutations'
import { DietTagField } from '@/features/profile/components/DietTagField'
import { DislikedIngredientsField } from '@/features/profile/components/DislikedIngredientsField'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import type { DietTag } from '@/types/models'

export function SettingsRoute() {
  const { data, isLoading, isError, error, refetch } = useProfileQuery()
  const update = useUpdateProfile()

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
    <form
      className="max-w-lg space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate({
          display_name: displayName || null,
          dietary_restrictions: restrictions,
          disliked_ingredients: disliked,
        })
      }}
    >
      <h1 className="text-lg font-semibold">Settings</h1>

      <label className="block text-sm font-medium">
        Display name
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      </label>

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

      {update.isError && <ErrorState error={update.error} />}
      <Button type="submit" disabled={update.isPending}>
        {update.isSuccess ? 'Saved' : 'Save settings'}
      </Button>
    </form>
  )
}
