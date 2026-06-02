import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useConferenceReveal } from "../../../context/ConferenceRevealContext"
import { useConferenceContent } from "../../../hooks/useConferenceContent"
import { normalizeRegisterCtaLabel, resolveConferenceHeroMedia, CONFERENCE_HERO_LOGO_PUBLIC, CONFERENCE_HERO_VIDEO_PUBLIC } from "../../../lib/conferenceDefaults"
import { resolveMediaUrl } from "../../../lib/assetUrl"

const revealEase = [0.22, 1, 0.36, 1] as const

export function ConferenceHero() {
  const conference = useConferenceContent()
  const { hero } = conference
  const { videoSrc: rawVideoSrc, posterSrc: rawPosterSrc } = resolveConferenceHeroMedia(hero)
  const videoSrc = resolveMediaUrl(rawVideoSrc, CONFERENCE_HERO_VIDEO_PUBLIC)
  const posterSrc = resolveMediaUrl(rawPosterSrc) || rawPosterSrc
  const { heroRevealReady, heroEntranceFast } = useConferenceReveal()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [useVideo, setUseVideo] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  const entranceDuration = heroEntranceFast ? 0.48 : 0.55
  const delay = (step: number) =>
    heroRevealReady
      ? heroEntranceFast
        ? step * 0.03
        : step * 0.07 + (step > 0 ? 0.05 : 0)
      : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) {
      setUseVideo(false)
      setVideoReady(false)
      video.pause()
      return
    }

    const onCanPlay = () => {
      setVideoReady(true)
      void video.play().catch(() => setUseVideo(false))
    }

    if (video.readyState >= 2) onCanPlay()
    else video.addEventListener("canplay", onCanPlay, { once: true })

    return () => video.removeEventListener("canplay", onCanPlay)
  }, [videoSrc])

  return (
    <section id="conference-hero" className="conference-hero">
      <div className="conference-hero__stage">
        <div className="conference-hero__media" aria-hidden>
          <div
            className="conference-hero__poster"
            style={{ backgroundImage: `url(${posterSrc})` }}
          />
          {useVideo ? (
            <video
              ref={videoRef}
              className={`conference-hero__video${videoReady ? " conference-hero__video--ready" : ""}`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={posterSrc}
              onError={() => {
                setUseVideo(false)
                setVideoReady(false)
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : null}
          <div className="conference-hero__shade" />
          <div className="conference-hero__vignette" />
          <div className="conference-hero__bottom-depth" />
        </div>

        <div className="conference-hero__content">
          <motion.div
            initial={false}
            animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: entranceDuration, delay: delay(0), ease: revealEase }}
            className={`conference-hero__badge${hero.badgeLogoUrl?.trim() ? " conference-hero__badge--logo" : ""}`}
          >
            {hero.badgeLogoUrl?.trim() ? (
              <img
                src={resolveMediaUrl(hero.badgeLogoUrl.trim(), CONFERENCE_HERO_LOGO_PUBLIC)}
                alt={hero.badge || "Superhumanly AI"}
                className="conference-hero__badge-logo"
              />
            ) : (
              <>
                <SparklesIcon className="h-3.5 w-3.5" />
                {hero.badge}
              </>
            )}
          </motion.div>

          <motion.h1
            id="conference-hero-heading"
            tabIndex={-1}
            initial={false}
            animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: entranceDuration, delay: delay(1), ease: revealEase }}
            className="conference-hero__title"
          >
            {hero.title}
            {hero.titleAccent ? (
              <>
                {" "}
                <span className="conference-hero__title-accent">{hero.titleAccent}</span>
              </>
            ) : null}
          </motion.h1>

          <motion.p
            initial={false}
            animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: entranceDuration, delay: delay(2), ease: revealEase }}
            className="conference-hero__lede"
          >
            {hero.lede}
          </motion.p>

          <motion.div
            initial={false}
            animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: entranceDuration, delay: delay(3), ease: revealEase }}
            className="conference-hero__meta-row"
          >
            <MetaPill icon={<Calendar className="h-[1.0625rem] w-[1.0625rem]" />} label={hero.dateLabel} />
            <MetaPill icon={<MapPin className="h-[1.0625rem] w-[1.0625rem]" />} label={hero.locationLabel} />
          </motion.div>

          <motion.div
            initial={false}
            animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: entranceDuration, delay: delay(4), ease: revealEase }}
            className="conference-hero__cta-row"
          >
            <Link to="/register" className="conference-hero__cta-register">
              {normalizeRegisterCtaLabel(hero.primaryCtaLabel)}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={heroRevealReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: entranceDuration, delay: delay(5), ease: revealEase }}
          className="conference-hero__stats-dock"
          aria-label="Conference highlights"
        >
          <div className="conference-hero__stats-inner" role="list">
            {hero.metrics.map((metric) => (
              <div key={metric.id} className="conference-hero__metric" role="listitem">
                <span className="conference-hero__metric-value">{metric.value}</span>
                <span className="conference-hero__metric-label">{metric.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function MetaPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="conference-hero__meta-pill">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}
