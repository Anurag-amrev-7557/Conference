import { Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { TextInput } from './TextInput'

const DEFAULT_PRESETS = [
  '#003E99',
  '#0052cc',
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#111111',
  '#555555',
]

type ColorPickerProps = {
  value: string
  onChange: (value: string) => void
  presets?: string[]
  label?: string
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label,
  className,
}: ColorPickerProps) {
  const normalized = value.toLowerCase()

  return (
    <div className={cn('flex flex-col gap-[var(--ds-space-4)]', className)}>
      {label ? (
        <span className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </span>
      ) : null}
      <div className="admin-color-grid">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'admin-color-swatch',
              normalized === color.toLowerCase() && 'admin-color-swatch--active',
            )}
            style={{ backgroundColor: color }}
            aria-label={`Use ${color}`}
          >
            {normalized === color.toLowerCase() && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow" aria-hidden />
              </span>
            )}
          </button>
        ))}
      </div>
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#0052cc"
        className="font-mono text-sm max-w-xs"
        label="Custom hex"
      />
    </div>
  )
}
