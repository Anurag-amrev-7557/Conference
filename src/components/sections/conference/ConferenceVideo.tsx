import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Play, RotateCcw } from 'lucide-react';
import { useConferenceContent } from '../../../hooks/useConferenceContent';
import {
  resolveConferenceVideoMedia,
  CONFERENCE_HERO_VIDEO_PUBLIC,
  normalizeRegisterCtaLabel,
} from '../../../lib/conferenceDefaults';
import { resolveAssetUrl, resolveMediaUrl } from '../../../lib/assetUrl';
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  parseYouTubeStartSeconds,
  parseYouTubeVideoId,
} from '../../../lib/youtube';
import { ConferenceSectionHeader } from './ConferenceSectionHeader';
import { ConferenceSectionShell } from './ConferenceSectionShell';
import { resolveCtaHref, resolveCtaLabel, SectionCtaLink } from '../../../lib/sectionCta';

function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ConferenceVideo() {
  const { video, sections, hero } = useConferenceContent();
  const copy = sections.video;
  const block = video ?? {};
  const { videoSrc: rawVideoSrc, posterSrc } = resolveConferenceVideoMedia(block);
  const youtubeId = parseYouTubeVideoId(rawVideoSrc);
  const youtubeStartSeconds = parseYouTubeStartSeconds(rawVideoSrc);
  const isYouTube = Boolean(youtubeId);
  const videoSrc = isYouTube ? '' : resolveMediaUrl(rawVideoSrc, CONFERENCE_HERO_VIDEO_PUBLIC);
  const poster =
    resolveAssetUrl(posterSrc) || posterSrc || (youtubeId ? getYouTubeThumbnail(youtubeId) : '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(() => !prefersReducedMotion());
  const [embedActive, setEmbedActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [durationLabel, setDurationLabel] = useState('');

  const caption =
    copy?.caption?.trim() ||
    'Official summit highlight — keynotes, workshops, and the conversations that shape what ships next.';
  const registerLabel = normalizeRegisterCtaLabel(
    copy?.ctaLabel?.trim() || hero.primaryCtaLabel || 'Register for the summit',
  );
  const metricSource = copy?.metrics?.length ? copy.metrics : hero.metrics;
  const metrics = metricSource
    .filter((metric) => metric.value?.trim() && metric.label?.trim())
    .slice(0, 3);

  useEffect(() => {
    if (isYouTube) return;

    const el = videoRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.pause();
      return;
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => {
      setDurationLabel(formatVideoDuration(el.duration));
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('loadedmetadata', onLoadedMetadata);

    if (el.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [isYouTube, videoSrc]);

  const startPlayback = () => {
    if (isYouTube && youtubeId) {
      setVideoError(false);
      setEmbedActive(true);
      setIsPlaying(true);
      return;
    }

    const el = videoRef.current;
    if (!el) return;
    setVideoError(false);
    void el.play().catch(() => {
      setVideoError(true);
      setUseVideo(false);
    });
  };

  const retryVideo = () => {
    setVideoError(false);
    setUseVideo(true);
    setEmbedActive(false);
    setIsPlaying(false);
  };

  const showPlayButton = !videoError && !isPlaying && (isYouTube ? !embedActive : useVideo);

  const headerActions = (
    <div className="conference-video-actions">
      <SectionCtaLink
        href={resolveCtaHref(copy?.ctaHref, '/register')}
        className="conference-section__cta-btn conference-section__cta-btn--primary group"
      >
        {registerLabel}
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </SectionCtaLink>
      <SectionCtaLink
        href={resolveCtaHref(
          copy?.secondaryCtaHref,
          resolveCtaHref(hero.secondaryCtaHref, '#conference-agenda'),
        )}
        className="conference-section__cta-btn group"
      >
        {resolveCtaLabel(
          copy?.secondaryCtaLabel,
          hero.secondaryCtaLabel?.trim() || 'See full agenda',
        )}
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </SectionCtaLink>
    </div>
  );

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
            The summit <span className="editorial-accent">in motion</span>
          </>
        }
        ledeFallback="Step inside the energy of Superhumanly Summit — keynotes, workshops, and the conversations that shape what ships next."
        actions={headerActions}
      />

      <div className="conference-video-stage">
        <div className="conference-video-frame">
          <div className="conference-video-frame__glow" aria-hidden />

          {isYouTube && embedActive && youtubeId ? (
            <iframe
              className="conference-video-frame__embed"
              src={getYouTubeEmbedUrl(youtubeId, true, youtubeStartSeconds)}
              title="Summit highlight video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : useVideo && !isYouTube ? (
            <video
              ref={videoRef}
              className="conference-video-frame__player"
              playsInline
              controls={isPlaying}
              preload="metadata"
              poster={poster}
              onError={() => {
                setVideoError(true);
                setUseVideo(false);
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div
              className="conference-video-frame__poster"
              style={poster ? { backgroundImage: `url(${poster})` } : undefined}
              role="img"
              aria-label="Summit preview"
            />
          )}

          <div className="conference-video-frame__vignette" aria-hidden />

          {showPlayButton ? (
            <button
              type="button"
              className="conference-video-frame__play"
              onClick={startPlayback}
              aria-label={`Play summit video${durationLabel ? `, ${durationLabel}` : ''}`}
            >
              <span className="conference-video-frame__play-core">
                <span className="conference-video-frame__play-icon" aria-hidden>
                  <Play className="conference-video-frame__play-glyph" fill="currentColor" />
                </span>
                <span className="conference-video-frame__play-copy">
                  <span className="conference-video-frame__play-label">Watch highlight</span>
                  {durationLabel ? (
                    <span className="conference-video-frame__play-duration">{durationLabel}</span>
                  ) : null}
                </span>
              </span>
            </button>
          ) : null}

          {videoError ? (
            <div className="conference-video-frame__error">
              <p>Video unavailable right now.</p>
              <button type="button" className="conference-video-frame__retry" onClick={retryVideo}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try again
              </button>
            </div>
          ) : null}
        </div>

        <p className="conference-video-caption">{caption}</p>

        {metrics.length > 0 ? (
          <div className="conference-video-metrics" aria-label="Summit highlights">
            {metrics.map((metric, index) => (
              <div
                key={metric.id}
                className="conference-video-metric"
                style={{ '--video-metric-i': index } as CSSProperties}
              >
                <span className="conference-video-metric__value">{metric.value}</span>
                <span className="conference-video-metric__label">{metric.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </ConferenceSectionShell>
  );
}
