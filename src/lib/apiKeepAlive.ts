import { getApiOrigin } from './assetUrl'

const PING_INTERVAL_MS = 8 * 60 * 1000
const DEFAULT_RENDER_PING = 'https://superhumanly-thoughts.onrender.com/ping'

export function getProductionPingUrl(): string | undefined {
  if (!import.meta.env.PROD) return undefined
  const origin = getApiOrigin()
  return origin ? `${origin}/ping` : DEFAULT_RENDER_PING
}

/** Wake Render while a visitor has the site open (does not replace 24/7 external monitoring). */
export function startApiKeepAlive(): () => void {
  const url = getProductionPingUrl()
  if (!url) return () => {}

  const ping = () => {
    if (document.visibilityState !== 'visible') return
    void fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(() => {})
  }

  ping()
  const timer = window.setInterval(ping, PING_INTERVAL_MS)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') ping()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
