import React, { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

type OgImageUploadProps = {
  value: string
  onChange: (url: string) => void
  getToken: () => string
}

export const OgImageUpload: React.FC<OgImageUploadProps> = ({ value, onChange, getToken }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const token = getToken()
      const { url } = await api.uploadOgImage(token, file)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
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
        className={cn(
          'admin-btn admin-btn--secondary !min-h-[3rem]',
          uploading ? 'opacity-60 cursor-not-allowed' : '',
        )}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : 'Upload image'}
      </button>
      {error ? (
        <p className="admin-field__hint text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {value ? (
        <div className="aspect-[1.91/1] max-w-md rounded-xl overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}
    </div>
  )
}
