import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus, Shield, Trash2, UserPlus } from 'lucide-react';
import { api } from '../../lib/api';
import {
  canDeleteUser,
  canDemoteUser,
  countPrivilegedAdmins,
  isPrivilegedAdminRole,
  roleOptionsForUser,
} from '../../lib/adminUserGuard';
import { AdminSelect } from './AdminSelect';
import { AdminConfirmModal } from './AdminConfirmModal';
import { InviteMemberPanelContainer } from './InviteMemberPanel';
import {
  RolePermissionsContent,
  RolePermissionsProvider,
  RolePermissionsRoleDesc,
  RolePermissionsToolbar,
} from './RolePermissionsManager';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import { useAdminSession } from './useAdminSession';
import { AdminPageIntro } from './admin-ui';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { USERS_TAB_INTROS } from './workspaceTabIntros';
import { EmptyState, SkeletonTable, DataTable } from './ui';
import type { DataTableColumn } from './ui';
import { useToast } from './ui/Toast';

type AdminUserRow = {
  id: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
};

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super admin', description: 'Full access including team & permissions' },
  { value: 'editor', label: 'Editor', description: 'Edit content per role permissions' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only per role permissions' },
];

const EMPTY_CREATE_FORM = { username: '', password: '', email: '', role: 'editor' };

type TabId = 'team' | 'permissions';

const USERS_SUBNAV_GROUPS = [
  {
    label: 'Team',
    items: [
      { id: 'team', label: 'Team members', icon: UserPlus },
      { id: 'permissions', label: 'Role permissions', icon: Shield },
    ],
  },
];

export const AdminUsersManager: React.FC = () => {
  const token = localStorage.getItem('adminToken') || '';
  const { isSuperAdmin, username: currentUsername } = useAdminSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('team');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [privilegedAdminCount, setPrivilegedAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const permissionsActive = activeTab === 'permissions' && isSuperAdmin;
  const onlyOnePrivilegedAdmin = privilegedAdminCount <= 1;

  const subnavGroups = isSuperAdmin
    ? USERS_SUBNAV_GROUPS
    : [{ label: 'Team', items: [{ id: 'team', label: 'Team members', icon: UserPlus }] }];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { items, meta } = await api.listAdminUsers(token);
      setUsers(items);
      setPrivilegedAdminCount(meta.privilegedAdminCount ?? countPrivilegedAdmins(items));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'permissions') {
      setActiveTab('team');
    }
  }, [isSuperAdmin, activeTab]);

  useApplyPendingAdminSection('/admin/users', (id) => {
    if (id === 'team' || id === 'permissions') {
      setActiveTab(id);
    }
  });

  const closeInviteModal = () => {
    if (busy) return;
    setShowCreate(false);
    setCreateError('');
    setCreateForm(EMPTY_CREATE_FORM);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setCreateError('');
    try {
      await api.createAdminUser(token, {
        username: createForm.username,
        password: createForm.password,
        email: createForm.email || undefined,
        role: createForm.role,
      });
      const username = createForm.username;
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreate(false);
      toast({ variant: 'success', title: 'Team member invited', description: `${username} can now sign in.` });
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      setCreateError(msg);
      toast({ variant: 'error', title: 'Could not create user', description: msg });
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (user: AdminUserRow, role: string) => {
    if (role === user.role) return;
    if (!canDemoteUser(user, role, users)) {
      toast({
        variant: 'error',
        title: 'Cannot change role',
        description:
          'At least one super admin must remain. Invite another super admin before demoting this account.',
      });
      return;
    }
    try {
      await api.updateAdminUser(token, user.id, { role });
      toast({ variant: 'success', title: 'Role updated' });
      await load();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Failed to update role',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const openDelete = (row: AdminUserRow) => {
    const check = canDeleteUser(row, users, currentUsername);
    if (!check.allowed) {
      toast({
        variant: 'error',
        title: 'Cannot remove member',
        description: check.reason,
      });
      return;
    }
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteAdminUser(token, deleteTarget.id);
      toast({
        variant: 'success',
        title: 'User removed',
        description: `${deleteTarget.username} no longer has access.`,
      });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Failed to remove user',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteModalMessage = useMemo(() => {
    if (!deleteTarget) return '';
    const privileged = isPrivilegedAdminRole(deleteTarget.role);
    const base = `"${deleteTarget.username}" will lose CMS access immediately. This cannot be undone.`;
    if (privileged) {
      return `${base} This account has super admin access — removing it affects who can manage team settings.`;
    }
    return base;
  }, [deleteTarget]);

  const deleteRequiresTypedConfirm =
    deleteTarget != null && isPrivilegedAdminRole(deleteTarget.role);

  const teamColumns: DataTableColumn<AdminUserRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="admin-data-table__user">
          <div className="admin-data-table__avatar" aria-hidden>
            {row.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="admin-data-table__user-meta">
            <p className="admin-data-table__name">{row.username}</p>
            <p className="admin-data-table__muted">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <AdminSelect
          className="admin-users-role-select"
          aria-label={`Role for ${row.username}`}
          value={row.role}
          onChange={(role) => void handleRoleChange(row, role)}
          options={roleOptionsForUser(row, users, ROLE_OPTIONS)}
        />
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (row) => (
        <span className="admin-data-table__muted">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const deleteCheck = canDeleteUser(row, users, currentUsername);
        return (
          <div className="admin-data-table__row-actions">
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--icon admin-btn--danger-icon"
              aria-label={
                deleteCheck.allowed
                  ? `Remove ${row.username}`
                  : `Cannot remove ${row.username}: ${deleteCheck.reason}`
              }
              title={deleteCheck.allowed ? undefined : deleteCheck.reason}
              disabled={!deleteCheck.allowed}
              onClick={() => openDelete(row)}
            >
              <Trash2 className="w-4 h-4" aria-hidden />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <RolePermissionsProvider active={permissionsActive}>
      <AdminWorkspaceShell
        editorClassName="admin-book-page"
        contentEditor={activeTab === 'permissions'}
        panelFlush={activeTab === 'team'}
        toolbar={
          <AdminPageIntro
            compact
            className="mb-0"
            lede="Manage sign-in access and role permissions for the admin."
          />
        }
        subnav={{
          groups: subnavGroups,
          title: 'Team & access',
          activeId: activeTab,
          onSelect: (id) => setActiveTab(id as TabId),
          pageId: 'users',
        }}
        editorHeader={USERS_TAB_INTROS[activeTab]}
        editorHeaderAside={
          activeTab === 'team' ? (
            <div className="admin-page-metrics-inline">
              <span>
                {loading
                  ? 'Loading…'
                  : `${users.length} members · ${privilegedAdminCount} super admin${privilegedAdminCount === 1 ? '' : 's'}`}
              </span>
            </div>
          ) : undefined
        }
        saveStatus={busy || deleting ? 'saving' : 'idle'}
        headerAction={
          activeTab === 'team' ? (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Invite member
            </button>
          ) : permissionsActive ? (
            <RolePermissionsToolbar />
          ) : undefined
        }
      >
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        {permissionsActive ? (
          <div className="admin-catalog-panel">
            <RolePermissionsRoleDesc />
            <RolePermissionsContent />
          </div>
        ) : (
          <div className="admin-catalog-panel admin-catalog-panel--crm">
            {!loading && onlyOnePrivilegedAdmin ? (
              <div className="admin-panel-banner admin-panel-banner--warning" role="status">
                <div className="admin-team-guard-banner">
                  <span className="admin-team-guard-banner__icon" aria-hidden>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div className="admin-team-guard-banner__content">
                    <p className="admin-team-guard-banner__title">Only one super admin on this team</p>
                    <p className="admin-team-guard-banner__text">
                      You cannot remove or demote this account until you invite another member with the
                      super admin role. That keeps team and permissions settings from becoming
                      inaccessible.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <InviteMemberPanelContainer
              open={showCreate}
              busy={busy}
              error={createError}
              form={createForm}
              roleOptions={ROLE_OPTIONS}
              onChange={setCreateForm}
              onSubmit={handleCreate}
              onClose={closeInviteModal}
            />

            {loading ? (
              <div className="admin-team-table">
                <SkeletonTable rows={4} cols={4} />
              </div>
            ) : users.length === 0 && !showCreate ? (
              <EmptyState
                icon={UserPlus}
                heading="No team members yet"
                subtext="Invite your first editor or viewer to collaborate on the site."
                actionLabel="Invite member"
                onAction={() => setShowCreate(true)}
              />
            ) : (
              <div className="admin-team-table">
                <DataTable embedded columns={teamColumns} data={users} />
              </div>
            )}
          </div>
        )}

        <AdminConfirmModal
          open={deleteTarget != null}
          title={
            deleteTarget && isPrivilegedAdminRole(deleteTarget.role)
              ? 'Remove super admin?'
              : 'Remove team member?'
          }
          message={deleteModalMessage}
          confirmLabel="Remove user"
          variant="danger"
          busy={deleting}
          requireConfirmText={deleteRequiresTypedConfirm ? deleteTarget?.username : undefined}
          requireConfirmLabel={
            deleteRequiresTypedConfirm
              ? `Type the username "${deleteTarget?.username}" to confirm removal`
              : undefined
          }
          onConfirm={() => void confirmDelete()}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      </AdminWorkspaceShell>
    </RolePermissionsProvider>
  );
};
