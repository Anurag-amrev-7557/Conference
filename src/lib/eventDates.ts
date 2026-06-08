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

/** Card-friendly date label, e.g. "24 May" + "Wednesday". */
export function formatEventCardDate(event: AppEvent): { day: string; weekday: string } {
  const d = getEventDate(event)
  if (!d) return { day: event.day, weekday: event.weekday }
  return {
    day: `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`,
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  }
}

/** Primary time line for cards — avoids duplicating short + long time strings. */
export function formatEventCardTime(event: AppEvent): string {
  const full = event.full_time?.trim()
  const short = event.time?.trim()
  if (full && short && full.includes(short)) return full
  if (full) return full
  return short || ""
}

/** Time portion only — for use beside an already-shown calendar date. */
export function formatEventCardTimeOnly(event: AppEvent): string {
  const short = event.time?.trim()
  if (short) return short

  const full = event.full_time?.trim()
  if (!full) return ""

  const commaIdx = full.indexOf(",")
  if (commaIdx >= 0) {
    const afterDate = full.slice(commaIdx + 1).trim()
    if (afterDate) return afterDate
  }

  return full
}

function looksLikeJobTitle(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  return (
    /\b(architect|engineer|strategist|analyst|researcher|director|specialist)\b/.test(
      normalized,
    ) ||
    normalized.startsWith("senior ") ||
    normalized.endsWith(" team")
  )
}

function getHostInitials(host: string): string {
  const parts = host.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
  }
  return host.trim().slice(0, 2).toUpperCase()
}

/** Host lines for event cards — avoids showing job titles as person names. */
export function formatEventHost(
  host: string,
  location: string,
): { name: string; subtitle: string; initials: string } {
  const rawHost = host?.trim() || "Superhumanly Events"
  const rawLocation = location?.trim() || "Online"

  if (looksLikeJobTitle(rawHost)) {
    return {
      name: "Superhumanly Events",
      subtitle: rawLocation,
      initials: "SE",
    }
  }

  return {
    name: rawHost,
    subtitle: rawLocation,
    initials: getHostInitials(rawHost),
  }
}

export function getPreviewEvents(events: AppEvent[], limit = 4): AppEvent[] {
  return events
    .filter((e) => e.isPublished)
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "Upcoming" ? -1 : 1
      }
      const da = getEventDate(a)?.getTime()
      const db = getEventDate(b)?.getTime()
      const aTime = da ?? (a.status === "Upcoming" ? Number.POSITIVE_INFINITY : 0)
      const bTime = db ?? (b.status === "Upcoming" ? Number.POSITIVE_INFINITY : 0)
      return a.status === "Upcoming" ? aTime - bTime : bTime - aTime
    })
    .slice(0, limit)
}
