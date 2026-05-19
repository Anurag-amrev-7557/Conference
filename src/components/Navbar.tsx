import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import * as Dialog from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { useWebsiteData } from "./WebsiteDataProvider"
import { cn } from "../lib/utils"

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M20 4L4 20"/>
  </svg>
)

const iconMap = {
  LinkedIn: LinkedInIcon,
  Youtube: YoutubeIcon,
  Instagram: InstagramIcon,
  X: XIcon,
} as const

const navLinkClass =
  "inline-flex items-center min-h-11 px-3 lg:px-4 text-[13px] lg:text-[14px] font-medium text-text2 hover:text-accent transition-colors duration-200 rounded-full hover:bg-off/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

const ctaClass =
  "inline-flex items-center justify-center min-h-11 px-5 lg:px-7 py-2 bg-accent text-white rounded-full text-[12px] lg:text-[13px] font-bold shadow-elite hover:bg-accent2 transition-colors leading-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

export function Navbar({ isInsidePreview = false }: { isInsidePreview?: boolean }) {
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { links, socials, primaryCta } = settings.navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const ctaLabel = primaryCta.label
  const ctaHref = primaryCta.href

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

  const renderPrimaryCta = (className?: string, onNavigate?: () => void) => {
    const resolvedHref = getHRef(ctaHref)
    const isHash = ctaHref.startsWith("#") || (ctaHref.startsWith("/#") && pathname === "/")

    if (isHash || resolvedHref.startsWith("#")) {
      return (
        <a
          href={resolvedHref}
          onClick={(e) => {
            handleLinkClick(e, ctaHref.startsWith("#") ? ctaHref : ctaHref.replace(/^\//, ""))
            onNavigate?.()
          }}
          className={cn(ctaClass, className)}
        >
          {ctaLabel}
        </a>
      )
    }

    if (resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")) {
      return (
        <a href={resolvedHref} className={cn(ctaClass, className)} onClick={() => onNavigate?.()}>
          {ctaLabel}
        </a>
      )
    }

    return (
      <Link to={resolvedHref} className={cn(ctaClass, className)} onClick={() => onNavigate?.()}>
        {ctaLabel}
      </Link>
    )
  }

  const renderNavLink = (link: (typeof links)[0], mobile = false) => {
    const resolvedHref = getHRef(link.href)
    const isExternal = resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")
    const isSection = link.href.startsWith("#") || (link.href.startsWith("/#") && pathname !== "/")
    const mobileClass = mobile
      ? "text-lg font-sans font-medium text-text hover:text-accent transition-colors min-h-11 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg px-2"
      : navLinkClass

    if (isExternal || isSection) {
      return (
        <a
          key={link.id}
          href={resolvedHref}
          onClick={(e) => {
            if (mobile) setIsMobileMenuOpen(false)
            handleLinkClick(e, link.href)
          }}
          className={mobileClass}
        >
          {link.name}
        </a>
      )
    }

    return (
      <Link
        key={link.id}
        to={resolvedHref}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={mobileClass}
      >
        {link.name}
      </Link>
    )
  }

  return (
    <header
      className={cn(
        "top-0 z-[100] w-full flex justify-center pt-4 sm:pt-6 lg:pt-8 px-3 sm:px-4 lg:px-6 pointer-events-none",
        isInsidePreview ? "absolute" : "fixed",
      )}
    >
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-6xl px-2 sm:px-3 lg:px-2 py-1.5 glass-pill rounded-full shadow-nav">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 group px-1 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-text rounded-full flex items-center justify-center text-white font-serif italic text-base sm:text-lg shadow-elite transition-transform group-hover:scale-105">
            {appearance.brandLogoText}
          </div>
          <span className="hidden sm:inline text-sm sm:text-base font-bold text-text tracking-tight">{appearance.brandName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Main">
          {links.map((link) => renderNavLink(link))}

          <div className="h-4 w-px bg-border/60 mx-2 lg:mx-3" aria-hidden />

          <div className="flex items-center gap-3 lg:gap-4 px-1 lg:px-2">
            {socials.map((social) => {
              const Icon = iconMap[social.platform]
              return (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.platform}
                  className="inline-flex items-center justify-center min-h-11 min-w-11 text-text2 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full"
                >
                  <Icon className="w-4 lg:w-[18px] h-4 lg:h-[18px]" />
                </a>
              )
            })}
          </div>

          <div className="ml-1 lg:ml-2">{renderPrimaryCta()}</div>
        </nav>

        <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center min-h-11 min-w-11 text-text hover:bg-off/50 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[104] bg-black/20 md:hidden data-[state=open]:animate-in data-[state=closed]:animate-out" />
            <Dialog.Content
              className={cn(
                "fixed top-[5.5rem] left-4 right-4 z-[105] md:hidden",
                "glass-pill rounded-3xl p-6 sm:p-8 flex flex-col gap-8 text-center shadow-2xl border border-border/30",
                "max-h-[calc(100dvh-6.5rem)] overflow-y-auto focus:outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
              )}
            >
              <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
              <Dialog.Description className="sr-only">Site navigation links and actions</Dialog.Description>

              <nav className="flex flex-col gap-4" aria-label="Mobile">
                {links.map((link) => renderNavLink(link, true))}
              </nav>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/10">
                {socials.map((social) => {
                  const Icon = iconMap[social.platform]
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      aria-label={social.platform}
                      className="inline-flex items-center justify-center min-h-11 min-w-11 text-text2 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-border/10">
                {renderPrimaryCta("w-full text-center", () => setIsMobileMenuOpen(false))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
