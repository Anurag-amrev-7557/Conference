import { useEffect, useRef, type CSSProperties } from "react"
import { Globe, ArrowRight } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { perkIcons } from "../../lib/websiteData"
import { renderSectionHeading } from "../../lib/renderSectionTitle"
import { Link } from "react-router-dom"

const FOUNDER_NODES = [
  { initials: "AK", hue: 215 },
  { initials: "MR", hue: 220 },
  { initials: "JL", hue: 210 },
  { initials: "SC", hue: 225 },
] as const

export function CommunitySection() {
  const { data } = useWebsiteData()
  const { perks, settings } = data
  const copy = settings.sections?.community
  const showPerks = settings.visibility.perks !== false
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("community-section--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="community" className="community-section">
      <div className="community-section__ambient" aria-hidden />
      <div className="community-section__globe" aria-hidden>
        <Globe className="w-64 h-64 text-accent" />
      </div>

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <header className="community-section__header flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16 lg:mb-20">
          <div className="editorial-eyebrow editorial-eyebrow--center mb-6 sm:mb-7">
            <span className="editorial-eyebrow__rule" aria-hidden />
            <span className="section-eyebrow !mb-0 text-muted">
              {copy?.eyebrow?.trim() || "Community Registry"}
            </span>
            <span className="editorial-eyebrow__rule" aria-hidden />
          </div>

          <h2 className="editorial-heading editorial-heading--section mb-6 sm:mb-8 max-w-3xl">
            {renderSectionHeading(copy, (
              <>
                Join the <span className="editorial-accent">Global Index</span> of Founders.
              </>
            ))}
          </h2>

          <p className="editorial-lede max-w-2xl mb-9 sm:mb-10">
            {copy?.lede?.trim() ||
              "An elite network of 2,500+ builders and innovators orchestrating automated business systems. Scale your brand alongside the best."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <Link
              to={copy?.ctaHref?.trim() || "/community"}
              className="btn-cta-primary group w-full sm:w-auto justify-center"
            >
              {copy?.ctaLabel?.trim() || "Apply for Access"}
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>

            <div
              className="flex items-center gap-4"
              aria-label={copy?.founderCountLabel?.trim() || "2,500+ active founders"}
            >
              <div className="flex -space-x-2.5">
                {FOUNDER_NODES.map((node) => (
                  <div
                    key={node.initials}
                    className="community-founder-node"
                    style={
                      {
                        "--node-hue": node.hue,
                      } as CSSProperties
                    }
                  >
                    <span className="sr-only">Founder {node.initials}</span>
                    <span aria-hidden>{node.initials}</span>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-text tracking-tight">+2.5K active</p>
                <p className="text-xs text-text2/80 uppercase tracking-[0.12em]">Founder nodes</p>
              </div>
            </div>
          </div>
        </header>

        {showPerks ? (
        <ul className="community-perks grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 list-none p-0 m-0">
          {perks.map((perk, idx) => {
            const Icon = perkIcons[perk.iconName]
            return (
              <li
                key={perk.id ?? idx}
                className="community-perk-card group"
                style={{ "--perk-i": idx } as CSSProperties}
              >
                <div className="community-perk-card__icon" aria-hidden>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <p className="community-perk-card__label">{perk.label}</p>
                <h3 className="community-perk-card__title">{perk.title}</h3>
                <p className="community-perk-card__desc">{perk.description}</p>
              </li>
            )
          })}
        </ul>
        ) : null}
      </div>
    </section>
  )
}
