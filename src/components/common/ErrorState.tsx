import { Button } from '@/components/ui/button'

/** Standard error panel. Pair with QueryErrorResetBoundary at route subtrees. */
export function ErrorState({
  error,
  onRetry,
}: {
  error?: unknown
  onRetry?: () => void
}) {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Something went wrong.'
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
