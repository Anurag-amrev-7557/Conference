import { useState } from "react"
import { Link } from "react-router-dom"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { Play } from "lucide-react"
import { MarketingService } from "../../lib/marketing"

export function HeroSection({ onBookDemo }: { onBookDemo: () => void }) {
  const { data } = useWebsiteData()
  const { hero, settings } = data
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const coverUrl = settings.book?.coverImageUrl?.trim()

  return (
    <section className="relative flex items-center overflow-hidden hero-premium-bg pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 lg:min-h-[88vh] lg:pb-24">
      <div className="hero-noise pointer-events-none" aria-hidden />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16 xl:gap-20">
          <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col items-start text-left">
            {hero.tagline ? (
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-text2 mb-4">
                {hero.tagline}
              </p>
            ) : null}

            <h1 className="font-sans font-semibold text-[clamp(2.125rem,4.8vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-text mb-6">
              {hero.headline}{" "}
              {hero.headlineAccent ? (
                <span className="font-semibold">{hero.headlineAccent}</span>
              ) : null}
            </h1>

            <p className="text-[17px] sm:text-lg text-text2 leading-relaxed mb-10 max-w-[32rem]">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onBookDemo()
                  MarketingService.logEvent("cta_click", { cta_id: "book_demo", destination: "lead_modal" })
                }}
                className="btn-cta-primary w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Book a demo
              </button>
              <Link
                to="/community"
                onClick={() => MarketingService.logEvent("cta_click", { cta_id: "founder_network", destination: "/community" })}
                className="btn-cta-secondary w-full sm:w-auto text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
              >
                Join founder network
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[52%] xl:w-[54%] flex items-center justify-center">
            <div className="relative w-full max-w-xl xl:max-w-none aspect-[16/10] rounded-2xl lg:rounded-3xl hero-media-frame overflow-hidden bg-off">
              {!isVideoPlaying ? (
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-pointer group/video"
                  onClick={() => {
                    setIsVideoPlaying(true)
                    MarketingService.logEvent("video_click", { video_id: "overview_video" })
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsVideoPlaying(true)
                    }
                  }}
                  aria-label="Play overview video"
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                  )}
                  <div className="absolute inset-0 bg-black/25 group-hover/video:bg-black/20 transition-colors" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-text flex items-center justify-center shadow-lg transition-transform group-hover/video:scale-105">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5 fill-current" />
                    </div>
                    <span className="text-[12px] font-medium text-white/90 tracking-wide">
                      Watch overview
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={hero.videoUrl || "https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0&modestbranding=1"}
                  title="Superhumanly AI Overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
