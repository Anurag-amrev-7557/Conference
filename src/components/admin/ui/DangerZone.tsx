import { ConfirmDialog } from './Modal'
import { useState } from 'react'

export function DangerZone({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-[var(--ds-radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-bg)] p-[var(--ds-space-5)] ${className ?? ''}`}
    >
      <h3 className="text-[var(--ds-text-md)] font-[var(--ds-font-medium)] text-[var(--ds-danger-text)]">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--ds-text-sm)] text-[var(--ds-danger-text)] opacity-90 mt-[var(--ds-space-2)]">
          {description}
        </p>
      )}
      <div className="mt-[var(--ds-space-4)]">{children}</div>
    </section>
  )
}

export function NavLinkEditor({
  links,
  onChange,
  emptyLabel = 'No links yet',
}: {
  links: Array<{ id: string; name: string; href: string }>
  onChange: (links: Array<{ id: string; name: string; href: string }>) => void
  emptyLabel?: string
}) {
  if (links.length === 0) {
    return (
      <p className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)] py-[var(--ds-space-4)] text-center border border-dashed border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="admin-list-editor admin-list-editor--v2 space-y-[var(--ds-space-3)]">
      {links.map((link, idx) => (
        <div key={link.id} className="admin-list-editor__row admin-list-editor__row--v2">
          <div className="admin-list-editor__fields grid grid-cols-1 sm:grid-cols-2 gap-[var(--ds-space-3)] flex-1">
            <div className="flex flex-col gap-[var(--ds-space-2)]">
              <label className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
                Label
              </label>
              <input
                className="admin-input"
                value={link.name}
                onChange={(e) => {
                  const next = [...links]
                  next[idx] = { ...next[idx], name: e.target.value }
                  onChange(next)
                }}
              />
            </div>
            <div className="flex flex-col gap-[var(--ds-space-2)]">
              <label className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
                URL path
              </label>
              <input
                className="admin-input font-mono text-sm"
                value={link.href}
                onChange={(e) => {
                  const next = [...links]
                  next[idx] = { ...next[idx], href: e.target.value }
                  onChange(next)
                }}
              />
            </div>
          </div>
          <button
            type="button"
            className="admin-list-editor__remove shrink-0 w-9 h-9 flex items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-danger-text)] hover:bg-[var(--ds-danger-bg)] border border-transparent hover:border-[var(--ds-danger-border)] ds-transition-base"
            aria-label="Remove link"
            onClick={() => onChange(links.filter((l) => l.id !== link.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function DangerZoneConfirm({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  trigger: (open: () => void) => React.ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      {trigger(() => setOpen(true))}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        variant="danger"
        loading={loading}
        onConfirm={async () => {
          setLoading(true)
          try {
            await onConfirm()
            setOpen(false)
          } finally {
            setLoading(false)
          }
        }}
      />
    </>
  )
}
