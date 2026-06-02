import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ImageIcon, Settings, MoreHorizontal, Mic2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useState } from 'react'
import { Drawer } from '../ui/Modal'
import { buildNavGroups, type NavGroup } from './Sidebar'

const PRIMARY_TABS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Mic2, label: 'Summit', path: '/admin/conference' },
  { icon: ImageIcon, label: 'Media', path: '/admin/media' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

export function MobileTabBar({
  navGroups,
  onLogout,
}: {
  navGroups: NavGroup[]
  onLogout: () => void
}) {
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav className="admin-mobile-tabbar" aria-label="Mobile navigation">
        {PRIMARY_TABS.slice(0, 4).map((tab) => {
          const isActive = location.pathname === tab.path || (tab.label === 'Content' && location.pathname.startsWith('/admin/') && !['/admin/dashboard', '/admin/media', '/admin/settings'].includes(location.pathname))
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn('admin-mobile-tabbar__item', isActive && 'admin-mobile-tabbar__item--active')}
            >
              <tab.icon className="w-5 h-5" aria-hidden />
              <span>{tab.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          className={cn('admin-mobile-tabbar__item', moreOpen && 'admin-mobile-tabbar__item--active')}
          onClick={() => setMoreOpen(true)}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] text-[var(--ds-text-subtle)] uppercase tracking-[var(--ds-tracking-wide)] mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--ds-radius-md)] text-[var(--ds-text-base)] hover:bg-[var(--ds-surface-sunken)] ds-transition-base"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { onLogout(); setMoreOpen(false) }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--ds-radius-md)] text-[var(--ds-danger-text)] hover:bg-[var(--ds-danger-bg)] ds-transition-base"
          >
            Sign out
          </button>
        </div>
      </Drawer>
    </>
  )
}

export { buildNavGroups }
