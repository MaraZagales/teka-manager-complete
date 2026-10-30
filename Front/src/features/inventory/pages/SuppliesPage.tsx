import { useEffect, useMemo, useState } from "react";
import { Ban, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { DataTableFilters } from "../../../components/data/DataTableFilters";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import type { Supply } from "../../../services/suppliesApi";
import { SuppliesTable } from "../components/supplies/SuppliesTable";
import { SupplyForm } from "../components/supplies/SupplyForm";
import { SupplyStateDialog } from "../components/supplies/SupplyStateDialog";
import { useSuppliesCatalog } from "../hooks/useSuppliesCatalog";
import { useSupplyRecord } from "../hooks/useSupplyRecord";
import type { SuppliesPageMode, SupplySortKey } from "../types/supplies";
import { filterAndSortSupplies } from "../utils/supplyPresentation";
import "../styles/products.css";
import "../styles/supplies.css";

const PAGE_SIZE = 8;
type Props = { mode?: SuppliesPageMode; supplyId?: number };

export function SuppliesPage({ mode = "list", supplyId }: Props) {
  const canCreate = hasPermission("Inventario", "Crear");
  const canEdit = hasPermission("Inventario", "Editar");
  const canDeactivate = hasPermission("Inventario", "Inactivar");
  const catalog = useSuppliesCatalog();
  const record = useSupplyRecord(mode === "detail" || mode === "edit" ? supplyId : undefined);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SupplySortKey>("codigo");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [stateSupply, setStateSupply] = useState<Supply | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => setPage(1), [search, typeFilter, statusFilter, sort, ascending]);
  useEffect(() => { const saved = sessionStorage.getItem("supply-notice"); if (saved) { setNotice(saved); sessionStorage.removeItem("supply-notice"); } }, []);

  const filtered = useMemo(() => filterAndSortSupplies(catalog.supplies, search, typeFilter, statusFilter, sort, ascending), [catalog.supplies, search, typeFilter, statusFilter, sort, ascending]);
  const hasFilters = Boolean(search.trim() || typeFilter || statusFilter);

  if (mode === "create" || mode === "edit" || mode === "detail") {
    const title = mode === "create" ? "Registrar insumo" : mode === "edit" ? "Editar insumo" : "Consultar insumo";
    return <AppShell title={title} breadcrumb={`Inventario / Insumos / ${title}`} backHref={mode === "detail" ? "/inventory/supplies" : undefined} backLabel="Volver a Insumos">
      {catalog.error || record.error ? <PageError message={catalog.error || record.error} onRetry={() => location.reload()}/>
        : catalog.loading || (mode !== "create" && record.loading) ? <PageLoading text="Cargando insumo…"/>
        : mode !== "create" && !record.supply ? <PageError message="No se encontró el insumo solicitado." onRetry={() => { location.href = "/inventory/supplies"; }} actionLabel="Volver al listado"/>
        : <SupplyForm mode={mode === "detail" ? "view" : mode} supply={mode !== "create" ? record.supply || undefined : undefined} supplies={catalog.supplies} types={catalog.types} colors={catalog.colors} units={catalog.units} initialNotice={notice} canEdit={canEdit}/>} 
    </AppShell>;
  }

  function changeSort(key: SupplySortKey) { if (sort === key) setAscending((value) => !value); else { setSort(key); setAscending(true); } }
  function clearFilters() { setSearch(""); setTypeFilter(""); setStatusFilter(""); }

  return <AppShell title="Insumos" breadcrumb="Inventario / Insumos">
    <Toast message={notice} onClose={() => setNotice("")}/>
    <PageHeader title="Insumos" action={<div className="products-header-actions">{canCreate && <a className="button primary" href="/inventory/supplies/new"><Plus size={17}/>Registrar insumo</a>}</div>}/>
    {catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load()}/> : <>
      <DataTableFilters balanced search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por código o nombre" onClear={clearFilters} clearDisabled={!hasFilters} clearLabel="Limpiar filtros" className="supplies-filters">
        <label className="data-table-filter-field"><span>Tipo</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">Todos</option>{catalog.types.map((type) => <option key={type.id} value={type.id}>{type.descripcion}</option>)}</select></label>
        <label className="data-table-filter-field"><span>Estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
      </DataTableFilters>
      <SuppliesTable supplies={filtered} loading={catalog.loading} page={page} pageSize={PAGE_SIZE} sort={sort} ascending={ascending} hasFilters={hasFilters} canCreate={canCreate} canEdit={canEdit} canDeactivate={canDeactivate} onPageChange={setPage} onSort={changeSort} onStateChange={setStateSupply}/>
      {stateSupply && <SupplyStateDialog supply={stateSupply} reasons={catalog.reasons} onClose={() => setStateSupply(null)} onChanged={(message) => { setStateSupply(null); setNotice(message); void catalog.load(); }}/>} 
    </>}
  </AppShell>;
}

function PageLoading({ text }: { text: string }) { return <div className="product-page-state"><span className="product-state-spinner"/><strong>{text}</strong></div>; }
function PageError({ message, onRetry, actionLabel = "Reintentar" }: { message: string; onRetry: () => void; actionLabel?: string }) { return <div className="product-page-state error" role="alert"><Ban size={26}/><strong>No pudimos cargar esta pantalla</strong><span>{message}</span><button type="button" className="button secondary" onClick={onRetry}>{actionLabel === "Reintentar" && <RotateCcw size={15}/>} {actionLabel}</button></div>; }
