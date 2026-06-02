import { cn } from '../../../lib/utils'

export function SkeletonText({ lines = 1, className }: { lines?: 1 | 2 | 3; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="ds-skeleton h-3"
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)] p-[var(--ds-space-4)] bg-[var(--ds-surface-elevated)]',
        className,
      )}
    >
      <div className="ds-skeleton h-4 w-1/3 mb-3" />
      <div className="ds-skeleton h-8 w-1/2 mb-2" />
      <div className="ds-skeleton h-3 w-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex gap-4 pb-2 border-b border-[var(--ds-border)]">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="ds-skeleton h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="ds-skeleton h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonImage({ aspectRatio = '16/9', className }: { aspectRatio?: string; className?: string }) {
  return (
    <div
      className={cn('ds-skeleton w-full', className)}
      style={{ aspectRatio }}
    />
  )
}

export function PageLoader({ variant = 'dashboard' }: { variant?: 'dashboard' | 'table' | 'editor' | 'media' }) {
  if (variant === 'table') {
    return (
      <div className="p-[var(--ds-space-6)] space-y-[var(--ds-space-6)]">
        <SkeletonText lines={2} />
        <SkeletonTable rows={8} cols={5} />
      </div>
    )
  }
  if (variant === 'editor') {
    return (
      <div className="flex h-full">
        <div className="w-48 border-r border-[var(--ds-border)] p-4 space-y-2 hidden lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ds-skeleton h-8 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-6">
          <SkeletonText lines={2} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="ds-skeleton h-3 w-24" />
              <div className="ds-skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (variant === 'media') {
    return (
      <div className="p-[var(--ds-space-6)]">
        <div className="ds-skeleton h-32 w-full mb-6 rounded-[var(--ds-radius-lg)]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonImage key={i} aspectRatio="1" />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="p-[var(--ds-space-6)] space-y-[var(--ds-space-8)] ds-page-enter">
      <SkeletonText lines={2} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
