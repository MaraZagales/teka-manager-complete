import { FileClock } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { AnalyticMovement } from "../../../../services/stockMovementsApi";
import type { MovementArticle } from "../../types/movements";
import { formatMovementDate, MOVEMENT_PAGE_SIZE, unitForMovement } from "../../utils/movementPresentation";

const quantityFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

type Props = {
  rows: AnalyticMovement[];
  articles: MovementArticle[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function MovementsTable({ rows, articles, loading, page, total, onPageChange }: Props) {
  const columns: DataTableColumn<AnalyticMovement>[] = [
    { key: "date", width: "16%", header: "Fecha y hora", render: (row) => <span className="movement-date">{formatMovementDate(row.fechaMovimiento)}</span> },
    { key: "article", width: "26%", header: "Artículo", render: (row) => <span className="movement-article"><a href={`/inventory/movements/${row.movimientoStockId}`} title={`Consultar ${row.articulo}`}>{row.articulo}</a><small>{row.codigo} · {row.clase === "PRODUCTO" ? "Producto terminado" : "Insumo"}</small></span> },
    { key: "type", width: "18%", header: "Movimiento", className: "movement-centered", headerClassName: "movement-centered", render: (row) => <StatusBadge tone={row.signo < 0 ? "danger" : "success"}>{row.tipoMovimiento}</StatusBadge> },
    { key: "quantity", width: "20%", header: "Cantidad", className: "movement-quantity-cell", headerClassName: "movement-quantity-cell", render: (row) => <strong>{quantityFormat.format(row.cantidad)}{unitForMovement(row, articles) && <small>{unitForMovement(row, articles)}</small>}</strong> },
    { key: "reason", width: "20%", header: "Motivo", className: "movement-reason-cell", render: (row) => <span title={row.motivo || undefined}>{row.motivo || "—"}</span> },
  ];
  return <DataTable rows={rows} columns={columns} rowKey={(row) => row.movimientoStockId} loading={loading} loadingText="Cargando movimientos…" page={page} pageSize={MOVEMENT_PAGE_SIZE} totalRecords={total} onPageChange={onPageChange} className="movement-table-card" tableClassName="movement-history-table" emptyState={<div className="state-box movement-empty"><FileClock size={27}/><strong>Sin movimientos</strong><span>No se encontraron operaciones para los filtros seleccionados.</span></div>}/>;
}
