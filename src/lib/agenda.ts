import type {
  ConferenceAgendaDay,
  ConferenceAgendaSession,
  ConferenceSpeaker,
} from './websiteData'

export type AgendaTrackSlug =
  | 'main-stage'
  | 'enterprise'
  | 'ethics'
  | 'technical'
  | 'networking'
  | 'default'

export function isAgendaBreak(session: ConferenceAgendaSession): boolean {
  const track = session.track?.toLowerCase() ?? ''
  return (
    !session.speaker?.trim() &&
    (track.includes('network') || track.includes('break') || track.includes('lunch'))
  )
}

export function getTrackSlug(track: string): AgendaTrackSlug {
  const value = track.toLowerCase()
  if (value.includes('main')) return 'main-stage'
  if (value.includes('enterprise')) return 'enterprise'
  if (value.includes('ethic')) return 'ethics'
  if (value.includes('technical') || value.includes('tech')) return 'technical'
  if (value.includes('network') || value.includes('break') || value.includes('lunch')) {
    return 'networking'
  }
  return 'default'
}

export function resolveSpeakerForSession(
  session: ConferenceAgendaSession,
  speakers: ConferenceSpeaker[],
): ConferenceSpeaker | null {
  if (session.speakerId) {
    const byId = speakers.find((speaker) => speaker.id === session.speakerId)
    if (byId) return byId
  }

  const label = session.speaker?.trim()
  if (!label) return null

  const namePart = label.split(',')[0]?.trim().toLowerCase() ?? ''
  if (!namePart) return null

  return (
    speakers.find((speaker) => {
      const speakerName = speaker.name.trim().toLowerCase()
      return (
        speakerName === namePart ||
        namePart.includes(speakerName) ||
        speakerName.includes(namePart)
      )
    }) ?? null
  )
}

export function getUniqueTracks(sessions: ConferenceAgendaSession[]): string[] {
  const tracks = new Set<string>()
  for (const session of sessions) {
    const track = session.track?.trim()
    if (track) tracks.add(track)
  }
  return [...tracks]
}

function parseClockTime(time: string): { hours: number; minutes: number } | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  return { hours, minutes }
}

function parseDurationMinutes(duration?: string): number {
  const value = duration?.trim().toLowerCase() ?? ''
  if (!value) return 60

  const hourMatch = value.match(/(\d+)\s*h/)
  const minMatch = value.match(/(\d+)\s*m/)

  const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0
  const minutes = minMatch ? Number.parseInt(minMatch[1], 10) : 0

  if (hours || minutes) return hours * 60 + minutes
  return 60
}

function formatIcsUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function getSessionWindow(
  eventStartAt: string,
  dayIndex: number,
  session: ConferenceAgendaSession,
): { start: Date; end: Date } | null {
  const clock = parseClockTime(session.time)
  if (!clock) return null

  const base = new Date(eventStartAt)
  if (Number.isNaN(base.getTime())) return null

  const start = new Date(base)
  start.setDate(start.getDate() + dayIndex)
  start.setHours(clock.hours, clock.minutes, 0, 0)

  const end = new Date(start)
  end.setMinutes(end.getMinutes() + parseDurationMinutes(session.duration))

  return { start, end }
}

export function buildGoogleCalendarUrl(
  eventStartAt: string,
  dayIndex: number,
  session: ConferenceAgendaSession,
  eventTitle: string,
): string | null {
  const window = getSessionWindow(eventStartAt, dayIndex, session)
  if (!window) return null

  const details = [
    session.speaker?.trim(),
    session.room?.trim(),
    session.description?.trim(),
  ]
    .filter(Boolean)
    .join('\n')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${eventTitle}: ${session.title}`,
    dates: `${formatIcsUtc(window.start)}/${formatIcsUtc(window.end)}`,
    details,
    location: session.room?.trim() ?? '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildAgendaIcs(
  agenda: ConferenceAgendaDay[],
  eventStartAt: string,
  eventTitle: string,
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Superhumanly Summit//Agenda//EN',
    `X-WR-CALNAME:${escapeIcsText(eventTitle)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const [dayIndex, day] of agenda.entries()) {
    for (const session of day.sessions) {
      const window = getSessionWindow(eventStartAt, dayIndex, session)
      if (!window) continue

      lines.push(
        'BEGIN:VEVENT',
        `UID:${session.id}@superhumanly-summit`,
        `DTSTAMP:${formatIcsUtc(new Date())}`,
        `DTSTART:${formatIcsUtc(window.start)}`,
        `DTEND:${formatIcsUtc(window.end)}`,
        `SUMMARY:${escapeIcsText(session.title)}`,
        `DESCRIPTION:${escapeIcsText(
          [day.label, session.speaker, session.description].filter(Boolean).join(' — '),
        )}`,
        `LOCATION:${escapeIcsText(session.room ?? '')}`,
        'END:VEVENT',
      )
    }
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadAgendaIcs(
  agenda: ConferenceAgendaDay[],
  eventStartAt: string,
  eventTitle: string,
): void {
  const content = buildAgendaIcs(agenda, eventStartAt, eventTitle)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'superhumanly-summit-agenda.ics'
  anchor.click()
  URL.revokeObjectURL(url)
}
