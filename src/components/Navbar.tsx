import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import * as Dialog from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { useWebsiteData } from "./WebsiteDataProvider"
import { cn } from "../lib/utils"

const navLinkClass =
  "inline-flex items-center min-h-10 px-3 text-[14px] font-medium text-text2 hover:text-text transition-colors duration-200 rounded-full hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"

const navCtaGhostClass = "btn-nav-ghost whitespace-nowrap"

export function Navbar({ isInsidePreview = false }: { isInsidePreview?: boolean }) {
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { links, primaryCta } = settings.navigation
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

  const renderNavCta = (className?: string, onNavigate?: () => void) => {
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
          className={cn(navCtaGhostClass, className)}
        >
          {ctaLabel}
        </a>
      )
    }

    if (resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")) {
      return (
        <a href={resolvedHref} className={cn(navCtaGhostClass, className)} onClick={() => onNavigate?.()}>
          {ctaLabel}
        </a>
      )
    }

    return (
      <Link to={resolvedHref} className={cn(navCtaGhostClass, className)} onClick={() => onNavigate?.()}>
        {ctaLabel}
      </Link>
    )
  }

  const renderNavLink = (link: (typeof links)[0], mobile = false) => {
    const resolvedHref = getHRef(link.href)
    const isExternal = resolvedHref.startsWith("http") || resolvedHref.startsWith("mailto:")
    const isSection = link.href.startsWith("#") || (link.href.startsWith("/#") && pathname !== "/")
    const mobileClass = mobile
      ? "text-[17px] font-sans font-medium text-text transition-colors min-h-11 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 rounded-lg px-2"
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
        "top-0 z-[100] w-full flex justify-center pt-3 sm:pt-5 lg:pt-6 px-3 sm:px-4 lg:px-6 pointer-events-none",
        isInsidePreview ? "absolute" : "fixed",
      )}
    >
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl px-2 sm:px-3 py-1 glass-pill rounded-full">
        <Link
          to="/"
          className="flex items-center gap-2.5 group pl-1 min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 rounded-full"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-text rounded-full flex items-center justify-center text-white font-serif italic text-sm sm:text-base shrink-0 transition-transform group-hover:scale-[1.03]">
            {appearance.brandLogoText}
          </div>
          <span className="hidden xl:block text-[15px] font-semibold text-text tracking-tight max-w-[11rem] truncate">
            {appearance.brandName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
          {links.map((link) => renderNavLink(link))}
          <div className="ml-2 pl-2 border-l border-border/50">{renderNavCta()}</div>
        </nav>

        <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center min-h-11 min-w-11 text-text hover:bg-black/[0.04] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[104] bg-black/15 md:hidden" />
            <Dialog.Content
              className={cn(
                "fixed top-[4.75rem] left-4 right-4 z-[105] md:hidden",
                "bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-premium border border-border/40",
                "max-h-[calc(100dvh-6rem)] overflow-y-auto focus:outline-none",
              )}
            >
              <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
              <Dialog.Description className="sr-only">Site navigation links</Dialog.Description>

              <nav className="flex flex-col gap-1 items-stretch" aria-label="Mobile">
                {links.map((link) => (
                  <div key={link.id} className="flex justify-center">
                    {renderNavLink(link, true)}
                  </div>
                ))}
              </nav>

              <div className="pt-4 border-t border-border/30 flex flex-col gap-3">
                {renderNavCta("w-full justify-center text-[15px]", () => setIsMobileMenuOpen(false))}
                <p className="text-[12px] text-muted text-center">Social links are in the footer</p>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
