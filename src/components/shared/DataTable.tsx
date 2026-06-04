import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({ columns, data, onRowClick, emptyState }: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="w-full overflow-auto rounded-xl border border-neutral-800 bg-neutral-900/30">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-900/50 text-neutral-400 border-b border-neutral-800">
          <tr>
            {columns.map((col, i) => (
              <th key={String(col.key) + i} className={`px-6 py-4 font-medium ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {data.map((row, i) => (
            <tr 
              key={i} 
              className={`hover:bg-neutral-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, j) => (
                <td key={String(col.key) + j} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.render ? col.render(row) : String((row as any)[col.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
