import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium ds-btn-press ds-transition-base disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--ds-primary-700)] text-white hover:bg-[var(--ds-primary-800)] border border-transparent',
        secondary:
          'bg-[var(--ds-surface-elevated)] text-[var(--ds-text-primary)] border border-[var(--ds-border)] hover:bg-[var(--ds-surface-sunken)] hover:border-[var(--ds-border-strong)]',
        ghost:
          'bg-transparent text-[var(--ds-text-secondary)] hover:bg-[var(--ds-surface-sunken)] hover:text-[var(--ds-text-primary)] border border-transparent',
        danger:
          'bg-[var(--ds-danger-bg)] text-[var(--ds-danger-text)] border border-[var(--ds-danger-border)] hover:opacity-90',
      },
      size: {
        sm: 'h-[var(--ds-btn-height-sm)] px-3 text-[var(--ds-text-sm)] rounded-[var(--ds-radius-md)]',
        md: 'h-[var(--ds-btn-height-md)] px-4 text-[var(--ds-text-base)] rounded-[var(--ds-radius-md)]',
        lg: 'h-[var(--ds-btn-height-lg)] px-5 text-[var(--ds-text-base)] rounded-[var(--ds-radius-md)]',
        icon: 'h-[var(--ds-btn-height-md)] w-[var(--ds-btn-height-md)] p-0 rounded-[var(--ds-radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    success?: boolean
  }

export function Button({
  className,
  variant,
  size,
  loading,
  success,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      ) : success ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}

export { buttonVariants }
