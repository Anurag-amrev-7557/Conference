import { ArrowUpRight } from 'lucide-react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'
import { SponsorsMarquee } from './SponsorsMarquee'
import { resolveCtaHref, resolveCtaLabel, SectionCtaLink } from '../../../lib/sectionCta'

const SPONSOR_CTA_LABEL = 'Become a sponsor'

export function ConferenceSponsors() {
  const { logos, sections } = useConferenceContent()
  const copy = sections.sponsors ?? sections.socialProof

  const ctaLabel = resolveCtaLabel(copy?.ctaLabel, SPONSOR_CTA_LABEL)
  const ctaHref = resolveCtaHref(copy?.ctaHref, '/register')

  const headerActions = (
    <SectionCtaLink href={ctaHref} className="conference-section__cta-btn group">
      {ctaLabel}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </SectionCtaLink>
  )

  const hasContent = logos.length > 0

  return (
    <ConferenceSectionShell
      id="conference-sponsors"
      sectionClass="conference-sponsors-section"
      visibleClass="conference-sponsors-section--visible"
      variant="muted"
      fullBleed={hasContent ? <SponsorsMarquee logos={logos} /> : null}
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            Our <span className="editorial-accent">sponsors</span>
          </>
        }
        ledeFallback="Proudly supported by teams building the infrastructure and workflows behind modern AI."
        ledeClassName="conference-sponsors-section__lede"
        titleClassName="conference-sponsors-section__title"
        actions={headerActions}
      />

      {!hasContent ? (
        <div className="conference-sponsors-empty">
          <p className="conference-sponsors-empty__title">
            {copy?.emptyStateTitle?.trim() || 'Sponsor lineup coming soon'}
          </p>
          <p className="conference-sponsors-empty__copy">
            {copy?.emptyStateBody?.trim() ||
              'Partner with Superhumanly Summit to reach 3,500+ AI leaders, operators, and builders.'}
          </p>
          <SectionCtaLink href={ctaHref} className="conference-section__cta-btn group">
            {resolveCtaLabel(copy?.emptyStateCtaLabel, ctaLabel)}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </SectionCtaLink>
        </div>
      ) : null}
    </ConferenceSectionShell>
  )
}
