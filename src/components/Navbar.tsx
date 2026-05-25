import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  BookOpen,
  CalendarDays,
  Menu,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { useWebsiteData } from "./WebsiteDataProvider"
import { cn } from "../lib/utils"
import type { NavLink } from "../lib/websiteData"

const getNavLinkClass = (isDark: boolean) =>
  `inline-flex items-center gap-2 min-h-10 px-3.5 text-[15px] font-semibold transition-colors duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 ${
    isDark
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-text/85 hover:text-text hover:bg-black/[0.05]"
  }`

const navIconClass = "h-4 w-4 shrink-0 stroke-[2.25]"

function getNavIcon(link: NavLink): LucideIcon {
  const href = link.href.toLowerCase()
  const name = link.name.toLowerCase()

  if (href.includes("blog") || href.includes("playbook") || name.includes("blog") || name.includes("playbook")) {
    return BookOpen
  }
  if (href.includes("community") || href.includes("founder") || name.includes("community") || name.includes("founder")) {
    return Users
  }
  if (href.includes("event") || name.includes("event") || name.includes("training")) {
    return CalendarDays
  }
  if (href.includes("who-we-are") || href.includes("about") || name.includes("about") || name.includes("strategy")) {
    return Sparkles
  }
  if (href.includes("conference") || name.includes("conference")) {
    return Sparkles
  }

  return BookOpen
}

export function Navbar({ isInsidePreview = false }: { isInsidePreview?: boolean }) {
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { links, primaryCta } = settings.navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const isDarkTheme = pathname === "/conference"

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open)

  const ctaLabel = primaryCta.label
  const ctaHref = primaryCta.href

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

    const linkClass = cn(
      variant === "desktop"
        ? "btn-nav-cta shrink-0"
        : "btn-cta-primary w-full min-h-[3.25rem] text-[15px] justify-center",
    )

    const sharedProps = {
      className: linkClass,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isHash || resolvedHref.startsWith("#")) {
          handleLinkClick(e, ctaHref.startsWith("#") ? ctaHref : ctaHref.replace(/^\//, ""))
        }
        onNavigate?.()
      },
    }

    if (isHash || resolvedHref.startsWith("#")) {
      return (
        <a href={resolvedHref} {...sharedProps}>
          {ctaLabel}
        </a>
      )
    }

    if (resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")) {
      return (
        <a href={resolvedHref} className={linkClass} onClick={() => onNavigate?.()}>
          {ctaLabel}
        </a>
      )
    }

    return (
      <Link to={resolvedHref} className={linkClass} onClick={() => onNavigate?.()}>
        {ctaLabel}
      </Link>
    )
  }

  const renderNavLink = (link: NavLink, mobile = false) => {
    const resolvedHref = getHRef(link.href)
    const isExternal = resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")
    const isSection = link.href.startsWith("#") || (link.href.startsWith("/#") && pathname !== "/")
    const Icon = getNavIcon(link)

    const mobileClass =
      `nav-mobile-link group w-full min-h-[3.25rem] px-3.5 rounded-xl inline-flex items-center gap-3 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
        isDarkTheme
          ? "text-white hover:bg-white/10"
          : "text-text hover:bg-black/[0.04]"
      }`
    const linkClass = mobile ? mobileClass : getNavLinkClass(isDarkTheme)

    const content = (
      <>
        {mobile ? (
          <span className="nav-mobile-link__icon" aria-hidden>
            <Icon className="h-[1.05rem] w-[1.05rem] stroke-[2.25]" />
          </span>
        ) : (
          <Icon className={navIconClass} aria-hidden />
        )}
        <span className={mobile ? "flex-1 text-left" : undefined}>{link.name}</span>
      </>
    )

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
          {content}
        </a>
      )
    }

    return (
      <Link
        key={link.id}
        to={resolvedHref}
        onClick={() => mobile && closeMobileMenu()}
        className={linkClass}
      >
        {content}
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
        <div className="nav-dock__bar flex items-center justify-between gap-3 py-2 pl-4 sm:pl-5 pr-2.5 sm:pr-3 min-h-14 sm:min-h-[3.75rem] md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 shrink-0 md:justify-self-start md:self-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 rounded-lg"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif italic text-sm shrink-0 transition-transform duration-200 group-hover:scale-[1.04] ${isDarkTheme ? 'bg-white text-black' : 'bg-text text-white'}`}>
              {appearance.brandLogoText}
            </div>
            <span className={`hidden sm:block text-base font-semibold tracking-[-0.02em] truncate max-w-[10rem] md:max-w-[12rem] lg:max-w-none ${isDarkTheme ? 'text-white' : 'text-text'}`}>
              {appearance.brandName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-1 justify-self-center self-center" aria-label="Main">
            {links.map((link) => renderNavLink(link))}
            {renderNavLink({ id: 'conf-nav', name: 'Conference', href: '/conference' })}
          </nav>

          <div className="flex items-stretch justify-end justify-self-end min-w-0 h-full md:h-auto">
            <div className="hidden md:flex h-full items-stretch">{renderNavCta("desktop")}</div>

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
              {links.map((link) => (
                <div key={link.id}>{renderNavLink(link, true)}</div>
              ))}
              <div key="conf-nav-mobile">{renderNavLink({ id: 'conf-nav-mobile', name: 'Conference', href: '/conference' }, true)}</div>
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
