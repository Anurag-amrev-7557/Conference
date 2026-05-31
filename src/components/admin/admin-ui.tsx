import React, { cloneElement, isValidElement, useId } from 'react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '../../lib/utils'

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
  className,
}: {
  eyebrow?: string
  title: string
  lede?: string
  className?: string
}) {
  return (
    <header className={cn('admin-page-intro', className)}>
      {eyebrow && <p className="admin-page-intro__eyebrow">{eyebrow}</p>}
      <h2 className="admin-page-intro__title">{title}</h2>
      {lede && <p className="admin-page-intro__lede">{lede}</p>}
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
    <div className={cn('admin-card', className)}>
      {title && <h3 className="admin-card__title">{title}</h3>}
      {children}
    </div>
  )
}

export function AdminField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
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
      {hint ? <p className="admin-field__hint" id={`${controlId}-hint`}>{hint}</p> : null}
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
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('admin-form-section', className)}>
      <header className="admin-form-section__header">
        <div className="admin-form-section__titles">
          <h3 className="admin-form-section__title">{title}</h3>
          {description ? <p className="admin-form-section__desc">{description}</p> : null}
        </div>
        {action ? <div className="admin-form-section__action">{action}</div> : null}
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
  return <input className={cn('admin-input', className)} {...rest} />
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props
  return <textarea className={cn('admin-input', className)} {...rest} />
}

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
  return (
    <AdminButton
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || saving}
      className="admin-header-save shrink-0"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </AdminButton>
  )
}

export function AdminButton({
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  return (
    <button
      type={type}
      className={cn(
        'admin-btn',
        variant === 'primary' && 'admin-btn--primary',
        variant === 'secondary' && 'admin-btn--secondary',
        variant === 'ghost' && 'admin-btn--ghost',
        variant === 'danger' && 'admin-btn--danger',
        className,
      )}
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
  title = 'Sections',
  activeId,
  onSelect,
  footer,
  className,
}: {
  items?: AdminSubnavItem[]
  groups?: { label: string; items: AdminSubnavItem[] }[]
  title?: string
  activeId: string
  onSelect: (id: string) => void
  footer?: React.ReactNode
  className?: string
}) {
  const sections =
    groups ??
    (items ? [{ label: '', items }] : [])

  return (
    <nav className={cn('admin-subnav', className)} aria-label="Section navigation" role="tablist">
      <p className="admin-subnav__title" id="admin-subnav-heading">
        {title}
      </p>
      {sections.map((section, index) => (
        <div
          key={section.label || `section-${index}`}
          className={cn('admin-subnav__group', index > 0 && 'admin-subnav__group--spaced')}
        >
          {section.label ? (
            <p className="admin-subnav__group-label">{section.label}</p>
          ) : null}
          <div className="admin-subnav__group-items">
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
                    'admin-subnav__item',
                    isActive && 'admin-subnav__item--active',
                  )}
                >
                  <span
                    className={cn(
                      'admin-subnav__item-icon',
                      isActive && 'admin-subnav__item-icon--active',
                    )}
                    aria-hidden
                  >
                    <item.icon className="admin-subnav__item-icon-svg" />
                  </span>
                  <span className="admin-subnav__item-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {footer && <div className="admin-subnav__hint">{footer}</div>}
    </nav>
  )
}
