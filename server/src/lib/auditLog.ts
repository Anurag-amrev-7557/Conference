import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import prisma from './prisma';

export interface AdminJwtPayload {
  role?: string;
  adminId?: string;
  username?: string;
  exp?: number;
}

export function getAdminFromRequest(req: Request): AdminJwtPayload {
  return (req as Request & { admin?: AdminJwtPayload }).admin ?? {};
}

export async function writeAuditLog(
  req: Request,
  input: {
    action: string;
    entityType: string;
    entityId?: string;
    summary?: string;
  },
): Promise<void> {
  const admin = getAdminFromRequest(req);
  try {
    await prisma.auditLog.create({
      data: {
        adminId: admin.adminId,
        username: admin.username ?? 'admin',
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary,
      },
    });
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}

export async function saveContentRevision(
  entityType: string,
  entityId: string,
  snapshot: unknown,
  changedBy = 'admin',
): Promise<void> {
  try {
    await prisma.contentRevision.create({
      data: {
        id: randomUUID(),
        entityType,
        entityId,
        snapshot: JSON.stringify(snapshot),
        changedBy,
      },
    });

    const rows = await prisma.contentRevision.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (rows.length > 50) {
      const toDelete = rows.slice(50).map((r) => r.id);
      await prisma.contentRevision.deleteMany({ where: { id: { in: toDelete } } });
    }
  } catch (err) {
    console.error('Content revision save failed:', err);
  }
}
