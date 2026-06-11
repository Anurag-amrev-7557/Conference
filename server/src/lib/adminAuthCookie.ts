import type { Response } from 'express';

export const ADMIN_AUTH_COOKIE = 'admin_session';

const isProduction = process.env.NODE_ENV === 'production';

function cookieFlags(): string[] {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${24 * 60 * 60}`];
  if (isProduction) {
    flags.push('Secure');
  }
  return flags;
}

export function setAdminAuthCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_AUTH_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags().join('; ')}`,
  );
}

export function clearAdminAuthCookie(res: Response): void {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isProduction) {
    flags.push('Secure');
  }
  res.setHeader('Set-Cookie', `${ADMIN_AUTH_COOKIE}=; ${flags.join('; ')}`);
}

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').flatMap((part) => {
      const trimmed = part.trim();
      if (!trimmed) return [];
      const eq = trimmed.indexOf('=');
      if (eq === -1) return [[trimmed, '']];
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      try {
        return [[key, decodeURIComponent(value)]];
      } catch {
        return [[key, value]];
      }
    }),
  );
}

export function readAdminTokenFromRequest(req: {
  headers: { authorization?: string; cookie?: string };
}): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim() || null;
  }
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies[ADMIN_AUTH_COOKIE]?.trim() || null;
}
