import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class names, resolving conflicts. Used by every UI primitive. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Trimmed, lower-cased canonical form for comparing ingredient names. */
export function canonicalName(name: string): string {
  return name.trim().toLowerCase()
}
