import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Paintbrush,
  ImageIcon,
  Mic2,
  ClipboardList,
  Mail,
  Users,
  Search,
  Clock,
  Pin,
  PinOff,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

type CommandItem = {
  id: string
  label: string
  path?: string
  action?: () => void
  icon: React.ElementType
  keywords?: string[]
  group: string
}

const NAV_ITEMS: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, group: 'Pages' },
  { id: 'design', label: 'Brand & theme', path: '/admin/design', icon: Paintbrush, group: 'Site' },
  { id: 'settings', label: 'Site settings', path: '/admin/settings', icon: Settings, group: 'Site' },
  { id: 'media', label: 'Media library', path: '/admin/media', icon: ImageIcon, group: 'Site' },
  { id: 'blogs', label: 'Blog workspace', path: '/admin/blogs', icon: FileText, group: 'Pages' },
  { id: 'events', label: 'Events workspace', path: '/admin/events', icon: Calendar, group: 'Pages' },
  { id: 'conference', label: 'Summit homepage', path: '/admin/conference', icon: Mic2, group: 'Pages' },
  { id: 'registrations', label: 'Registrations', path: '/admin/registrations', icon: ClipboardList, group: 'Pages' },
  { id: 'newsletter', label: 'Newsletter signups', path: '/admin/newsletter', icon: Mail, group: 'Overview' },
  { id: 'users', label: 'Team & access', path: '/admin/users', icon: Users, group: 'Overview' },
]

const RECENT_KEY = 'admin_recent_pages'
const PINNED_KEY = 'admin_pinned_pages'

function getRecentPages(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function getPinnedPages(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PINNED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function togglePinnedPage(path: string): string[] {
  const pinned = getPinnedPages()
  const next = pinned.includes(path) ? pinned.filter((p) => p !== path) : [...pinned, path]
  localStorage.setItem(PINNED_KEY, JSON.stringify(next))
  return next
}

export function trackRecentPage(path: string) {
  const recent = getRecentPages().filter((p) => p !== path)
  recent.unshift(path)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)))
}

function fuzzyMatch(query: string, item: CommandItem): boolean {
  const q = query.toLowerCase()
  if (item.label.toLowerCase().includes(q)) return true
  if (item.keywords?.some((k) => k.includes(q))) return true
  if (item.group.toLowerCase().includes(q)) return true
  return false
}

function itemsFromPaths(paths: string[]): CommandItem[] {
  return paths
    .map((path) => NAV_ITEMS.find((i) => i.path === path))
    .filter(Boolean) as CommandItem[]
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(() => getPinnedPages())
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setPinnedPaths(getPinnedPages())
    } else {
      setQuery('')
      setSelectedIndex(0)
    }
  }

  const recentPaths = useMemo(() => (open ? getRecentPages() : []), [open])

  const filtered = useMemo(() => {
    if (query.trim()) {
      return NAV_ITEMS.filter((item) => fuzzyMatch(query, item))
    }
    const pinned = itemsFromPaths(pinnedPaths)
    const recent = itemsFromPaths(recentPaths.filter((p) => !pinnedPaths.includes(p)))
    const rest = NAV_ITEMS.filter(
      (item) => item.path && !pinnedPaths.includes(item.path) && !recentPaths.includes(item.path),
    )
    return [...pinned, ...recent, ...rest]
  }, [query, recentPaths, pinnedPaths])

  const pinnedCount = query.trim() ? 0 : pinnedPaths.length
  const recentCount = query.trim()
    ? 0
    : itemsFromPaths(recentPaths.filter((p) => !pinnedPaths.includes(p))).length

  const selectItem = useCallback(
    (item: CommandItem) => {
      if (item.path) {
        trackRecentPage(item.path)
        navigate(item.path)
      } else if (item.action) {
        item.action()
      }
      onOpenChange(false)
      setQuery('')
    },
    [navigate, onOpenChange],
  )

  const handleTogglePin = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    setPinnedPaths(togglePinnedPage(path))
  }

  const filterKey = `${query}\0${pinnedPaths.join(',')}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    if (selectedIndex !== 0) setSelectedIndex(0)
  }

  const activeIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1))

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault()
        selectItem(filtered[activeIndex])
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, activeIndex, selectItem, onOpenChange])

  const renderItem = (item: CommandItem, index: number, section?: 'pinned' | 'recent') => {
    const isPinned = item.path ? pinnedPaths.includes(item.path) : false

    return (
      <div key={`${section ?? 'all'}-${item.id}`} className="relative group">
        <button
          type="button"
          onClick={() => selectItem(item)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-[var(--ds-radius-md)] text-left ds-transition-base',
            index === activeIndex
              ? 'bg-[var(--ds-primary-50)] text-[var(--ds-primary-700)]'
              : 'text-[var(--ds-text-primary)] hover:bg-[var(--ds-surface-sunken)]',
          )}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-[var(--ds-text-base)]">{item.label}</span>
          {section === 'pinned' ? (
            <Pin className="w-3 h-3 text-[var(--ds-primary-600)] shrink-0" aria-hidden />
          ) : null}
          <span className="text-[var(--ds-text-xs)] text-[var(--ds-text-subtle)]">{item.group}</span>
        </button>
        {item.path ? (
          <button
            type="button"
            aria-label={isPinned ? 'Unpin page' : 'Pin page'}
            onClick={(e) => handleTogglePin(e, item.path!)}
            className={cn(
              'absolute right-16 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-[var(--ds-radius-md)]',
              'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ds-transition-base',
              'hover:bg-[var(--ds-surface-sunken)] text-[var(--ds-text-muted)]',
              isPinned && 'opacity-100 text-[var(--ds-primary-600)]',
            )}
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--ds-z-modal)] bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[12%] z-[var(--ds-z-modal)] w-full max-w-2xl -translate-x-1/2 rounded-[var(--ds-radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-[var(--ds-shadow-3)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-[var(--ds-border)]">
              <Search className="w-4 h-4 text-[var(--ds-text-muted)] shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions..."
                className="flex-1 h-10 bg-transparent text-[var(--ds-text-base)] text-[var(--ds-text-primary)] outline-none placeholder:text-[var(--ds-text-subtle)] ds-transition-base rounded-[var(--ds-radius-md)] px-2"
              />
              <kbd className="hidden sm:inline text-[var(--ds-text-xs)] text-[var(--ds-text-subtle)] bg-[var(--ds-surface-sunken)] px-1 py-0.5 rounded border border-[var(--ds-border)]">
                ESC
              </kbd>
            </div>
            <div className="max-h-[min(28rem,70vh)] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : query.trim() ? (
                filtered.map((item, index) => renderItem(item, index))
              ) : (
                <>
                  {pinnedCount > 0 && (
                    <>
                      <p className="px-2 py-1 text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] text-[var(--ds-text-subtle)] uppercase tracking-[var(--ds-tracking-wide)] flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </p>
                      {itemsFromPaths(pinnedPaths).map((item, index) => renderItem(item, index, 'pinned'))}
                    </>
                  )}
                  {recentCount > 0 && (
                    <>
                      <p className="px-2 py-1 mt-1 text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] text-[var(--ds-text-subtle)] uppercase tracking-[var(--ds-tracking-wide)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Recent
                      </p>
                      {itemsFromPaths(recentPaths.filter((p) => !pinnedPaths.includes(p))).map((item, index) =>
                        renderItem(item, index + pinnedCount, 'recent'),
                      )}
                    </>
                  )}
                  {(pinnedCount > 0 || recentCount > 0) && (
                    <p className="px-2 py-1 mt-1 text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] text-[var(--ds-text-subtle)] uppercase tracking-[var(--ds-tracking-wide)]">
                      All pages
                    </p>
                  )}
                  {NAV_ITEMS.filter(
                    (item) =>
                      item.path &&
                      !pinnedPaths.includes(item.path) &&
                      !recentPaths.includes(item.path),
                  ).map((item, index) => renderItem(item, index + pinnedCount + recentCount))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}
