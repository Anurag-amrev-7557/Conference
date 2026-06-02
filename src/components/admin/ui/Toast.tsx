import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useAdminTheme } from '../providers/AdminThemeProvider'

type ToastVariant = 'success' | 'warning' | 'error' | 'info'

type Toast = {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

type ToastContextValue = {
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'admin-toast--success',
  warning: 'admin-toast--warning',
  error: 'admin-toast--error',
  info: 'admin-toast--info',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { theme } = useAdminTheme()

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...opts, id }])
  }, [])

  const stack =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className="admin-shell admin-toast-stack"
            data-theme={theme}
            aria-live="polite"
          >
            <AnimatePresence>
              {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )
      : null

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {stack}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const duration = toast.duration ?? 5000
  const Icon = icons[toast.variant]

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn('admin-toast', variantStyles[toast.variant])}
    >
      <div className="admin-toast__body">
        <Icon className="admin-toast__icon" aria-hidden />
        <div className="admin-toast__content">
          <p className="admin-toast__title">{toast.title}</p>
          {toast.description ? (
            <p className="admin-toast__description">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="admin-toast__close"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        className="admin-toast__progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
