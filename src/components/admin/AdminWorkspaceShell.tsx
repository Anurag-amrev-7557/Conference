import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { LivePreview } from './LivePreview'
import { AdminPanelTabIntro, AdminSubnav } from './admin-ui'
import { useAdminWorkspaceNavRegistry } from './admin-workspace-nav'

type SubnavItem = { id: string; label: string; icon: React.ElementType }

type AdminWorkspaceShellProps = {
  isPreviewVisible: boolean
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  toolbar: React.ReactNode
  subnav?: {
    groups: { label: string; items: SubnavItem[] }[]
    title?: string
    activeId: string
    onSelect: (id: string) => void
    footer?: React.ReactNode
  }
  tabIntro?: { title: string; description: string }
  /** Primary save control — rendered in the top toolbar (right side). */
  headerAction?: React.ReactNode
  children: React.ReactNode
}

export function AdminWorkspaceShell({
  isPreviewVisible,
  isSidebarCollapsed,
  onToggleSidebar,
  toolbar,
  subnav,
  tabIntro,
  headerAction,
  children,
}: AdminWorkspaceShellProps) {
  const hideEditorOnMobilePreview = isPreviewVisible && isSidebarCollapsed

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
    <div
      className={cn(
        'admin-workspace flex h-full w-full overflow-hidden min-h-0',
        isPreviewVisible && 'admin-workspace--preview',
      )}
    >
      <div
        className={cn(
          'admin-workspace__editor-pane flex flex-col min-h-0 overflow-hidden bg-[var(--admin-surface)]',
          isPreviewVisible && 'admin-workspace__editor-pane--split border-[var(--admin-border)]',
          !isPreviewVisible && 'flex-1 w-full min-w-0 admin-page-workspace',
          hideEditorOnMobilePreview && 'max-lg:hidden',
        )}
      >
        <div
          className={cn(
            'admin-toolbar shrink-0',
            isPreviewVisible && 'admin-toolbar--compact',
          )}
        >
          <div className="admin-toolbar__content">{toolbar}</div>
          {headerAction ? <div className="admin-toolbar__actions">{headerAction}</div> : null}
        </div>

        <div className="admin-page-editor flex flex-1 min-h-0">
          {subnav ? (
            <AdminSubnav
              className="admin-subnav--desktop-only"
              groups={subnav.groups}
              title={subnav.title ?? 'Sections'}
              activeId={subnav.activeId}
              onSelect={subnav.onSelect}
              footer={subnav.footer}
            />
          ) : null}

          <div className="admin-panel-body flex-1 min-h-0 min-w-0 overflow-y-auto">
            <div className="admin-panel-body__inner">
              {tabIntro ? (
                <AdminPanelTabIntro title={tabIntro.title} description={tabIntro.description} />
              ) : null}
              <div className="admin-form-stack">{children}</div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPreviewVisible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="admin-workspace__preview-pane flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-[var(--admin-surface)]"
          >
            <LivePreview
              onToggleSidebar={onToggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
