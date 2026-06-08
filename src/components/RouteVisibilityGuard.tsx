import type { ReactNode } from 'react'
import { useWebsiteData } from './WebsiteDataProvider'
import { NotFoundPage } from '../pages/NotFoundPage'

type RouteKey = 'blog' | 'events' | 'speakers' | 'register'

export function RouteVisibilityGuard({
  route,
  children,
}: {
  route: RouteKey
  children: ReactNode
}) {
  const { data } = useWebsiteData()
  const visible = data.settings.routeVisibility?.[route] !== false
  if (!visible) return <NotFoundPage />
  return <>{children}</>
}
