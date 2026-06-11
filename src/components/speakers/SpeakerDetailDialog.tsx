import * as Dialog from '@radix-ui/react-dialog'
import { Mic2, X } from 'lucide-react'
import { useState } from 'react'
import { resolveAssetUrl } from '../../lib/assetUrl'
import type { ConferenceSpeaker } from '../../lib/websiteData'

type SpeakerDetailDialogProps = {
  speaker: ConferenceSpeaker | null
  onClose: () => void
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function SpeakerDetailDialog({ speaker, onClose }: SpeakerDetailDialogProps) {
  const [imageFailedById, setImageFailedById] = useState<Record<string, boolean>>({})

  const open = Boolean(speaker)
  const imageFailed = speaker ? Boolean(imageFailedById[speaker.id]) : false
  const imageSrc = speaker ? resolveAssetUrl(speaker.image)?.trim() : ''
  const showImage = Boolean(imageSrc) && !imageFailed
  const initials = speaker ? getInitials(speaker.name) : ''
  const hasMeta = Boolean(speaker?.title?.trim() || speaker?.company?.trim())
  const hasBio = Boolean(speaker?.bio?.trim())
  const hasSession = Boolean(speaker?.talkTitle?.trim())
  const edition = speaker?.edition?.trim()
  const isAlumni = speaker?.roster === 'past'
  const linkedIn = speaker?.linkedIn?.trim()
  const twitter = speaker?.twitter?.trim()

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="speaker-detail-dialog__overlay" />
        <Dialog.Content className="speaker-detail-dialog__content">
          <div className="speaker-detail-dialog__header">
            <div className="speaker-detail-dialog__heading">
              <Dialog.Title className="speaker-detail-dialog__title">
                {speaker?.name}
              </Dialog.Title>
              {hasMeta ? (
                <Dialog.Description className="speaker-detail-dialog__subtitle">
                  {[speaker?.title?.trim(), speaker?.company?.trim()].filter(Boolean).join(' · ')}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">
                  {speaker?.name ?? 'Speaker details'}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              type="button"
              className="speaker-detail-dialog__close"
              aria-label="Close speaker details"
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          {speaker ? (
            <div className="speaker-detail-dialog__body">
              <div className="speaker-detail-dialog__media">
                {showImage ? (
                  <img
                    src={imageSrc}
                    alt={speaker.name}
                    className="speaker-detail-dialog__photo"
                    onError={() => {
                      if (!speaker) return
                      setImageFailedById((prev) => ({ ...prev, [speaker.id]: true }))
                    }}
                  />
                ) : (
                  <div className="speaker-detail-dialog__fallback" aria-hidden>
                    <span>{initials || speaker.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="speaker-detail-dialog__details">
                {isAlumni && edition ? (
                  <p className="speaker-detail-dialog__edition">
                    Summit {edition}
                  </p>
                ) : null}
                {hasSession ? (
                  <div className="speaker-detail-dialog__session">
                    <Mic2 className="speaker-detail-dialog__session-icon" aria-hidden />
                    <div>
                      <p className="speaker-detail-dialog__session-title">{speaker.talkTitle}</p>
                      {speaker.timeSlot?.trim() ? (
                        <p className="speaker-detail-dialog__session-time">{speaker.timeSlot}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {hasBio ? <p className="speaker-detail-dialog__bio">{speaker.bio}</p> : null}

                {linkedIn || twitter ? (
                  <div className="speaker-detail-dialog__links">
                    {linkedIn ? (
                      <a
                        href={linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="speaker-detail-dialog__link"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {twitter ? (
                      <a
                        href={twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="speaker-detail-dialog__link"
                      >
                        X / Twitter
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
