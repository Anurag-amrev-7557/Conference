import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from './Button';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  selectable,
  selectedIds,
  onSelectionChange,
  bulkActions,
  pagination,
  className,
  emptyState,
  embedded = false,
  activeRowId,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  bulkActions?: React.ReactNode;
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void };
  className?: string;
  emptyState?: React.ReactNode;
  /** Full-bleed admin CRM table — no rounded card wrapper */
  embedded?: boolean;
  /** Highlights the active CRM row (e.g. open detail panel) */
  activeRowId?: string | null;
  onRowClick?: (row: T) => void;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const allSelected = selectable && data.length > 0 && selectedIds?.size === data.length;
  const someSelected = selectable && selectedIds && selectedIds.size > 0;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((r) => r.id)));
    }
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return data;
    return [...data].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortKey] ?? '');
      const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
      const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [columns, data, sortDir, sortKey]);

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('flex flex-col gap-0', embedded && 'admin-data-table', className)}>
      {someSelected && bulkActions && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--ds-primary-50)] dark:bg-[var(--ds-primary-950)] border border-[var(--ds-primary-200)] dark:border-[var(--ds-primary-800)] rounded-[var(--ds-radius-lg)] mb-3">
          <span className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-primary-700)] dark:text-[var(--ds-primary-300)]">
            {selectedIds!.size} selected
          </span>
          {bulkActions}
        </div>
      )}
      <div
        className={
          embedded
            ? 'admin-data-table__scroll'
            : 'overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)]'
        }
      >
        <table className={embedded ? 'admin-data-table__table' : 'w-full ds-table-responsive'}>
          <thead>
            <tr
              className={
                embedded
                  ? undefined
                  : 'bg-[var(--ds-surface-sunken)] border-b border-[var(--ds-border)]'
              }
            >
              {selectable && (
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="rounded border-[var(--ds-border)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    embedded
                      ? col.sortable && 'admin-data-table__th--sortable'
                      : 'px-4 py-2 text-left text-[var(--ds-text-xs)] font-[var(--ds-font-medium)] text-[var(--ds-text-muted)] uppercase tracking-[var(--ds-tracking-wide)]',
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-1 w-full text-left',
                        !embedded && 'hover:text-[var(--ds-text-primary)]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary-600)] focus-visible:ring-offset-2 rounded-[var(--ds-radius-sm)]',
                      )}
                      onClick={() => handleSort(col.key)}
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3 h-3" aria-hidden />
                        ) : (
                          <ChevronDown className="w-3 h-3" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" aria-hidden />
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1">{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={
                  embedded
                    ? cn(
                        onRowClick && 'admin-data-table__row--clickable',
                        activeRowId === row.id && 'admin-data-table__row--active',
                      )
                    : cn(
                        'border-b border-[var(--ds-border)] last:border-0 ds-transition-base',
                        'hover:bg-[var(--ds-surface-sunken)]',
                        selectedIds?.has(row.id) &&
                          'bg-[var(--ds-primary-50)] dark:bg-[var(--ds-primary-950)]',
                      )
                }
                style={embedded ? undefined : { animationDelay: `${rowIndex * 2}ms` }}
                onClick={embedded && onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  embedded && onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={embedded && onRowClick && !selectable ? 0 : undefined}
              >
                {selectable && (
                  <td className="w-10 px-3 py-3" data-label="">
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(row.id) ?? false}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                      className="rounded border-[var(--ds-border)]"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    data-label={col.header}
                    className={cn(
                      !embedded &&
                        'px-4 py-3 text-[var(--ds-text-base)] text-[var(--ds-text-primary)]',
                      col.className,
                    )}
                  >
                    <div
                      className={
                        col.key === 'actions' ? 'admin-data-table__cell-actions' : undefined
                      }
                      onClick={col.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                      onKeyDown={col.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {col.render(row)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[var(--ds-text-sm)] text-[var(--ds-text-muted)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
