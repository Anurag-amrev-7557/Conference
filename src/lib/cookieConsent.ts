export const COOKIE_CONSENT_KEY = 'cms_cookie_consent';

export function hasCookieConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return false;
  }
}

export function acceptCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, '1');
}
