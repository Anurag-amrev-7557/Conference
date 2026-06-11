import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NavMagneticCta } from './NavMagneticCta';
import { useWebsiteData } from './WebsiteDataProvider';
import { cn, formatBrandNameForDisplay } from '../lib/utils';
import { NavbarBrandLogo } from './NavbarBrandLogo';
import type { NavLink } from '../lib/websiteData';

function getNavLinkClass(isDark: boolean, isActive: boolean, mobile = false) {
  return cn(
    'nav-dock__link',
    isDark && 'nav-dock__link--on-hero',
    isActive && 'nav-dock__link--active',
    mobile && 'nav-dock__link--mobile',
  );
}

function normalizeNavHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed === '/conference' || trimmed === '/conference/') {
    return '/#conference-hero';
  }
  return href;
}

export function Navbar() {
  const { data } = useWebsiteData();
  const { appearance, settings } = data;
  const { links, primaryCta, navbarVisible } = settings.navigation;
  const { pathname } = useLocation();
  const [mobileMenu, setMobileMenu] = useState({ open: false, path: pathname });
  const isMobileMenuOpen = mobileMenu.open && mobileMenu.path === pathname;
  const [heroIntersecting, setHeroIntersecting] = useState(
    () => pathname === '/' || pathname === '/register',
  );
  const dockRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenu({ open: false, path: pathname });
        return;
      }
      if (event.key !== 'Tab' || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen, pathname]);

  const isOverHero =
    pathname === '/register'
      ? true
      : pathname === '/' || pathname === '/home'
        ? heroIntersecting
        : false;
  const isDarkTheme = isOverHero;

  const closeMobileMenu = () => setMobileMenu({ open: false, path: pathname });
  const toggleMobileMenu = () =>
    setMobileMenu((current) =>
      current.open && current.path === pathname
        ? { open: false, path: pathname }
        : { open: true, path: pathname },
    );

  const ctaLabel = primaryCta.label;
  const ctaHref = normalizeNavHref(primaryCta.href);

  const navLinks = links
    .filter((link) => link.name?.trim() && link.href?.trim())
    .map((link, index) => ({
      ...link,
      id: link.id || `nav-${index}`,
      href: normalizeNavHref(link.href),
    }));

  const desktopNavLinks = navLinks;
  const mobileNavLinks = navLinks.map((link, index) => ({
    ...link,
    id: `${link.id}-mobile-${index}`,
  }));

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (dockRef.current && !dockRef.current.contains(target)) {
        closeMobileMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen]);

  useLayoutEffect(() => {
    const isHome = pathname === '/' || pathname === '/home';
    if (!isHome) {
      setHeroIntersecting(false);
      return;
    }

    const heroSelector = pathname === '/' ? '#conference-hero' : '.premium-home-hero';
    let intersectionObserver: IntersectionObserver | null = null;
    let waitObserver: MutationObserver | null = null;
    let cancelled = false;

    const syncHeroIntersecting = (heroEl: Element) => {
      const rect = heroEl.getBoundingClientRect();
      const navOffset = 72;
      const inView = rect.top < window.innerHeight && rect.bottom > navOffset;
      if (!cancelled) setHeroIntersecting(inView);
    };

    const observeHero = (heroEl: Element) => {
      intersectionObserver?.disconnect();
      syncHeroIntersecting(heroEl);

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (!cancelled) setHeroIntersecting(entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '-72px 0px 0px 0px' },
      );
      intersectionObserver.observe(heroEl);
    };

    const tryAttach = () => {
      const heroEl = document.querySelector(heroSelector);
      if (heroEl) {
        waitObserver?.disconnect();
        waitObserver = null;
        observeHero(heroEl);
        return true;
      }
      return false;
    };

    // Stay on hero styling while the lazy homepage chunk mounts — avoids white nav flash.
    setHeroIntersecting(true);

    if (!tryAttach()) {
      waitObserver = new MutationObserver(() => {
        tryAttach();
      });
      waitObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      intersectionObserver?.disconnect();
      waitObserver?.disconnect();
    };
  }, [pathname]);

  const getHRef = (href: string) => {
    if (href.startsWith('#')) {
      return pathname === '/' ? href : `/${href}`;
    }
    return href;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && pathname === '/') {
      e.preventDefault();
      const id = href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderNavCta = (variant: 'desktop' | 'mobile', onNavigate?: () => void) => {
    const resolvedHref = getHRef(ctaHref);
    const isHash = ctaHref.startsWith('#') || (ctaHref.startsWith('/#') && pathname === '/');
    const useMagnetic = variant === 'desktop';

    const linkClass = cn(
      variant === 'desktop' ? 'shrink-0' : 'w-full min-h-[3.25rem] text-[15px] justify-center',
      isDarkTheme && 'btn-nav-cta--on-hero',
    );

    const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isHash || resolvedHref.startsWith('#')) {
        handleLinkClick(e, ctaHref.startsWith('#') ? ctaHref : ctaHref.replace(/^\//, ''));
      }
      onNavigate?.();
    };

    if (isHash || resolvedHref.startsWith('#')) {
      return (
        <NavMagneticCta
          href={resolvedHref}
          label={ctaLabel}
          className={linkClass}
          magnetic={useMagnetic}
          onClick={handleCtaClick}
        />
      );
    }

    if (resolvedHref.startsWith('http') || resolvedHref.startsWith('mailto:')) {
      return (
        <NavMagneticCta
          href={resolvedHref}
          label={ctaLabel}
          className={linkClass}
          magnetic={useMagnetic}
          onClick={() => onNavigate?.()}
        />
      );
    }

    return (
      <NavMagneticCta
        to={resolvedHref}
        label={ctaLabel}
        className={linkClass}
        magnetic={useMagnetic}
        onClick={() => onNavigate?.()}
      />
    );
  };

  const renderNavLink = (link: NavLink, mobile = false) => {
    const resolvedHref = getHRef(link.href);
    const isExternal = resolvedHref.startsWith('http') || resolvedHref.startsWith('mailto:');
    const isSection = link.href.startsWith('#') || (link.href.startsWith('/#') && pathname !== '/');
    const isActive = !isExternal && !isSection && pathname === resolvedHref;

    const linkClass = getNavLinkClass(isDarkTheme, isActive, mobile);

    if (isExternal || isSection) {
      return (
        <a
          key={link.id}
          href={resolvedHref}
          onClick={(e) => {
            if (mobile) closeMobileMenu();
            handleLinkClick(e, link.href);
          }}
          className={linkClass}
        >
          {link.name}
        </a>
      );
    }

    return (
      <Link
        key={link.id}
        to={resolvedHref}
        onClick={() => {
          if (mobile) closeMobileMenu();
        }}
        className={linkClass}
      >
        {link.name}
      </Link>
    );
  };

  if (navbarVisible === false) return null;

  return (
    <header
      className={cn(
        'top-0 z-[100] w-full flex justify-center pt-4 sm:pt-5 px-4 sm:px-6 pointer-events-none',
        'fixed',
      )}
    >
      <div
        className={cn(
          'nav-mobile-backdrop fixed inset-0 z-[99] md:hidden',
          isMobileMenuOpen ? 'nav-mobile-backdrop--visible' : 'nav-mobile-backdrop--hidden',
        )}
        aria-hidden={!isMobileMenuOpen}
        onClick={closeMobileMenu}
      />

      <div
        ref={dockRef}
        className={cn(
          'nav-dock nav-dock--expandable pointer-events-auto relative z-[101] w-full max-w-6xl',
          isDarkTheme && 'nav-dock--dark',
          isMobileMenuOpen && 'nav-dock--open',
        )}
      >
        <div className="nav-dock__bar flex items-center justify-between gap-3 py-1 pl-4 sm:pl-5 pr-1 sm:pr-1.5 min-h-[3.25rem] sm:min-h-14 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5 lg:gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 shrink-0 md:justify-self-start md:self-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 rounded-lg"
          >
            <NavbarBrandLogo
              cmsUrl={appearance.brandLogoUrl}
              className="nav-dock__brand-logo h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain object-center transition-transform duration-200 group-hover:scale-[1.04]"
            />
            <span
              className={cn(
                'text-[14px] sm:text-[15px] leading-none font-semibold tracking-[-0.02em]',
                'md:truncate md:max-w-[12rem] lg:max-w-none',
                isDarkTheme ? 'text-white' : 'text-text',
              )}
            >
              {formatBrandNameForDisplay(appearance.brandName)}
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2 justify-self-center self-center h-full"
            aria-label="Main"
          >
            {desktopNavLinks.map((link) => renderNavLink(link))}
          </nav>

          <div className="flex items-stretch justify-end justify-self-end min-w-0 h-full md:h-auto">
            <div className="nav-dock__cta-slot hidden md:flex self-stretch items-stretch md:pl-1 lg:pl-2">
              {renderNavCta('desktop')}
            </div>

            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className={`nav-mobile-trigger md:hidden self-center inline-flex items-center justify-center min-h-10 min-w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                isDarkTheme
                  ? 'text-white border-white/10 bg-black/50 hover:bg-black/80'
                  : 'text-text border-black/[0.08] bg-white/80 hover:bg-white'
              }`}
              onClick={toggleMobileMenu}
            >
              <span className="relative h-5 w-5" aria-hidden>
                <Menu
                  className={cn(
                    'nav-mobile-trigger__icon absolute inset-0 h-5 w-5',
                    isMobileMenuOpen
                      ? 'nav-mobile-trigger__icon--hide'
                      : 'nav-mobile-trigger__icon--show',
                  )}
                />
                <X
                  className={cn(
                    'nav-mobile-trigger__icon absolute inset-0 h-5 w-5',
                    isMobileMenuOpen
                      ? 'nav-mobile-trigger__icon--show'
                      : 'nav-mobile-trigger__icon--hide nav-mobile-trigger__icon--hide-x',
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          ref={mobileMenuRef}
          className={cn(
            'nav-dock__drawer md:hidden',
            isMobileMenuOpen && 'nav-dock__drawer--open',
            isDarkTheme && 'bg-black/40',
          )}
          aria-hidden={!isMobileMenuOpen}
          inert={isMobileMenuOpen ? undefined : true}
        >
          <div className="nav-dock__drawer-inner">
            <nav className="nav-dock__menu flex flex-col gap-0.5 px-2.5 pb-2.5" aria-label="Mobile">
              {mobileNavLinks.map((link) => (
                <div key={link.id}>{renderNavLink(link, true)}</div>
              ))}
            </nav>

            <div className="nav-dock__cta px-2.5 pb-3 pt-1">
              {renderNavCta('mobile', closeMobileMenu)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
