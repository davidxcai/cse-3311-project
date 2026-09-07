export function MissingIngredients({ missing }: { missing: string[] }) {
  if (missing.length === 0) return <p className="text-xs text-primary">You have everything.</p>
  return (
    <p className="text-xs text-muted-foreground">
      Need to buy: {missing.slice(0, 4).join(', ')}
      {missing.length > 4 && ` +${missing.length - 4} more`}
    </p>
  )
}
