import React, { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { api } from '../../lib/api'
import { AdminField, AdminInput } from './admin-ui'
import { cn } from '../../lib/utils'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

type MediaUrlFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  hint?: string
}

export const MediaUrlField: React.FC<MediaUrlFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://…',
  hint,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <AdminField label={label}>
      <div className="space-y-2">
        <AdminInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
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
            'admin-btn admin-btn--secondary w-full text-sm',
            uploading && 'opacity-60',
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload from media library
            </>
          )}
        </button>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </AdminField>
  )
}
