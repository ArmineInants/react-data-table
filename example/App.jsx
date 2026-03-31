import React, { useMemo } from 'react';
import { DataTable } from 'react-column-drag-resize-table';

const MOCK_ROWS = [
  {
    id: 1,
    code: 'TX-1001',
    website_id: 1,
    user_name: 'alice',
    deposit_number: '1',
    deposit_placement_time: '2026-03-15T12:30:00',
    deposit_type_id: 4,
    deposit_amount: 250,
    deposit_currency_id: 1,
    deposit_status_id: 1
  },
  {
    id: 2,
    code: 'TX-1002',
    website_id: 1,
    user_name: 'bob',
    deposit_number: '2',
    deposit_placement_time: '2026-03-16T09:00:00',
    deposit_type_id: 5,
    deposit_amount: 100,
    deposit_currency_id: 1,
    deposit_status_id: 2
  },
  {
    id: 3,
    code: 'TX-1003',
    website_id: 2,
    user_name: 'carol',
    deposit_number: '3',
    deposit_placement_time: '2026-03-17T18:45:00',
    deposit_type_id: 4,
    deposit_amount: 500,
    deposit_currency_id: 2,
    deposit_status_id: 1
  },
  {
    id: 4,
    code: 'TX-1004',
    website_id: 2,
    user_name: 'david',
    deposit_number: '4',
    deposit_placement_time: '2026-03-18T10:15:00',
  },
  {
    id: 5,
    code: 'TX-1005',
    website_id: 2,
    user_name: 'eve',
    deposit_number: '5',
    deposit_placement_time: '2026-03-19T14:30:00',
  },
  {
    id: 6,
    code: 'TX-1006',
    website_id: 2,
    user_name: 'frank',
    deposit_number: '6',
    deposit_placement_time: '2026-03-20T16:45:00',
  },
];

const WEBSITES = [
  { id: 1, name: 'example.com' },
  { id: 2, name: 'partner.net' }
];

const CURRENCIES = [
  { id: 1, code: 'USD' },
  { id: 2, code: 'EUR' }
];

const DEPOSIT_TYPES = [
  { id: 4, type: 'PAYMENT_SYSTEM' },
  { id: 5, type: 'SYSTEM' }
];

const STATUSES = [
  { id: 1, status: 'SUCCESS' },
  { id: 2, status: 'PENDING' }
];

function formatDate(iso) {
  return String(iso).substr(0, 19).split('T').join(' ');
}

function formatLabel(s) {
  return String(s)
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export default function App() {
  const columns = useMemo(
    () => [
      { id: 'code', title: 'Transaction Code', accessor: 'code' },
      {
        id: 'web',
        title: 'Partner Website',
        render: (row) => WEBSITES.find((w) => w.id === row.website_id)?.name ?? ''
      },
      { id: 'user', title: 'Customer Username', accessor: 'user_name' },
      {
        id: 'dep-num',
        title: 'Deposit Number',
        render: (row) => row.deposit_number || ''
      },
      {
        id: 'time',
        title: 'Placement Time',
        render: (row) => formatDate(row.deposit_placement_time)
      },
      {
        id: 'type',
        title: 'Deposit Type',
        render: (row) =>
          formatLabel(DEPOSIT_TYPES.find((t) => t.id === row.deposit_type_id)?.type ?? '')
      },
      {
        id: 'amount',
        title: 'Deposit Amount',
        render: (row) => Math.round(Number(row.deposit_amount) || 0)
      },
      {
        id: 'currency',
        title: 'Currency',
        render: (row) =>
          CURRENCIES.find((c) => c.id === row.deposit_currency_id)?.code ?? ''
      },
      {
        id: 'status',
        title: 'Status',
        render: (row) =>
          formatLabel(STATUSES.find((s) => s.id === row.deposit_status_id)?.status ?? '')
      }
    ],
    []
  );

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
      <h1 style={{ marginTop: 0 }}>react-column-drag-resize-table</h1>
      <p style={{ color: '#555' }}>
        Demo: optional built-in filter (exact match on <code>user_name</code>) and pagination. Pass{' '}
        <code>enableFiltering</code> / <code>enablePagination</code> to toggle.
      </p>

      <DataTable
        columns={columns}
        rows={MOCK_ROWS}
        enableFiltering
        filterFields={[
          { field: 'user_name', label: 'Username', placeholder: 'e.g. alice' },
          { field: 'deposit_number', label: 'Deposit Number', placeholder: 'e.g. 1' },
          { field: 'deposit_type_id', label: 'Deposit Type', placeholder: 'e.g. PAYMENT_SYSTEM' },
          { field: 'deposit_status_id', label: 'Deposit Status', placeholder: 'e.g. SUCCESS' },
        ]}
        enablePagination
        defaultPageSize={10}
        pageSizeOptions={[5, 10]}
        renderSummary={({ filteredCount, totalRows, currentPage, pageSize, totalPages }) => (
          <div className="summary-line grey lighten-3">
            <div className="bold">Summary</div>
            <div>Total rows</div>
            <div className="bold">{totalRows}</div>
            <div>After filter</div>
            <div className="bold">{filteredCount}</div>
            <div>Page</div>
            <div className="bold">
              {currentPage} / {totalPages}
            </div>
            <div>Per page</div>
            <div className="bold">{pageSize}</div>
          </div>
        )}
      />
    </div>
  );
}
