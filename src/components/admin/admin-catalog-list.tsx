import { Edit2, Plus, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Tabs, SkeletonCard } from './ui'

export type CatalogView = 'active' | 'trash'

export function CatalogViewToggle({
  view,
  onChange,
  activeLabel = 'Active',
  trashLabel = 'Trash',
  className,
}: {
  view: CatalogView
  onChange: (view: CatalogView) => void
  activeLabel?: string
  trashLabel?: string
  className?: string
}) {
  return (
    <Tabs
      variant="pill"
      activeId={view}
      onChange={(id) => onChange(id as CatalogView)}
      className={cn('admin-catalog-view-toggle', className)}
      items={[
        { id: 'active', label: activeLabel },
        { id: 'trash', label: trashLabel },
      ]}
    />
  )
}

export function CatalogListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="admin-catalog-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export type PublishBadge = 'published' | 'draft' | 'scheduled' | 'expired' | 'trashed'

const publishBadgeClass: Record<PublishBadge, string> = {
  published: 'admin-catalog-item__status--live',
  draft: 'admin-catalog-item__status--draft',
  scheduled: 'admin-catalog-item__status--scheduled',
  expired: 'admin-catalog-item__status--expired',
  trashed: 'admin-catalog-item__status--trashed',
}

const publishBadgeLabel: Record<PublishBadge, string> = {
  published: 'Live',
  draft: 'Draft',
  scheduled: 'Scheduled',
  expired: 'Expired',
  trashed: 'Trashed',
}

export function CatalogItemCard({
  title,
  meta,
  thumbnail,
  publishBadge,
  extraBadges,
  view,
  canEdit,
  isSuperAdmin,
  onEdit,
  onTrash,
  onRestore,
  onPermanentDelete,
}: {
  title: string
  meta?: React.ReactNode
  thumbnail?: React.ReactNode
  publishBadge?: PublishBadge
  extraBadges?: React.ReactNode
  view: CatalogView
  canEdit: boolean
  isSuperAdmin?: boolean
  onEdit?: () => void
  onTrash?: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
}) {
  return (
    <article className="admin-catalog-item group">
      {thumbnail ? <div className="admin-catalog-item__thumb">{thumbnail}</div> : null}

      <div className="admin-catalog-item__body">
        <h3 className="admin-catalog-item__title">{title}</h3>
        <div className="admin-catalog-item__meta">
          {meta ? <span className="admin-catalog-item__category">{meta}</span> : null}
          {publishBadge ? (
            <span className={cn('admin-catalog-item__status', publishBadgeClass[publishBadge])}>
              {publishBadgeLabel[publishBadge]}
            </span>
          ) : null}
          {extraBadges}
        </div>
      </div>

      <div className="admin-catalog-item__actions">
        {view === 'active' && canEdit && (
          <>
            <button type="button" className="admin-catalog-item__action" onClick={onEdit} aria-label="Edit">
              <Edit2 className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              className="admin-catalog-item__action admin-catalog-item__action--danger"
              onClick={onTrash}
              aria-label="Move to trash"
            >
              <Trash2 className="w-4 h-4" aria-hidden />
            </button>
          </>
        )}
        {view === 'trash' && canEdit && (
          <button type="button" className="admin-catalog-item__action" onClick={onRestore} aria-label="Restore">
            <RotateCcw className="w-4 h-4" aria-hidden />
          </button>
        )}
        {view === 'trash' && isSuperAdmin && (
          <button
            type="button"
            className="admin-catalog-item__action admin-catalog-item__action--danger"
            onClick={onPermanentDelete}
            aria-label="Delete permanently"
          >
            <XCircle className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>
    </article>
  )
}

export function CatalogListHeader({
  view,
  onViewChange,
  canEdit,
  newLabel,
  onNew,
}: {
  view: CatalogView
  onViewChange: (v: CatalogView) => void
  canEdit: boolean
  newLabel: string
  onNew?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[var(--ds-space-3)] mb-[var(--ds-space-5)]">
      <CatalogViewToggle view={view} onChange={onViewChange} />
      {view === 'active' && canEdit && onNew && (
        <button type="button" className="admin-btn admin-btn--primary" onClick={onNew}>
          <Plus className="w-4 h-4" aria-hidden />
          {newLabel}
        </button>
      )}
    </div>
  )
}

export function getPublishBadge(
  isPublished: boolean,
  scheduleBadge: 'scheduled' | 'expired' | null,
  isTrash: boolean,
): PublishBadge {
  if (isTrash) return 'trashed'
  if (scheduleBadge === 'scheduled') return 'scheduled'
  if (scheduleBadge === 'expired') return 'expired'
  return isPublished ? 'published' : 'draft'
}
