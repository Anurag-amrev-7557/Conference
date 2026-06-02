import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { resolveAssetUrl } from '../../../lib/assetUrl'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

export function ConferencePartners() {
  const { partners, sections } = useConferenceContent()
  const copy = sections.partners

  if (!partners?.length) return null

  return (
    <ConferenceSectionShell
      id="conference-partners"
      sectionClass="conference-partners-section"
      visibleClass="conference-partners-section--visible"
      variant="white"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Community <span className="editorial-accent">partners</span>
          </>
        }
        ledeFallback="Organizations collaborating to make the summit possible."
      />

      <ul className="conference-partners-grid list-none p-0 m-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-6">
        {partners.map((partner) => (
          <li key={partner.id} className="conference-partner-tile flex items-center justify-center p-6 rounded-2xl border border-black/8 bg-white/80">
            {partner.logoUrl?.trim() ? (
              partner.websiteUrl?.trim() ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={resolveAssetUrl(partner.logoUrl)}
                    alt={partner.logoAlt || partner.name}
                    className="max-h-12 w-auto object-contain"
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={resolveAssetUrl(partner.logoUrl)}
                  alt={partner.logoAlt || partner.name}
                  className="max-h-12 w-auto object-contain"
                  loading="lazy"
                />
              )
            ) : (
              <span className="text-sm font-semibold text-muted text-center">{partner.name}</span>
            )}
          </li>
        ))}
      </ul>
    </ConferenceSectionShell>
  )
}
