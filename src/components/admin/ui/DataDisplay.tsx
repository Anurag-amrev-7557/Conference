import { cn } from '../../../lib/utils'

export function EmptyState({
  icon: Icon,
  heading,
  subtext,
  actionLabel,
  onAction,
  className,
}: {
  icon: React.ElementType
  heading: string
  subtext: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'admin-empty-state ds-page-enter flex flex-col items-center justify-center text-center py-[var(--ds-space-16)] px-[var(--ds-space-6)]',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-[var(--ds-radius-lg)] bg-[var(--editor-bg-secondary,var(--ds-surface-sunken))] border border-[var(--editor-border-secondary,var(--ds-border))] flex items-center justify-center mb-[var(--ds-space-4)]">
        <Icon className="w-6 h-6 text-[var(--editor-text-tertiary,var(--ds-text-muted))]" aria-hidden />
      </div>
      <h3 className="text-[var(--editor-fs-section,var(--ds-text-lg))] font-medium text-[var(--editor-text-primary,var(--ds-text-primary))] mb-[var(--ds-space-2)]">
        {heading}
      </h3>
      <p
        className={cn(
          'text-[var(--editor-fs-section-desc,var(--ds-text-base))] text-[var(--editor-text-secondary,var(--ds-text-muted))] max-w-sm',
          actionLabel && onAction ? 'mb-[var(--ds-space-6)]' : 'mb-0',
        )}
      >
        {subtext}
      </p>
      {actionLabel && onAction && (
        <button type="button" className="admin-btn admin-btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function StatCard({
  label,
  value,
  trend,
  trendValue,
  className,
}: {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-[var(--ds-text-muted)]',
  }

  return (
    <div
      className={cn(
        'rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-elevated)]',
        'p-[var(--ds-space-5)] shadow-[var(--ds-shadow-1)]',
        className,
      )}
    >
      <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)] font-[var(--ds-font-medium)] mb-[var(--ds-space-2)]">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-[var(--ds-text-2xl)] font-[var(--ds-font-semibold)] text-[var(--ds-text-primary)] leading-[var(--ds-leading-tight)]">
          {value}
        </p>
        {trend && trendValue && (
          <span className={cn('text-[var(--ds-text-sm)] font-[var(--ds-font-medium)]', trendColors[trend])}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}

export function ActivityFeed({
  items,
  className,
}: {
  items: Array<{
    id: string
    avatar?: string
    initials?: string
    description: React.ReactNode
    timestamp: string
    detail?: React.ReactNode
  }>
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex gap-3 py-[var(--ds-space-3)]',
            index < items.length - 1 && 'border-b border-[var(--ds-border)]',
          )}
        >
          <div className="shrink-0 w-8 h-8 rounded-[var(--ds-radius-full)] bg-[var(--ds-primary-100)] text-[var(--ds-primary-700)] flex items-center justify-center text-[var(--ds-text-xs)] font-[var(--ds-font-semibold)]">
            {item.avatar ? (
              <img src={item.avatar} alt="" className="w-full h-full rounded-[var(--ds-radius-full)] object-cover" />
            ) : (
              item.initials ?? '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--ds-text-base)] text-[var(--ds-text-primary)]">{item.description}</p>
            <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-subtle)] mt-0.5">{item.timestamp}</p>
            {item.detail && (
              <div className="mt-2 text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]">{item.detail}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
