import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { AdminPanelTabIntro, AdminSubnav } from './admin-ui'
import {
  AdminEditorPageHeader,
  type EditorSaveStatus,
  type EditorTabIntro,
} from './admin-editor-ui'
import { useAdminWorkspaceNavRegistry } from './admin-workspace-nav'
import type { AdminPageId } from '../../lib/adminPermissions'

type SubnavItem = { id: string; label: string; icon: React.ElementType }

type AdminWorkspaceShellProps = {
  toolbar?: React.ReactNode
  editorClassName?: string
  subnav?: {
    groups: { label: string; items: SubnavItem[] }[]
    title?: string
    activeId: string
    onSelect: (id: string) => void
    footer?: React.ReactNode
    pageId?: AdminPageId
  }
  editorHeader?: EditorTabIntro
  /** @deprecated Settings/design — use editorHeader for content editors */
  tabIntro?: { title: string; description: string }
  saveStatus?: EditorSaveStatus
  contentEditor?: boolean
  panelFlush?: boolean
  headerAction?: React.ReactNode
  editorHeaderAside?: React.ReactNode
  children: React.ReactNode
}

export function AdminWorkspaceShell({
  toolbar,
  editorClassName,
  subnav,
  editorHeader,
  tabIntro,
  saveStatus = 'idle',
  contentEditor = false,
  panelFlush = false,
  headerAction,
  editorHeaderAside,
  children,
}: AdminWorkspaceShellProps) {
  useAdminWorkspaceNavRegistry(
    subnav
      ? {
          groups: subnav.groups,
          activeId: subnav.activeId,
          onSelect: subnav.onSelect,
        }
      : null,
  )

  return (
    <div className="admin-workspace flex h-full w-full overflow-hidden min-h-0">
      <div
        className={cn(
          'admin-workspace__editor-pane flex flex-col min-h-0 overflow-hidden flex-1 w-full min-w-0 admin-page-workspace',
          editorClassName,
        )}
      >
        {toolbar || headerAction ? (
          <div className="admin-toolbar shrink-0">
            {toolbar ? <div className="admin-toolbar__content">{toolbar}</div> : null}
            {headerAction ? (
              <div className="admin-toolbar__actions flex items-center gap-2">{headerAction}</div>
            ) : null}
          </div>
        ) : null}

        <div className="admin-page-editor flex flex-1 min-h-0">
          {subnav ? (
            <AdminSubnav
              className="admin-page-subnav--desktop-only"
              groups={subnav.groups}
              title={subnav.title ?? 'Sections'}
              activeId={subnav.activeId}
              onSelect={subnav.onSelect}
              footer={subnav.footer}
              pageId={subnav.pageId}
            />
          ) : null}

          <div
            className={cn(
              'admin-panel-body flex-1 min-h-0 min-w-0 overflow-y-auto',
              contentEditor && 'admin-content-editor',
              panelFlush && 'admin-panel-body--flush',
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={subnav?.activeId ?? 'panel'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                className={cn(
                  'admin-panel-body__inner h-full',
                  panelFlush && 'admin-panel-body__inner--flush',
                )}
              >
                {editorHeader ? (
                  <AdminEditorPageHeader
                    breadcrumb={editorHeader.breadcrumb}
                    title={editorHeader.title}
                    description={editorHeader.description}
                    status={editorHeader.status}
                    saveStatus={saveStatus}
                    aside={editorHeaderAside}
                  />
                ) : tabIntro ? (
                  <AdminPanelTabIntro title={tabIntro.title} description={tabIntro.description} />
                ) : null}
                <div className="admin-form-stack">{children}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
