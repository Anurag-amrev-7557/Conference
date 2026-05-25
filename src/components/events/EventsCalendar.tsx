import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AppEvent } from "../../lib/websiteData"
import { eventMatchesCalendarDay, getEventDate } from "../../lib/eventDates"

interface EventsCalendarProps {
  events: AppEvent[]
  activeTab: "Upcoming" | "Past"
  selectedEventId: string | null
  month: Date
  onMonthChange: (date: Date) => void
  onSelectDay: (dayEvents: AppEvent[]) => void
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export function EventsCalendar({
  events,
  activeTab,
  selectedEventId,
  month,
  onMonthChange,
  onSelectDay,
}: EventsCalendarProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const published = events.filter((e) => e.isPublished && e.status === activeTab)

  const selectedEvent = selectedEventId
    ? published.find((e) => e.id === selectedEventId)
    : undefined
  const selectedDate = selectedEvent ? getEventDate(selectedEvent) : null

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const eventsForDay = (day: number) =>
    published.filter((e) => eventMatchesCalendarDay(e, year, monthIndex, day))

  const today = new Date()

  return (
    <div className="events-calendar">
      <div className="events-calendar__header">
        <h3 className="events-calendar__title">
          {MONTH_NAMES[monthIndex]} {year}
        </h3>
        <div className="events-calendar__nav">
          <button
            type="button"
            className="events-calendar__nav-btn"
            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="events-calendar__nav-btn"
            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="events-calendar__grid" role="grid" aria-label="Event calendar">
        {WEEKDAYS.map((label, i) => (
          <div key={`${label}-${i}`} className="events-calendar__weekday">
            {label}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} aria-hidden />
          }
          const dayEvents = eventsForDay(day)
          const hasEvents = dayEvents.length > 0
          const isSelected =
            selectedDate !== null &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === monthIndex &&
            selectedDate.getDate() === day
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === monthIndex &&
            today.getDate() === day

          return (
            <div key={day} className="events-calendar__day-wrap">
              <button
                type="button"
                disabled={!hasEvents}
                onClick={() => hasEvents && onSelectDay(dayEvents)}
                className={[
                  "events-calendar__day w-full",
                  hasEvents ? "events-calendar__day--has-events" : "",
                  isSelected ? "events-calendar__day--selected" : "",
                  isToday ? "events-calendar__day--today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={
                  hasEvents
                    ? `${day} ${MONTH_NAMES[monthIndex]}, ${dayEvents.length} event(s)`
                    : `${day} ${MONTH_NAMES[monthIndex]}, no events`
                }
                aria-pressed={isSelected}
              >
                {day}
              </button>
              {hasEvents && !isSelected ? (
                <span className="events-calendar__dot" aria-hidden />
              ) : null}
            </div>
          )
        })}
      </div>

      <p className="events-calendar__legend">Dot = event scheduled</p>
    </div>
  )
}
