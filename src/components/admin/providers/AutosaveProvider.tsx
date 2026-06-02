import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { cn } from '../../../lib/utils'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'idle'

type AutosaveContextValue = {
  status: SaveStatus
  setStatus: (status: SaveStatus) => void
  markUnsaved: () => void
  registerSaveHandler: (handler: (() => void | Promise<void>) | null) => void
}

const AutosaveContext = createContext<AutosaveContextValue | null>(null)

export function AutosaveProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [saveHandler, setSaveHandler] = useState<(() => void | Promise<void>) | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const markUnsaved = useCallback(() => {
    setHasChanges(true)
    setStatus('unsaved')
  }, [])

  const registerSaveHandler = useCallback((handler: (() => void | Promise<void>) | null) => {
    setSaveHandler(() => handler)
  }, [])

  useEffect(() => {
    if (!hasChanges || !saveHandler) return
    const interval = setInterval(async () => {
      setStatus('saving')
      try {
        await saveHandler()
        setStatus('saved')
        setHasChanges(false)
      } catch {
        setStatus('unsaved')
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [hasChanges, saveHandler])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (status === 'unsaved') {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [status])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (saveHandler) {
          setStatus('saving')
          void Promise.resolve(saveHandler()).then(() => {
            setStatus('saved')
            setHasChanges(false)
          }).catch(() => setStatus('unsaved'))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveHandler])

  return (
    <AutosaveContext.Provider value={{ status, setStatus, markUnsaved, registerSaveHandler }}>
      {children}
    </AutosaveContext.Provider>
  )
}

export function useAutosave() {
  const ctx = useContext(AutosaveContext)
  if (!ctx) throw new Error('useAutosave must be used within AutosaveProvider')
  return ctx
}

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null

  const labels: Record<SaveStatus, string> = {
    saved: 'Saved just now',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    idle: '',
  }

  return (
    <span className={cn('admin-topbar__save-status', `admin-topbar__save-status--${status}`)}>
      {labels[status]}
    </span>
  )
}
