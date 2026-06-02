/** Client mirror of server privileged-admin rules (keep in sync with server/src/lib/adminUserGuard.ts). */

export const PRIVILEGED_ADMIN_ROLES = ['super_admin', 'admin'] as const;

export const MIN_PRIVILEGED_ADMINS = 1;

export type AdminUserGuardRow = {
  id: string;
  username: string;
  role: string;
};

export function isPrivilegedAdminRole(role: string): boolean {
  return (PRIVILEGED_ADMIN_ROLES as readonly string[]).includes(role);
}

export function countPrivilegedAdmins(users: AdminUserGuardRow[]): number {
  return users.filter((u) => isPrivilegedAdminRole(u.role)).length;
}

export function isOnlyPrivilegedAdmin(user: AdminUserGuardRow, users: AdminUserGuardRow[]): boolean {
  if (!isPrivilegedAdminRole(user.role)) return false;
  return countPrivilegedAdmins(users) <= MIN_PRIVILEGED_ADMINS;
}

export function canDemoteUser(
  user: AdminUserGuardRow,
  newRole: string,
  users: AdminUserGuardRow[],
): boolean {
  if (!isPrivilegedAdminRole(user.role)) return true;
  if (isPrivilegedAdminRole(newRole)) return true;
  return countPrivilegedAdmins(users) > MIN_PRIVILEGED_ADMINS;
}

export function canDeleteUser(
  user: AdminUserGuardRow,
  users: AdminUserGuardRow[],
  currentUsername: string,
): { allowed: boolean; reason?: string } {
  if (user.username === currentUsername) {
    return { allowed: false, reason: 'You cannot remove your own account while signed in.' };
  }
  if (isOnlyPrivilegedAdmin(user, users)) {
    return {
      allowed: false,
      reason:
        'This is the only super admin. Invite another super admin before removing or demoting this account.',
    };
  }
  return { allowed: true };
}

export function roleOptionsForUser(
  user: AdminUserGuardRow,
  users: AdminUserGuardRow[],
  allOptions: Array<{ value: string; label: string; description?: string }>,
): Array<{ value: string; label: string; description?: string; disabled?: boolean }> {
  const privilegedCount = countPrivilegedAdmins(users);
  return allOptions.map((opt) => {
    if (
      isPrivilegedAdminRole(user.role) &&
      !isPrivilegedAdminRole(opt.value) &&
      privilegedCount <= MIN_PRIVILEGED_ADMINS
    ) {
      return {
        ...opt,
        disabled: true,
        description: 'Add another super admin before changing this role.',
      };
    }
    return opt;
  });
}
