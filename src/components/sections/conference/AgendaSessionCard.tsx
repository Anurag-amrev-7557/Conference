import type { CSSProperties } from 'react'
import { cn } from '../../../lib/utils'
import { getTrackSlug, isAgendaBreak, resolveSpeakerForSession } from '../../../lib/agenda'
import type { ConferenceAgendaSession, ConferenceSpeaker } from '../../../lib/websiteData'

type AgendaSessionCardProps = {
  session: ConferenceAgendaSession
  index: number
  speakers: ConferenceSpeaker[]
  onSpeakerSelect?: (speaker: ConferenceSpeaker) => void
}

export function AgendaSessionCard({
  session,
  index,
  speakers,
  onSpeakerSelect,
}: AgendaSessionCardProps) {
  const isBreak = isAgendaBreak(session)
  const trackSlug = getTrackSlug(session.track ?? '')
  const matchedSpeaker = resolveSpeakerForSession(session, speakers)
  const canOpenSpeaker = Boolean(matchedSpeaker && onSpeakerSelect && !isBreak)

  return (
    <li
      className={cn('conference-agenda-card', isBreak && 'conference-agenda-card--break')}
      data-track={trackSlug}
      style={{ '--session-i': index } as CSSProperties}
    >
      <span className="conference-agenda-card__time">{session.time}</span>

      <div className="conference-agenda-card__main">
        {session.track ? (
          <p className="conference-agenda-card__track">{session.track}</p>
        ) : null}
        <h3 className="conference-agenda-card__title">{session.title}</h3>
        {session.speaker?.trim() ? (
          canOpenSpeaker ? (
            <button
              type="button"
              className="conference-agenda-card__speaker-link"
              onClick={() => matchedSpeaker && onSpeakerSelect?.(matchedSpeaker)}
            >
              {session.speaker}
            </button>
          ) : (
            <p className="conference-agenda-card__speaker">{session.speaker}</p>
          )
        ) : null}
      </div>
    </li>
  )
}
