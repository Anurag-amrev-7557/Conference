import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Copy,
  Grid3X3,
  ImageIcon,
  List,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { api, type MediaLibraryItem } from '../../lib/api'
import { resolveAssetUrl } from '../../lib/assetUrl'
import { cn } from '../../lib/utils'
import { AdminPageIntro } from './admin-ui'
import { AdminWorkspaceShell } from './AdminWorkspaceShell'
import { MEDIA_TAB_INTROS } from './workspaceTabIntros'
import {
  EmptyState,
  SkeletonImage,
  ConfirmDialog,
  Badge,
} from './ui'
import { useToast } from './ui/Toast'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

type ViewMode = 'grid' | 'list'

function MediaDetailPanel({
  item,
  copiedUrl,
  deleting,
  onClose,
  onCopy,
  onDelete,
}: {
  item: MediaLibraryItem
  copiedUrl: string | null
  deleting: boolean
  onClose: () => void
  onCopy: (url: string) => void
  onDelete: () => void
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="admin-media-detail"
      aria-label="Image details"
    >
      <header className="admin-media-detail__header">
        <h2 className="admin-media-detail__title">Image details</h2>
        <button
          type="button"
          className="admin-media-detail__close"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </header>

      <div className="admin-media-detail__preview">
        <img src={resolveAssetUrl(item.url)} alt="" />
      </div>

      <div className="admin-media-detail__field">
        <span className="admin-media-detail__field-label">URL</span>
        <div className="admin-media-detail__url">
          <code>{item.url}</code>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--icon admin-media-detail__copy"
            onClick={() => void onCopy(item.url)}
            aria-label="Copy URL"
          >
            {copiedUrl === item.url ? (
              <Check className="w-4 h-4 text-[var(--ds-success-text)]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <dl className="admin-media-detail__meta">
        <div className="admin-media-detail__meta-item admin-media-detail__meta-item--wide">
          <dt>Filename</dt>
          <dd title={item.filename}>{item.filename}</dd>
        </div>
        <div className="admin-media-detail__meta-item">
          <dt>Size</dt>
          <dd>{formatBytes(item.size)}</dd>
        </div>
        <div className="admin-media-detail__meta-item">
          <dt>Type</dt>
          <dd>{item.ext.toUpperCase()}</dd>
        </div>
        <div className="admin-media-detail__meta-item admin-media-detail__meta-item--wide">
          <dt>Uploaded</dt>
          <dd>{formatDate(item.createdAt)}</dd>
        </div>
      </dl>

      <div className="admin-media-detail__actions">
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => void onCopy(item.url)}>
          <Copy className="w-4 h-4" aria-hidden />
          Copy URL
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-btn--danger"
          disabled={deleting}
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" aria-hidden />
          Delete
        </button>
      </div>
    </motion.aside>
  )
}

export const MediaManager: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [items, setItems] = useState<MediaLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailItem, setDetailItem] = useState<MediaLibraryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaLibraryItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || ''

  const loadLibrary = useCallback(async (): Promise<MediaLibraryItem[]> => {
    setError(null)
    setLoading(true)
    try {
      const { items: next } = await api.listMedia(getToken())
      setItems(next)
      return next
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLibrary()
  }, [loadLibrary])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.ext.includes(q),
    )
  }, [items, query])

  const uploadFile = async (file: File) => {
    setError(null)
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use JPEG, PNG, or WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 5MB or smaller.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => (p !== null && p < 90 ? p + 10 : p))
    }, 200)

    try {
      const { url } = await api.uploadMediaImage(getToken(), file)
      setUploadProgress(100)
      const next = await loadLibrary()
      const uploaded = next.find((i) => i.url === url)
      if (uploaded) setDetailItem(uploaded)
      toast({ variant: 'success', title: 'Upload complete', description: file.name })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed.'
      setError(msg)
      toast({ variant: 'error', title: 'Upload failed', description: msg })
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      setUploadProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    const valid = Array.from(files).filter((file) => ACCEPT.split(',').includes(file.type))
    if (valid.length === 0) {
      setError('Use JPEG, PNG, or WebP.')
      return
    }
    if (valid.length < files.length) {
      toast({
        variant: 'warning',
        title: 'Some files skipped',
        description: 'Only JPEG, PNG, and WebP images are supported.',
      })
    }
    void (async () => {
      for (const file of valid) {
        await uploadFile(file)
      }
    })()
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast({ variant: 'success', title: 'URL copied' })
    window.setTimeout(() => setCopiedUrl((current) => (current === url ? null : current)), 2000)
  }

  const handleDelete = async (item: MediaLibraryItem) => {
    setDeleting(true)
    setError(null)
    try {
      await api.deleteMedia(getToken(), item.filename)
      setItems((prev) => prev.filter((i) => i.filename !== item.filename))
      setSelectedIds((prev) => {
        const n = new Set(prev)
        n.delete(item.filename)
        return n
      })
      if (detailItem?.filename === item.filename) setDetailItem(null)
      setDeleteTarget(null)
      toast({ variant: 'success', title: 'File deleted', description: item.filename })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed.'
      setError(msg)
      toast({ variant: 'error', title: 'Delete failed', description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const targets = items.filter((i) => selectedIds.has(i.filename))
    for (const item of targets) {
      await handleDelete(item)
    }
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  const toggleSelect = (filename: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(filename)) next.delete(filename)
      else next.add(filename)
      return next
    })
  }

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      contentEditor
      toolbar={<AdminPageIntro compact className="mb-0" lede="Upload and manage site images." />}
      editorHeader={MEDIA_TAB_INTROS}
      saveStatus={uploading || deleting ? 'saving' : 'idle'}
      editorHeaderAside={
        <div className="admin-page-metrics-inline">
          <span>{loading ? 'Loading…' : `${filtered.length} of ${items.length} files`}</span>
        </div>
      }
      headerAction={
        <>
          <div className="admin-media-view-toggle" role="tablist" aria-label="View mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'admin-media-view-toggle__btn--active')}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'admin-media-view-toggle__btn--active')}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => void loadLibrary()}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4" aria-hidden />
            Upload image
          </button>
        </>
      }
    >
      <div
        className={cn(
          'admin-catalog-panel admin-media-panel admin-media-layout',
          detailItem && 'admin-media-layout--detail',
        )}
      >
        <div className="admin-media-layout__main">
        <div className="admin-media-toolbar">
          <div className="admin-media-search">
            <Search className="admin-media-search__icon" aria-hidden />
            <input
              type="search"
              placeholder="Search by filename or URL…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search media"
              className="admin-editor-input admin-media-search__input"
            />
          </div>
          {selectedIds.size > 0 ? (
            <button
              type="button"
              className="admin-btn admin-btn--secondary admin-btn--danger"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              Delete {selectedIds.size} selected
            </button>
          ) : null}
        </div>

        <div
          role="button"
          tabIndex={0}
          className={cn(
            'admin-media-dropzone',
            dragActive && 'admin-media-dropzone--active',
            uploading && 'admin-media-dropzone--uploading',
          )}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            if (e.currentTarget === e.target) setDragActive(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Upload className="admin-media-dropzone__icon" aria-hidden />
          <p className="admin-media-dropzone__title">
            {uploading ? 'Uploading…' : 'Drop images here or click to upload'}
          </p>
          <p className="admin-media-dropzone__hint">JPEG, PNG, or WebP · max 5 MB each</p>
          {uploadProgress !== null ? (
            <div className="admin-media-dropzone__progress">
              <div
                className="admin-media-dropzone__progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'admin-media-grid admin-media-grid--loading'
                : 'admin-media-list admin-media-list--loading',
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonImage key={i} aspectRatio="1" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            heading={items.length === 0 ? 'No uploads yet' : 'No matches'}
            subtext={
              items.length === 0
                ? 'Upload your first image using the toolbar or dropzone above.'
                : 'Try a different search term.'
            }
            actionLabel={items.length === 0 ? 'Upload image' : undefined}
            onAction={items.length === 0 ? () => inputRef.current?.click() : undefined}
          />
        ) : viewMode === 'grid' ? (
          <div className="admin-media-grid" role="list">
            {filtered.map((item) => {
              const selected = selectedIds.has(item.filename)
              return (
                <div
                  key={item.filename}
                  role="listitem"
                  className={cn(
                    'admin-media-grid__item',
                    selected && 'admin-media-grid__item--selected',
                    detailItem?.filename === item.filename && 'admin-media-grid__item--active',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(item.filename)}
                    className="admin-media-grid__checkbox"
                    aria-label={`Select ${item.filename}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    className="admin-media-grid__thumb"
                    onClick={() => setDetailItem(item)}
                  >
                    <img src={resolveAssetUrl(item.url)} alt="" loading="lazy" />
                  </button>
                  <div className="admin-media-grid__meta">
                    <Badge variant="neutral" className="normal-case tracking-normal text-xs">
                      {item.ext}
                    </Badge>
                    <span>{formatBytes(item.size)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="admin-media-list">
            {filtered.map((item) => (
              <div key={item.filename} className="admin-media-list__row">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.filename)}
                  onChange={() => toggleSelect(item.filename)}
                  className="rounded"
                  aria-label={`Select ${item.filename}`}
                />
                <button
                  type="button"
                  onClick={() => setDetailItem(item)}
                  className="admin-media-list__thumb"
                >
                  <img src={resolveAssetUrl(item.url)} alt="" />
                </button>
                <button type="button" onClick={() => setDetailItem(item)} className="admin-media-list__body">
                  <p className="admin-media-list__name">{item.filename}</p>
                  <p className="admin-media-list__detail">
                    {formatBytes(item.size)} · {formatDate(item.createdAt)}
                  </p>
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--icon"
                  onClick={() => void copyUrl(item.url)}
                  aria-label={`Copy URL for ${item.filename}`}
                >
                  {copiedUrl === item.url ? (
                    <Check className="w-4 h-4 text-[var(--ds-success-text)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        </div>

        <AnimatePresence>
          {detailItem ? (
            <MediaDetailPanel
              key={detailItem.filename}
              item={detailItem}
              copiedUrl={copiedUrl}
              deleting={deleting}
              onClose={() => setDetailItem(null)}
              onCopy={copyUrl}
              onDelete={() => setDeleteTarget(detailItem)}
            />
          ) : null}
        </AnimatePresence>

        <ConfirmDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          title={`Delete ${selectedIds.size} files?`}
          description="Selected images will be removed permanently. This cannot be undone."
          confirmLabel="Delete all"
          variant="danger"
          loading={deleting}
          onConfirm={() => void handleBulkDelete()}
        />

        <ConfirmDialog
          open={deleteTarget != null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete file?"
          description={deleteTarget ? `Delete ${deleteTarget.filename}? This cannot be undone.` : ''}
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={() => {
            if (deleteTarget) void handleDelete(deleteTarget)
          }}
        />
      </div>
    </AdminWorkspaceShell>
  )
}
