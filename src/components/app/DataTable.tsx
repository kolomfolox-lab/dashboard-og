import { cn } from '@/lib/utils';

interface Column<T> {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, rows, emptyMessage = 'Nothing to show yet.' }: { columns: Array<Column<T>>; rows: T[]; emptyMessage?: string }) {
  if (!rows.length) {
    return <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8">
          <thead className="bg-white/[0.03]">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 bg-black/8">
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={String(column.key)} className={cn('px-4 py-4 align-top text-sm text-white/78', column.className)}>
                    {column.render ? column.render(row) : row[column.key as keyof T] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
