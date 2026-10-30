import { ArrowDownAZ, ArrowUpAZ, PackageOpen, Pencil, Power, RotateCcw } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import { formatSupplyName } from "../../../../services/supplyDisplay";
import type { Supply } from "../../../../services/suppliesApi";
import type { SupplySortKey } from "../../types/supplies";

type Props = {
  supplies: Supply[]; loading: boolean; page: number; pageSize: number; sort: SupplySortKey; ascending: boolean;
  hasFilters: boolean; canCreate: boolean; canEdit: boolean; canDeactivate: boolean;
  onPageChange: (page: number) => void; onSort: (key: SupplySortKey) => void; onStateChange: (supply: Supply) => void;
};

export function SuppliesTable({ supplies, loading, page, pageSize, sort, ascending, hasFilters, canCreate, canEdit, canDeactivate, onPageChange, onSort, onStateChange }: Props) {
  const visible = supplies.slice((page - 1) * pageSize, page * pageSize);
  function sortHeader(label: string, key: SupplySortKey) {
    const active = sort === key;
    return <button type="button" className="supplies-sort" onClick={(event) => { event.stopPropagation(); onSort(key); }} aria-label={`Ordenar por ${label}${active ? ascending ? ", ascendente" : ", descendente" : ""}`}>{label}{active && (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>)}</button>;
  }
  const columns: DataTableColumn<Supply>[] = [
    { key: "codigo", header: sortHeader("Código", "codigo"), render: (supply) => <strong>{supply.codigo}</strong> },
    { key: "nombre", header: sortHeader("Insumo", "nombre"), render: (supply) => <div className="supply-name-cell"><strong>{formatSupplyName(supply)}</strong>{supply.descripcion && <small>{supply.descripcion}</small>}</div> },
    { key: "tipo", header: sortHeader("Tipo", "tipo"), render: (supply) => supply.tipoInsumoNombre },
    { key: "unidad", header: sortHeader("Unidad", "unidad"), render: (supply) => <span title={supply.unidadMedidaNombre}>{supply.unidadMedidaAbreviatura}</span> },
    { key: "estado", header: sortHeader("Estado", "estado"), render: (supply) => <StatusBadge tone={supply.activo ? "success" : "danger"}>{supply.activo ? "Activo" : "Inactivo"}</StatusBadge> },
    { key: "action", header: "Acciones", className: "supplies-action-cell", render: (supply) => <div className="supplies-inline-actions" onClick={(event) => event.stopPropagation()}>{canEdit && <a href={`/inventory/supplies/${supply.insumoId}/edit`} title={`Editar ${formatSupplyName(supply)}`} aria-label={`Editar ${formatSupplyName(supply)}`}><Pencil size={16}/></a>}{((supply.activo && canDeactivate) || (!supply.activo && canEdit)) && <button type="button" title={supply.activo ? "Inactivar insumo" : "Reactivar insumo"} aria-label={`${supply.activo ? "Inactivar" : "Reactivar"} ${formatSupplyName(supply)}`} onClick={() => onStateChange(supply)}>{supply.activo ? <Power size={17}/> : <RotateCcw size={17}/>}</button>}</div> },
  ];

  return <DataTable rows={visible} columns={columns} rowKey={(supply) => supply.insumoId} loading={loading} loadingText="Cargando insumos…" page={page} pageSize={pageSize} totalRecords={supplies.length} onPageChange={onPageChange} onRowClick={(supply) => { location.href = `/inventory/supplies/${supply.insumoId}`; }} className="supplies-table-card" tableClassName="supplies-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{supplies.length}</strong> insumos</>} emptyState={<div className="state-box supplies-empty-state"><PackageOpen size={28}/><strong>{hasFilters ? "No hay resultados para estos filtros" : "Todavía no hay insumos"}</strong><span>{hasFilters ? "Cambiá la búsqueda o limpiá los filtros." : "Registrá el primer insumo para comenzar."}</span>{!hasFilters && canCreate && <a className="button primary" href="/inventory/supplies/new">Registrar insumo</a>}</div>}/>;
}
