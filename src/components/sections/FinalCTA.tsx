import { useEffect, useRef, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { WaitlistForm } from "../landing/WaitlistForm"
import { useWebsiteData } from "../WebsiteDataProvider"
import { renderSectionHeading } from "../../lib/renderSectionTitle"
import { EditorialEyebrow } from "../ui/EditorialEyebrow"

const DEFAULT_TRUST_ITEMS = [
  "2,500+ on the registry",
  "Free agentic playbook",
  "No spam, ever",
] as const

const DEFAULT_PRIMARY = {
  label: "Register for the summit",
  href: "/register",
} as const

const DEFAULT_SECONDARY = {
  label: "View the agenda",
  href: "#conference-agenda",
} as const

const DEFAULT_FORM_NOTE = "Join 2,500+ founders — playbook in your inbox in minutes."

const DEFAULT_WAITLIST = {
  submitLabel: "Get the playbook",
  placeholder: "you@company.com",
  guideLabel: "Exclusive guide · Building AI agents",
  successTitle: "You're on the list",
  successCopy: "Check your inbox — the playbook arrives in a few minutes.",
} as const

function FinalCtaLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  const isInternalRoute = href.startsWith("/") && !href.startsWith("//")

  if (isInternalRoute) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

export function FinalCTA({
  forceDark = false,
  useSummitRegister = false,
}: {
  forceDark?: boolean
  useSummitRegister?: boolean
}) {
  const { data } = useWebsiteData()
  const copy = data.settings.sections?.finalCta
  const sectionRef = useRef<HTMLElement>(null)

  const trustItems =
    copy?.trustItems?.map((item) => item.trim()).filter(Boolean) ??
    [...DEFAULT_TRUST_ITEMS]

  const primaryLabel = copy?.ctaLabel?.trim() || DEFAULT_PRIMARY.label
  const primaryHref = copy?.ctaHref?.trim() || DEFAULT_PRIMARY.href
  const secondaryLabel = copy?.secondaryCtaLabel?.trim() || DEFAULT_SECONDARY.label
  const secondaryHref = copy?.secondaryCtaHref?.trim() || DEFAULT_SECONDARY.href
  const formNote = copy?.formNote?.trim() || DEFAULT_FORM_NOTE
  const waitlistSubmitLabel = copy?.waitlistSubmitLabel?.trim() || DEFAULT_WAITLIST.submitLabel
  const waitlistPlaceholder = copy?.waitlistPlaceholder?.trim() || DEFAULT_WAITLIST.placeholder
  const waitlistGuideLabel =
    copy?.waitlistGuideLabel !== undefined
      ? copy.waitlistGuideLabel.trim()
      : DEFAULT_WAITLIST.guideLabel
  const waitlistSuccessTitle = copy?.waitlistSuccessTitle?.trim() || DEFAULT_WAITLIST.successTitle
  const waitlistSuccessCopy = copy?.waitlistSuccessCopy?.trim() || DEFAULT_WAITLIST.successCopy

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
    <section
      ref={sectionRef}
      id="final-cta"
      className={`final-cta-section premium-home-section${forceDark ? " final-cta-section--dark" : ""}`}
    >
      <div className="final-cta-section__ambient" aria-hidden />
      <div className="final-cta-section__glow" aria-hidden />

      <div className="final-cta-section__inner">
        <div className="final-cta-section__grid">
          <div className="final-cta-section__copy">
            <header className="final-cta-section__header">
              <EditorialEyebrow
                theme="dark"
                className="mb-5 sm:mb-6"
                textClassName="final-cta-section__eyebrow"
              >
                {copy?.eyebrow?.trim() || "Final Registry"}
              </EditorialEyebrow>

              <h2 className="editorial-heading editorial-heading--cta final-cta-section__title">
                {renderSectionHeading(copy, (
                  <>
                    Secure your <span className="editorial-accent">spot</span>.
                  </>
                ))}
              </h2>

              <p className="editorial-lede final-cta-section__lede">
                {copy?.lede?.trim() ||
                  "The architectural blueprint for automating your business with agentic AI — written for founders who ship, not slide decks."}
              </p>
            </header>

            {trustItems.length > 0 ? (
              <ul className="final-cta-section__trust list-none p-0 m-0">
                {trustItems.map((item) => (
                  <li key={item} className="final-cta-section__trust-item">
                    <Check className="final-cta-section__trust-icon" aria-hidden strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="final-cta-section__action">
            {useSummitRegister ? (
              <div className="final-cta-section__buttons">
                <FinalCtaLink
                  href={primaryHref}
                  className="final-cta-section__btn final-cta-section__btn--primary group"
                >
                  {primaryLabel}
                  <ArrowRight
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </FinalCtaLink>
                <FinalCtaLink
                  href={secondaryHref}
                  className="final-cta-section__btn final-cta-section__btn--secondary"
                >
                  {secondaryLabel}
                </FinalCtaLink>
              </div>
            ) : (
              <div className="final-cta-section__form-well">
                <WaitlistForm
                  showHint={false}
                  showGuideLabel={Boolean(waitlistGuideLabel)}
                  guideLabel={waitlistGuideLabel}
                  submitLabel={waitlistSubmitLabel}
                  placeholder={waitlistPlaceholder}
                  successTitle={waitlistSuccessTitle}
                  successCopy={waitlistSuccessCopy}
                  analyticsLocation="final_cta_waitlist"
                />
                <p className="final-cta-section__form-note">{formNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
