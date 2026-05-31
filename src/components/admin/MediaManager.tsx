import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Copy,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { api, type MediaLibraryItem } from '../../lib/api'
import { resolveAssetUrl } from '../../lib/assetUrl'
import { cn } from '../../lib/utils'
import { AdminButton, AdminInput, AdminPageIntro } from './admin-ui'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export const MediaManager: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<MediaLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || ''

  const loadLibrary = useCallback(async (): Promise<MediaLibraryItem[]> => {
    setError(null)
    setLoading(true)
    try {
      const { items: next } = await api.listMedia(getToken())
      setItems(next)
      setSelectedFilename((prev) => {
        if (prev && next.some((i) => i.filename === prev)) return prev
        return next[0]?.filename ?? null
      })
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

  const selected = useMemo(
    () => items.find((i) => i.filename === selectedFilename) ?? null,
    [items, selectedFilename],
  )

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
    try {
      const { url } = await api.uploadMediaImage(getToken(), file)
      const next = await loadLibrary()
      const uploaded = next.find((i) => i.url === url)
      if (uploaded) setSelectedFilename(uploaded.filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) void uploadFile(file)
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (item: MediaLibraryItem) => {
    if (!window.confirm(`Delete ${item.filename}? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      await api.deleteMedia(getToken(), item.filename)
      setItems((prev) => prev.filter((i) => i.filename !== item.filename))
      if (selectedFilename === item.filename) {
        setSelectedFilename(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="admin-workspace admin-media">
      <AdminPageIntro
        eyebrow="Site"
        title="Media library"
        lede="Upload images for covers, thumbnails, and inline URLs. OG crops (1200×630) use the SEO upload in each workspace."
      />

      <div className="admin-media__stack">
        <div className="admin-media__toolbar">
          <div className="relative flex-1 min-w-0 max-w-[22rem]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-subtle)] pointer-events-none"
              aria-hidden
            />
            <AdminInput
              type="search"
              placeholder="Search by filename or URL…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="!pl-9"
              aria-label="Search media"
            />
          </div>
          <AdminButton
            variant="secondary"
            onClick={() => void loadLibrary()}
            disabled={loading}
            className="!min-h-10"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </AdminButton>
          <span className="admin-media__count">
            {loading ? 'Loading…' : `${filtered.length} of ${items.length} file${items.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div
        role="button"
        tabIndex={0}
        className={cn('admin-media-dropzone', dragActive && 'admin-media-dropzone--active')}
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
        {uploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-primary)]" aria-hidden />
        ) : (
          <Upload className="w-8 h-8 text-[var(--admin-text-subtle)]" aria-hidden />
        )}
        <p className="admin-media-dropzone__title">
          {uploading ? 'Uploading…' : 'Drop an image here or click to upload'}
        </p>
        <p className="admin-media-dropzone__hint">JPEG, PNG, or WebP · max 5 MB · resized up to 1920px</p>
        </div>

        {error ? <p className="admin-error admin-media__error">{error}</p> : null}

        {loading ? (
        <div className="admin-media-grid" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="admin-media-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-media-empty">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-[var(--admin-text-subtle)]" aria-hidden />
          <p className="admin-media-empty__title">
            {items.length === 0 ? 'No uploads yet' : 'No matches'}
          </p>
          <p className="admin-media-empty__desc">
            {items.length === 0
              ? 'Upload your first image above. Files are stored on the API server and served from /media/.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className={cn('admin-media-layout', selected && 'admin-media-layout--detail')}>
          <div className="admin-media-grid" role="list">
            {filtered.map((item) => (
              <button
                key={item.filename}
                type="button"
                role="listitem"
                className={cn(
                  'admin-media-card',
                  selectedFilename === item.filename && 'admin-media-card--selected',
                )}
                onClick={() => setSelectedFilename(item.filename)}
              >
                <div className="admin-media-card__thumb">
                  <img src={resolveAssetUrl(item.url)} alt="" loading="lazy" />
                </div>
                <div className="admin-media-card__meta">
                  <span className="admin-media-card__ext">{item.ext}</span>
                  <span className="admin-media-card__size">{formatBytes(item.size)}</span>
                </div>
              </button>
            ))}
          </div>

          {selected ? (
            <aside className="admin-media-detail" aria-label="Selected image details">
              <div className="admin-media-detail__preview">
                <img src={resolveAssetUrl(selected.url)} alt="" />
              </div>
              <div className="admin-media-detail__url">
                <code>{selected.url}</code>
                <AdminButton
                  variant="secondary"
                  className="!min-h-9 !px-2 shrink-0"
                  title="Copy URL"
                  onClick={() => void copyUrl(selected.url)}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </AdminButton>
              </div>
              <dl className="admin-media-detail__facts">
                <div>
                  <dt>File</dt>
                  <dd>{selected.filename}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{formatBytes(selected.size)}</dd>
                </div>
                <div>
                  <dt>Uploaded</dt>
                  <dd>{formatDate(selected.createdAt)}</dd>
                </div>
              </dl>
              <div className="admin-media-detail__actions">
                <AdminButton variant="secondary" onClick={() => void copyUrl(selected.url)}>
                  <Copy className="w-4 h-4" />
                  Copy URL
                </AdminButton>
                <AdminButton
                  variant="danger"
                  disabled={deleting}
                  onClick={() => void handleDelete(selected)}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </AdminButton>
              </div>
              <p className="text-sm text-[var(--admin-text-muted)] mt-4 mb-0 leading-relaxed">
                Paste this URL into hero images, event thumbnails, article covers, or speaker photos.
              </p>
            </aside>
          ) : null}
        </div>
        )}
      </div>
    </div>
  )
}
