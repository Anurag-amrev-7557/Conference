import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteData } from './WebsiteDataProvider';
import { acceptCookieConsent, COOKIE_CONSENT_KEY, hasCookieConsent } from '../lib/cookieConsent';

export function CookieBanner() {
  const { data } = useWebsiteData();
  const banner = data.settings.cookieBanner;
  const [dismissed, setDismissed] = useState(hasCookieConsent);
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const accept = () => {
    acceptCookieConsent();
    setDismissed(true);
    window.dispatchEvent(new CustomEvent('cms:cookie-consent'));
    previousFocusRef.current?.focus();
  };

  useEffect(() => {
    if (!banner?.enabled || dismissed) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    acceptRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        accept();
        return;
      }
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (!hasCookieConsent()) {
        previousFocusRef.current?.focus();
      }
    };
  }, [banner?.enabled, dismissed]);

  if (!banner?.enabled || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cookie consent"
        className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-xl dark:shadow-none p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">
          {banner.text || 'We use cookies to improve your experience and analyze site traffic.'}
          {banner.policyUrl ? (
            <>
              {' '}
              {banner.policyUrl.startsWith('/') ? (
                <Link to={banner.policyUrl} className="text-accent underline underline-offset-2">
                  Learn more
                </Link>
              ) : (
                <a
                  href={banner.policyUrl}
                  className="text-accent underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              )}
            </>
          ) : null}
        </p>
        <button
          ref={acceptRef}
          type="button"
          onClick={accept}
          className="admin-btn admin-btn--primary shrink-0 min-h-11 px-6 py-2.5 text-sm font-semibold rounded-xl bg-accent text-white hover:opacity-90 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          {banner.acceptLabel || 'Accept'}
        </button>
      </div>
    </div>
  );
}

export { COOKIE_CONSENT_KEY };
