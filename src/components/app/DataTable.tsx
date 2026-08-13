import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column<T> {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, rows, emptyMessage, maxHeight }: { columns: Array<Column<T>>; rows: T[]; emptyMessage?: string; maxHeight?: number }) {
  const { t } = useLocale();
  const resolvedEmpty = emptyMessage ?? t('dataTable_empty', 'Nothing to show yet.');
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-black/10 px-5 py-10 text-center text-sm text-theme-muted">
        {resolvedEmpty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-theme bg-black/10">
      <div className="overflow-x-auto" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex} className="hover:bg-white/[0.04]">
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={cn('align-top text-theme-secondary', column.className)}>
                    {column.render ? column.render(row) : (row[column.key as keyof T] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
