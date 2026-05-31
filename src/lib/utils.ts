import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Ensures a single space on each side of the first name separator dash. */
export function formatBrandNameForDisplay(name: string): string {
  const match = name.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (!match) return name
  return `${match[1].trimEnd()} - ${match[2].trimStart()}`
}
