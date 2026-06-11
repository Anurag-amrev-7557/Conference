import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAdminSession } from './useAdminSession';
import { pageIdFromPath } from '../../lib/adminPermissions';
import { Sidebar, buildNavGroups } from './layout/Sidebar';
import { TopBar, buildPageContext } from './layout/TopBar';
import { MobileTabBar } from './layout/MobileTabBar';
import { CommandPalette, useCommandPalette, trackRecentPage } from './ui/CommandPalette';
import { useAutosave } from './providers/AutosaveProvider';
import { useAdminTheme } from './providers/AdminThemeProvider';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout: () => void;
  wide?: boolean;
  headerActions?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  onLogout,
  wide = false,
  headerActions,
}) => {
  const { isSuperAdmin, isViewer, username, pageAccess, pageWrite } = useAdminSession();
  const location = useLocation();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const { status: saveStatus } = useAutosave();
  const { theme } = useAdminTheme();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [prevPathname, setPrevPathname] = React.useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
  }

  useEffect(() => {
    trackRecentPage(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    document.body.classList.toggle('admin-shell--nav-open', mobileNavOpen);
    return () => document.body.classList.remove('admin-shell--nav-open');
  }, [mobileNavOpen]);

  const filterNavItems = (items: { icon: React.ElementType; label: string; path: string }[]) =>
    items.filter((item) => {
      const pageId = pageIdFromPath(item.path);
      if (!pageId) return true;
      return isSuperAdmin || pageAccess(pageId);
    });

  const navGroups = buildNavGroups(filterNavItems);
  const currentPageId = pageIdFromPath(location.pathname);
  const readOnlyPage = currentPageId && !pageWrite(currentPageId) && pageAccess(currentPageId);
  const pageContext = buildPageContext(location.pathname, title);

  return (
    <div
      className={cn(
        'admin-shell flex h-screen overflow-hidden',
        mobileNavOpen && 'admin-shell--nav-open',
      )}
      data-theme={theme}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
        mobileNavOpen={mobileNavOpen}
        onMobileNavClose={() => setMobileNavOpen(false)}
        onLogout={onLogout}
        navGroups={navGroups}
      />

      <main id="admin-main" className="flex-1 flex flex-col overflow-hidden min-w-0" role="main">
        <TopBar
          pageContext={pageContext}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onLogout={onLogout}
          username={username}
          saveStatus={saveStatus}
          headerActions={headerActions}
          onToggleMobileNav={() => setMobileNavOpen((o) => !o)}
          mobileNavOpen={mobileNavOpen}
        />

        <div
          className={cn(
            'flex-1 min-h-0 ds-page-enter',
            wide
              ? 'admin-shell__content--wide flex flex-col overflow-hidden'
              : 'admin-shell__content overflow-y-auto',
          )}
        >
          {(isViewer || readOnlyPage) && (
            <div className="mx-[var(--ds-space-6)] mt-[var(--ds-space-4)] mb-0 text-[var(--ds-text-sm)] rounded-[var(--ds-radius-lg)] border border-[var(--ds-warning-border)] bg-[var(--ds-warning-bg)] text-[var(--ds-warning-text)] px-[var(--ds-space-3)] py-[var(--ds-space-2)]">
              {isViewer
                ? 'View-only access — you can browse content but cannot save changes.'
                : 'Read-only access on this page — viewing is allowed but saves are disabled.'}
            </div>
          )}
          <div
            className={cn(
              wide ? 'admin-workspace admin-workspace--fill' : 'admin-workspace admin-shell__page',
            )}
          >
            {children}
          </div>
        </div>
      </main>

      <MobileTabBar navGroups={navGroups} onLogout={onLogout} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
};
