import { cn } from '../../../lib/utils'

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  mode?: 'date' | 'datetime-local' | 'time'
  label?: string
  hint?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  mode = 'datetime-local',
  label,
  hint,
  className,
  disabled,
}: DatePickerProps) {
  return (
    <div className={cn('flex flex-col gap-[var(--ds-space-2)]', className)}>
      {label ? (
        <label className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </label>
      ) : null}
      <input
        type={mode}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input h-[var(--ds-input-height)] text-[var(--ds-text-base)] text-[var(--ds-text-primary)]"
      />
      {hint ? (
        <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)] m-0">{hint}</p>
      ) : null}
    </div>
  )
}

