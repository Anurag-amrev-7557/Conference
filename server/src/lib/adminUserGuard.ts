import type { Prisma } from '@prisma/client';
import prisma from './prisma';

/** Roles that can manage team, permissions, and full CMS access. */
export const PRIVILEGED_ADMIN_ROLES = ['super_admin', 'admin'] as const;

export type PrivilegedAdminRole = (typeof PRIVILEGED_ADMIN_ROLES)[number];

export const MIN_PRIVILEGED_ADMINS = 1;

export function isPrivilegedAdminRole(role: string): boolean {
  return (PRIVILEGED_ADMIN_ROLES as readonly string[]).includes(role);
}

export function privilegedAdminWhere(): Prisma.AdminWhereInput {
  return { role: { in: [...PRIVILEGED_ADMIN_ROLES] } };
}

export async function countPrivilegedAdmins(
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<number> {
  return client.admin.count({ where: privilegedAdminWhere() });
}

/** True when removing or demoting this user would leave zero privileged admins. */
export function wouldRemoveLastPrivilegedAdmin(
  currentRole: string,
  nextRole?: string,
  privilegedCount?: number,
): boolean {
  if (!isPrivilegedAdminRole(currentRole)) return false;
  if (nextRole !== undefined && isPrivilegedAdminRole(nextRole)) return false;
  if (privilegedCount !== undefined) return privilegedCount <= MIN_PRIVILEGED_ADMINS;
  return true;
}

export async function assertCanChangePrivilegedRole(
  existingRole: string,
  nextRole: string | undefined,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!wouldRemoveLastPrivilegedAdmin(existingRole, nextRole)) {
    return { ok: true };
  }
  const count = await countPrivilegedAdmins(client);
  if (count <= MIN_PRIVILEGED_ADMINS) {
    return {
      ok: false,
      error: 'Cannot change role: at least one super admin must remain to manage team access.',
    };
  }
  return { ok: true };
}

export async function assertCanDeleteAdminUser(
  existingRole: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return assertCanChangePrivilegedRole(existingRole, undefined, client);
}
