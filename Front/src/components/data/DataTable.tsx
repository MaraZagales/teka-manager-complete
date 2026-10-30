import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  loadingText?: string;
  emptyState?: ReactNode;
  summary?: ReactNode;
  page: number;
  pageSize?: number;
  totalRecords: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string | number | null;
  className?: string;
  tableClassName?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  loadingText = 'Cargando…',
  emptyState,
  summary,
  page,
  pageSize = 10,
  totalRecords,
  onPageChange = () => {},
  onRowClick,
  selectedRowKey,
  className = '',
  tableClassName = '',
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRecords);

  return (
    <section className={`table-card reusable-data-table ${className}`.trim()}>
      {summary && <div className="table-summary">{summary}</div>}

      {loading ? (
        <div className="state-box">{loadingText}</div>
      ) : rows.length === 0 ? (
        emptyState || <div className="state-box">No hay registros para mostrar.</div>
      ) : (
        <div className="table-scroll">
          <table className={`data-table ${tableClassName}`.trim()}>
            {columns.some(column => column.width) && <colgroup>{columns.map(column => <col key={column.key} style={column.width ? { width: column.width } : undefined}/>)}</colgroup>}
            <thead>
              <tr>{columns.map(column => <th key={column.key} className={column.headerClassName}>{column.header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const key = rowKey(row);
                const selected = selectedRowKey !== undefined && selectedRowKey !== null && key === selectedRowKey;
                return (
                  <tr
                    key={key}
                    className={selected ? 'selected-row' : ''}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    } : undefined}
                  >
                    {columns.map(column => <td key={column.key} className={column.className}>{column.render(row)}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <span><strong>Mostrando {start}–{end} de {totalRecords} registros</strong> · Página {page} de {totalPages}</span>
        <div>
          <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={15}/></button>
          <button type="button" aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={15}/></button>
        </div>
      </div>
    </section>
  );
}
