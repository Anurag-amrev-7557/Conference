import { useState } from "react"
import { Link } from "react-router-dom"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { Play, BookOpen, Sparkles } from "lucide-react"
import { MarketingService } from "../../lib/marketing"

export function HeroSection({ onBookDemo }: { onBookDemo: () => void }) {
  const { data } = useWebsiteData()
  const { hero } = data
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <section className="relative flex items-center overflow-hidden hero-aura-bg pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:min-h-screen lg:pb-20">
      <div className="hero-noise pointer-events-none" aria-hidden />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col xl:flex-row xl:items-center items-center gap-10 xl:gap-12 2xl:gap-16">
          <div className="w-full xl:w-1/2 2xl:w-[42%] flex flex-col items-start text-left">
            <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.28em] text-accent mb-3 sm:mb-4 ml-0.5">
              {hero.tagline}
            </p>

            <h1 className="text-[clamp(2rem,5.5vw,4.25rem)] font-sans font-bold leading-[1.06] tracking-tight text-text mb-5 sm:mb-6">
              {hero.headline}{" "}
              <span className="text-accent">{hero.headlineAccent}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-xl">
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
                Book a Demo
              </button>
              <Link
                to="/community"
                onClick={() => MarketingService.logEvent("cta_click", { cta_id: "founder_network", destination: "/community" })}
                className="btn-cta-secondary w-full sm:w-auto text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Join Founder Network
              </Link>
            </div>
          </div>

          <div className="w-full xl:w-1/2 2xl:w-[58%] flex items-center justify-center relative aspect-[16/10] sm:aspect-[16/9] xl:aspect-auto xl:min-h-[480px] xl:h-[560px] 2xl:h-[620px]">
            <div
              className="absolute inset-0 opacity-25 bg-gradient-to-br from-accent/25 to-accent2/10 rounded-[28px] blur-2xl pointer-events-none"
              aria-hidden
            />

            <div className="relative z-10 w-full h-full rounded-2xl sm:rounded-3xl lg:rounded-[40px] glow-border overflow-hidden group shadow-xl sm:shadow-2xl">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-[#091b36] via-[#0c2d5a] to-[#13407a]" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 group-hover/video:opacity-55 transition-opacity duration-300" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <BookOpen className="w-20 h-20 sm:w-28 sm:h-28 text-blue-300" />
                  </div>

                  <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover/video:scale-105">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </div>

                  <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/55 uppercase tracking-[0.32em]">
                      Watch the Overview
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-accent/50" />
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
