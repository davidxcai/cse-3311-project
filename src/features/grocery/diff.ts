/**
 * Pure diff for the "Generate grocery list" action. No React, no Supabase.
 * Unit-tested in diff.test.ts.
 *
 * Rules (see ARCHITECTURE.md § "Grocery list generation"):
 *  - keep generated rows still needed, preserving `checked`
 *  - delete generated rows (is_manual = false) no longer needed
 *  - insert newly needed rows, unchecked
 *  - never touch manual rows (is_manual = true)
 * Idempotent: same plan + pantry ⇒ same list.
 */
import type { GroceryItem } from '@/types/models'

function canon(name: string): string {
  return name.trim().toLowerCase()
}

export type GroceryDiff = {
  toInsert: string[]
  toDelete: string[]
}

export function computeGroceryDiff(neededNames: string[], existing: GroceryItem[]): GroceryDiff {
  const needed = new Map<string, string>()
  for (const raw of neededNames) {
    const key = canon(raw)
    if (key && !needed.has(key)) needed.set(key, raw.trim())
  }

  const generated = existing.filter((row) => !row.is_manual)
  // A manual row already covering a name blocks a generated insert (PK is
  // (user_id, ingredient)), so check inserts against every existing row...
  const allKeys = new Set(existing.map((row) => canon(row.ingredient)))
  // ...but only generated rows are eligible for deletion.

  const toInsert = [...needed.entries()]
    .filter(([key]) => !allKeys.has(key))
    .map(([, original]) => original)

  const toDelete = generated
    .filter((row) => !needed.has(canon(row.ingredient)))
    .map((row) => row.ingredient)

  return { toInsert, toDelete }
}
