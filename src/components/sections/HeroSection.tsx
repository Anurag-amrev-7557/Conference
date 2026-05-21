import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Play } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { MarketingService } from "../../lib/marketing"
import { HeroAmbient } from "./HeroAmbient"

export function HeroSection({ onBookDemo }: { onBookDemo: () => void }) {
  const { data } = useWebsiteData()
  const { hero, settings } = data
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const coverUrl = settings.book?.coverImageUrl?.trim()

  return (
    <section className="relative w-full overflow-hidden hero-premium-bg pt-[5.25rem] sm:pt-28 lg:pt-[7.5rem] pb-14 sm:pb-20 lg:pb-24 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center">
      <HeroAmbient />
      <div className="hero-noise pointer-events-none" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-12 xl:gap-x-16 2xl:gap-x-20 gap-y-10 lg:gap-y-0 items-stretch">
          <div className="flex flex-col items-start text-left max-w-2xl lg:max-w-none lg:pr-4 xl:pr-5 lg:py-1">
            {hero.tagline ? (
              <div className="editorial-eyebrow mb-5 sm:mb-6">
                <span className="editorial-eyebrow__rule" aria-hidden />
                <span className="section-eyebrow !mb-0 text-muted">{hero.tagline}</span>
              </div>
            ) : null}

            <h1 className="editorial-heading editorial-heading--hero">
              {hero.headline}
              {hero.headlineAccent ? (
                <>
                  <br />
                  <span className="editorial-accent">{hero.headlineAccent}</span>
                </>
              ) : null}
            </h1>

            <p className="editorial-lede mt-7 sm:mt-8 mb-10 sm:mb-12 max-w-xl lg:max-w-2xl">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onBookDemo()
                  MarketingService.logEvent("cta_click", { cta_id: "book_demo", destination: "lead_modal" })
                }}
                className="btn-cta-primary w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text/20 focus-visible:ring-offset-2"
              >
                {hero.primaryCtaLabel?.trim() || "Book a demo"}
              </button>
              <Link
                to={hero.secondaryCtaHref?.trim() || "/community"}
                onClick={() =>
                  MarketingService.logEvent("cta_click", {
                    cta_id: "founder_network",
                    destination: "/community",
                  })
                }
                className="btn-cta-secondary group w-full sm:w-auto justify-center sm:justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text/15 focus-visible:ring-offset-2"
              >
                {hero.secondaryCtaLabel?.trim() || "Join founder network"}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="w-full flex min-h-[280px] sm:min-h-[320px] lg:min-h-0 lg:h-full">
            <div className="relative w-full aspect-[16/10] lg:aspect-auto hero-media-panel hero-media-surface">
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
                    <div className="absolute inset-0 hero-media-mesh" aria-hidden />
                  )}
                  <div
                    className={`absolute inset-0 transition-colors duration-300 ${
                      coverUrl ? "bg-black/20 group-hover/video:bg-black/15" : "bg-white/10"
                    }`}
                    aria-hidden
                  />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className={`w-14 h-14 sm:w-[4.25rem] sm:h-[4.25rem] rounded-full flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover/video:scale-[1.04] ${
                        coverUrl
                          ? "bg-white/95 text-text"
                          : "bg-white text-text border border-black/[0.06]"
                      }`}
                    >
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5 fill-current" />
                    </div>
                    <span
                      className={`text-[12px] font-medium tracking-wide ${
                        coverUrl ? "text-white/90" : "text-text2"
                      }`}
                    >
                      Watch overview
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={
                    hero.videoUrl ||
                    "https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0&modestbranding=1"
                  }
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
