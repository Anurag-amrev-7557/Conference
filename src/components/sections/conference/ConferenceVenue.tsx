import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

export function ConferenceVenue() {
  const { venue } = useConferenceContent()
  if (!venue?.title && !venue?.address && !venue?.mapEmbedUrl) return null

  return (
    <ConferenceSectionShell
      id="conference-venue"
      sectionClass="conference-venue-section"
      visibleClass="conference-venue-section--visible"
      variant="muted"
    >
      <ConferenceSectionHeader
        copy={{
          eyebrow: venue.eyebrow,
          title: venue.title,
          lede: venue.lede,
        }}
        fallback={venue.title || 'Venue'}
        centered={false}
        className="conference-venue-section__header"
      />

      <div className="conference-venue-grid">
        {venue.address ? (
          <p className="conference-venue-section__address">{venue.address}</p>
        ) : null}

        {venue.mapEmbedUrl ? (
          <div className="conference-venue-section__map">
            <iframe
              title="Venue map"
              src={venue.mapEmbedUrl}
              className="conference-venue-section__map-frame"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : null}
      </div>
    </ConferenceSectionShell>
  )
}
