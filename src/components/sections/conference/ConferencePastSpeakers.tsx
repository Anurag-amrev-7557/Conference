import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import {
  getHomepagePastSpeakers,
  getPastSpeakers,
  getSpeakerEditions,
} from '../../../lib/speakers'
import { resolveCtaHref, SectionCtaLink } from '../../../lib/sectionCta'
import type { ConferenceSpeaker } from '../../../lib/websiteData'
import { SpeakerDetailDialog } from '../../speakers/SpeakerDetailDialog'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'
import { PastSpeakerEditionTabs } from './PastSpeakerEditionTabs'

const DEFAULT_MAX_PAST = 12

export function ConferencePastSpeakers() {
  const conference = useConferenceContent()
  const { speakers, sections } = conference
  const copy = sections.pastSpeakers
  const [selectedSpeaker, setSelectedSpeaker] = useState<ConferenceSpeaker | null>(null)

  const pastSpeakers = useMemo(() => getPastSpeakers(speakers), [speakers])

  const editionLabels = useMemo(() => getSpeakerEditions(speakers, 'past'), [speakers])

  const editions = useMemo(() => {
    if (editionLabels.length === 0) return []
    return [
      { id: 'all', label: 'All editions' },
      ...editionLabels.map((edition) => ({ id: edition, label: edition })),
    ]
  }, [editionLabels])

  const cappedSpeakers = useMemo(
    () =>
      getHomepagePastSpeakers(speakers, {
        homepagePastSpeakerIds: conference.homepagePastSpeakerIds,
        maxPast: conference.maxPastSpeakers ?? DEFAULT_MAX_PAST,
        edition: 'all',
      }),
    [speakers, conference.homepagePastSpeakerIds, conference.maxPastSpeakers],
  )

  const speakersByEdition = useMemo(() => {
    const maxPast = conference.maxPastSpeakers ?? DEFAULT_MAX_PAST
    const map = new Map<string, ConferenceSpeaker[]>()

    for (const edition of getSpeakerEditions(speakers, 'past')) {
      map.set(
        edition,
        getHomepagePastSpeakers(speakers, {
          homepagePastSpeakerIds: conference.homepagePastSpeakerIds,
          maxPast,
          edition,
        }),
      )
    }

    return map
  }, [speakers, conference.homepagePastSpeakerIds, conference.maxPastSpeakers])

  if (pastSpeakers.length === 0) return null
  const catalogCta = (
    <SectionCtaLink
      href={resolveCtaHref(copy?.ctaHref, '/speakers?roster=past')}
      className="conference-section__cta-btn conference-section__cta-btn--lg group"
    >
      {copy?.ctaLabel?.trim() || 'Explore the full archive'}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </SectionCtaLink>
  )

  return (
    <>
      <ConferenceSectionShell
        id="conference-past-speakers"
        sectionClass="conference-past-speakers-section"
        visibleClass="conference-past-speakers-section--visible"
        variant="white"
      >
        <ConferenceSectionHeader
          copy={copy}
          fallback={
            <>
              Past <span className="editorial-accent">Speakers</span>
            </>
          }
          ledeFallback="Leaders who have taken the Superhumanly stage — across editions."
          actions={catalogCta}
        />

        <PastSpeakerEditionTabs
          editions={editions}
          speakersByEdition={speakersByEdition}
          allSpeakers={cappedSpeakers}
          onSelect={setSelectedSpeaker}
        />
      </ConferenceSectionShell>

      <SpeakerDetailDialog
        speaker={selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </>
  )
}
