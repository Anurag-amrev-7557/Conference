import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { resolveAssetUrl } from '../../../lib/assetUrl'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

export function ConferenceSpeakers() {
  const { speakers, sections } = useConferenceContent()
  const copy = sections.speakers

  const headerActions = copy?.ctaLabel ? (
    <button
      type="button"
      className="conference-section__link-cta group"
      onClick={() =>
        document.getElementById('conference-agenda')?.scrollIntoView({ behavior: 'smooth' })
      }
    >
      {copy.ctaLabel}
      <ArrowUpRight
        className="h-[1.125rem] w-[1.125rem] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </button>
  ) : null

  return (
    <ConferenceSectionShell
      id="conference-speakers"
      sectionClass="conference-speakers-section"
      visibleClass="conference-speakers-section--visible"
      variant="white"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Featured <span className="italic editorial-accent">Speakers</span>
          </>
        }
        ledeFallback="Learn directly from the innovators and leaders who are shaping the future of AI."
        actions={headerActions}
      />

      {speakers.length === 0 ? (
        <p className="conference-speakers-empty">Speaker lineup coming soon.</p>
      ) : (
        <ul className="conference-speakers-grid list-none p-0 m-0">
          {speakers.map((speaker, idx) => (
            <li
              key={speaker.id}
              className="conference-speaker-card"
              style={{ '--speaker-i': idx } as CSSProperties}
            >
              <article className="conference-speaker-card__inner">
                <div className="conference-speaker-card__frame">
                  <img
                    src={resolveAssetUrl(speaker.image)}
                    alt={`Portrait of ${speaker.name}`}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="conference-speaker-card__img"
                  />
                </div>
                <div className="conference-speaker-card__body">
                  <h3 className="conference-speaker-card__name">{speaker.name}</h3>
                  {(speaker.title?.trim() || speaker.company?.trim()) && (
                    <div className="conference-speaker-card__details">
                      {speaker.title?.trim() ? (
                        <p className="conference-speaker-card__role">{speaker.title}</p>
                      ) : null}
                      {speaker.company?.trim() ? (
                        <p className="conference-speaker-card__company">{speaker.company}</p>
                      ) : null}
                    </div>
                  )}
                  {speaker.talkTitle?.trim() ? (
                    <p className="conference-speaker-card__talk text-sm text-muted mt-2">
                      {speaker.talkTitle}
                      {speaker.timeSlot?.trim() ? ` · ${speaker.timeSlot}` : ''}
                    </p>
                  ) : null}
                  {speaker.bio?.trim() ? (
                    <p className="conference-speaker-card__bio text-sm text-text2 mt-2 leading-relaxed">
                      {speaker.bio}
                    </p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </ConferenceSectionShell>
  )
}
