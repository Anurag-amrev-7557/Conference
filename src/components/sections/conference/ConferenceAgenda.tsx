import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Download } from 'lucide-react'
import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react'
import { defaultConferenceContent } from '../../../lib/conferenceDefaults'
import { cn } from '../../../lib/utils'
import { downloadAgendaIcs } from '../../../lib/agenda'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import type { ConferenceSpeaker } from '../../../lib/websiteData'
import { SpeakerDetailDialog } from '../../speakers/SpeakerDetailDialog'
import { AgendaSessionCard } from './AgendaSessionCard'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'
import { resolveCtaHref, resolveCtaLabel, SectionCtaLink } from '../../../lib/sectionCta'

const panelVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
  },
}

export function ConferenceAgenda() {
  const { agenda, sections, speakers, eventStartAt, hero } = useConferenceContent()
  const summitStartAt = eventStartAt ?? defaultConferenceContent.eventStartAt ?? ''
  const copy = sections.agenda
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [pickedDayId, setPickedDayId] = useState<string | null>(null)
  const activeDayId =
    agenda.length === 0
      ? ''
      : pickedDayId && agenda.some((day) => day.id === pickedDayId)
        ? pickedDayId
        : (agenda[0]?.id ?? '')
  const [selectedSpeaker, setSelectedSpeaker] = useState<ConferenceSpeaker | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const eventTitle = hero?.title?.trim() || 'Superhumanly AI Summit'

  const activeDay = agenda.find((day) => day.id === activeDayId) ?? agenda[0]
  const sessions = activeDay?.sessions ?? []

  const panelId = `${baseId}-panel`

  const focusTab = useCallback(
    (index: number) => {
      const tab = tabRefs.current[index]
      if (!tab) return
      tab.focus()
      setPickedDayId(agenda[index].id)
    },
    [agenda],
  )

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const lastIndex = agenda.length - 1
      let nextIndex: number | null = null

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = index === lastIndex ? 0 : index + 1
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = index === 0 ? lastIndex : index - 1
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = lastIndex
          break
        default:
          return
      }

      event.preventDefault()
      focusTab(nextIndex)
    },
    [agenda.length, focusTab],
  )

  const handleDayChange = (dayId: string, label: string) => {
    setPickedDayId(dayId)
    setLiveMessage(`${label} agenda loaded`)
  }

  return (
    <>
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
          ledeClassName="conference-agenda-section__lede"
          titleClassName="conference-agenda-section__title"
        />

        {agenda.length === 0 ? (
          <div className="conference-agenda-empty-state">
            <div className="conference-agenda-empty-state__icon-wrap" aria-hidden>
              <CalendarDays className="conference-agenda-empty-state__icon" />
            </div>
            <h3 className="conference-agenda-empty-state__title">
              {copy?.emptyStateTitle?.trim() || 'Agenda coming soon'}
            </h3>
            <p className="conference-agenda-empty-state__body">
              {copy?.emptyStateBody?.trim() ||
                'We are finalizing the session lineup. Register now to get notified the moment the full program drops.'}
            </p>
            <SectionCtaLink
              href={resolveCtaHref(copy?.emptyStateCtaHref, '/register')}
              className="conference-section__cta-btn"
            >
              {resolveCtaLabel(copy?.emptyStateCtaLabel, 'Get early access')}
            </SectionCtaLink>
          </div>
        ) : (
          <>
            <div className="conference-agenda__toolbar">
              <div className="conference-agenda__tabs" role="tablist" aria-label="Agenda days">
                {agenda.map((day, index) => {
                  const tabId = `${baseId}-tab-${day.id}`
                  const isActive = activeDayId === day.id

                  return (
                    <button
                      key={day.id}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      id={tabId}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={panelId}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleDayChange(day.id, day.label)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
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

            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {liveMessage}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDayId}
                id={panelId}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${activeDayId}`}
                className="conference-agenda__panel"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {sessions.length === 0 ? (
                  <div className="conference-agenda-empty-state conference-agenda-empty-state--inset">
                    <h3 className="conference-agenda-empty-state__title">No sessions scheduled</h3>
                    <p className="conference-agenda-empty-state__body">
                      Switch days to explore the full program.
                    </p>
                  </div>
                ) : (
                  <ol className="conference-agenda__sessions list-none p-0 m-0">
                    {sessions.map((session, idx) => (
                      <AgendaSessionCard
                        key={session.id}
                        session={session}
                        index={idx}
                        speakers={speakers}
                        onSpeakerSelect={setSelectedSpeaker}
                      />
                    ))}
                  </ol>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="conference-agenda-section__footer">
              <SectionCtaLink
                href={resolveCtaHref(copy?.registerCtaHref, '/register')}
                className="conference-section__cta-btn"
              >
                {resolveCtaLabel(copy?.registerCtaLabel, 'Secure your spot')}
              </SectionCtaLink>
              <button
                type="button"
                className="conference-agenda__download-btn"
                onClick={() => downloadAgendaIcs(agenda, summitStartAt, eventTitle)}
              >
                <Download className="h-4 w-4" aria-hidden />
                {resolveCtaLabel(copy?.downloadCtaLabel ?? copy?.ctaLabel, 'Download full agenda')}
              </button>
            </div>
          </>
        )}
      </ConferenceSectionShell>

      <SpeakerDetailDialog
        speaker={selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </>
  )
}
