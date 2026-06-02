import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { ConferenceSectionShell } from './ConferenceSectionShell'

export function ConferenceVenue() {
  const { venue } = useConferenceContent()
  if (!venue?.title && !venue?.address && !venue?.mapEmbedUrl) return null

  return (
    <ConferenceSectionShell
      id="conference-venue"
      sectionClass="conference-venue-section"
      visibleClass="conference-venue-section--visible"
      variant="light"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            {venue.eyebrow ? (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                {venue.eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text mb-4">
              {venue.title || 'Venue'}
            </h2>
            {venue.lede ? <p className="text-text2 leading-relaxed mb-4">{venue.lede}</p> : null}
            {venue.address ? (
              <p className="text-sm text-muted font-medium">{venue.address}</p>
            ) : null}
          </div>
          {venue.mapEmbedUrl ? (
            <div className="rounded-2xl overflow-hidden border border-black/10 aspect-video min-h-[240px]">
              <iframe
                title="Venue map"
                src={venue.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>
      </div>
    </ConferenceSectionShell>
  )
}
