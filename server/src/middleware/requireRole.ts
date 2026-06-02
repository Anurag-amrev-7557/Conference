import type { Request, Response, NextFunction } from 'express';
import { getAdminFromRequest } from '../lib/auditLog';

const ROLE_RANK: Record<string, number> = {
  viewer: 1,
  editor: 2,
  super_admin: 3,
  admin: 3,
};

function rank(role?: string): number {
  if (!role) return ROLE_RANK.super_admin;
  return ROLE_RANK[role] ?? ROLE_RANK.viewer;
}

/** Block viewers from mutating routes. Editors+ can write; super_admin for destructive ops. */
export function requireMinRole(minRole: 'editor' | 'super_admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = getAdminFromRequest(req);
    const needed = ROLE_RANK[minRole];
    if (rank(admin.role) < needed) {
      return res.status(403).json({ error: 'Insufficient permissions for this action.' });
    }
    next();
  };
}

/** Viewers may only use GET/HEAD/OPTIONS on admin API. */
export function blockViewerMutations(req: Request, res: Response, next: NextFunction) {
  const admin = getAdminFromRequest(req);
  if (rank(admin.role) >= ROLE_RANK.editor) {
    return next();
  }
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }
  return res.status(403).json({ error: 'Viewer accounts are read-only.' });
}
