import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Settings2,
  LogOut,
  ExternalLink,
  Paintbrush,
  ChevronLeft,
  ChevronDown,
  X,
  ImageIcon,
  Mic2,
  ClipboardList,
  Mail,
  Users,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useAdminWorkspaceNav } from '../admin-workspace-nav'
import { useAdminSession } from '../useAdminSession'
import {
  MOBILE_NAV_SECTIONS,
  setPendingAdminSection,
} from '../admin-mobile-nav-sections'
import { pageIdFromPath, filterSubnavByPermissions } from '../../../lib/adminPermissions'
import { SidebarNavTooltip } from '../ui/Navigation'

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 68
const BRAND_LOGO = '/Superhumanly AI Logo.png'

function SidebarBrandMark({ collapsed }: { collapsed: boolean }) {
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    return (
      <div className="admin-shell__brand-mark">
        <Settings2 className="w-5 h-5 text-white" aria-hidden />
      </div>
    )
  }

  return (
    <div className={cn('admin-shell__brand-mark admin-shell__brand-mark--logo', collapsed && 'admin-shell__brand-mark--collapsed')}>
      <img
        src={BRAND_LOGO}
        alt=""
        className="admin-shell__brand-logo"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export type NavGroup = {
  label: string
  items: { icon: React.ElementType; label: string; path: string }[]
}

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  mobileNavOpen: boolean
  onMobileNavClose: () => void
  onLogout: () => void
  navGroups: NavGroup[]
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  mobileNavOpen,
  onMobileNavClose,
  onLogout,
  navGroups,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { username, role, permissions } = useAdminSession()
  const workspaceSubnav = useAdminWorkspaceNav()?.subnav
  const [mobileNavExpandedPath, setMobileNavExpandedPath] = React.useState<string | null>(null)

  const showLabels = !isCollapsed || mobileNavOpen
  const width = mobileNavOpen ? undefined : isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  const filterMobileNavGroups = (
    path: string,
    groups: { label: string; items: { id: string; label: string; icon: React.ElementType }[] }[],
  ) => {
    const pid = pageIdFromPath(path)
    if (!pid) return groups
    return groups
      .map((section) => ({
        ...section,
        items: filterSubnavByPermissions(role, pid, section.items, permissions),
      }))
      .filter((section) => section.items.length > 0)
  }

  const roleLabel = role?.replace('_', ' ') ?? 'member'

  return (
    <>
      {mobileNavOpen && (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close navigation menu"
          onClick={onMobileNavClose}
        />
      )}

      <motion.aside
        animate={{ width: mobileNavOpen ? SIDEBAR_EXPANDED : width }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          'admin-shell__sidebar flex flex-col z-30 relative select-none shrink-0',
          isCollapsed && !mobileNavOpen
            ? 'admin-shell__sidebar--collapsed overflow-visible'
            : 'overflow-hidden',
          mobileNavOpen && 'admin-shell__sidebar--mobile-open',
        )}
      >
        {/* Brand */}
        <div className={cn('admin-sidebar-header', isCollapsed && !mobileNavOpen && 'admin-sidebar-header--collapsed')}>
          <div className={cn('admin-shell__brand', isCollapsed && !mobileNavOpen && 'admin-shell__brand--collapsed')}>
            <SidebarBrandMark collapsed={isCollapsed && !mobileNavOpen} />
            {showLabels && (
              <div className="admin-shell__brand-text min-w-0">
                <p className="admin-shell__brand-title truncate">Superhumanly AI</p>
                <p className="admin-shell__brand-sub truncate">Admin workspace</p>
              </div>
            )}
            <button type="button" onClick={onMobileNavClose} aria-label="Close menu" className="admin-shell__sidebar-close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'admin-sidebar-header__toggle',
              isCollapsed && 'admin-sidebar-header__toggle--collapsed',
            )}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav flex-1 overflow-y-auto" aria-label="Admin navigation">
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={cn(
                'admin-nav-group',
                groupIndex > 0 && 'admin-nav-group--spaced',
                isCollapsed && !mobileNavOpen && 'admin-nav-group--collapsed',
              )}
            >
              {showLabels && <p className="admin-nav-group__label">{group.label}</p>}
              {!showLabels && groupIndex > 0 && <div className="admin-nav-group__rule" aria-hidden />}
              <div className="admin-nav-group__items">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path
                  const staticGroups = MOBILE_NAV_SECTIONS[item.path]
                  const rawNavGroups = isActive && workspaceSubnav ? workspaceSubnav.groups : staticGroups
                  const navSubGroups = rawNavGroups ? filterMobileNavGroups(item.path, rawNavGroups) : null
                  const showMobileDropdown = mobileNavOpen && navSubGroups != null
                  const isDropdownOpen = mobileNavExpandedPath === item.path
                  const activeSectionId = isActive && workspaceSubnav ? workspaceSubnav.activeId : undefined

                  const linkContent = (
                    <>
                      <item.icon className="admin-shell__nav-icon shrink-0" aria-hidden />
                      {showLabels && <span className="admin-shell__nav-label truncate">{item.label}</span>}
                    </>
                  )

                  const linkClass = cn(
                    'admin-shell__nav-link admin-shell__nav-link--v2 relative',
                    isActive && 'admin-shell__nav-link--active',
                    !showLabels && 'admin-shell__nav-link--icon-only',
                  )

                  if (showMobileDropdown && navSubGroups) {
                    const sectionsId = `admin-nav-sections-${item.path.replace(/\//g, '-')}`
                    return (
                      <div key={item.path} className="admin-nav-dropdown">
                        <button
                          type="button"
                          className={cn(linkClass, 'admin-nav-dropdown__trigger w-full', isDropdownOpen && 'admin-nav-dropdown__trigger--open')}
                          aria-expanded={isDropdownOpen}
                          aria-controls={sectionsId}
                          onClick={() => setMobileNavExpandedPath(isDropdownOpen ? null : item.path)}
                        >
                          {linkContent}
                          <ChevronDown className={cn('admin-nav-dropdown__chevron w-4 h-4 shrink-0 ml-auto', isDropdownOpen && 'admin-nav-dropdown__chevron--open')} />
                        </button>
                        <div id={sectionsId} className={cn('admin-nav-subsections', isDropdownOpen && 'admin-nav-subsections--open')} hidden={!isDropdownOpen}>
                          {navSubGroups.map((section) => (
                            <div key={section.label || 'default'} className="admin-nav-subsections__block">
                              {section.label && <p className="admin-nav-subsections__label">{section.label}</p>}
                              {section.items.map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  className={cn('admin-nav-subsection', activeSectionId === sub.id && 'admin-nav-subsection--active')}
                                  onClick={() => {
                                    if (isActive && workspaceSubnav) workspaceSubnav.onSelect(sub.id)
                                    else { setPendingAdminSection(item.path, sub.id); navigate(item.path) }
                                    onMobileNavClose()
                                    setMobileNavExpandedPath(null)
                                  }}
                                >
                                  <sub.icon className="w-4 h-4 shrink-0" />
                                  <span className="truncate">{sub.label}</span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  const link = (
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onMobileNavClose}
                      className={linkClass}
                    >
                      {isActive && <span className="admin-shell__nav-link-accent" aria-hidden />}
                      {linkContent}
                    </Link>
                  )

                  if (!showLabels) {
                    return (
                      <SidebarNavTooltip key={item.path} content={item.label}>
                        {link}
                      </SidebarNavTooltip>
                    )
                  }
                  return <React.Fragment key={item.path}>{link}</React.Fragment>
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user + actions */}
        <div className="admin-sidebar-footer">
          {showLabels && username && (
            <div className="admin-sidebar-user">
              <div className="admin-sidebar-user__avatar" aria-hidden>
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="admin-sidebar-user__meta min-w-0">
                <p className="admin-sidebar-user__name truncate">{username}</p>
                <p className="admin-sidebar-user__role truncate">{roleLabel}</p>
              </div>
            </div>
          )}
          <div className={cn('admin-sidebar-footer__actions', showLabels && 'admin-sidebar-footer__actions--expanded')}>
            {!showLabels ? (
              <>
                <SidebarNavTooltip content="View site">
                  <Link to="/" className={cn('admin-shell__nav-link admin-shell__nav-link--icon-only')} onClick={onMobileNavClose}>
                    <ExternalLink className="admin-shell__nav-icon" />
                  </Link>
                </SidebarNavTooltip>
                <SidebarNavTooltip content="Sign out">
                  <button type="button" onClick={onLogout} className={cn('admin-shell__nav-link admin-shell__nav-link--danger admin-shell__nav-link--icon-only')}>
                    <LogOut className="admin-shell__nav-icon" />
                  </button>
                </SidebarNavTooltip>
              </>
            ) : (
              <>
                <Link to="/" className="admin-sidebar-action" onClick={onMobileNavClose}>
                  <ExternalLink className="admin-shell__nav-icon" aria-hidden />
                  <span>View site</span>
                </Link>
                <button type="button" onClick={onLogout} className="admin-sidebar-action admin-sidebar-action--signout">
                  <LogOut className="admin-shell__nav-icon" aria-hidden />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export function buildNavGroups(
  filterNavItems: (items: { icon: React.ElementType; label: string; path: string }[]) => typeof items,
): NavGroup[] {
  return [
    {
      label: 'Overview',
      items: filterNavItems([
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Mail, label: 'Newsletter', path: '/admin/newsletter' },
        { icon: Users, label: 'Team & access', path: '/admin/users' },
      ]),
    },
    {
      label: 'Content',
      items: filterNavItems([
        { icon: FileText, label: 'Blog', path: '/admin/blogs' },
        { icon: Calendar, label: 'Events', path: '/admin/events' },
        { icon: Mic2, label: 'Summit homepage', path: '/admin/conference' },
        { icon: ClipboardList, label: 'Registrations', path: '/admin/registrations' },
      ]),
    },
    {
      label: 'Settings',
      items: filterNavItems([
        { icon: Paintbrush, label: 'Brand & theme', path: '/admin/design' },
        { icon: Settings, label: 'Site settings', path: '/admin/settings' },
        { icon: ImageIcon, label: 'Media', path: '/admin/media' },
      ]),
    },
  ].filter((group) => group.items.length > 0)
}
