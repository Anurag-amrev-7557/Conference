import cors from 'cors';
import type { Request, RequestHandler } from 'express';

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
    path.startsWith('/api/v1/community') ||
    path.startsWith('/api/v1/marketing')
  );
}

/**
 * Split CORS: public vs admin origin lists (SEC-05 D-13–D-15).
 */
export function createCorsMiddleware(): RequestHandler {
  const defaultPublic = ['http://localhost:5173', 'http://localhost:5174', 'https://superhumanly-thoughts.com'];
  const publicOrigins = parseOrigins(process.env.ALLOWED_ORIGINS, defaultPublic);
  const adminOrigins = parseOrigins(process.env.ADMIN_ALLOWED_ORIGINS, publicOrigins);
  const isProduction = process.env.NODE_ENV === 'production';

  return (req, res, next) => {
    const path = req.path;
    const origin = req.headers.origin;
    const adminRoute = isAdminRoute(path);

    if (isProduction && !origin) {
      if (req.method === 'GET' && path === '/health') {
        return cors({ origin: false })(req, res, next);
      }
      return res.status(403).json({ error: 'Origin header required' });
    }

    if (!origin) {
      return cors({ origin: true, credentials: false })(req, res, next);
    }

    const allowList = adminRoute ? adminOrigins : isPublicApiRoute(path) ? publicOrigins : publicOrigins;

    if (!allowList.includes(origin)) {
      return res.status(403).json({ error: 'Cross-Origin Request Blocked by Vellux Security Policy' });
    }

    const useCredentials = adminRoute && adminOrigins.includes(origin);

    return cors({
      origin: true,
      credentials: useCredentials,
    })(req, res, next);
  };
}
