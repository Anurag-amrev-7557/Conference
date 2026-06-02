import React, { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../lib/utils'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminTheme } from '../providers/AdminThemeProvider'

export function Breadcrumb({
  items,
  className,
}: {
  items: Array<{ label: string; path?: string }>
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 min-w-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--ds-text-subtle)] shrink-0" aria-hidden />
            )}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)] truncate ds-transition-base"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'text-[var(--ds-text-sm)] truncate',
                  isLast ? 'text-[var(--ds-text-primary)] font-[var(--ds-font-medium)]' : 'text-[var(--ds-text-muted)]',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = 'underline',
  className,
}: {
  items: Array<{ id: string; label: string; icon?: React.ElementType }>
  activeId: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pill'
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1',
        variant === 'underline' && 'border-b border-[var(--ds-border)]',
        variant === 'pill' && 'bg-[var(--ds-surface-sunken)] p-1 rounded-[var(--ds-radius-lg)]',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] ds-transition-base cursor-pointer',
              variant === 'underline' && cn(
                'border-b-2 -mb-px',
                isActive
                  ? 'border-[var(--ds-primary-700)] text-[var(--ds-primary-700)]'
                  : 'border-transparent text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)]',
              ),
              variant === 'pill' && cn(
                'rounded-[var(--ds-radius-md)]',
                isActive
                  ? 'bg-[var(--ds-surface-elevated)] text-[var(--ds-text-primary)] shadow-[var(--ds-shadow-1)]'
                  : 'text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)]',
              ),
            )}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('mb-[var(--ds-space-8)]', className)}>
      {breadcrumb && <div className="mb-[var(--ds-space-3)]">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[var(--ds-text-xl)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)] leading-[var(--ds-leading-tight)] tracking-[var(--ds-tracking-tight)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-[var(--ds-space-2)] text-[var(--ds-text-base)] text-[var(--ds-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 ds-actions-mobile-stack">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export function SidebarNavTooltip({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) {
  const { theme } = useAdminTheme()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const show = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 })
  }, [])

  const hide = useCallback(() => setCoords(null), [])

  return (
    <>
      <span
        ref={wrapRef}
        className="admin-sidebar-tooltip-wrap"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {coords
        ? createPortal(
            <span
              role="tooltip"
              className="admin-shell admin-sidebar-tooltip admin-sidebar-tooltip--fixed"
              data-theme={theme}
              style={{ top: coords.top, left: coords.left }}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}

/** @deprecated Prefer SidebarNavTooltip for collapsed sidebar items */
export function Tooltip({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) {
  return <SidebarNavTooltip content={content}>{children}</SidebarNavTooltip>
}
