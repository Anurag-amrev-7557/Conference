import { ChevronLeft, ChevronRight } from "lucide-react"

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="catalog-pagination" aria-label="Pagination">
      <button
        type="button"
        className="catalog-pagination__arrow"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="catalog-pagination__pages">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`catalog-pagination__page${
              p === page ? " catalog-pagination__page--active" : ""
            }`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="catalog-pagination__arrow"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
