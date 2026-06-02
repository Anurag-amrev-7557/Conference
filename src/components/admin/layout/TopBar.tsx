import { Bell, Menu, Search, ChevronDown, ChevronRight, LogOut, User, Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SaveStatusIndicator } from '../providers/AutosaveProvider'
import type { SaveStatus } from '../providers/AutosaveProvider'
import { useAdminTheme } from '../providers/AdminThemeProvider'

export type PageContext = {
  pageTitle: string
  parent: { label: string; path: string } | null
}

interface TopBarProps {
  pageContext: PageContext
  onOpenCommandPalette: () => void
  onLogout: () => void
  username?: string | null
  saveStatus?: SaveStatus
  headerActions?: React.ReactNode
  onToggleMobileNav: () => void
  mobileNavOpen: boolean
}

export function TopBar({
  pageContext,
  onOpenCommandPalette,
  onLogout,
  username,
  saveStatus = 'idle',
  headerActions,
  onToggleMobileNav,
  mobileNavOpen,
}: TopBarProps) {
  const { theme, toggleTheme } = useAdminTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const initials = username?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__lead">
        <button
          type="button"
          className="admin-topbar__menu-btn admin-shell__menu-btn"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileNavOpen}
          onClick={onToggleMobileNav}
        >
          <Menu aria-hidden />
        </button>

        <div className="admin-topbar__context">
          {pageContext.parent ? (
            <>
              <Link to={pageContext.parent.path} className="admin-topbar__parent">
                {pageContext.parent.label}
              </Link>
              <ChevronRight className="admin-topbar__context-sep" aria-hidden />
            </>
          ) : null}
          <h1 className="admin-topbar__page-title">{pageContext.pageTitle}</h1>
        </div>
      </div>

      <div className="admin-topbar__cluster">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="admin-topbar__search-mobile"
          aria-label="Open command palette"
        >
          <Search aria-hidden />
        </button>

        <div className="admin-topbar__search-wrap">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="admin-topbar__search"
            aria-label="Open command palette"
          >
            <Search className="admin-topbar__search-icon" aria-hidden />
            <span className="admin-topbar__search-label">Search workspace</span>
            <kbd className="admin-topbar__search-kbd">⌘K</kbd>
          </button>
        </div>

        <div className="admin-topbar__actions">
          <SaveStatusIndicator status={saveStatus} />

          {headerActions}

          <div className="admin-topbar__divider" aria-hidden />

          <div className="admin-topbar__tools">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="admin-topbar__icon-btn"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -20 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 20 }}
                  className="admin-topbar__icon-btn-inner"
                >
                  {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              className="admin-topbar__icon-btn admin-topbar__icon-btn--disabled"
              aria-label="Notifications (coming soon)"
              disabled
              title="Notifications coming soon"
            >
              <Bell aria-hidden />
            </button>
          </div>

          <div className="admin-topbar__user">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="admin-topbar__user-trigger"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <div className="admin-topbar__avatar" aria-hidden>
                {initials}
              </div>
              <span className="admin-topbar__username">{username ?? 'User'}</span>
              <ChevronDown className="admin-topbar__user-chevron" aria-hidden />
            </button>

            <AnimatePresence>
              {userMenuOpen ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="admin-topbar__user-backdrop"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden
                  />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                    className="admin-topbar__user-menu"
                  >
                  <div className="admin-topbar__user-menu-header">
                    <p className="admin-topbar__user-menu-name truncate">{username}</p>
                    <p className="admin-topbar__user-menu-hint">Signed in</p>
                  </div>
                  <button type="button" role="menuitem" className="admin-topbar__user-menu-item">
                    <User aria-hidden />
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                    className="admin-topbar__user-menu-item admin-topbar__user-menu-item--danger"
                  >
                    <LogOut aria-hidden />
                    Sign out
                  </button>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export function buildPageContext(pathname: string, pageTitle: string): PageContext {
  const isDashboard =
    pathname === '/admin/dashboard' ||
    pathname === '/admin' ||
    pathname.endsWith('/dashboard')

  return {
    pageTitle,
    parent: isDashboard ? null : { label: 'Home', path: '/admin/dashboard' },
  }
}

/** @deprecated Use buildPageContext */
export function buildBreadcrumbs(pathname: string, pageTitle: string) {
  const ctx = buildPageContext(pathname, pageTitle)
  const items: Array<{ label: string; path?: string }> = []
  if (ctx.parent) items.push(ctx.parent)
  items.push({ label: ctx.pageTitle })
  return items
}
