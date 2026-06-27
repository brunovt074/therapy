import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface ResponsiveTableProps<T extends object> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T extends object>({
  columns,
  rows,
  rowKey,
  emptyMessage = "Sin resultados",
  className,
}: ResponsiveTableProps<T>) {
  const actionColumn = columns.find((c) => c.header === "");
  const dataColumns = columns.filter(
    (c) => c.header !== "" && !c.mobileHidden
  );
  const [firstColumn, ...restColumns] = dataColumns;

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-8 text-center",
          className
        )}
      >
        <p className="text-sm text-[var(--text-tertiary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Mobile card-stack (< md) */}
      <div className="md:hidden divide-y divide-[var(--border-color-subtle)]">
        {rows.map((row) => (
          <div key={rowKey(row)} className="p-4 space-y-2">
            {firstColumn && (
              <div className="font-medium text-[var(--text-primary)]">
                {firstColumn.cell(row)}
              </div>
            )}
            {restColumns.map((col) => (
              <div key={col.key} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--text-tertiary)] shrink-0 w-24">
                  {col.header}
                </span>
                <span className="text-[var(--text-secondary)]">
                  {col.cell(row)}
                </span>
              </div>
            ))}
            {actionColumn && (
              <div className="flex justify-end pt-1 border-t border-[var(--border-color-subtle)] mt-2">
                {actionColumn.cell(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table (md+) */}
      <table className="hidden md:table w-full">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[var(--border-color-subtle)] last:border-0"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-[var(--text-secondary)]",
                    col.className
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
