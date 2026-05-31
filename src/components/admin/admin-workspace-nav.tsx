import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ElementType } from 'react'
import { ADMIN_PENDING_SECTION_KEY } from './admin-mobile-nav-sections'

export type WorkspaceSubnavItem = { id: string; label: string; icon: ElementType }

export type WorkspaceSubnavConfig = {
  groups: { label: string; items: WorkspaceSubnavItem[] }[]
  activeId: string
  onSelect: (id: string) => void
}

type WorkspaceSubnavState = {
  groups: { label: string; items: WorkspaceSubnavItem[] }[]
  activeId: string
  onSelect: (id: string) => void
} | null

const AdminWorkspaceNavContext = createContext<{
  subnav: WorkspaceSubnavState
  setSubnav: (next: WorkspaceSubnavState) => void
} | null>(null)

export function AdminWorkspaceNavProvider({ children }: { children: ReactNode }) {
  const [subnav, setSubnav] = useState<WorkspaceSubnavState>(null)
  const value = useMemo(() => ({ subnav, setSubnav }), [subnav])
  return (
    <AdminWorkspaceNavContext.Provider value={value}>{children}</AdminWorkspaceNavContext.Provider>
  )
}

export function useAdminWorkspaceNav() {
  return useContext(AdminWorkspaceNavContext)
}

function subnavRegistryToken(groupsKey: string, activeId: string) {
  return `${groupsKey}\0${activeId}`
}

/** Registers workspace section nav for the mobile drawer (hidden on desktop subnav column). */
export function useAdminWorkspaceNavRegistry(config: WorkspaceSubnavConfig | null) {
  const ctx = useAdminWorkspaceNav()
  const onSelectRef = useRef(config?.onSelect)
  onSelectRef.current = config?.onSelect

  const groupsRef = useRef(config?.groups)
  groupsRef.current = config?.groups

  const setSubnav = ctx?.setSubnav
  const activeId = config?.activeId
  const groupsKey = config
    ? config.groups.map((g) => `${g.label}:${g.items.map((i) => i.id).join(',')}`).join('|')
    : ''
  const registeredTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!setSubnav) return

    if (!config || !groupsRef.current || !activeId) {
      if (registeredTokenRef.current !== null) {
        registeredTokenRef.current = null
        setSubnav(null)
      }
      return
    }

    const token = subnavRegistryToken(groupsKey, activeId)
    if (registeredTokenRef.current === token) return
    registeredTokenRef.current = token

    setSubnav({
      groups: groupsRef.current,
      activeId,
      onSelect: (id) => onSelectRef.current?.(id),
    })

    return () => {
      registeredTokenRef.current = null
      setSubnav(null)
    }
  }, [setSubnav, groupsKey, activeId, config != null])
}

/** Applies a section chosen from the mobile drawer before the workspace mounted. */
export function useApplyPendingAdminSection(
  path: string,
  apply: (sectionId: string) => void,
) {
  const applyRef = useRef(apply)
  applyRef.current = apply

  useEffect(() => {
    const raw = sessionStorage.getItem(ADMIN_PENDING_SECTION_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { path?: string; sectionId?: string }
      if (parsed.path === path && parsed.sectionId) {
        applyRef.current(parsed.sectionId)
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem(ADMIN_PENDING_SECTION_KEY)
    }
  }, [path])
}
