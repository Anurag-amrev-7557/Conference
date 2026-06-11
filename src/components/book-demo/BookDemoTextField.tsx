import { memo } from 'react'
import { cn } from '../../lib/utils'

type BookDemoTextFieldProps = {
  label: string
  name: string
  type: 'text' | 'email' | 'tel' | 'url'
  autoComplete: string
  placeholder?: string
  value: string
  error?: string
  disabled: boolean
  required: boolean
  onChange: (value: string) => void
}

export const BookDemoTextField = memo(function BookDemoTextField({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  value,
  error,
  disabled,
  required,
  onChange,
}: BookDemoTextFieldProps) {
  return (
    <label className="book-demo-field">
      <span className="book-demo-field__label">{label}</span>
      <div className={cn('book-demo-control', error && 'book-demo-control--error')}>
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className="book-demo-input"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error ? (
        <span className="book-demo-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
})
