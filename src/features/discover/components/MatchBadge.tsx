export function MatchBadge({ have, total }: { have: number; total: number }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      You have {have} of {total}
    </span>
  )
}
