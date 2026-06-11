import { Suspense, type ReactNode } from 'react'
import { RoutePageSkeleton } from './RoutePageSkeleton'

export function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RoutePageSkeleton />}>{children}</Suspense>
}
