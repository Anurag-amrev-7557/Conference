import { LayoutGrid, List, Search } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { SpeakerSort, SpeakerViewMode } from '../../lib/speakers'
import { CatalogSelect } from '../catalog/CatalogSelect'
import type { CatalogFilterOption } from '../catalog/CatalogToolbar'

const SORT_OPTIONS: { id: SpeakerSort; label: string }[] = [
  { id: 'featured-first', label: 'Featured first' },
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'name-desc', label: 'Name Z–A' },
  { id: 'company-asc', label: 'Company A–Z' },
]

type SpeakersCatalogToolbarProps = {
  searchId: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters: CatalogFilterOption[]
  activeFilterId: string
  onFilterChange: (id: string) => void
  companies: string[]
  activeCompany: string
  onCompanyChange: (company: string) => void
  sort: SpeakerSort
  onSortChange: (sort: SpeakerSort) => void
  viewMode: SpeakerViewMode
  onViewModeChange: (mode: SpeakerViewMode) => void
}

export function SpeakersCatalogToolbar({
  searchId,
  searchValue,
  onSearchChange,
  filters,
  activeFilterId,
  onFilterChange,
  companies,
  activeCompany,
  onCompanyChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SpeakersCatalogToolbarProps) {
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
    window.addEventListener('resize', update)
    const container = segmentsRef.current
    const ro = container ? new ResizeObserver(update) : null
    if (container && ro) ro.observe(container)
    return () => {
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [activeFilterId, filters])

  const companyOptions = [
    { value: 'all', label: 'All companies' },
    ...companies.map((company) => ({ value: company, label: company })),
  ]

  return (
    <div className="speakers-catalog-toolbar">
      <div className="catalog-search speakers-catalog-toolbar__search">
        <Search className="catalog-search__icon" aria-hidden />
        <label className="sr-only" htmlFor={searchId}>
          Search speakers
        </label>
        <input
          id={searchId}
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, company, or talk"
          className="catalog-search__input"
        />
      </div>

      <div className="speakers-catalog-toolbar__controls">
        {filters.length > 0 ? (
          <div
            ref={segmentsRef}
            className="catalog-segments"
            role="tablist"
            aria-label="Speaker filters"
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
            {filters.map((filter) => {
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
                  className={`catalog-segments__btn${isActive ? ' catalog-segments__btn--active' : ''}`}
                  onClick={() => onFilterChange(filter.id)}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        ) : null}

        {companies.length > 1 ? (
          <CatalogSelect
            value={activeCompany}
            onChange={onCompanyChange}
            options={companyOptions}
            searchable
            searchPlaceholder="Search companies"
            aria-label="Filter by company"
          />
        ) : null}

        <CatalogSelect
          value={sort}
          onChange={(value) => onSortChange(value as SpeakerSort)}
          options={SORT_OPTIONS.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
          aria-label="Sort speakers"
        />

        <div className="speakers-catalog-toolbar__view" role="group" aria-label="Layout">
          <button
            type="button"
            className={`speakers-catalog-toolbar__view-btn${viewMode === 'grid' ? ' speakers-catalog-toolbar__view-btn--active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={`speakers-catalog-toolbar__view-btn${viewMode === 'list' ? ' speakers-catalog-toolbar__view-btn--active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
          >
            <List className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
