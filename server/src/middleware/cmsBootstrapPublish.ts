import type { Request, Response, NextFunction } from 'express';
import { scheduleCmsBootstrapPublish } from '../lib/cmsBootstrapPublish';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function affectsPublicBootstrap(method: string, path: string): boolean {
  if (!MUTATION_METHODS.has(method)) return false;

  if (path === '/content' && method === 'PATCH') return true;
  if (path === '/import') return true;
  if (path.startsWith('/blogs')) return true;
  if (path.startsWith('/events')) return true;
  if (/^\/revisions\/[^/]+\/restore$/.test(path)) return true;

  return false;
}

/** After successful CMS mutations, refresh bootstrap artifact / deploy hooks. */
export function cmsBootstrapPublishMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!affectsPublicBootstrap(req.method, req.path)) {
    next();
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      scheduleCmsBootstrapPublish();
    }
  });

  next();
}
