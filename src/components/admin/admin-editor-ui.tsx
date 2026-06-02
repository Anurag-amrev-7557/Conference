import React, { cloneElement, isValidElement, useId } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export type EditorPublishStatus = 'published' | 'draft' | 'scheduled'
export type EditorSaveStatus = 'saved' | 'saving' | 'unsaved' | 'idle'

export type EditorTabIntro = {
  breadcrumb: string
  title: string
  description: string
  status?: EditorPublishStatus
}

function slugifyId(id: string) {
  return id.replace(/:/g, '')
}

function linkControlId(children: React.ReactNode, controlId: string): React.ReactNode {
  if (!isValidElement(children)) return children
  const props = children.props as { id?: string }
  if (props.id) return children
  return cloneElement(children, { id: controlId } as Record<string, string>)
}

function charCountTone(current: number, max: number): 'default' | 'warn' | 'danger' {
  const ratio = current / max
  if (ratio > 0.95) return 'danger'
  if (ratio > 0.8) return 'warn'
  return 'default'
}

export function AdminEditorCharCount({ current, max }: { current: number; max: number }) {
  const tone = charCountTone(current, max)
  return (
    <p
      className={cn(
        'admin-editor-char-count',
        tone === 'warn' && 'admin-editor-char-count--warn',
        tone === 'danger' && 'admin-editor-char-count--danger',
      )}
      aria-live="polite"
    >
      {current} / {max}
    </p>
  )
}

export function AdminEditorStatusBadge({ status }: { status: EditorPublishStatus }) {
  const label =
    status === 'published' ? 'Published' : status === 'scheduled' ? 'Scheduled' : 'Draft'
  return (
    <span className={cn('admin-editor-status-badge', `admin-editor-status-badge--${status}`)}>
      {label}
    </span>
  )
}

export function AdminEditorSaveStatus({ status }: { status: EditorSaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="admin-editor-save-status" aria-live="polite">
        <Loader2 className="admin-editor-save-status__spinner" aria-hidden />
        Saving…
      </span>
    )
  }

  if (status === 'unsaved') {
    return (
      <span className="admin-editor-save-status admin-editor-save-status--unsaved" aria-live="polite">
        Unsaved changes
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="admin-editor-save-status" aria-live="polite">
        Saved just now
      </span>
    )
  }

  return (
    <span className="admin-editor-save-status admin-editor-save-status--idle" aria-hidden>
      Saved just now
    </span>
  )
}

function normalizeHeaderLabel(value: string) {
  return value.toLowerCase().replace(/\s+/g, '')
}

/** Avoid redundant eyebrow + title pairs like "Blog · Articles" + "Articles". */
function resolveEditorPageHeader(breadcrumb: string, title: string) {
  const segments = breadcrumb
    .split('·')
    .map((segment) => segment.trim())
    .filter(Boolean)
  if (segments.length === 0) return { eyebrow: null as string | null, title }

  const titleNorm = normalizeHeaderLabel(title)
  const last = segments[segments.length - 1]
  if (normalizeHeaderLabel(last) === titleNorm) {
    const parent = segments.slice(0, -1).join(' · ')
    return { eyebrow: parent || null, title }
  }

  const first = segments[0]
  if (segments.length > 1 && normalizeHeaderLabel(first) === titleNorm) {
    const rest = segments.slice(1).join(' · ')
    return { eyebrow: rest || null, title }
  }

  const joined = segments.map(normalizeHeaderLabel).join('')
  if (segments.length > 1 && joined === titleNorm) {
    return { eyebrow: segments[0], title }
  }

  return { eyebrow: breadcrumb, title }
}

export function AdminEditorPageHeader({
  breadcrumb,
  title,
  description,
  status,
  saveStatus = 'idle',
  aside,
}: {
  breadcrumb: string
  title: string
  description: string
  status?: EditorPublishStatus
  saveStatus?: EditorSaveStatus
  aside?: React.ReactNode
}) {
  const header = resolveEditorPageHeader(breadcrumb, title)

  return (
    <header className="admin-editor-page-header">
      <div className="admin-editor-page-header__main">
        {header.eyebrow ? (
          <p className="admin-editor-page-header__eyebrow">{header.eyebrow}</p>
        ) : null}
        <div className="admin-editor-page-header__title-row">
          <h1 className="admin-editor-page-header__title">{header.title}</h1>
          {status ? <AdminEditorStatusBadge status={status} /> : null}
        </div>
        <p className="admin-editor-page-header__subtitle">{description}</p>
      </div>
      <div className="admin-editor-page-header__aside">
        {aside}
        <AdminEditorSaveStatus status={saveStatus} />
      </div>
    </header>
  )
}

export function AdminEditorSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('admin-editor-section', className)}>
      <header className="admin-editor-section__header">
        <div className="admin-editor-section__lead">
          {Icon ? (
            <span className="admin-editor-section__icon" aria-hidden>
              <Icon />
            </span>
          ) : null}
          <div className="admin-editor-section__titles">
            <h2 className="admin-editor-section__title">{title}</h2>
            {description ? <p className="admin-editor-section__desc">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="admin-editor-section__action">{action}</div> : null}
      </header>
      <div className="admin-editor-section__body">{children}</div>
    </section>
  )
}

export function AdminEditorSubsection({
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
    <div className={cn('admin-editor-subsection', className)}>
      <header
        className={cn(
          'admin-editor-subsection__header',
          action && 'admin-editor-subsection__header--row',
        )}
      >
        <div className="admin-editor-subsection__titles">
          <h3 className="admin-editor-subsection__title">{title}</h3>
          {description ? <p className="admin-editor-subsection__desc">{description}</p> : null}
        </div>
        {action ? <div className="admin-editor-subsection__action">{action}</div> : null}
      </header>
      <div className="admin-editor-subsection__body">{children}</div>
    </div>
  )
}

export function AdminEditorField({
  label,
  htmlFor,
  hint,
  error,
  value,
  maxLength,
  showCharCount,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  value?: string
  maxLength?: number
  showCharCount?: boolean
  children: React.ReactNode
  className?: string
}) {
  const generatedId = slugifyId(useId())
  const controlId = htmlFor ?? generatedId
  const control = linkControlId(children, controlId)
  const currentLength = typeof value === 'string' ? value.length : 0
  const shouldCount = showCharCount && maxLength != null && maxLength > 0

  return (
    <div className={cn('admin-editor-field', className)}>
      <label htmlFor={controlId} className="admin-editor-field__label">
        {label}
      </label>
      {control}
      {error ? (
        <p className="admin-editor-field__error" role="alert">
          {error}
        </p>
      ) : hint || shouldCount ? (
        <div className="admin-editor-field__footer">
          {hint ? (
            <p className="admin-editor-field__hint" id={`${controlId}-hint`}>
              {hint}
            </p>
          ) : (
            <span />
          )}
          {shouldCount ? <AdminEditorCharCount current={currentLength} max={maxLength} /> : null}
        </div>
      ) : null}
    </div>
  )
}

export function AdminEditorInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, maxLength, ...rest } = props
  return (
    <input
      className={cn('admin-editor-input', className)}
      maxLength={maxLength}
      {...rest}
    />
  )
}

export const AdminEditorTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function AdminEditorTextarea(props, ref) {
  const { className, maxLength, ...rest } = props
  return (
    <textarea
      ref={ref}
      className={cn('admin-editor-input', className)}
      maxLength={maxLength}
      {...rest}
    />
  )
})

export function AdminEditorFields({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('admin-editor-fields', className)}>{children}</div>
}

/** Derive save status from manual save flow */
export function editorSaveStatusFrom(isSaving: boolean, isDirty: boolean): EditorSaveStatus {
  if (isSaving) return 'saving'
  if (isDirty) return 'unsaved'
  return 'idle'
}
