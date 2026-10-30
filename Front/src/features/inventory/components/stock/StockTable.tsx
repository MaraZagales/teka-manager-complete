import { ArrowDownAZ, ArrowUpAZ, PackageOpen } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { InventoryStockRow, StockKind, StockSortKey } from "../../types/stock";
import { stockStateLabel, stockStateTone } from "../../utils/stockPresentation";

const numberFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

type Props = {
  kind: StockKind;
  rows: InventoryStockRow[];
  loading: boolean;
  page: number;
  pageSize: number;
  sort: StockSortKey;
  ascending: boolean;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onSort: (key: StockSortKey) => void;
};

export function StockTable({ kind, rows, loading, page, pageSize, sort, ascending, hasFilters, onPageChange, onSort }: Props) {
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  function sortHeader(label: string, key: StockSortKey) {
    const active = sort === key;
    return <button type="button" className="stock-sort" onClick={() => onSort(key)} aria-label={`Ordenar por ${label}${active ? ascending ? ", ascendente" : ", descendente" : ""}`}>{label}{active && (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>)}</button>;
  }
  function quantity(value: number, unit: string) {
    return <span className="stock-quantity">{numberFormat.format(value)}{unit && <small>{unit}</small>}</span>;
  }

  const columns: DataTableColumn<InventoryStockRow>[] = [
    { key: "code", width: "16%", header: sortHeader("Código", "code"), render: (row) => <strong>{row.code}</strong> },
    { key: "name", width: "36%", header: sortHeader(kind === "products" ? "Producto" : "Insumo", "name"), render: (row) => <strong>{row.name}</strong> },
    { key: "quantity", width: "16%", header: sortHeader("Stock actual", "quantity"), className: "stock-number-cell", headerClassName: "stock-number-header", render: (row) => quantity(row.quantity, row.unit) },
    { key: "minimum", width: "16%", header: sortHeader("Stock mínimo", "minimum"), className: "stock-number-cell", headerClassName: "stock-number-header", render: (row) => row.minimum === null ? <span aria-label="Sin configurar">—</span> : quantity(row.minimum, row.unit) },
    { key: "state", width: "16%", header: sortHeader("Estado", "state"), className: "stock-state-cell", headerClassName: "stock-state-header", render: (row) => <StatusBadge tone={stockStateTone[row.state]}>{stockStateLabel[row.state]}</StatusBadge> },
  ];

  return <DataTable
    rows={visible}
    columns={columns}
    rowKey={(row) => row.key}
    loading={loading}
    loadingText="Cargando existencias…"
    page={page}
    pageSize={pageSize}
    totalRecords={rows.length}
    onPageChange={onPageChange}
    className="stock-query-table-card"
    tableClassName="stock-query-table"
    emptyState={<div className="state-box stock-query-empty"><PackageOpen size={28}/><strong>{hasFilters ? "No hay resultados para estos filtros" : "No hay existencias para mostrar"}</strong><span>{hasFilters ? "Cambiá la búsqueda o limpiá los filtros." : "La consulta no devolvió artículos."}</span></div>}
  />;
}
