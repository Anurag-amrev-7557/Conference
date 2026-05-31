import { useEffect, useRef, type CSSProperties } from "react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { pillarIcons } from "../../lib/websiteData"
import { renderSectionHeading } from "../../lib/renderSectionTitle"

export function WhoWeAreSection() {
  const { data } = useWebsiteData()
  const { stats, pillars, settings } = data
  const { visibility } = settings
  const copy = settings.sections?.whoWeAre
  const showStats = visibility.stats !== false
  const showPillars = visibility.pillars !== false
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("who-section--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="who-we-are" className="who-section premium-home-section">
      <div className="who-section__ambient" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <div className="who-section__intro grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start mb-12 sm:mb-14 lg:mb-16">
          <div className="lg:col-span-7">
            <div className="editorial-eyebrow mb-5 sm:mb-6">
              <span className="editorial-eyebrow__rule" aria-hidden />
              <span className="section-eyebrow !mb-0 text-muted">
                {copy?.eyebrow?.trim() || "Who We Are"}
              </span>
            </div>

            <h2 className="editorial-heading editorial-heading--who mb-6">
              {renderSectionHeading(copy, (
                <>
                  Built by founders,
                  <br />
                  <span className="italic editorial-accent">for founders</span>.
                </>
              ))}
            </h2>

            <p className="editorial-lede max-w-xl">
              {copy?.lede?.trim() ||
                "The definitive playbook for small business owners who want to harness AI — without jargon, complexity, or hiring a developer."}
            </p>
          </div>

          {showStats ? (
          <ul className="who-section__stats lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5 list-none p-0 m-0">
            {stats.map((stat, idx) => (
              <li
                key={stat.id}
                className="who-stat-card"
                style={{ "--stat-i": idx } as CSSProperties}
              >
                <p className="who-stat-card__value">{stat.value}</p>
                <p className="who-stat-card__label">{stat.label}</p>
              </li>
            ))}
          </ul>
          ) : null}
        </div>

        {showPillars ? (
        <ul className="who-section__pillars grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 list-none p-0 m-0">
          {pillars.map((pillar, idx) => {
            const Icon = pillarIcons[pillar.iconName]
            return (
              <li
                key={pillar.id}
                className="who-pillar-card group"
                style={{ "--pillar-i": idx } as CSSProperties}
              >
                <div className="who-pillar-card__icon" aria-hidden>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <h3 className="who-pillar-card__title">{pillar.title}</h3>
                <p className="who-pillar-card__desc">{pillar.description}</p>
              </li>
            )
          })}
        </ul>
        ) : null}
      </div>
    </section>
  )
}
