import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Command palette' },
  { keys: ['⌘', 'S'], label: 'Save current page' },
  { keys: ['⌘', 'Z'], label: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
  { keys: ['⌘', '/'], label: 'Keyboard shortcuts' },
  { keys: ['Esc'], label: 'Close modal / drawer' },
  { keys: ['G', 'D'], label: 'Go to dashboard' },
  { keys: ['G', 'C'], label: 'Go to summit homepage' },
  { keys: ['G', 'M'], label: 'Go to media' },
]

export function KeyboardShortcutsOverlay({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--ds-z-modal)] bg-black/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed left-1/2 top-1/2 z-[var(--ds-z-modal)] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--ds-radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-[var(--ds-shadow-3)] p-[var(--ds-space-6)]"
          >
            <div className="flex items-center justify-between mb-[var(--ds-space-4)]">
              <h2 className="text-[var(--ds-text-lg)] font-[var(--ds-font-medium)]">Keyboard shortcuts</h2>
              <button type="button" onClick={() => onOpenChange(false)} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-[var(--ds-radius-md)] hover:bg-[var(--ds-surface-sunken)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <dl className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5">
                  <dt className="text-[var(--ds-text-base)] text-[var(--ds-text-secondary)]">{s.label}</dt>
                  <dd className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="px-1.5 py-0.5 text-[var(--ds-text-xs)] bg-[var(--ds-surface-sunken)] border border-[var(--ds-border)] rounded-[var(--ds-radius-sm)] font-mono">
                        {k}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function useGlobalShortcuts(onOpenHelp: () => void) {
  const navigate = useNavigate()
  const [pendingG, setPendingG] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        onOpenHelp()
        return
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        setPendingG(true)
        setTimeout(() => setPendingG(false), 1000)
        return
      }

      if (pendingG) {
        if (e.key === 'd') navigate('/admin/dashboard')
        else if (e.key === 'c') navigate('/admin/conference')
        else if (e.key === 'm') navigate('/admin/media')
        setPendingG(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, onOpenHelp, pendingG])
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  useGlobalShortcuts(() => setShortcutsOpen(true))

  return (
    <>
      {children}
      <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
