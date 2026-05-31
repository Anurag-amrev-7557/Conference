import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { useConferenceContent } from '../../../hooks/useConferenceContent'
import { resolveConferenceVideoMedia, CONFERENCE_HERO_VIDEO_PUBLIC } from '../../../lib/conferenceDefaults'
import { resolveAssetUrl, resolveMediaUrl } from '../../../lib/assetUrl'
import { ConferenceSectionHeader } from './ConferenceSectionHeader'
import { ConferenceSectionShell } from './ConferenceSectionShell'

export function ConferenceVideo() {
  const { video, sections } = useConferenceContent()
  const copy = sections.video
  const block = video ?? {}
  const { videoSrc: rawVideoSrc, posterSrc } = resolveConferenceVideoMedia(block)
  const videoSrc = resolveMediaUrl(rawVideoSrc, CONFERENCE_HERO_VIDEO_PUBLIC)
  const poster = resolveAssetUrl(posterSrc) || posterSrc
  const videoRef = useRef<HTMLVideoElement>(null)
  const [useVideo, setUseVideo] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setUseVideo(false)
      el.pause()
      return
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [videoSrc])

  const startPlayback = () => {
    const el = videoRef.current
    if (!el) return
    void el.play().catch(() => setUseVideo(false))
  }

  return (
    <ConferenceSectionShell
      id="conference-video"
      sectionClass="conference-video-section"
      visibleClass="conference-video-section--visible"
      variant="muted"
    >
      <ConferenceSectionHeader
        copy={copy}
        fallback={
          <>
            The summit <span className="italic editorial-accent">in motion</span>
          </>
        }
        ledeFallback="Step inside the energy of the event — keynotes, workshops, and the conversations that shape what ships next."
      />

      <div className="conference-video-frame">
        {useVideo ? (
          <video
            ref={videoRef}
            className="conference-video-frame__player"
            playsInline
            controls={isPlaying}
            preload="metadata"
            poster={poster}
            onError={() => setUseVideo(false)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <div
            className="conference-video-frame__poster"
            style={{ backgroundImage: `url(${poster})` }}
            role="img"
            aria-label="Summit preview"
          />
        )}

        {useVideo && !isPlaying && (
          <button
            type="button"
            className="conference-video-frame__play"
            onClick={startPlayback}
            aria-label="Play summit video"
          >
            <span className="conference-video-frame__play-ring" aria-hidden />
            <Play className="h-7 w-7 text-white" fill="currentColor" aria-hidden />
          </button>
        )}
      </div>
    </ConferenceSectionShell>
  )
}
