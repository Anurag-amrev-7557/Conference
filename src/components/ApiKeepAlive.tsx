import { useEffect } from 'react'
import { startApiKeepAlive } from '../lib/apiKeepAlive'

/** Production-only: pings Render /ping while the tab is open. */
export function ApiKeepAlive() {
  useEffect(() => startApiKeepAlive(), [])
  return null
}
