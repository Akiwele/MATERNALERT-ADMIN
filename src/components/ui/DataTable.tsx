import type { ReactNode } from 'react';

import { brand } from '../../theme/brand';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: brand.textSecondary,
          backgroundColor: brand.white,
          border: `1px solid ${brand.border}`,
          borderRadius: '14px',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        backgroundColor: brand.white,
        border: `1px solid ${brand.border}`,
        borderRadius: '14px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
        <thead>
          <tr style={{ backgroundColor: brand.primaryMuted }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: brand.primaryDark,
                  borderBottom: `1px solid ${brand.border}`,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: '14px 16px',
                    fontSize: '14px',
                    color: brand.text,
                    borderBottom: `1px solid ${brand.border}`,
                    verticalAlign: 'top',
                  }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
