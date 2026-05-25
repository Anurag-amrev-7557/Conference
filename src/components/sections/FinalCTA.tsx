import { useEffect, useRef } from "react"
import { WaitlistForm } from "../landing/WaitlistForm"
import { useWebsiteData } from "../WebsiteDataProvider"
import { renderSectionHeading } from "../../lib/renderSectionTitle"

export function FinalCTA({ forceDark = false }: { forceDark?: boolean }) {
  const { data } = useWebsiteData()
  const copy = data.settings.sections?.finalCta
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("final-cta-section--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="final-cta" className={`final-cta-section ${forceDark ? 'final-cta-section--dark' : ''}`}>
      <div className="final-cta-section__ambient" aria-hidden />
      <div className="final-cta-section__glow" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto flex justify-center">
        <div className="final-cta-section__shell">
          <header className="final-cta-section__header">
            <div className="editorial-eyebrow editorial-eyebrow--center mb-6 sm:mb-7">
              <span className="editorial-eyebrow__rule" aria-hidden />
              <span className="section-eyebrow !mb-0 text-muted">
                {copy?.eyebrow?.trim() || "Final Registry"}
              </span>
              <span className="editorial-eyebrow__rule" aria-hidden />
            </div>

            <h2 className="editorial-heading editorial-heading--cta">
              {renderSectionHeading(copy, (
                <>
                  Secure Your <span className="italic editorial-accent">Spot</span>.
                </>
              ))}
            </h2>

            <p className="editorial-lede final-cta-section__lede">
              {copy?.lede?.trim() ||
                "The architectural blueprint for automating your business with agentic AI — written for founders who ship, not slide decks."}
            </p>
          </header>

          <div className="final-cta-section__divider" aria-hidden />

          <div className="final-cta-section__form">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  )
}
