import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium rounded-[var(--ds-radius-full)] border px-2 py-0.5 text-[var(--ds-text-xs)] tracking-[var(--ds-tracking-wide)] uppercase',
  {
    variants: {
      variant: {
        success: 'bg-[var(--ds-success-bg)] text-[var(--ds-success-text)] border-[var(--ds-success-border)]',
        warning: 'bg-[var(--ds-warning-bg)] text-[var(--ds-warning-text)] border-[var(--ds-warning-border)]',
        danger: 'bg-[var(--ds-danger-bg)] text-[var(--ds-danger-text)] border-[var(--ds-danger-border)]',
        info: 'bg-[var(--ds-info-bg)] text-[var(--ds-info-text)] border-[var(--ds-info-border)]',
        neutral: 'bg-[var(--ds-surface-sunken)] text-[var(--ds-text-muted)] border-[var(--ds-border)]',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
