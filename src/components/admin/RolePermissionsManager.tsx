import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  ADMIN_PAGE_META,
  ADMIN_PAGE_SECTIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  mergeAdminPermissions,
  type AdminPageId,
  type AdminPermissionsConfig,
  type PageAccess,
} from '../../lib/adminPermissions';
import { AdminSelect } from './AdminSelect';
import { AdminConfirmModal } from './AdminConfirmModal';
import { notifyPermissionsUpdated } from './useAdminSession';
import { SkeletonTable } from './ui';

const ROLES = [
  { id: 'editor' as const, label: 'Editor', icon: Pencil, description: 'Can edit content when page access is Write' },
  { id: 'viewer' as const, label: 'Viewer', icon: Eye, description: 'Read-only when page access is Read' },
];

const ACCESS_OPTIONS = [
  { value: 'write', label: 'Full access', description: 'View and edit this area' },
  { value: 'read', label: 'View only', description: 'Browse without saving' },
  { value: 'none', label: 'Hidden', description: 'Not visible in navigation' },
];

type RolePermissionsContextValue = {
  activeRole: 'editor' | 'viewer';
  setActiveRole: (role: 'editor' | 'viewer') => void;
  roleConfig: AdminPermissionsConfig['editor'];
  activeRoleMeta: (typeof ROLES)[number] | undefined;
  pagesByGroup: Record<string, { id: AdminPageId; label: string; path: string }[]>;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string;
  setPageAccess: (pageId: AdminPageId, access: PageAccess) => void;
  toggleSection: (pageId: AdminPageId, sectionId: string, enabled: boolean) => void;
  handleSave: () => Promise<void>;
  openReset: () => void;
};

const RolePermissionsContext = createContext<RolePermissionsContextValue | null>(null);

function useRolePermissions() {
  const ctx = useContext(RolePermissionsContext);
  if (!ctx) throw new Error('useRolePermissions must be used within RolePermissionsProvider');
  return ctx;
}

export function RolePermissionsProvider({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const token = localStorage.getItem('adminToken') || '';
  const [activeRole, setActiveRole] = useState<'editor' | 'viewer'>('editor');
  const [form, setForm] = useState<AdminPermissionsConfig>(() => mergeAdminPermissions(undefined));
  const [loading, setLoading] = useState(active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const permissions = await api.getAdminPermissions(token);
        if (!cancelled) setForm(mergeAdminPermissions(permissions));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load permissions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, token]);

  const roleConfig = form[activeRole];
  const activeRoleMeta = ROLES.find((role) => role.id === activeRole);
  const pagesByGroup = useMemo(
    () =>
      (Object.entries(ADMIN_PAGE_META) as [AdminPageId, (typeof ADMIN_PAGE_META)[AdminPageId]][]).reduce(
        (acc, [id, meta]) => {
          if (meta.group === 'Access') return acc;
          acc[meta.group] = acc[meta.group] ?? [];
          acc[meta.group].push({ id, ...meta });
          return acc;
        },
        {} as Record<string, { id: AdminPageId; label: string; path: string }[]>,
      ),
    [],
  );

  const setPageAccess = (pageId: AdminPageId, access: PageAccess) => {
    setForm((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        pages: { ...prev[activeRole].pages, [pageId]: access },
      },
    }));
    setSaved(false);
  };

  const toggleSection = (pageId: AdminPageId, sectionId: string, enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        sections: {
          ...prev[activeRole].sections,
          [pageId]: {
            ...prev[activeRole].sections[pageId],
            [sectionId]: enabled,
          },
        },
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const permissions = await api.updateAdminPermissions(token, form);
      const merged = mergeAdminPermissions(permissions);
      setForm(merged);
      notifyPermissionsUpdated(merged);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm((prev) => ({
      ...prev,
      [activeRole]: structuredClone(DEFAULT_ADMIN_PERMISSIONS[activeRole]),
    }));
    setSaved(false);
    setResetOpen(false);
  };

  const value: RolePermissionsContextValue = {
    activeRole,
    setActiveRole,
    roleConfig,
    activeRoleMeta,
    pagesByGroup,
    loading,
    saving,
    saved,
    error,
    setPageAccess,
    toggleSection,
    handleSave,
    openReset: () => setResetOpen(true),
  };

  return (
    <RolePermissionsContext.Provider value={value}>
      {children}
      <AdminConfirmModal
        open={resetOpen}
        title="Reset role permissions?"
        message={`Restore default page and section access for the ${activeRole} role? Changes are not saved until you click Save permissions.`}
        confirmLabel="Reset defaults"
        variant="primary"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </RolePermissionsContext.Provider>
  );
}

export function RolePermissionsToolbar() {
  const { activeRole, setActiveRole, loading, saving, saved, handleSave, openReset } = useRolePermissions();

  return (
    <div className="admin-team-page__control-actions">
      <div className="admin-team-segmented admin-permissions__role-segmented" role="tablist" aria-label="Role">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={loading}
              className={cn('admin-team-segmented__item', isActive && 'admin-team-segmented__item--active')}
              onClick={() => setActiveRole(role.id)}
            >
              <Icon className="w-4 h-4" aria-hidden />
              {role.label}
            </button>
          );
        })}
      </div>
      <button type="button" className="admin-btn admin-btn--secondary admin-permissions__action-btn" disabled={loading || saving} onClick={openReset}>
        Reset
      </button>
      <button type="button" className="admin-btn admin-btn--primary admin-permissions__action-btn" disabled={loading || saving} onClick={() => void handleSave()}>
        <Save className="w-4 h-4" aria-hidden />
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

export function RolePermissionsRoleDesc() {
  const { activeRoleMeta, loading } = useRolePermissions();
  if (loading) {
    return (
      <p className="admin-permissions__role-desc admin-permissions__role-desc--placeholder" aria-hidden>
        &nbsp;
      </p>
    );
  }
  if (!activeRoleMeta) return null;
  return <p className="admin-permissions__role-desc">{activeRoleMeta.description}</p>;
}

export function RolePermissionsContent() {
  const {
    activeRole,
    roleConfig,
    pagesByGroup,
    loading,
    error,
    setPageAccess,
    toggleSection,
  } = useRolePermissions();

  if (loading) {
    return <SkeletonTable rows={6} cols={3} />;
  }

  return (
    <div className="admin-permissions">
      {error ? (
        <p className="admin-permissions__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-permissions__groups">
        {Object.entries(pagesByGroup).map(([group, pages]) => (
          <section key={group} className="admin-permissions__group" aria-labelledby={`perm-group-${group}`}>
            <h3 id={`perm-group-${group}`} className="admin-permissions__group-title">
              {group}
            </h3>
            <ul className="admin-permissions__page-list">
              {pages.map((page) => {
                const access =
                  roleConfig.pages[page.id] ??
                  DEFAULT_ADMIN_PERMISSIONS[activeRole].pages[page.id] ??
                  'write';
                const sections = ADMIN_PAGE_SECTIONS[page.id];
                return (
                  <li key={page.id} className="admin-permissions__page-row">
                    <div className="admin-permissions__page-head">
                      <div className="admin-permissions__page-meta">
                        <p className="admin-permissions__page-label">{page.label}</p>
                        <p className="admin-permissions__page-path">{page.path}</p>
                      </div>
                      <AdminSelect
                        className="admin-permissions__access-select"
                        aria-label={`Access for ${page.label}`}
                        value={access}
                        onChange={(v) => setPageAccess(page.id, v as PageAccess)}
                        options={ACCESS_OPTIONS}
                      />
                    </div>
                    {sections && sections.length > 0 && access !== 'none' ? (
                      <div className="admin-permissions__sections">
                        <p className="admin-permissions__sections-label">Sections</p>
                        <div className="admin-permissions__section-grid">
                          {sections.map((section) => {
                            const enabled = roleConfig.sections[page.id]?.[section.id] !== false;
                            return (
                              <label key={section.id} className="admin-permissions__section-chip">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={(e) => toggleSection(page.id, section.id, e.target.checked)}
                                />
                                <span>{section.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Standalone wrapper — prefer Provider + Toolbar + Content in AdminUsersManager */
export const RolePermissionsManager: React.FC = () => (
  <RolePermissionsProvider active>
    <RolePermissionsToolbar />
    <RolePermissionsRoleDesc />
    <RolePermissionsContent />
  </RolePermissionsProvider>
);
