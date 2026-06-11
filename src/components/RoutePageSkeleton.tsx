/** In-route loading placeholder — navbar stays mounted via PublicLayout. */
export function RoutePageSkeleton() {
  return (
    <main
      className="public-page-shell min-h-[calc(100vh-var(--header-offset,5.5rem))] w-full"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto py-16 md:py-20">
        <div className="route-page-skeleton mx-auto max-w-3xl text-center">
          <div className="route-page-skeleton__eyebrow" />
          <div className="route-page-skeleton__title" />
          <div className="route-page-skeleton__lede" />
        </div>
        <div className="route-page-skeleton__grid mt-14 sm:mt-16">
          <div className="route-page-skeleton__card" />
          <div className="route-page-skeleton__card" />
          <div className="route-page-skeleton__card" />
        </div>
      </div>
      <p className="sr-only">Loading page…</p>
    </main>
  )
}
