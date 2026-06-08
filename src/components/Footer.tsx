import { useEffect, useRef, type SVGProps } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useWebsiteData } from "./WebsiteDataProvider"

type IconProps = SVGProps<SVGSVGElement>

const LinkedInIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const YoutubeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const InstagramIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M20 4L4 20" />
  </svg>
)

const iconMap = {
  LinkedIn: LinkedInIcon,
  Youtube: YoutubeIcon,
  Instagram: InstagramIcon,
  X: XIcon,
} as const

function splitBrandName(name: string): { lead: string; trail: string | null } {
  const match = name.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (!match) return { lead: name, trail: null }
  return { lead: match[1].trim(), trail: match[2].trim() }
}

function FooterNavLink({ href, index, children }: { href: string; index: number; children: string }) {
  const className = "site-footer__link"
  const num = String(index + 1).padStart(2, "0")
  const inner = (
    <>
      <span className="site-footer__link-num" aria-hidden>
        {num}
      </span>
      <span className="site-footer__link-label">{children}</span>
    </>
  )

  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    )
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  )
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { socials, footerLinks, primaryCta } = settings.navigation
  const footer = settings.footer ?? {}
  const { lead, trail } = splitBrandName(appearance.brandName)
  const year = new Date().getFullYear()
  const tagline = footer.tagline ?? 'Orchestrating the future of automated business systems.'
  const copyright = footer.copyright ?? `© ${year} Superhumanly AI Playbook.`
  const registryLabel = footer.registryStatusLabel ?? 'Registry open'
  const registryCtaLabel = footer.registryCtaLabel?.trim() || primaryCta.label || 'Join the registry'
  const registryHref = footer.registryCtaHref?.trim() || primaryCta.href || '/register'
  const navColumnTitle = footer.navColumnTitle?.trim() || 'Section Index'
  const socialColumnTitle = footer.socialColumnTitle?.trim() || 'Connection'
  const privacyUrl = footer.privacyUrl ?? '#'
  const termsUrl = footer.termsUrl ?? '#'
  const privacyLabel = footer.privacyLabel?.trim() || 'Privacy Policy'
  const termsLabel = footer.termsLabel?.trim() || 'Terms of Service'

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("site-footer--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-40px 0px", threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <footer ref={footerRef} className="site-footer">
      <div className="site-footer__mesh" aria-hidden />
      <div className="site-footer__glow site-footer__glow--left" aria-hidden />
      <div className="site-footer__glow site-footer__glow--right" aria-hidden />
      <div className="site-footer__ambient" aria-hidden />
      <p className="site-footer__watermark" aria-hidden>
        {lead}
      </p>

      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <div className="site-footer__status">
              <span className="site-footer__status-dot" aria-hidden />
              <span className="site-footer__status-label">{registryLabel}</span>
            </div>

            <Link to="/" className="site-footer__mark">
              <span className="site-footer__mark-text">
                <span className="site-footer__mark-lead">{lead}</span>
                {trail ? (
                  <>
                    {" "}
                    <span className="site-footer__mark-accent">{trail}</span>
                  </>
                ) : null}
              </span>
            </Link>

            <p className="site-footer__tagline">{tagline}</p>

            {registryHref.startsWith("http") || registryHref.startsWith("mailto:") ? (
              <a
                href={registryHref}
                className="site-footer__registry"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="site-footer__registry-label">{registryCtaLabel}</span>
                <ArrowRight className="site-footer__registry-icon" aria-hidden />
              </a>
            ) : registryHref.startsWith("#") ? (
              <a href={registryHref} className="site-footer__registry">
                <span className="site-footer__registry-label">{registryCtaLabel}</span>
                <ArrowRight className="site-footer__registry-icon" aria-hidden />
              </a>
            ) : (
              <Link to={registryHref} className="site-footer__registry">
                <span className="site-footer__registry-label">{registryCtaLabel}</span>
                <ArrowRight className="site-footer__registry-icon" aria-hidden />
              </Link>
            )}
          </div>

          <nav className="site-footer__nav" aria-label="Footer">
            <div className="site-footer__column-head">
              <span className="site-footer__head-rule" aria-hidden />
              <h3 className="site-footer__column-title">{navColumnTitle}</h3>
            </div>
            <ul className="site-footer__links">
              {footerLinks.map((link, index) => (
                <li key={link.id}>
                  <FooterNavLink href={link.href} index={index}>
                    {link.name}
                  </FooterNavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__social">
            <div className="site-footer__column-head site-footer__column-head--end">
              <span className="site-footer__head-rule" aria-hidden />
              <h3 className="site-footer__column-title">{socialColumnTitle}</h3>
            </div>
            <ul className="site-footer__social-list">
              {socials.map((social) => {
                const Icon = iconMap[social.platform as keyof typeof iconMap]
                if (!Icon) return null

                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-footer__social-btn"
                      aria-label={social.platform}
                    >
                      <Icon className="site-footer__social-icon" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="site-footer__divider" aria-hidden />

        <div className="site-footer__bar">
          <p className="site-footer__copyright">{copyright}</p>
          <nav className="site-footer__legal" aria-label="Legal">
            <a href={privacyUrl} className="site-footer__legal-link">
              {privacyLabel}
            </a>
            <a href={termsUrl} className="site-footer__legal-link">
              {termsLabel}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
