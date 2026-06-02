import { useId } from 'react'
import { cn } from '../../../lib/utils'

export type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label?: string
  hint?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  maxLength?: number
  showCount?: boolean
}

export function TextInput({
  label,
  hint,
  error,
  prefix,
  suffix,
  maxLength,
  showCount,
  className,
  id: externalId,
  value,
  ...props
}: TextInputProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className={cn('flex flex-col gap-[var(--ds-space-2)]', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[var(--ds-text-base)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[var(--ds-text-muted)] pointer-events-none">{prefix}</span>
        )}
        <input
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'w-full h-[var(--ds-input-height)] px-3 text-[var(--ds-text-base)] text-[var(--ds-text-primary)]',
            'bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]',
            'ds-focus-ring ds-transition-base placeholder:text-[var(--ds-text-subtle)]',
            prefix && 'pl-9',
            suffix && 'pr-9',
            error && 'border-[var(--ds-danger-border)]',
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-[var(--ds-text-muted)]">{suffix}</span>
        )}
      </div>
      <div className="flex justify-between gap-2">
        {error ? (
          <p id={`${id}-error`} className="text-[var(--ds-text-sm)] text-[var(--ds-danger-text)]" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className={cn(
            'text-[var(--ds-text-xs)] text-[var(--ds-text-subtle)] ml-auto',
            charCount >= maxLength && 'text-[var(--ds-danger-text)]',
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
}

export function Textarea({
  label,
  hint,
  error,
  maxLength,
  showCount,
  className,
  id: externalId,
  value,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className={cn('flex flex-col gap-[var(--ds-space-2)]', className)}>
      {label && (
        <label htmlFor={id} className="text-[var(--ds-text-base)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={cn(
          'w-full min-h-[80px] px-3 py-2 text-[var(--ds-text-base)] text-[var(--ds-text-primary)] resize-y',
          'bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]',
          'ds-focus-ring ds-transition-base placeholder:text-[var(--ds-text-subtle)]',
          error && 'border-[var(--ds-danger-border)]',
        )}
        {...props}
      />
      <div className="flex justify-between gap-2">
        {error ? (
          <p className="text-[var(--ds-text-sm)] text-[var(--ds-danger-text)]" role="alert">{error}</p>
        ) : hint ? (
          <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]">{hint}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className="text-[var(--ds-text-xs)] text-[var(--ds-text-subtle)] ml-auto">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  id: externalId,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}) {
  const generatedId = useId()
  const id = externalId ?? generatedId

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3.5 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 shrink-0 w-11 h-6 rounded-[var(--ds-radius-full)] ds-transition-spring',
          'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-surface-elevated)]',
          checked
            ? 'bg-[var(--admin-primary,var(--ds-primary-700))] border-[var(--admin-primary,var(--ds-primary-700))]'
            : 'bg-[var(--admin-border-strong,var(--ds-neutral-300))] border-[var(--ds-border)]',
        )}
      >
        <span
          style={{
            left: checked ? 'calc(100% - 22px)' : '2px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          className={cn(
            'absolute w-5 h-5 rounded-full bg-[var(--ds-surface-elevated)] ds-transition-spring',
          )}
        />
      </button>
      <div className="flex flex-col gap-0.5">
        <span className="text-[var(--ds-text-base)] leading-[var(--ds-leading-tight)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </span>
        {description && (
          <span className="text-[var(--ds-text-sm)] leading-[var(--ds-leading-relaxed)] text-[var(--ds-text-muted)]">{description}</span>
        )}
      </div>
    </label>
  )
}
