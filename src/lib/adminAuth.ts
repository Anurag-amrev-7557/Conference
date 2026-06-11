import { config } from './config';
import { api } from './api';

const ADMIN_TOKEN_KEY = 'adminToken';

/**
 * Bearer token for split deploy (Firebase frontend + Render API).
 * HttpOnly cookies are same-site only — they are not sent cross-origin.
 */
export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token: string): void {
  if (!token.trim()) return;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function markAdminSessionActive(): void {
  localStorage.setItem(config.admin.sessionKey, 'true');
}

export async function clearAdminAuth(): Promise<void> {
  try {
    await api.logout();
  } catch {
    // Logout endpoint may be absent on older API builds — local clear still applies.
  }
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(config.admin.sessionKey);
}
