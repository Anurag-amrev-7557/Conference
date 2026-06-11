import { useEffect, useRef } from 'react'

export type WorkspaceSaveConfig = {
  label: string
  saving: boolean
  onSave: () => void | Promise<void>
}

/** Registers save handler in parent header without re-render loops from unstable callbacks. */
export function useRegisterWorkspaceSave(
  onSaveReady: ((config: WorkspaceSaveConfig | null) => void) | undefined,
  config: WorkspaceSaveConfig | null,
) {
  const onSaveRef = useRef(config?.onSave)

  useEffect(() => {
    onSaveRef.current = config?.onSave
    if (!onSaveReady) return

    if (!config) {
      onSaveReady(null)
      return () => onSaveReady(null)
    }

    onSaveReady({
      label: config.label,
      saving: config.saving,
      onSave: () => onSaveRef.current?.(),
    })

    return () => onSaveReady(null)
  }, [onSaveReady, config])
}
