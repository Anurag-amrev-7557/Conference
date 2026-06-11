import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { api } from '../../lib/api';
import { getAdminToken } from '../../lib/adminAuth';
import {
  mergeAdminPermissions,
  canAccessPage,
  canWritePage,
  canAccessSection,
  type AdminPermissionsConfig,
  type AdminPageId,
} from '../../lib/adminPermissions';

const PERMISSIONS_KEY = 'adminPermissions';

type AdminSessionContextValue = {
  role: string;
  username: string;
  ready: boolean;
  permissions: AdminPermissionsConfig;
  isSuperAdmin: boolean;
  isViewer: boolean;
  canEdit: boolean;
  pageAccess: (pageId: AdminPageId) => boolean;
  pageWrite: (pageId: AdminPageId) => boolean;
  sectionAccess: (pageId: AdminPageId, sectionId: string) => boolean;
  refreshSession: () => Promise<void>;
  applyPermissions: (config: AdminPermissionsConfig) => void;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState(() => localStorage.getItem('adminRole') || 'super_admin');
  const [username, setUsername] = useState(() => localStorage.getItem('adminUsername') || 'admin');
  const [permissions, setPermissions] = useState<AdminPermissionsConfig>(() => {
    try {
      const raw = localStorage.getItem(PERMISSIONS_KEY);
      return raw ? mergeAdminPermissions(JSON.parse(raw)) : mergeAdminPermissions(undefined);
    } catch {
      return mergeAdminPermissions(undefined);
    }
  });
  const [ready, setReady] = useState(false);

  const applyPermissions = useCallback((config: AdminPermissionsConfig) => {
    const merged = mergeAdminPermissions(config);
    setPermissions(merged);
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(merged));
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setReady(true);
      return;
    }
    try {
      const me = await api.getAdminMe(token);
      setRole(me.role);
      setUsername(me.username);
      localStorage.setItem('adminRole', me.role);
      localStorage.setItem('adminUsername', me.username);
      if (me.permissions) applyPermissions(me.permissions);
    } catch {
      /* keep cached session */
    } finally {
      setReady(true);
    }
  }, [applyPermissions]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<AdminPermissionsConfig>).detail;
      if (detail) applyPermissions(detail);
      else void refreshSession();
    };
    window.addEventListener('admin-permissions-updated', onUpdated);
    return () => window.removeEventListener('admin-permissions-updated', onUpdated);
  }, [applyPermissions, refreshSession]);

  const isSuperAdmin = role === 'super_admin' || role === 'admin';
  const isViewer = role === 'viewer';
  const pageAccess = useCallback(
    (pageId: AdminPageId) => canAccessPage(role, pageId, permissions),
    [role, permissions],
  );
  const pageWrite = useCallback(
    (pageId: AdminPageId) => canWritePage(role, pageId, permissions),
    [role, permissions],
  );
  const sectionAccess = useCallback(
    (pageId: AdminPageId, sectionId: string) =>
      canAccessSection(role, pageId, sectionId, permissions),
    [role, permissions],
  );
  const canEdit = !isViewer && pageWrite('dashboard');

  const value = useMemo(
    () => ({
      role,
      username,
      ready,
      permissions,
      isSuperAdmin,
      isViewer,
      canEdit,
      pageAccess,
      pageWrite,
      sectionAccess,
      refreshSession,
      applyPermissions,
    }),
    [
      role,
      username,
      ready,
      permissions,
      isSuperAdmin,
      isViewer,
      canEdit,
      pageAccess,
      pageWrite,
      sectionAccess,
      refreshSession,
      applyPermissions,
    ],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error('useAdminSession must be used within AdminSessionProvider');
  }
  return ctx;
}

export function setAdminSession(role: string, username: string) {
  localStorage.setItem('adminRole', role);
  localStorage.setItem('adminUsername', username);
}

export function clearAdminSession() {
  localStorage.removeItem('adminRole');
  localStorage.removeItem('adminUsername');
  localStorage.removeItem(PERMISSIONS_KEY);
}

export function notifyPermissionsUpdated(config?: AdminPermissionsConfig) {
  window.dispatchEvent(new CustomEvent('admin-permissions-updated', { detail: config }));
}
