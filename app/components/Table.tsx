import { ReactNode, forwardRef } from "react";

interface TableColumn {
  key: string;
  label: string;
}

interface TableProps {
  columns: TableColumn[];
  rows: Record<string, ReactNode>[];
  className?: string;
}

const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  { columns, rows, className = "" },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`flex w-full flex-col overflow-x-auto rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] ${className}`}
    >
      <div className="flex w-full min-w-max items-center gap-3 bg-[var(--color-bg-surface-elevated)] px-4 py-3 text-body-sm font-semibold text-[color:var(--color-text-secondary)]">
        {columns.map((column) => (
          <div
            key={column.key}
            className="min-w-35 flex-1 overflow-hidden first:flex-[2] last:flex last:justify-end"
          >
            {column.label}
          </div>
        ))}
      </div>
      {rows.map((row, index) => (
        <div
          key={index}
          data-table-row
          className="flex w-full min-w-max items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3 text-body-md text-[color:var(--color-text-primary)] last:border-b-0"
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className="min-w-35 flex-1 overflow-hidden first:flex-[2] last:flex last:justify-end"
            >
              {row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

export default Table;
