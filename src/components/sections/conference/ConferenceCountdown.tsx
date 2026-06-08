import { useEffect, useState } from 'react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { ConferenceSectionShell } from './ConferenceSectionShell'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function computeTimeLeft(targetMs: number): TimeLeft | null {
  const diff = targetMs - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function ConferenceCountdown() {
  const { eventStartAt, countdownEnabled } = useConferenceContent()
  const [left, setLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!countdownEnabled || !eventStartAt) return
    const target = new Date(eventStartAt).getTime()
    if (Number.isNaN(target)) return

    const tick = () => setLeft(computeTimeLeft(target))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [countdownEnabled, eventStartAt])

  if (!countdownEnabled || !eventStartAt || !left) return null

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: left.days },
    { label: 'Hours', value: left.hours },
    { label: 'Min', value: left.minutes },
    { label: 'Sec', value: left.seconds },
  ]

  return (
    <ConferenceSectionShell
      id="conference-countdown"
      sectionClass="conference-countdown-section conference-section--compact"
      visibleClass="conference-countdown-section--visible"
      variant="white"
    >
      <div className="conference-countdown__inner" aria-label="Event countdown">
        <p className="conference-countdown__label">Summit begins in</p>
        <ul className="conference-countdown__units list-none p-0 m-0">
          {units.map(({ label, value }) => (
            <li key={label} className="conference-countdown__unit">
              <span className="conference-countdown__value tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <span className="conference-countdown__unit-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </ConferenceSectionShell>
  )
}
