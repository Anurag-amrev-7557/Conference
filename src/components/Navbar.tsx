import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
} from "lucide-react"
import { NavMagneticCta } from "./NavMagneticCta"
import { useWebsiteData } from "./WebsiteDataProvider"
import { cn, formatBrandNameForDisplay } from "../lib/utils"
import { CmsImage } from "./CmsImage"
import { getNavbarLogoSrc } from "../lib/brandLogo"
import type { NavLink } from "../lib/websiteData"

function getNavLinkClass(isDark: boolean, isActive: boolean, mobile = false) {
  return cn(
    "nav-dock__link",
    isDark && "nav-dock__link--on-hero",
    isActive && "nav-dock__link--active",
    mobile && "nav-dock__link--mobile",
  )
}

function normalizeNavHref(href: string): string {
  const trimmed = href.trim()
  if (trimmed === "/conference" || trimmed === "/conference/") {
    return "/#conference-hero"
  }
  return href
}

export function Navbar({ isInsidePreview = false }: { isInsidePreview?: boolean }) {
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { links, primaryCta } = settings.navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [isOverHero, setIsOverHero] = useState(
    () => pathname === "/" || pathname === "/register",
  )
  const dockRef = useRef<HTMLDivElement>(null)
  const isDarkTheme = isOverHero

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open)

  const ctaLabel = primaryCta.label
  const ctaHref = normalizeNavHref(primaryCta.href)
  const matchLink = (candidates: string[]) =>
    links.find((link) => {
      const normalized = `${link.name} ${link.href}`.toLowerCase()
      return candidates.some((candidate) => normalized.includes(candidate))
    })

  const orderedCoreLinks = [
    matchLink(["blog", "playbook"]),
    matchLink(["event"]),
    matchLink(["about", "who-we-are", "strategy"]),
  ]
    .filter(Boolean)
    .map((link) => ({
      ...(link as NavLink),
      href: normalizeNavHref((link as NavLink).href),
    })) as NavLink[]

  const desktopNavLinks = orderedCoreLinks.map((link, index) => ({
    ...link,
    id: `${link.id || "nav"}-${index}`,
  }))
  const mobileNavLinks = orderedCoreLinks.map((link, index) => ({
    ...link,
    id: `${link.id || "mobile-nav"}-mobile-${index}`,
  }))

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (dockRef.current && !dockRef.current.contains(target)) {
        closeMobileMenu()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (pathname === "/register") {
      setIsOverHero(true)
      return
    }

    const heroSelector =
      pathname === "/" ? "#conference-hero" : pathname === "/home" ? ".premium-home-hero" : null

    if (!heroSelector) {
      setIsOverHero(false)
      return
    }

    const heroEl = document.querySelector(heroSelector)
    if (!heroEl) {
      setIsOverHero(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverHero(entry.isIntersecting)
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    )

    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [pathname])

  const getHRef = (href: string) => {
    if (href.startsWith("#")) {
      return pathname === "/" ? href : `/${href}`
    }
    return href
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault()
      const id = href.substring(1)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const renderNavCta = (variant: "desktop" | "mobile", onNavigate?: () => void) => {
    const resolvedHref = getHRef(ctaHref)
    const isHash = ctaHref.startsWith("#") || (ctaHref.startsWith("/#") && pathname === "/")
    const useMagnetic = variant === "desktop"

    const linkClass = cn(
      variant === "desktop" ? "shrink-0" : "w-full min-h-[3.25rem] text-[15px] justify-center",
      isDarkTheme && "btn-nav-cta--on-hero",
    )

    const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isHash || resolvedHref.startsWith("#")) {
        handleLinkClick(e, ctaHref.startsWith("#") ? ctaHref : ctaHref.replace(/^\//, ""))
      }
      onNavigate?.()
    }

    if (isHash || resolvedHref.startsWith("#")) {
      return (
        <NavMagneticCta
          href={resolvedHref}
          label={ctaLabel}
          className={linkClass}
          magnetic={useMagnetic}
          onClick={handleCtaClick}
        />
      )
    }

    if (resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")) {
      return (
        <NavMagneticCta
          href={resolvedHref}
          label={ctaLabel}
          className={linkClass}
          magnetic={useMagnetic}
          onClick={() => onNavigate?.()}
        />
      )
    }

    return (
      <NavMagneticCta
        to={resolvedHref}
        label={ctaLabel}
        className={linkClass}
        magnetic={useMagnetic}
        onClick={() => onNavigate?.()}
      />
    )
  }

  const renderNavLink = (link: NavLink, mobile = false) => {
    const resolvedHref = getHRef(link.href)
    const isExternal = resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")
    const isSection = link.href.startsWith("#") || (link.href.startsWith("/#") && pathname !== "/")
    const isActive = !isExternal && !isSection && pathname === resolvedHref

    const linkClass = getNavLinkClass(isDarkTheme, isActive, mobile)

    if (isExternal || isSection) {
      return (
        <a
          key={link.id}
          href={resolvedHref}
          onClick={(e) => {
            if (mobile) closeMobileMenu()
            handleLinkClick(e, link.href)
          }}
          className={linkClass}
        >
          {link.name}
        </a>
      )
    }

    return (
      <Link
        key={link.id}
        to={resolvedHref}
        onClick={() => {
          if (mobile) closeMobileMenu()
        }}
        className={linkClass}
      >
        {link.name}
      </Link>
    )
  }

  return (
    <header
      className={cn(
        "top-0 z-[100] w-full flex justify-center pt-4 sm:pt-5 px-4 sm:px-6 pointer-events-none",
        isInsidePreview ? "absolute" : "fixed",
      )}
    >
      <div
        className={cn(
          "nav-mobile-backdrop fixed inset-0 z-[99] md:hidden",
          isMobileMenuOpen ? "nav-mobile-backdrop--visible" : "nav-mobile-backdrop--hidden",
        )}
        aria-hidden={!isMobileMenuOpen}
        onClick={closeMobileMenu}
      />

      <div
        ref={dockRef}
        className={cn(
          "nav-dock nav-dock--expandable pointer-events-auto relative z-[101] w-full max-w-6xl",
          isDarkTheme && "nav-dock--dark",
          isMobileMenuOpen && "nav-dock--open",
        )}
      >
        <div className="nav-dock__bar flex items-center justify-between gap-3 py-2 pl-4 sm:pl-5 pr-2.5 sm:pr-3 min-h-14 sm:min-h-[3.75rem] md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5 lg:gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 shrink-0 md:justify-self-start md:self-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 rounded-lg"
          >
            <CmsImage
              src={getNavbarLogoSrc(appearance.brandLogoUrl)}
              alt=""
              aria-hidden
              className="nav-dock__brand-logo h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain object-center transition-transform duration-200 group-hover:scale-[1.04]"
            />
            <span
              className={cn(
                "text-[14px] sm:text-[15px] leading-none font-semibold tracking-[-0.02em]",
                "md:truncate md:max-w-[12rem] lg:max-w-none",
                isDarkTheme ? "text-white" : "text-text",
              )}
            >
              {formatBrandNameForDisplay(appearance.brandName)}
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2 justify-self-center self-center h-full" aria-label="Main">
            {desktopNavLinks.map((link) => renderNavLink(link))}
          </nav>

          <div className="flex items-stretch justify-end justify-self-end min-w-0 h-full md:h-auto">
            <div className="hidden md:flex h-full items-stretch md:pl-1 lg:pl-2">{renderNavCta("desktop")}</div>

            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className={`nav-mobile-trigger md:hidden self-center inline-flex items-center justify-center min-h-10 min-w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                isDarkTheme
                  ? "text-white border-white/10 bg-black/50 hover:bg-black/80"
                  : "text-text border-black/[0.08] bg-white/80 hover:bg-white"
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="relative h-5 w-5" aria-hidden>
                <Menu
                  className={cn(
                    "nav-mobile-trigger__icon absolute inset-0 h-5 w-5",
                    isMobileMenuOpen ? "nav-mobile-trigger__icon--hide" : "nav-mobile-trigger__icon--show",
                  )}
                />
                <X
                  className={cn(
                    "nav-mobile-trigger__icon absolute inset-0 h-5 w-5",
                    isMobileMenuOpen
                      ? "nav-mobile-trigger__icon--show"
                      : "nav-mobile-trigger__icon--hide nav-mobile-trigger__icon--hide-x",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          className={cn(
            "nav-dock__drawer md:hidden",
            isMobileMenuOpen && "nav-dock__drawer--open",
            isDarkTheme && "bg-black/40"
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="nav-dock__drawer-inner">
            <nav className="nav-dock__menu flex flex-col gap-0.5 px-2.5 pb-2.5" aria-label="Mobile">
              {mobileNavLinks.map((link) => (
                <div key={link.id}>{renderNavLink(link, true)}</div>
              ))}
            </nav>

            <div className="nav-dock__cta px-2.5 pb-3 pt-1">
              {renderNavCta("mobile", closeMobileMenu)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
