import type { CSSProperties } from 'react'
import type { ConferenceLogo } from '../../../lib/websiteData'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { resolveAssetUrl } from '../../../lib/assetUrl'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

/** Repeat sponsors until the row is wide enough for ultra-wide viewports. */
function repeatForMarquee(logos: ConferenceLogo[], minCount = 14): ConferenceLogo[] {
  if (logos.length === 0) return []
  const out: ConferenceLogo[] = []
  while (out.length < minCount) {
    out.push(...logos)
  }
  return out
}

export function ConferenceSponsors() {
  const { logos, sections } = useConferenceContent()
  const copy = sections.sponsors ?? sections.socialProof

  const row = repeatForMarquee(logos)
  const trackItems = row.length > 0 ? [...row, ...row] : []
  const durationSec = Math.max(28, row.length * 3.2)

  return (
    <ConferenceSectionShell
      id="conference-sponsors"
      sectionClass="conference-sponsors-section"
      visibleClass="conference-sponsors-section--visible"
      variant="light"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Our <span className="editorial-accent">sponsors</span>
          </>
        }
        ledeFallback="Proudly supported by teams building the infrastructure and workflows behind modern AI."
      />

      {trackItems.length > 0 ? (
        <div
          className="conference-sponsors-marquee"
          aria-label="Sponsor logos"
          style={{ '--marquee-duration': `${durationSec}s` } as CSSProperties}
        >
          <div className="conference-sponsors-marquee__viewport">
            <ul className="conference-sponsors-marquee__track list-none p-0 m-0">
              {trackItems.map((logo, idx) => (
                <li key={`${logo.id}-${idx}`} className="conference-sponsor-logo">
                  {logo.logoUrl?.trim() ? (
                    logo.websiteUrl?.trim() ? (
                      <a
                        href={logo.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="conference-sponsor-logo__link"
                      >
                        <img
                          src={resolveAssetUrl(logo.logoUrl)}
                          alt={logo.logoAlt || logo.name}
                          className="conference-sponsor-logo__img"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <img
                        src={resolveAssetUrl(logo.logoUrl)}
                        alt={logo.logoAlt || logo.name}
                        className="conference-sponsor-logo__img"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <span>{logo.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </ConferenceSectionShell>
  )
}
