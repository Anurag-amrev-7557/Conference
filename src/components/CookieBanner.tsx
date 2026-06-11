import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWebsiteData } from './WebsiteDataProvider'

const STORAGE_KEY = 'cms_cookie_consent'

function hasAcceptedCookies() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export function CookieBanner() {
  const { data } = useWebsiteData()
  const banner = data.settings.cookieBanner
  const [dismissed, setDismissed] = useState(hasAcceptedCookies)

  if (!banner?.enabled || dismissed) return null

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border/50 bg-white/95 backdrop-blur-md shadow-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted leading-relaxed flex-1">
          {banner.text ||
            'We use cookies to improve your experience and analyze site traffic.'}
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
          type="button"
          onClick={accept}
          className="admin-btn admin-btn--primary shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl bg-accent text-white hover:opacity-90"
        >
          {banner.acceptLabel || 'Accept'}
        </button>
      </div>
    </div>
  )
}
