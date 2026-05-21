import React, { useRef, useState } from 'react'
import { Copy, Image, Loader2, Upload } from 'lucide-react'
import { api } from '../../lib/api'
import { motion } from 'framer-motion'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

export const MediaManager: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUrl, setLastUrl] = useState('')

  const getToken = () => localStorage.getItem('adminToken') || ''

  const handleFile = async (file: File) => {
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
      setLastUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 lg:p-12 max-w-2xl">
      <div className="mb-10">
        <h3 className="text-3xl font-serif italic text-text mb-2">Media Library</h3>
        <p className="text-sm text-muted">
          Upload images for covers, thumbnails, and inline URLs. OG-specific crops still use the SEO
          tab (1200×630).
        </p>
      </div>

      <div className="rounded-[32px] border border-border/40 bg-white p-8 shadow-alabaster space-y-6">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 border border-dashed border-border rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload image
            </>
          )}
        </button>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {lastUrl ? (
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden border border-border/40 bg-off flex items-center justify-center">
              <img src={lastUrl} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex items-center gap-2 p-4 bg-off rounded-xl font-mono text-sm break-all">
              <Image className="w-4 h-4 shrink-0 text-muted" />
              <span className="flex-1">{lastUrl}</span>
              <button
                type="button"
                className="p-2 rounded-lg border border-border hover:border-accent"
                title="Copy URL"
                onClick={() => navigator.clipboard.writeText(lastUrl)}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted">
              Paste this path into hero video cover, event thumbnails, book cover, or article fields.
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
