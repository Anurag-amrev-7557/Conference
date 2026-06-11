import { ChevronRight, UserRound } from 'lucide-react'
import { useState } from 'react'
import { resolveAssetUrl } from '../../lib/assetUrl'
import type { ConferenceSpeaker } from '../../lib/websiteData'

type SpeakerListRowProps = {
  speaker: ConferenceSpeaker
  onSelect: (speaker: ConferenceSpeaker) => void
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SpeakerListRow({ speaker, onSelect }: SpeakerListRowProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSrc = resolveAssetUrl(speaker.image)?.trim()
  const showImage = Boolean(imageSrc) && !imageFailed
  const initials = getInitials(speaker.name)

  return (
    <button
      type="button"
      className="speaker-list-row"
      onClick={() => onSelect(speaker)}
    >
      <div className="speaker-list-row__avatar" aria-hidden>
        {showImage ? (
          <img
            src={imageSrc}
            alt=""
            className="speaker-list-row__photo"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="speaker-list-row__fallback">
            {initials ? (
              initials
            ) : (
              <UserRound className="speaker-list-row__fallback-icon" />
            )}
          </span>
        )}
      </div>

      <div className="speaker-list-row__body">
        <h3 className="speaker-list-row__name">{speaker.name}</h3>
        {speaker.title?.trim() ? (
          <p className="speaker-list-row__role">{speaker.title}</p>
        ) : null}
        {speaker.company?.trim() ? (
          <p className="speaker-list-row__company">{speaker.company}</p>
        ) : null}
      </div>

      <ChevronRight className="speaker-list-row__chevron" aria-hidden />
    </button>
  )
}
