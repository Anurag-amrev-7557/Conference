import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAdminTheme } from './providers/AdminThemeProvider';

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  busy?: boolean;
  /** When set, user must type this exact string to enable confirm (e.g. username). */
  requireConfirmText?: string;
  requireConfirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  requireConfirmText,
  requireConfirmLabel,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  const { theme } = useAdminTheme();
  const [confirmInput, setConfirmInput] = useState('');

  const needsTypedConfirm = Boolean(requireConfirmText);
  const confirmMatches =
    !needsTypedConfirm || confirmInput.trim() === requireConfirmText?.trim();

  const handleCancel = useCallback(() => {
    setConfirmInput('');
    onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    setConfirmInput('');
  }, [onConfirm]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) handleCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, busy, handleCancel]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="admin-modal-root" data-theme={theme} role="presentation">
          <motion.button
            type="button"
            className="admin-modal-backdrop"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && handleCancel()}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-message"
            className="admin-shell admin-modal"
            data-theme={theme}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="admin-modal__close"
              aria-label="Close"
              disabled={busy}
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </button>
            <div className={variant === 'danger' ? 'admin-modal__icon admin-modal__icon--danger' : 'admin-modal__icon'}>
              <AlertTriangle className="w-5 h-5" aria-hidden />
            </div>
            <h2 id="admin-confirm-title" className="admin-modal__title">
              {title}
            </h2>
            <p id="admin-confirm-message" className="admin-modal__message">
              {message}
            </p>
            {needsTypedConfirm ? (
              <div className="admin-modal__confirm-field">
                <label htmlFor="admin-confirm-typed" className="admin-modal__confirm-label">
                  {requireConfirmLabel ?? `Type ${requireConfirmText} to confirm`}
                </label>
                <input
                  id="admin-confirm-typed"
                  type="text"
                  className="admin-input"
                  value={confirmInput}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  onChange={(e) => setConfirmInput(e.target.value)}
                />
              </div>
            ) : null}
            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                disabled={busy}
                onClick={handleCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={cn(
                  'admin-btn',
                  variant === 'danger' ? 'admin-btn--danger-solid' : 'admin-btn--primary',
                )}
                disabled={busy || !confirmMatches}
                onClick={() => void handleConfirm()}
              >
                {busy ? 'Working…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
