/** Fired when admin login state changes (login, logout, session expiry). */
export const ADMIN_SESSION_CHANGED = 'admin-session-changed';

export function notifyAdminSessionChanged() {
  window.dispatchEvent(new CustomEvent(ADMIN_SESSION_CHANGED));
}
