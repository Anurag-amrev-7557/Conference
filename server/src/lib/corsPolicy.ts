import cors from 'cors';
import type { Request, RequestHandler } from 'express';
import { getProductionSiteOrigins } from './siteOrigins';

function parseOrigins(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) {
    return fallback;
  }
  return value.split(',').map((o) => o.trim()).filter(Boolean);
}

function isAdminRoute(path: string): boolean {
  return path.startsWith('/api/v1/admin') || path.startsWith('/api/v1/auth');
}

function isPublicApiRoute(path: string): boolean {
  return (
    path.startsWith('/api/v1/content') ||
    path.startsWith('/api/v1/marketing')
  );
}

function isKeepAliveRoute(path: string): boolean {
  return path === '/ping' || path === '/health';
}

/**
 * Split CORS: public vs admin origin lists (SEC-05 D-13–D-15).
 */
function mergeSiteOrigin(origins: string[]): string[] {
  if (process.env.NODE_ENV !== 'production') {
    return origins;
  }
  return [...new Set([...origins, ...getProductionSiteOrigins()])];
}

export function createCorsMiddleware(): RequestHandler {
  const defaultPublic = ['http://localhost:5173', 'http://localhost:5174'];
  const publicOrigins = mergeSiteOrigin(parseOrigins(process.env.ALLOWED_ORIGINS, defaultPublic));
  const adminOrigins = mergeSiteOrigin(
    parseOrigins(process.env.ADMIN_ALLOWED_ORIGINS, publicOrigins),
  );
  const isProduction = process.env.NODE_ENV === 'production';

  return (req, res, next) => {
    const path = req.path;
    const origin = req.headers.origin;
    const adminRoute = isAdminRoute(path);

    if (isKeepAliveRoute(path)) {
      return cors({ origin: true, credentials: false })(req, res, next);
    }

    if (isProduction && !origin) {
      // Non-browser or same-origin requests may legitimately omit Origin in production.
      return cors({ origin: false, credentials: false })(req, res, next);
    }

    if (!origin) {
      return cors({ origin: true, credentials: false })(req, res, next);
    }

    const allowList = adminRoute ? adminOrigins : isPublicApiRoute(path) ? publicOrigins : publicOrigins;

    if (!allowList.includes(origin)) {
      return res.status(403).json({ error: 'Cross-Origin Request Blocked by Book Website Security Policy (legacy: Vellux policy)' });
    }

    const useCredentials = adminRoute && adminOrigins.includes(origin);

    return cors({
      origin: true,
      credentials: useCredentials,
    })(req, res, next);
  };
}
