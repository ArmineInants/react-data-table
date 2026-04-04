import { useMemo, useState, useCallback, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { filterRows } from './filterRows.js';
import { Pagination } from './Pagination.jsx';

const LS_ORDER_PREFIX = 'react-column-drag-resize-table:v1:order:';
const LS_WIDTHS_PREFIX = 'react-column-drag-resize-table:v1:widths:';

function mergeOrderWithBaseIds(order, baseIds) {
  const list = Array.isArray(order) ? order : [];
  const set = new Set(baseIds);
  const out = [];
  for (const id of list) {
    if (set.has(id)) out.push(id);
  }
  for (const id of baseIds) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

function readOrderFromStorage(key) {
  if (!key || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeOrderToStorage(key, order) {
  if (!key || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(order));
  } catch {
    /* quota / private mode */
  }
}

function readWidthsFromStorage(key) {
  if (!key || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeWidthsToStorage(key, widths) {
  if (!key || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(widths));
  } catch {
    /* quota / private mode */
  }
}

function defaultGetRowId(row, index) {
  if (row && row.id != null) return String(row.id);
  return String(index);
}

function getCellValue(column, row) {
  if (column.render) {
    return column.render(row);
  }
  if (typeof column.accessor === 'function') {
    return column.accessor(row);
  }
  if (column.accessor != null) {
    return row[column.accessor];
  }
  return row[column.id];
}

function useOrderedColumns(columnsProp, columnOrderProp, onColumnOrderChange, orderPersistKey) {
  const controlled = columnOrderProp != null;
  const baseIds = useMemo(
    () => (columnsProp || []).map((c) => c.id),
    [columnsProp]
  );
  const [internalOrder, setInternalOrder] = useState(null);
  const lastOrderPersistKeyRef = useRef(orderPersistKey);

  useEffect(() => {
    if (controlled) return;
    const keyChanged = lastOrderPersistKeyRef.current !== orderPersistKey;
    lastOrderPersistKeyRef.current = orderPersistKey;

    setInternalOrder((prev) => {
      const fromLs = orderPersistKey ? readOrderFromStorage(orderPersistKey) : null;
      if (prev === null || keyChanged) {
        return mergeOrderWithBaseIds(fromLs ?? baseIds, baseIds);
      }
      return mergeOrderWithBaseIds(prev, baseIds);
    });
  }, [baseIds, controlled, orderPersistKey]);

  const orderedIds = useMemo(() => {
    const requested = controlled ? columnOrderProp : internalOrder || baseIds;
    const map = new Map((columnsProp || []).map((c) => [c.id, c]));
    const seen = new Set();
    const result = [];
    for (const id of requested) {
      if (map.has(id) && !seen.has(id)) {
        result.push(id);
        seen.add(id);
      }
    }
    for (const id of baseIds) {
      if (!seen.has(id)) result.push(id);
    }
    return result;
  }, [columnsProp, columnOrderProp, internalOrder, baseIds, controlled]);

  const columns = useMemo(() => {
    const map = new Map((columnsProp || []).map((c) => [c.id, c]));
    return orderedIds.map((id) => map.get(id)).filter(Boolean);
  }, [columnsProp, orderedIds]);

  const setOrder = useCallback(
    (nextIds) => {
      const merged = mergeOrderWithBaseIds(nextIds, baseIds);
      if (!controlled) {
        setInternalOrder(merged);
        if (orderPersistKey) writeOrderToStorage(orderPersistKey, merged);
      }
      onColumnOrderChange?.(merged);
    },
    [controlled, onColumnOrderChange, orderPersistKey, baseIds]
  );

  return { columns, orderedIds, setOrder };
}

/**
 * @param {object} props
 * @param {boolean} [props.enableFiltering]
 * @param {Array<{ field: string, label: string, placeholder?: string }>} [props.filterFields]
 * @param {Record<string, unknown>} [props.filters]
 * @param {(f: Record<string, unknown>) => void} [props.onFiltersChange]
 * @param {Record<string, unknown>} [props.defaultFilters]
 * @param {boolean} [props.enablePagination]
 * @param {number} [props.defaultPageSize]
 * @param {number[]} [props.pageSizeOptions]
 * @param {number} [props.currentPage]
 * @param {(page: number) => void} [props.onPageChange]
 * @param {number} [props.pageSize]
 * @param {(size: number) => void} [props.onPageSizeChange]
 * @param {string} [props.filterBarClassName]
 * @param {string} [props.paginationClassName]
 * @param {(ctx: { totalRows: number, filteredCount: number, currentPage: number, pageSize: number, totalPages: number }) => import('react').ReactNode} [props.renderSummary]
 * @param {string} [props.layoutStorageKey] - optional id segment for localStorage when column order/width callbacks are omitted
 */
export function DataTable({
  columns: columnsProp,
  rows,
  getRowId = defaultGetRowId,
  loading = false,
  emptyMessage = 'No rows to display.',
  summary,
  className = '',
  tableClassName = 'highlight',
  columnOrder: columnOrderProp,
  onColumnOrderChange,
  enableColumnReorder = true,
  columnWidths: columnWidthsProp,
  onColumnWidthsChange,
  enableColumnResize = true,
  minColumnWidth = 64,
  layoutStorageKey,
  enableFiltering = false,
  filterFields = [],
  filters: filtersProp,
  onFiltersChange,
  defaultFilters,
  enablePagination = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  currentPage: currentPageProp,
  onPageChange,
  pageSize: pageSizeProp,
  onPageSizeChange,
  filterBarClassName = '',
  paginationClassName = '',
  renderSummary
}) {
  const uid = useId();
  const filtersControlled = filtersProp !== undefined;
  const [internalFilters, setInternalFilters] = useState(() => ({
    ...(defaultFilters ?? {})
  }));

  const pageControlled = currentPageProp !== undefined;
  const pageSizeControlled = pageSizeProp !== undefined;
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const effectiveFilters = filtersControlled ? filtersProp : internalFilters;
  const effectivePageSize = pageSizeControlled ? pageSizeProp : internalPageSize;

  const baseColumnIds = useMemo(
    () => (columnsProp || []).map((c) => c.id),
    [columnsProp]
  );
  const persistLayoutId = useMemo(
    () => layoutStorageKey ?? [...baseColumnIds].sort().join('|'),
    [layoutStorageKey, baseColumnIds]
  );

  const orderPersistKey =
    onColumnOrderChange == null && columnOrderProp == null
      ? `${LS_ORDER_PREFIX}${persistLayoutId}`
      : null;

  const widthsPersistKey =
    onColumnWidthsChange == null && columnWidthsProp === undefined
      ? `${LS_WIDTHS_PREFIX}${persistLayoutId}`
      : null;

  const widthsControlled = columnWidthsProp !== undefined;
  const [internalWidths, setInternalWidths] = useState({});
  const columnWidths = widthsControlled ? columnWidthsProp : internalWidths;

  useEffect(() => {
    if (widthsControlled || !widthsPersistKey) return;
    const saved = readWidthsFromStorage(widthsPersistKey);
    if (saved) setInternalWidths(saved);
  }, [widthsControlled, widthsPersistKey]);

  const setColumnWidth = useCallback(
    (colId, widthPx) => {
      if (widthsControlled) {
        onColumnWidthsChange?.({ ...columnWidthsProp, [colId]: widthPx });
      } else {
        setInternalWidths((prev) => {
          const next = { ...prev, [colId]: widthPx };
          onColumnWidthsChange?.(next);
          if (widthsPersistKey) writeWidthsToStorage(widthsPersistKey, next);
          return next;
        });
      }
    },
    [widthsControlled, columnWidthsProp, onColumnWidthsChange, widthsPersistKey]
  );

  const resizeSession = useRef(null);
  const orderedIdsRef = useRef([]);
  const [columnReorderUI, setColumnReorderUI] = useState(null);

  const { columns, orderedIds, setOrder } = useOrderedColumns(
    columnsProp,
    columnOrderProp,
    onColumnOrderChange,
    orderPersistKey
  );

  orderedIdsRef.current = orderedIds;

  const applyColumnReorderAtPoint = useCallback(
    (draggedId, clientX, clientY) => {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return;
      const th = el.closest?.('th.react-data-table__th');
      const targetId = th?.id;
      if (!targetId || !draggedId || targetId === draggedId) return;

      const order = [...orderedIdsRef.current];
      const draggedIdx = order.indexOf(draggedId);
      const targetIdx = order.indexOf(targetId);
      if (draggedIdx < 0 || targetIdx < 0) return;

      const bb = th.getBoundingClientRect();
      const afterHalf = clientX >= bb.x + parseFloat(bb.width) / 2;

      const next = order.filter((id) => id !== draggedId);
      let insertAt = next.indexOf(targetId);
      if (afterHalf) insertAt += 1;
      next.splice(insertAt, 0, draggedId);
      setOrder(next);
    },
    [setOrder]
  );

  const handleReorderPointerDown = useCallback(
    (col, e) => {
      if (!enableColumnReorder) return;
      if (!e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest?.('.react-data-table__resize-handle')) return;

      const th = e.currentTarget;
      const rect = th.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      e.preventDefault();
      try {
        th.setPointerCapture(e.pointerId);
      } catch {
        /* preview / unsupported */
      }

      setColumnReorderUI({
        colId: col.id,
        title: col.title,
        width: rect.width,
        height: rect.height,
        offsetX,
        offsetY,
        pointerX: e.clientX,
        pointerY: e.clientY
      });

      const pointerId = e.pointerId;

      const onMove = (ev) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        setColumnReorderUI((prev) =>
          prev && prev.colId === col.id
            ? { ...prev, pointerX: ev.clientX, pointerY: ev.clientY }
            : prev
        );
      };

      const onEnd = (ev) => {
        if (ev.pointerId !== pointerId) return;
        try {
          th.releasePointerCapture(pointerId);
        } catch {
          /* already released */
        }
        th.removeEventListener('pointermove', onMove);
        th.removeEventListener('pointerup', onEnd);
        th.removeEventListener('pointercancel', onEnd);
        setColumnReorderUI(null);
        applyColumnReorderAtPoint(col.id, ev.clientX, ev.clientY);
      };

      th.addEventListener('pointermove', onMove, { passive: false });
      th.addEventListener('pointerup', onEnd);
      th.addEventListener('pointercancel', onEnd);
    },
    [enableColumnReorder, applyColumnReorderAtPoint]
  );

  const filteredRows = useMemo(() => {
    if (!enableFiltering) return rows;
    return filterRows(rows, effectiveFilters);
  }, [rows, enableFiltering, effectiveFilters]);

  const totalRows = rows.length;
  const filteredCount = filteredRows.length;

  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.max(1, Math.ceil(filteredRows.length / effectivePageSize));
  }, [enablePagination, filteredRows.length, effectivePageSize]);

  const rawPage = pageControlled ? currentPageProp : internalPage;

  const safePage = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.min(Math.max(1, rawPage), totalPages);
  }, [enablePagination, rawPage, totalPages]);

  useEffect(() => {
    if (!enablePagination || pageControlled) return;
    setInternalPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages, enablePagination, pageControlled]);

  const displayRows = useMemo(() => {
    if (!enablePagination) return filteredRows;
    const start = (safePage - 1) * effectivePageSize;
    return filteredRows.slice(start, start + effectivePageSize);
  }, [enablePagination, filteredRows, safePage, effectivePageSize]);

  const goToPage = useCallback(
    (page) => {
      const p = Math.min(Math.max(1, page), totalPages);
      if (pageControlled) onPageChange?.(p);
      else setInternalPage(p);
    },
    [totalPages, pageControlled, onPageChange]
  );

  const updateFilterField = useCallback(
    (field, rawValue) => {
      const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      const next = { ...effectiveFilters };
      if (value === '' || value == null) delete next[field];
      else next[field] = value;

      if (filtersControlled) onFiltersChange?.(next);
      else setInternalFilters(next);

      if (enablePagination) {
        if (pageControlled) onPageChange?.(1);
        else setInternalPage(1);
      }
    },
    [
      effectiveFilters,
      filtersControlled,
      onFiltersChange,
      enablePagination,
      pageControlled,
      onPageChange
    ]
  );

  const handlePageSizeChange = useCallback(
    (e) => {
      const n = Number(e.target.value);
      if (Number.isNaN(n) || n < 1) return;
      if (pageSizeControlled) onPageSizeChange?.(n);
      else setInternalPageSize(n);
      if (pageControlled) onPageChange?.(1);
      else setInternalPage(1);
    },
    [pageSizeControlled, onPageSizeChange, pageControlled, onPageChange]
  );

  const handleResizePointerDown = useCallback(
    (colId, event) => {
      if (!enableColumnResize) return;
      if (!event.isPrimary) return;
      event.preventDefault();
      event.stopPropagation();

      const el = event.currentTarget;
      const th = el.closest('th');
      const startW =
        columnWidths[colId] ?? (th ? th.getBoundingClientRect().width : minColumnWidth);

      resizeSession.current = { colId, startX: event.clientX, startW };
      document.body.classList.add('react-data-table--resizing');

      const pointerId = event.pointerId;
      try {
        el.setPointerCapture(pointerId);
      } catch {
        /* preview / unsupported */
      }

      const onMove = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        moveEvent.preventDefault();
        const s = resizeSession.current;
        if (!s) return;
        const delta = moveEvent.clientX - s.startX;
        const newW = Math.max(minColumnWidth, s.startW + delta);
        setColumnWidth(s.colId, newW);
      };

      const onUp = (upEvent) => {
        if (upEvent.pointerId !== pointerId) return;
        try {
          el.releasePointerCapture(pointerId);
        } catch {
          /* */
        }
        resizeSession.current = null;
        document.body.classList.remove('react-data-table--resizing');
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
      };

      el.addEventListener('pointermove', onMove, { passive: false });
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    },
    [enableColumnResize, columnWidths, minColumnWidth, setColumnWidth]
  );

  if (loading) {
    return (
      <div className={`table react-data-table react-data-table--loading ${className}`.trim()}>
        <div className="react-data-table__spinner" aria-busy="true" aria-label="Loading" />
      </div>
    );
  }

  if (!columnsProp || columnsProp.length === 0) {
    return null;
  }

  const showHints = enableColumnReorder || enableColumnResize;
  const showFilterBar = enableFiltering && filterFields.length > 0;
  const showPageSize =
    enablePagination && Array.isArray(pageSizeOptions) && pageSizeOptions.length > 0;

  const summaryContext = {
    totalRows,
    filteredCount,
    currentPage: safePage,
    pageSize: effectivePageSize,
    totalPages
  };

  const summaryNode = renderSummary
    ? renderSummary(summaryContext)
    : summary;

  const columnsList = columns.map((col) => {
    const w = columnWidths[col.id];
    const thStyle =
      w != null
        ? { width: w, minWidth: minColumnWidth, maxWidth: w }
        : { minWidth: minColumnWidth };

    return (
      <th
        key={col.id}
        id={col.id}
        scope="col"
        className={[
          'react-data-table__th',
          enableColumnReorder && 'react-data-table__th--draggable',
          columnReorderUI?.colId === col.id && 'react-data-table__th--reorder-source'
        ]
          .filter(Boolean)
          .join(' ')}
        style={thStyle}
        onPointerDown={enableColumnReorder ? (e) => handleReorderPointerDown(col, e) : undefined}
        title={
          enableColumnReorder && enableColumnResize
            ? 'Drag to reorder · Drag the right edge to resize'
            : enableColumnReorder
              ? 'Drag to reorder columns'
              : enableColumnResize
                ? 'Drag the right edge to resize'
                : undefined
        }
      >
        <div className="react-data-table__th-main">
          {enableColumnReorder ? (
            <span
              className="react-data-table__drag-grip"
              aria-hidden="true"
              title="Drag to reorder"
            />
          ) : null}
          <span className="react-data-table__th-title">{col.title}</span>
        </div>
        {enableColumnResize ? (
          <span
            className="react-data-table__resize-handle"
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            aria-label="Resize column"
            title="Drag to resize"
            onPointerDown={(e) => handleResizePointerDown(col.id, e)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const step = e.key === 'ArrowLeft' ? -8 : 8;
                const current =
                  columnWidths[col.id] ??
                  (e.currentTarget.closest('th')?.getBoundingClientRect().width ?? minColumnWidth);
                setColumnWidth(col.id, Math.max(minColumnWidth, current + step));
              }
            }}
          />
        ) : null}
      </th>
    );
  });

  const body =
    displayRows.length > 0
      ? displayRows.map((row, rowIndex) => (
          <tr key={getRowId(row, rowIndex)}>
            {columns.map((col) => {
              const w = columnWidths[col.id];
              const tdStyle =
                w != null
                  ? { width: w, minWidth: minColumnWidth, maxWidth: w }
                  : { minWidth: minColumnWidth };
              return (
                <td key={col.id} style={tdStyle}>
                  {getCellValue(col, row)}
                </td>
              );
            })}
          </tr>
        ))
      : [
          <tr key="__empty">
            <td colSpan={columns.length} className="react-data-table__empty">
              {emptyMessage}
            </td>
          </tr>
        ];

  return (
    <div className={`table react-data-table ${className}`.trim()}>
      {showFilterBar ? (
        <div
          className={`react-data-table__filter-bar ${filterBarClassName}`.trim()}
          role="search"
        >
          {filterFields.map((field) => {
            const fid = field.field;
            const inputId = `${uid}-filter-${fid}`;
            const val =
              effectiveFilters[fid] != null && effectiveFilters[fid] !== ''
                ? String(effectiveFilters[fid])
                : '';
            return (
              <div key={fid} className="react-data-table__filter-field">
                <label className="react-data-table__filter-label" htmlFor={inputId}>
                  {field.label}
                </label>
                <input
                  id={inputId}
                  className="react-data-table__filter-input"
                  type="text"
                  placeholder={field.placeholder ?? ''}
                  value={val}
                  onChange={(e) => updateFilterField(fid, e.target.value)}
                  autoComplete="off"
                />
              </div>
            );
          })}
          {showPageSize ? (
            <div className="react-data-table__filter-field react-data-table__filter-field--page-size">
              <label className="react-data-table__filter-label" htmlFor={`${uid}-page-size`}>
                Rows per page
              </label>
              <select
                id={`${uid}-page-size`}
                className="react-data-table__filter-select"
                value={effectivePageSize}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      ) : null}

      {!showFilterBar && enablePagination && showPageSize ? (
        <div
          className={`react-data-table__toolbar react-data-table__toolbar--pagination-only ${filterBarClassName}`.trim()}
        >
          <div className="react-data-table__filter-field react-data-table__filter-field--page-size">
            <label className="react-data-table__filter-label" htmlFor={`${uid}-page-size-solo`}>
              Rows per page
            </label>
            <select
              id={`${uid}-page-size-solo`}
              className="react-data-table__filter-select"
              value={effectivePageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {showHints ? (
        <div className="react-data-table__hints" role="note">
          {enableColumnReorder ? (
            <span className="react-data-table__hint react-data-table__hint--drag">
              <span className="react-data-table__hint-icon react-data-table__hint-icon--grip" aria-hidden="true" />
              Drag or touch column headers to reorder
            </span>
          ) : null}
          {enableColumnResize ? (
            <span className="react-data-table__hint react-data-table__hint--resize">
              <span className="react-data-table__hint-icon react-data-table__hint-icon--arrows" aria-hidden="true" />
              Drag or touch the right edge of a header to resize
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="react-data-table__scroll">
        <table className={tableClassName} style={{ tableLayout: 'fixed' }}>
          <thead className="grey lighten-3">
            <tr>{columnsList}</tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {summaryNode}
      {enablePagination ? (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={goToPage}
          className={paginationClassName}
        />
      ) : null}
      {typeof document !== 'undefined' &&
        columnReorderUI &&
        createPortal(
          <div
            className="react-data-table__reorder-ghost"
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: columnReorderUI.width,
              minHeight: columnReorderUI.height,
              pointerEvents: 'none',
              zIndex: 10000,
              transform: `translate(${columnReorderUI.pointerX - columnReorderUI.offsetX}px, ${columnReorderUI.pointerY - columnReorderUI.offsetY}px)`,
              boxSizing: 'border-box'
            }}
            aria-hidden="true"
          >
            <div className="react-data-table__reorder-ghost-inner">
              <span className="react-data-table__drag-grip" aria-hidden="true" />
              <span className="react-data-table__th-title">{columnReorderUI.title}</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
