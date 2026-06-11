import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type UndoHandlers = {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

type UndoRedoContextValue = {
  register: (handlers: UndoHandlers | null) => void
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null)

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const handlersRef = useRef<UndoHandlers | null>(null)

  const register = useCallback((handlers: UndoHandlers | null) => {
    handlersRef.current = handlers
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const h = handlersRef.current
      if (!h || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return

      e.preventDefault()
      if (e.shiftKey) {
        if (h.canRedo) h.redo()
      } else if (h.canUndo) {
        h.undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <UndoRedoContext.Provider value={{ register }}>{children}</UndoRedoContext.Provider>
  )
}

export function useRegisterUndoRedo(handlers: UndoHandlers) {
  const ctx = useContext(UndoRedoContext)

  useEffect(() => {
    if (!ctx) return
    ctx.register(handlers)
    return () => ctx.register(null)
  }, [ctx, handlers])
}

export function useFormHistory<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial])
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  const value = history[index] ?? initial

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const i = indexRef.current
        const current = prev[i] ?? initial
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(current) : next
        const trimmed = prev.slice(0, i + 1)
        trimmed.push(resolved)
        const nextHistory = trimmed.slice(-50)
        indexRef.current = nextHistory.length - 1
        setIndex(indexRef.current)
        return nextHistory
      })
    },
    [initial],
  )

  const undo = useCallback(() => {
    setIndex((i) => {
      const next = Math.max(0, i - 1)
      indexRef.current = next
      return next
    })
  }, [])

  const redo = useCallback(() => {
    setIndex((i) => {
      const next = Math.min(history.length - 1, i + 1)
      indexRef.current = next
      return next
    })
  }, [history.length])

  const reset = useCallback((next: T) => {
    setHistory([next])
    indexRef.current = 0
    setIndex(0)
  }, [])

  return {
    value,
    setValue,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  }
}
