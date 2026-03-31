import type { ReactElement, ReactNode } from 'react';

export interface Column<T = Record<string, unknown>> {
  id: string;
  title: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  render?: (row: T) => ReactNode;
}

export interface FilterField {
  field: string;
  label: string;
  placeholder?: string;
}

export interface DataTableSummaryContext {
  totalRows: number;
  filteredCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  getRowId?: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  summary?: ReactNode;
  renderSummary?: (ctx: DataTableSummaryContext) => ReactNode;
  className?: string;
  tableClassName?: string;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  enableColumnReorder?: boolean;
  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  enableColumnResize?: boolean;
  minColumnWidth?: number;
  /** When set, used with `react-column-drag-resize-table:v1:*` keys in localStorage if column callbacks are omitted. */
  layoutStorageKey?: string;
  enableFiltering?: boolean;
  filterFields?: FilterField[];
  filters?: Record<string, unknown>;
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  defaultFilters?: Record<string, unknown>;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  filterBarClassName?: string;
  paginationClassName?: string;
}

export function DataTable<T = Record<string, unknown>>(
  props: DataTableProps<T>
): ReactElement | null;

export function filterRows<T extends Record<string, unknown>>(
  rows: T[],
  filters: Record<string, unknown>
): T[];
