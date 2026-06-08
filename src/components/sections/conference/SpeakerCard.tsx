import { useState } from 'react'
import { Mic2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { resolveAssetUrl } from '../../../lib/assetUrl'
import type { ConferenceSpeaker } from '../../../lib/websiteData'

type SpeakerCardProps = {
  speaker: ConferenceSpeaker
  priority?: boolean
  interactive?: boolean
  onSelect?: (speaker: ConferenceSpeaker) => void
  variant?: 'default' | 'compact'
  showTalkChip?: boolean
  showFeaturedBadge?: boolean
  featuredBadgeLabel?: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SpeakerCard({
  speaker,
  priority = false,
  interactive = false,
  onSelect,
  variant = 'default',
  showTalkChip = true,
  showFeaturedBadge = false,
  featuredBadgeLabel = 'Featured',
}: SpeakerCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSrc = resolveAssetUrl(speaker.image)?.trim()
  const showImage = Boolean(imageSrc) && !imageFailed

  const name = speaker.name.trim()
  const initials = getInitials(name)
  const title = speaker.title?.trim() ?? ''
  const company = speaker.company?.trim() ?? ''
  const talkTitle = speaker.talkTitle?.trim() ?? ''
  const hasMeta = Boolean(title || company)
  const hasSession = Boolean(talkTitle) && showTalkChip && variant === 'default'
  const isCompact = variant === 'compact'
  const isInteractive = interactive && Boolean(onSelect)

  const Root = isInteractive ? 'button' : 'article'

  return (
    <Root
      type={isInteractive ? 'button' : undefined}
      className={cn(
        'speaker-card',
        isCompact && 'speaker-card--compact',
        isInteractive && 'speaker-card--interactive',
      )}
      onClick={isInteractive && onSelect ? () => onSelect(speaker) : undefined}
      aria-label={isInteractive ? `View profile for ${name}` : undefined}
    >
      <div className="speaker-card__media-shell">
        <div className="speaker-card__media">
          {showImage ? (
            <img
              src={imageSrc}
              alt={name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="speaker-card__photo"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="speaker-card__fallback" aria-hidden>
              <span className="speaker-card__initials">{initials || '?'}</span>
            </div>
          )}
          {showFeaturedBadge && speaker.featured ? (
            <span className="speaker-card__featured-badge">{featuredBadgeLabel}</span>
          ) : null}
          <div className="speaker-card__media-shade" aria-hidden />
        </div>
      </div>

      <div className="speaker-card__body">
        <h3 className="speaker-card__name" title={name}>
          {name}
        </h3>

        {hasMeta ? (
          <div className="speaker-card__meta">
            {title ? (
              <p className="speaker-card__role" title={title}>
                {title}
              </p>
            ) : null}
            {company ? (
              <p className="speaker-card__company" title={company}>
                {company}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasSession ? (
          <div className="speaker-card__session">
            <Mic2 className="speaker-card__session-icon" aria-hidden />
            <p className="speaker-card__session-text" title={talkTitle}>
              {talkTitle}
              {speaker.timeSlot?.trim() ? (
                <span className="speaker-card__session-time"> · {speaker.timeSlot}</span>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
    </Root>
  )
}
