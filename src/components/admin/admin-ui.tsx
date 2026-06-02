import React, { cloneElement, isValidElement, useId, useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAdminSession } from './useAdminSession'
import { filterSubnavByPermissions, type AdminPageId } from '../../lib/adminPermissions'

function slugifyId(id: string) {
  return id.replace(/:/g, '')
}

function linkControlId(children: React.ReactNode, controlId: string): React.ReactNode {
  if (!isValidElement(children)) return children
  const props = children.props as { id?: string }
  if (props.id) return children
  return cloneElement(children, { id: controlId } as Record<string, string>)
}

export function AdminPageIntro({
  eyebrow,
  title,
  lede,
  compact,
  className,
}: {
  eyebrow?: string
  title?: string
  lede?: string
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return lede ? (
      <header className={cn('admin-page-intro admin-page-intro--compact', className)}>
        <p className="admin-page-intro__lede">{lede}</p>
      </header>
    ) : null
  }

  return (
    <header className={cn('admin-page-intro admin-page-intro--v2', className)}>
      {eyebrow && (
        <p className="admin-page-intro__eyebrow text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] uppercase tracking-[var(--ds-tracking-wide)] text-[var(--ds-text-subtle)]">
          {eyebrow}
        </p>
      )}
      {title ? (
        <h2 className="admin-page-intro__title text-[var(--ds-text-xl)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)] tracking-[var(--ds-tracking-tight)]">
          {title}
        </h2>
      ) : null}
      {lede && (
        <p className="admin-page-intro__lede text-[var(--ds-text-base)] text-[var(--ds-text-muted)] mt-[var(--ds-space-2)]">
          {lede}
        </p>
      )}
    </header>
  )
}

export function AdminCard({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'admin-card rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-elevated)] p-[var(--ds-space-5)] shadow-[var(--ds-shadow-1)]',
      className,
    )}>
      {title && (
        <h3 className="admin-card__title text-[var(--ds-text-md)] font-[var(--ds-font-medium)] mb-[var(--ds-space-4)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export function AdminField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
  className?: string
}) {
  const generatedId = slugifyId(useId())
  const controlId = htmlFor ?? generatedId
  const control = linkControlId(children, controlId)

  return (
    <div className={cn('admin-field', className)}>
      <label htmlFor={controlId} className="admin-field__label">
        {label}
      </label>
      {control}
      {error ? (
        <p className="admin-field__error text-[var(--ds-text-sm)] text-[var(--ds-danger-text)]" role="alert">{error}</p>
      ) : hint ? (
        <p className="admin-field__hint text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]" id={`${controlId}-hint`}>{hint}</p>
      ) : null}
    </div>
  )
}

export function AdminPanelTabIntro({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <header className={cn('admin-panel-tab-intro', className)}>
      <h2 className="admin-panel-tab-intro__title">{title}</h2>
      <p className="admin-panel-tab-intro__desc">{description}</p>
    </header>
  )
}

export function AdminFormSection({
  title,
  description,
  action,
  children,
  variant = 'default',
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'card'
  className?: string
}) {
  return (
    <section className={cn('admin-form-section', variant === 'card' && 'admin-form-section--card', className)}>
      <header className="admin-form-section__header">
        <div className="admin-form-section__titles">
          <h3 className="admin-form-section__title">{title}</h3>
          {description ? (
            <p className="admin-form-section__desc">{description}</p>
          ) : null}
        </div>
        {action ? <div className="admin-form-section__action shrink-0">{action}</div> : null}
      </header>
      <div className="admin-form-section__body">{children}</div>
    </section>
  )
}

export function AdminFieldGrid({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}) {
  return (
    <div
      className={cn(
        'admin-field-grid',
        columns === 1 && 'admin-field-grid--1',
        columns === 2 && 'admin-field-grid--2',
        columns === 3 && 'admin-field-grid--3',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      className={cn(
        'admin-input w-full h-[var(--ds-input-height)] px-3 text-[var(--ds-text-base)]',
        'bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]',
        'ds-focus-ring ds-transition-base placeholder:text-[var(--ds-text-subtle)]',
        className,
      )}
      {...rest}
    />
  )
}

export const AdminTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function AdminTextarea(props, ref) {
  const { className, ...rest } = props
  return (
    <textarea
      ref={ref}
      className={cn(
        'admin-input w-full min-h-[80px] px-3 py-2 text-[var(--ds-text-base)] resize-y',
        'bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]',
        'ds-focus-ring ds-transition-base placeholder:text-[var(--ds-text-subtle)]',
        className,
      )}
      {...rest}
    />
  )
})

export function AdminHeaderSave({
  label,
  saving = false,
  disabled,
  onClick,
}: {
  label: string
  saving?: boolean
  disabled?: boolean
  onClick: () => void | Promise<void>
}) {
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!saving && success) {
      const t = setTimeout(() => setSuccess(false), 1500)
      return () => clearTimeout(t)
    }
    return undefined
  }, [saving, success])

  const handleClick = async () => {
    try {
      await onClick()
      setSuccess(true)
    } catch {
      /* save failed — keep default label */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || saving}
      className={cn('admin-btn admin-btn--primary admin-header-save shrink-0')}
    >
      {saving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          Saving…
        </>
      ) : success ? (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Saved
        </>
      ) : (
        <>
          <Save className="w-4 h-4" aria-hidden />
          {label}
        </>
      )}
    </button>
  )
}

const adminButtonVariantClass = {
  primary: 'admin-btn--primary',
  secondary: 'admin-btn--secondary',
  ghost: 'admin-btn--ghost',
  danger: 'admin-btn--danger',
} as const

export function AdminButton({
  variant = 'primary',
  className,
  children,
  type = 'button',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn('admin-btn', 'admin-btn--compact', adminButtonVariantClass[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

type AdminSubnavItem = { id: string; label: string; icon: React.ElementType }

export function AdminSubnav({
  items,
  groups,
  title: _title,
  activeId,
  onSelect,
  footer,
  className,
  pageId,
}: {
  items?: AdminSubnavItem[]
  groups?: { label: string; items: AdminSubnavItem[] }[]
  title?: string
  activeId: string
  onSelect: (id: string) => void
  footer?: React.ReactNode
  className?: string
  pageId?: AdminPageId
}) {
  const { role, permissions } = useAdminSession()
  const filterItems = (list: AdminSubnavItem[]) =>
    pageId ? filterSubnavByPermissions(role, pageId, list, permissions) : list

  const sections = (
    groups ??
    (items ? [{ label: '', items }] : [])
  )
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <aside className={cn('admin-page-subnav', className)} aria-label="Section navigation">
      <nav className="admin-nav admin-page-subnav__nav" role="tablist">
        {sections.map((section, index) => (
          <div
            key={section.label || `section-${index}`}
            className={cn('admin-nav-group', index > 0 && 'admin-nav-group--spaced')}
          >
            {section.label ? <p className="admin-nav-group__label">{section.label}</p> : null}
            <div className="admin-nav-group__items">
              {section.items.map((item) => {
                const isActive = activeId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'admin-shell__nav-link admin-shell__nav-link--v2',
                      isActive && 'admin-shell__nav-link--active',
                    )}
                  >
                    {isActive ? <span className="admin-shell__nav-link-accent" aria-hidden /> : null}
                    <item.icon className="admin-shell__nav-icon shrink-0" aria-hidden />
                    <span className="admin-shell__nav-label truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      {footer ? <div className="admin-page-subnav__footer">{footer}</div> : null}
    </aside>
  )
}
