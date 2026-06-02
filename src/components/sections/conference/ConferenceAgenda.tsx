import { useEffect, useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { cn } from '../../../lib/utils'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import type { ConferenceAgendaSession } from '../../../lib/websiteData'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

function isAgendaBreak(session: ConferenceAgendaSession) {
  const track = session.track?.toLowerCase() ?? ''
  return (
    !session.speaker?.trim() &&
    (track.includes('network') || track.includes('break') || track.includes('lunch'))
  )
}

export function ConferenceAgenda() {
  const { agenda, sections } = useConferenceContent()
  const copy = sections.agenda
  const baseId = useId()
  const [activeDayId, setActiveDayId] = useState(agenda[0]?.id ?? '')

  useEffect(() => {
    if (agenda.length === 0) {
      setActiveDayId('')
      return
    }
    if (!agenda.some((day) => day.id === activeDayId)) {
      setActiveDayId(agenda[0].id)
    }
  }, [agenda, activeDayId])

  const activeDay = agenda.find((day) => day.id === activeDayId) ?? agenda[0]
  const sessions = activeDay?.sessions ?? []
  const panelId = `${baseId}-panel`

  return (
    <ConferenceSectionShell
      id="conference-agenda"
      sectionClass="conference-agenda-section"
      visibleClass="conference-agenda-section--visible"
      variant="white"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Full <span className="editorial-accent">Agenda</span>
          </>
        }
        ledeFallback="Two days. Zero fluff. Just the sessions worth your calendar."
      />

      {agenda.length === 0 ? (
        <p className="conference-agenda-empty">Agenda coming soon.</p>
      ) : (
        <>
          <div className="conference-agenda__tabs" role="tablist" aria-label="Agenda days">
            {agenda.map((day) => {
              const tabId = `${baseId}-tab-${day.id}`
              const isActive = activeDayId === day.id

              return (
                <button
                  key={day.id}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveDayId(day.id)}
                  className={cn(
                    'conference-agenda__tab',
                    isActive && 'conference-agenda__tab--active',
                  )}
                >
                  {day.label}
                </button>
              )
            })}
          </div>

          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${activeDayId}`}
            className="conference-agenda__panel"
          >
            {sessions.length === 0 ? (
              <p className="conference-agenda-empty conference-agenda-empty--inset">
                Sessions for this day will be posted soon.
              </p>
            ) : (
              <ol className="conference-agenda__sessions list-none p-0 m-0">
                {sessions.map((session, idx) => {
                  const isBreak = isAgendaBreak(session)

                  return (
                    <li
                      key={session.id}
                      className={cn(
                        'conference-agenda-card',
                        isBreak && 'conference-agenda-card--break',
                      )}
                      style={{ '--session-i': idx } as CSSProperties}
                    >
                      <span className="conference-agenda-card__time">{session.time}</span>

                      <div className="conference-agenda-card__main">
                        {session.track ? (
                          <p className="conference-agenda-card__track">{session.track}</p>
                        ) : null}
                        <h3 className="conference-agenda-card__title">{session.title}</h3>
                        {session.speaker?.trim() ? (
                          <p className="conference-agenda-card__speaker">{session.speaker}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </>
      )}
    </ConferenceSectionShell>
  )
}
