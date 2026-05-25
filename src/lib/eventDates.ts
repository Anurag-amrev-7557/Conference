import type { AppEvent } from "./websiteData"

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export function getEventDate(event: AppEvent): Date | null {
  if (event.startDate) {
    const parsed = new Date(event.startDate)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  const match = event.day.match(/^(\d{1,2})\s+(\w+)/i)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const monthStr = match[2].slice(0, 3)
  const monthIdx = MONTH_ABBR.findIndex(
    (m) => m.toLowerCase() === monthStr.toLowerCase(),
  )
  if (monthIdx < 0) return null
  const year = new Date().getFullYear()
  return new Date(year, monthIdx, day)
}

export function eventMatchesCalendarDay(
  event: AppEvent,
  year: number,
  month: number,
  day: number,
): boolean {
  const d = getEventDate(event)
  if (!d) return false
  return (
    d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  )
}

export function formatEventDayLabel(event: AppEvent): { day: string; weekday: string } {
  const d = getEventDate(event)
  if (!d) return { day: event.day, weekday: event.weekday }
  return {
    day: String(d.getDate()),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  }
}
