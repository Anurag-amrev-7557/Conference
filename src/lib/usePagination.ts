import { useMemo, useState } from "react"

export const CATALOG_PAGE_SIZE = 9

function paginationKey<T>(items: T[]): string {
  return items
    .map((item, index) => {
      if (item && typeof item === "object" && "id" in item) {
        return String((item as { id: unknown }).id)
      }
      return String(index)
    })
    .join("\0")
}

export function usePagination<T>(items: T[], pageSize = CATALOG_PAGE_SIZE) {
  const [requestedPage, setRequestedPage] = useState(1)
  const itemsKey = useMemo(() => paginationKey(items), [items])
  const [prevItemsKey, setPrevItemsKey] = useState(itemsKey)

  if (itemsKey !== prevItemsKey) {
    setPrevItemsKey(itemsKey)
    setRequestedPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requestedPage, totalPages)

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  )

  return {
    page,
    setPage: setRequestedPage,
    totalPages,
    paginatedItems,
    showPagination: items.length > pageSize,
    totalItems: items.length,
  }
}
