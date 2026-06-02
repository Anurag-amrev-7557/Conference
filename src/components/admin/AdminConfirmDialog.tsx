import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { AdminButton } from './admin-ui'

type AdminConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-confirm-overlay" />
        <Dialog.Content
          className="admin-confirm-dialog"
          onPointerDownOutside={(e) => loading && e.preventDefault()}
          onEscapeKeyDown={(e) => loading && e.preventDefault()}
        >
          <div
            className={cn(
              'admin-confirm-dialog__icon',
              variant === 'danger' && 'admin-confirm-dialog__icon--danger',
              variant === 'primary' && 'admin-confirm-dialog__icon--primary',
            )}
            aria-hidden
          >
            <AlertTriangle className="h-6 w-6" strokeWidth={2} />
          </div>
          <Dialog.Title className="admin-confirm-dialog__title">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description asChild>
              <div className="admin-confirm-dialog__desc">{description}</div>
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="admin-confirm-dialog__actions">
            <AdminButton
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </AdminButton>
            <AdminButton
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {confirmLabel}
            </AdminButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
