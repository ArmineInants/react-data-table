# react-column-drag-resize-table

**Data grid for React admin and internal tools:** draggable column reorder and edge resize, optional text filters, pagination, optional persisted layout, and a simple Materialize-inspired look you can theme with CSS variables.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-%3E%3D16.8-61dafb?logo=react&logoColor=white)](https://react.dev/)

---

## Installation

```bash
npm install react-column-drag-resize-table
```

Peers: **React** and **React DOM** ≥ **16.8**.

> If this name is unavailable on npm, publish as a [scoped package](https://docs.npmjs.com/about/scopes) (for example `@your-org/react-column-drag-resize-table`).

---

## How to use

Import **`DataTable`** and the stylesheet once (for layout and theme tokens):

```js
import { DataTable } from 'react-column-drag-resize-table';
import 'react-column-drag-resize-table/styles.css';
```

Pass **`columns`** (definitions) and **`rows`** (your data). Turn on **`enableFiltering`** / **`enablePagination`** when you need those toolbars. For controlled filter or page state, pair the value props with their **`on*Change`** handlers.

---

## Short example

```jsx
import { DataTable } from 'react-column-drag-resize-table';
import 'react-column-drag-resize-table/styles.css';

const columns = [
  { id: 'id', title: 'ID', accessor: 'id' },
  { id: 'name', title: 'Name', accessor: 'name' }
];

const rows = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' }
];

export function Example() {
  return <DataTable columns={columns} rows={rows} />;
}
```

---

## Advanced example

Filtering, pagination, and a **`renderSummary`** line using the built-in filter bar:

```jsx
import { useMemo } from 'react';
import { DataTable } from 'react-column-drag-resize-table';
import 'react-column-drag-resize-table/styles.css';

const rows = [
  { id: 1, user_name: 'alice', amount: 100, status: 'ok' },
  { id: 2, user_name: 'bob', amount: 200, status: 'pending' }
];

export function AdvancedExample() {
  const columns = useMemo(
    () => [
      { id: 'id', title: 'ID', accessor: 'id' },
      { id: 'user_name', title: 'User', accessor: 'user_name' },
      { id: 'amount', title: 'Amount', accessor: 'amount' },
      { id: 'status', title: 'Status', accessor: 'status' }
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      enableFiltering
      filterFields={[
        { field: 'user_name', label: 'Username', placeholder: 'e.g. alice' },
        { field: 'status', label: 'Status', placeholder: 'e.g. ok' },
      ]}
      enablePagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20]}
      renderSummary={({ filteredCount, totalRows, currentPage, pageSize, totalPages }) => (
        <div className="summary-line grey lighten-3">
          <span>
            Rows: {filteredCount} of {totalRows} · Page {currentPage}/{totalPages} · {pageSize} per page
          </span>
        </div>
      )}
    />
  );
}
```

---

## `DataTable` props

| Property | Required | Type | Default | Possible values / notes | Description |
|----------|----------|------|---------|-------------------------|-------------|
| `columns` | **yes** | `Column<T>[]` | — | See [Column](#column) | Column definitions (`id`, `title`, cell content). |
| `rows` | **yes** | `T[]` | — | — | Row data; each row is a record (often with `id`). |
| `getRowId` | no | `(row: T, index: number) => string \| number` | `row.id` if present, else `index` | — | Stable id for React keys and layout storage keys. |
| `loading` | no | `boolean` | `false` | `true` / `false` | Shows a loading state instead of the table body. |
| `emptyMessage` | no | `string` | `'No rows to display.'` | — | Shown when there are no rows (after filter). |
| `summary` | no | `ReactNode` | — | — | Static summary node above the table (if you do not use `renderSummary`). |
| `renderSummary` | no | `(ctx: DataTableSummaryContext) => ReactNode` | — | See [DataTableSummaryContext](#datatablesummarycontext) | Summary slot with counts and pagination info. |
| `className` | no | `string` | `''` | — | Class on the outer wrapper. |
| `tableClassName` | no | `string` | `'highlight'` | — | Class on the `<table>` (e.g. zebra striping). |
| `columnOrder` | no | `string[]` | internal order | Array of column `id`s | **Controlled:** current column order. Omit for internal state. |
| `onColumnOrderChange` | no | `(order: string[]) => void` | — | — | Fires when the user reorders columns (also used with `layoutStorageKey`). |
| `enableColumnReorder` | no | `boolean` | `true` | `true` / `false` | Allow drag-and-drop column reorder. |
| `columnWidths` | no | `Record<string, number>` | internal widths | Pixel numbers per column `id` | **Controlled:** column widths. |
| `onColumnWidthsChange` | no | `(widths: Record<string, number>) => void` | — | — | Fires when the user resizes a column. |
| `enableColumnResize` | no | `boolean` | `true` | `true` / `false` | Allow drag resize on column edges. |
| `minColumnWidth` | no | `number` | `64` | ≥ `0` | Minimum width when resizing (px). |
| `layoutStorageKey` | no | `string` | — | — | If set and column callbacks are omitted, order/width persist under `react-column-drag-resize-table:v1:*` in `localStorage`. |
| `enableFiltering` | no | `boolean` | `false` | `true` / `false` | Show the filter toolbar and apply [filter rules](#filter-value-rules) to `rows`. |
| `filterFields` | no | `FilterField[]` | `[]` | See [FilterField](#filterfield) | Fields listed here get text inputs; empty string means “no filter” for that key. |
| `filters` | no | `Record<string, unknown>` | — | — | **Controlled:** current filter object. Pair with `onFiltersChange`. |
| `onFiltersChange` | no | `(filters: Record<string, unknown>) => void` | — | — | Called when filters change (built-in UI or your controlled updates). |
| `defaultFilters` | no | `Record<string, unknown>` | — | — | Initial filters when uncontrolled (`filters` omitted). |
| `enablePagination` | no | `boolean` | `false` | `true` / `false` | Paginate **after** filtering. |
| `defaultPageSize` | no | `number` | `10` | Positive integer | Initial page size when `pageSize` is uncontrolled. |
| `pageSizeOptions` | no | `number[]` | `[5, 10, 20, 50]` | Positive integers | Options in the page-size `<select>`. |
| `currentPage` | no | `number` | internal | ≥ `1` | **Controlled:** current page (1-based). |
| `onPageChange` | no | `(page: number) => void` | — | — | Fires when the user changes page. |
| `pageSize` | no | `number` | internal | Positive integer | **Controlled:** rows per page. |
| `onPageSizeChange` | no | `(size: number) => void` | — | — | Fires when the user changes page size. |
| `filterBarClassName` | no | `string` | `''` | — | Extra class on the filter toolbar row. |
| `paginationClassName` | no | `string` | `''` | — | Extra class on the pagination row. |

### `Column`

Used for each entry in **`columns`**.

| Property | Required | Type | Default | Possible values / notes | Description |
|----------|----------|------|---------|-------------------------|-------------|
| `id` | **yes** | `string` | — | Unique among columns | Stable id (order, resize, filters, storage). |
| `title` | **yes** | `string` | — | — | Header label. |
| `accessor` | no | `keyof T \| ((row: T) => ReactNode)` | — | — | Key on the row, or function returning cell content. If omitted, falls back to `row[id]`. |
| `render` | no | `(row: T) => ReactNode` | — | — | If set, used for the cell instead of `accessor`. |

### `FilterField`

Used for each entry in **`filterFields`** when the built-in filter bar is enabled.

| Property | Required | Type | Default | Possible values / notes | Description |
|----------|----------|------|---------|-------------------------|-------------|
| `field` | **yes** | `string` | — | Must match a key you filter on | Filter object key (e.g. `user_name`). |
| `label` | **yes** | `string` | — | — | Label for the input. |
| `placeholder` | no | `string` | — | — | Input placeholder. |

### `DataTableSummaryContext`

Argument to **`renderSummary`** when that prop is provided.

| Property | Type | Description |
|----------|------|-------------|
| `totalRows` | `number` | Number of rows in **`rows`** before filtering. |
| `filteredCount` | `number` | Number of rows after filtering. |
| `currentPage` | `number` | Current page (1-based). |
| `pageSize` | `number` | Current page size. |
| `totalPages` | `number` | Total page count after filtering. |

### Filter value rules

When **`enableFiltering`** is on, each key in the active filter object is applied to **`rows`** as follows:

| Key pattern | Effect |
|-------------|--------|
| `name_from` / `name_to` | Numeric range on field **`name`** |
| `name_datefrom` / `name_dateto` | Date range on field **`name`** |
| Other keys | `row[key] == filter[key]` (equality); empty values are ignored |

You can drive the same keys from **`filterFields`** (one input per `field`) or from **`filters`** / **`onFiltersChange`** with your own UI.

---

## Styling

```js
import 'react-column-drag-resize-table/styles.css';
```

Theme tokens use the **`--rdt-*`** CSS variables on **`:root`** (see **`src/styles.css`** in this repo). The component root element keeps the class **`react-data-table`** so existing selectors and overrides stay stable.

---

## TypeScript

Types are exported from **`react-column-drag-resize-table`**, for example **`DataTableProps`**, **`Column`**, **`FilterField`**, and **`DataTableSummaryContext`**.

---

## Other export: `filterRows`

| Export | Type | Description |
|--------|------|-------------|
| `filterRows` | `<T>(rows: T[], filters: Record<string, unknown>) => T[]` | Applies the same filter rules as **`DataTable`** to an array of rows (optional if you only use the built-in filtering). |

---

## Development

```bash
npm install && npm run dev   # demo: example/
npm run build                # dist/ + types
```

---

## License

MIT — [LICENSE](./LICENSE)
