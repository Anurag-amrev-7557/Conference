import React, { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { api } from '../../lib/api'
import { AdminField, AdminInput } from './admin-ui'
import { AdminEditorField, AdminEditorInput } from './admin-editor-ui'
import { cn } from '../../lib/utils'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'

type MediaUrlFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  hint?: string
  editor?: boolean
  maxLength?: number
}

export const MediaUrlField: React.FC<MediaUrlFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://…',
  hint,
  editor = false,
  maxLength = 500,
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

  const uploadControls = (
    <>
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
          'admin-btn admin-btn--secondary admin-editor-upload-btn text-sm',
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
      {error && <p className="admin-editor-field__error">{error}</p>}
    </>
  )

  if (editor) {
    return (
      <AdminEditorField
        label={label}
        hint={hint}
        value={value}
        maxLength={maxLength}
        showCharCount={Boolean(maxLength)}
      >
        <AdminEditorInput
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <div className="admin-editor-upload-row mt-2">{uploadControls}</div>
      </AdminEditorField>
    )
  }

  return (
    <AdminField label={label}>
      <div className="space-y-2">
        <AdminInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {uploadControls}
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    </AdminField>
  )
}
