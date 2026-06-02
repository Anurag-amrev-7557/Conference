import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { api } from '../../../lib/api'
import { cn } from '../../../lib/utils'
import { Button } from './Button'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

type ImageUploadProps = {
  value: string
  onChange: (url: string) => void
  getToken?: () => string
  variant?: 'media' | 'og'
  label?: string
  hint?: string
  className?: string
  showPreview?: boolean
}

export function ImageUpload({
  value,
  onChange,
  getToken = () => localStorage.getItem('adminToken') || '',
  variant = 'media',
  label,
  hint,
  className,
  showPreview = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 5MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const token = getToken()
      const { url } =
        variant === 'og'
          ? await api.uploadOgImage(token, file)
          : await api.uploadMediaImage(token, file)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-[var(--ds-space-3)]', className)}>
      {label ? (
        <span className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </span>
      ) : null}
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
      <div className="flex flex-wrap items-center gap-[var(--ds-space-2)]">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload image'}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} aria-label="Remove image">
            <X className="w-4 h-4" />
            Clear
          </Button>
        ) : null}
      </div>
      {hint ? <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)] m-0">{hint}</p> : null}
      {error ? <p className="text-[var(--ds-text-sm)] text-[var(--ds-danger-text)] m-0">{error}</p> : null}
      {showPreview && value ? (
        <div
          className={cn(
            'rounded-[var(--ds-radius-lg)] overflow-hidden border border-[var(--ds-border)] bg-[var(--ds-surface-sunken)]',
            variant === 'og' ? 'aspect-[1.91/1] max-w-md' : 'max-w-xs',
          )}
        >
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}
    </div>
  )
}
