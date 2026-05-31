import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { LivePreview } from './LivePreview'

type AdminSplitWorkspaceProps = {
  isPreviewVisible: boolean
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  sidebarMaxWidth?: 'editor' | 'full'
}

export function AdminSplitWorkspace({
  isPreviewVisible,
  isSidebarCollapsed,
  onToggleSidebar,
  header,
  footer,
  children,
  sidebarMaxWidth = 'editor',
}: AdminSplitWorkspaceProps) {
  return (
    <div className="admin-workspace admin-split-workspace flex h-full w-full overflow-hidden relative">
      <motion.div
        layout
        animate={{
          width: !isPreviewVisible ? '100%' : isSidebarCollapsed ? 0 : 520,
          opacity: isSidebarCollapsed && isPreviewVisible ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'admin-split-workspace__sidebar flex flex-col shrink-0 relative z-10 overflow-hidden',
          isPreviewVisible && !isSidebarCollapsed && 'border-r border-[var(--admin-border)]',
        )}
      >
        <div
          className={cn(
            'admin-split-workspace__sidebar-inner flex flex-col h-full w-full',
            sidebarMaxWidth === 'full' && !isPreviewVisible && 'admin-split-workspace__sidebar-inner--wide mx-auto',
            isPreviewVisible && 'w-[520px] max-w-[520px]',
          )}
        >
          {header && <div className="admin-split-workspace__header">{header}</div>}
          <div className="admin-split-workspace__body flex-1 min-h-0">{children}</div>
          {footer && <div className="admin-split-workspace__footer">{footer}</div>}
        </div>
      </motion.div>

      <AnimatePresence>
        {isPreviewVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-hidden flex flex-col relative bg-[var(--admin-surface)]"
          >
            <div className="flex-1 relative min-h-0">
              <LivePreview
                onToggleSidebar={onToggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
