import { Search } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

export interface CatalogFilterOption {
  id: string
  label: string
}

interface CatalogToolbarProps {
  searchId: string
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: CatalogFilterOption[]
  activeFilterId: string
  onFilterChange: (id: string) => void
  filterAriaLabel: string
}

export function CatalogToolbar({
  searchId,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters = [],
  activeFilterId,
  onFilterChange,
  filterAriaLabel,
}: CatalogToolbarProps) {
  const segmentFilters = filters
  const segmentsRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ x: 0, y: 0, width: 0, height: 0 })

  useLayoutEffect(() => {
    const update = () => {
      const container = segmentsRef.current
      const activeBtn = buttonRefs.current.get(activeFilterId)
      if (!container || !activeBtn) return
      setIndicator({
        x: activeBtn.offsetLeft,
        y: activeBtn.offsetTop,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
      })
    }

    update()
    window.addEventListener("resize", update)
    const container = segmentsRef.current
    const ro = container ? new ResizeObserver(update) : null
    if (container && ro) ro.observe(container)
    return () => {
      window.removeEventListener("resize", update)
      ro?.disconnect()
    }
  }, [activeFilterId, segmentFilters])

  return (
    <div className="catalog-toolbar">
      <div className="catalog-search">
        <Search className="catalog-search__icon" aria-hidden />
        <label className="sr-only" htmlFor={searchId}>
          {searchPlaceholder}
        </label>
        <input
          id={searchId}
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="catalog-search__input"
        />
      </div>

      {segmentFilters.length > 0 ? (
      <div
        ref={segmentsRef}
        className="catalog-segments"
        role="tablist"
        aria-label={filterAriaLabel}
      >
        <span
          className="catalog-segments__indicator"
          style={{
            width: indicator.width,
            height: indicator.height,
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
          }}
          aria-hidden
        />
        {segmentFilters.map((filter) => {
          const isActive = activeFilterId === filter.id
          return (
            <button
              key={filter.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(filter.id, el)
                else buttonRefs.current.delete(filter.id)
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`catalog-segments__btn${isActive ? " catalog-segments__btn--active" : ""}`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
      ) : null}
    </div>
  )
}
