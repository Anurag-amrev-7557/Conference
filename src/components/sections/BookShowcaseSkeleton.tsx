export function BookShowcaseSkeleton() {
  return (
    <section
      className="book-section book-section-bg book-section-bg--conference book-section--borderless relative w-full"
      aria-hidden
    >
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 xl:gap-16 items-center max-w-[1600px] mx-auto">
          <div className="flex justify-center w-full lg:w-auto">
            <div className="book-section-skeleton__cover" />
          </div>
          <div className="flex flex-col gap-4 w-full max-w-2xl lg:max-w-none">
            <div className="book-section-skeleton__line book-section-skeleton__line--eyebrow" />
            <div className="book-section-skeleton__line book-section-skeleton__line--title" />
            <div className="book-section-skeleton__line book-section-skeleton__line--tagline" />
            <div className="flex flex-wrap gap-2">
              <div className="book-section-skeleton__chip" />
              <div className="book-section-skeleton__chip" />
              <div className="book-section-skeleton__chip" />
            </div>
            <div className="book-section-skeleton__line book-section-skeleton__line--body book-section-skeleton__line--short" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="book-section-skeleton__button" />
              <div className="book-section-skeleton__button book-section-skeleton__button--secondary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
