import { useEffect, useState } from 'react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'

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
    <section className="conference-countdown" aria-label="Event countdown">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-4">
          Summit begins in
        </p>
        <ul className="flex justify-center gap-4 sm:gap-8 list-none p-0 m-0">
          {units.map(({ label, value }) => (
            <li key={label} className="text-center min-w-[4.5rem]">
              <span className="block text-3xl sm:text-5xl font-serif font-bold text-text tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted mt-1 block">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
