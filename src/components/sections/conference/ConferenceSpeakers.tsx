import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import {
  getFeaturedSpeakers,
  getPublishableSpeakers,
} from '../../../lib/speakers'
import type { ConferenceSectionCopy } from '../../../lib/websiteData'
import { SpeakerDetailDialog } from '../../speakers/SpeakerDetailDialog'
import { SectionCarousel, SectionCarouselItem } from '../SectionCarousel'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'
import { SpeakerCard } from './SpeakerCard'
import type { ConferenceSpeaker } from '../../../lib/websiteData'

function getSpeakersSectionCtaLabel(
  copy: ConferenceSectionCopy | undefined,
  speakerCount: number,
): string {
  const cms = copy?.ctaLabel?.trim()
  if (cms && !/agenda/i.test(cms)) {
    return cms
  }
  if (speakerCount > 0) {
    return `Meet all ${speakerCount} speakers`
  }
  return 'Meet all speakers'
}

export function ConferenceSpeakers() {
  const { speakers, sections } = useConferenceContent()
  const copy = sections.speakers
  const publishableSpeakers = useMemo(() => getPublishableSpeakers(speakers), [speakers])
  const featuredSpeakers = useMemo(() => getFeaturedSpeakers(speakers), [speakers])
  const [selectedSpeaker, setSelectedSpeaker] = useState<ConferenceSpeaker | null>(null)

  const lede =
    copy?.lede?.trim() ||
    (publishableSpeakers.length > 0
      ? `Featuring ${featuredSpeakers.length} of ${publishableSpeakers.length} summit voices — innovators and leaders shaping the future of AI.`
      : 'Learn directly from the innovators and leaders who are shaping the future of AI.')

  const catalogCta =
    publishableSpeakers.length > 0 ? (
      <Link to="/speakers" className="conference-section__cta-btn group">
        {getSpeakersSectionCtaLabel(copy, publishableSpeakers.length)}
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </Link>
    ) : null

  return (
    <>
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
              Featured <span className="editorial-accent">Speakers</span>
            </>
          }
          lede={lede}
          actions={catalogCta}
        />

        {featuredSpeakers.length === 0 ? (
          <p className="conference-speakers-empty">
            {publishableSpeakers.length > 0
              ? 'No speakers are featured on the homepage yet. In the admin, open Summit → Lists → Speakers and check “Featured on summit homepage”.'
              : 'Speaker lineup coming soon.'}
          </p>
        ) : (
          <SectionCarousel
            ariaLabel="Featured speakers"
            variant="speakers"
            showScrollHints
          >
            {featuredSpeakers.map((speaker, idx) => (
              <SectionCarouselItem
                key={speaker.id}
                className="speaker-card-item"
                style={{ '--speaker-i': idx } as CSSProperties}
              >
                <SpeakerCard
                  speaker={speaker}
                  priority={idx < 2}
                  interactive
                  showFeaturedBadge
                  showTalkChip
                  onSelect={setSelectedSpeaker}
                />
              </SectionCarouselItem>
            ))}
          </SectionCarousel>
        )}
      </ConferenceSectionShell>

      <SpeakerDetailDialog
        speaker={selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </>
  )
}
