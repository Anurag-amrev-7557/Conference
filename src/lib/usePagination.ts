import { useEffect, useMemo, useState } from "react"

export const CATALOG_PAGE_SIZE = 9

export function usePagination<T>(items: T[], pageSize = CATALOG_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [items])

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  return {
    page: safePage,
    setPage,
    totalPages,
    paginatedItems,
    showPagination: items.length > pageSize,
    totalItems: items.length,
  }
}
