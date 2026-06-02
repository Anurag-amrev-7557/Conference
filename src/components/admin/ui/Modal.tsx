import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { AdminConfirmModal } from '../AdminConfirmModal'

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[var(--ds-z-modal)] bg-black/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-[var(--ds-z-modal)] w-full max-w-[640px] -translate-x-1/2 -translate-y-1/2',
                  'rounded-[var(--ds-radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]',
                  'shadow-[var(--ds-shadow-3)] ds-modal-mobile-full ds-modal-tablet',
                  className,
                )}
              >
                <div className="flex items-start justify-between gap-4 p-[var(--ds-space-6)] pb-0">
                  <div>
                    <Dialog.Title className="text-[var(--ds-text-lg)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
                      {title}
                    </Dialog.Title>
                    {description && (
                      <Dialog.Description className="mt-1 text-[var(--ds-text-base)] text-[var(--ds-text-muted)]">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-text-muted)] hover:bg-[var(--ds-surface-sunken)] ds-transition-base"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="p-[var(--ds-space-6)] max-h-[60vh] overflow-y-auto">{children}</div>
                {footer && (
                  <div className="flex items-center justify-end gap-2 p-[var(--ds-space-6)] pt-0 border-t border-[var(--ds-border)] mt-0 pt-4">
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  loading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  loading?: boolean
}) {
  return (
    <AdminConfirmModal
      open={open}
      title={title}
      message={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
      busy={loading}
      onConfirm={onConfirm}
      onCancel={() => onOpenChange(false)}
    />
  )
}

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  side = 'right',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  side?: 'right' | 'left'
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[var(--ds-z-drawer)] bg-black/40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: side === 'right' ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: side === 'right' ? '100%' : '-100%' }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                className={cn(
                  'fixed top-0 z-[var(--ds-z-drawer)] h-full w-full max-w-md',
                  'bg-[var(--ds-surface-overlay)] border-[var(--ds-border)] shadow-[var(--ds-shadow-3)]',
                  'flex flex-col',
                  side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                )}
              >
                <div className="flex items-center justify-between p-[var(--ds-space-4)] border-b border-[var(--ds-border)] shrink-0">
                  <Dialog.Title className="text-[var(--ds-text-lg)] font-[var(--ds-font-medium)]">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-[var(--ds-radius-md)] hover:bg-[var(--ds-surface-sunken)]" aria-label="Close">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-[var(--ds-space-4)]">{children}</div>
                {footer && (
                  <div className="shrink-0 p-[var(--ds-space-4)] border-t border-[var(--ds-border)] flex justify-end gap-2">
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
