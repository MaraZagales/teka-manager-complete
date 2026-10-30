import { useEffect, useMemo, useState } from "react";
import { Ban, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { DataTableFilters } from "../../../components/data/DataTableFilters";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import type { Product } from "../../../services/productsApi";
import { ProductForm } from "../components/products/ProductForm";
import { ProductStateDialog } from "../components/products/ProductStateDialog";
import { ProductsTable } from "../components/products/ProductsTable";
import { useProductRecord } from "../hooks/useProductRecord";
import { useProductsCatalog } from "../hooks/useProductsCatalog";
import type { ProductSortKey, ProductsPageMode } from "../types/products";
import { filterAndSortProducts } from "../utils/productPresentation";
import "../styles/products.css";

const PAGE_SIZE = 8;
type Props = { mode?: ProductsPageMode; productId?: number };

export function ProductsPage({ mode = "list", productId }: Props) {
  const canCreate = hasPermission("Inventario", "Crear");
  const canEdit = hasPermission("Inventario", "Editar");
  const canDeactivate = hasPermission("Inventario", "Inactivar");
  const catalog = useProductsCatalog();
  const record = useProductRecord(mode === "detail" || mode === "edit" ? productId : undefined);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<ProductSortKey>("codigo");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [stateProduct, setStateProduct] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => setPage(1), [search, typeFilter, statusFilter, sort, ascending]);
  useEffect(() => { const saved = sessionStorage.getItem("product-notice"); if (saved) { setNotice(saved); sessionStorage.removeItem("product-notice"); } }, []);

  const filtered = useMemo(() => filterAndSortProducts(catalog.products, search, typeFilter, statusFilter, sort, ascending), [catalog.products, search, typeFilter, statusFilter, sort, ascending]);
  const hasFilters = Boolean(search.trim() || typeFilter || statusFilter);

  if (mode === "create" || mode === "edit" || mode === "detail") {
    const title = mode === "create" ? "Registrar producto" : mode === "edit" ? "Editar producto" : "Consultar producto";
    return <AppShell title={title} breadcrumb={`Inventario / Productos terminados / ${title}`} backHref={mode === "detail" ? "/inventory/products" : undefined} backLabel="Volver a Productos terminados">
      {catalog.error || record.error ? <PageError message={catalog.error || record.error} onRetry={() => location.reload()}/>
        : catalog.loading || (mode !== "create" && record.loading) ? <PageLoading text="Cargando producto…"/>
        : mode !== "create" && !record.product ? <PageError message="No se encontró el producto solicitado." onRetry={() => { location.href = "/inventory/products"; }} actionLabel="Volver al listado"/>
        : <ProductForm mode={mode === "detail" ? "view" : mode} product={mode !== "create" ? record.product || undefined : undefined} types={catalog.types} colors={catalog.colors} units={catalog.units} initialNotice={notice} canEdit={canEdit}/>} 
    </AppShell>;
  }

  function changeSort(key: ProductSortKey) { if (sort === key) setAscending((value) => !value); else { setSort(key); setAscending(true); } }
  function clearFilters() { setSearch(""); setTypeFilter(""); setStatusFilter(""); }

  return <AppShell title="Productos terminados" breadcrumb="Inventario / Productos terminados">
    <Toast message={notice} onClose={() => setNotice("")}/>
    <PageHeader title="Productos terminados" action={<div className="products-header-actions">{canCreate && <a className="button primary" href="/inventory/products/new"><Plus size={17}/>Registrar producto</a>}</div>}/>
    {catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load()}/> : <>
      <DataTableFilters balanced search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por código o nombre" onClear={clearFilters} clearDisabled={!hasFilters} clearLabel="Limpiar filtros" className="finished-products-filters">
        <label className="data-table-filter-field"><span>Categoría</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">Todas</option>{catalog.types.map((type) => <option key={type.id} value={type.id}>{type.descripcion}</option>)}</select></label>
        <label className="data-table-filter-field"><span>Estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
      </DataTableFilters>
      <ProductsTable products={filtered} summaries={catalog.ecommerceSummary} loading={catalog.loading} page={page} pageSize={PAGE_SIZE} sort={sort} ascending={ascending} hasFilters={hasFilters} canCreate={canCreate} canEdit={canEdit} canDeactivate={canDeactivate} onPageChange={setPage} onSort={changeSort} onStateChange={setStateProduct}/>
      {stateProduct && <ProductStateDialog product={stateProduct} reasons={catalog.reasons} onClose={() => setStateProduct(null)} onChanged={(message) => { setStateProduct(null); setNotice(message); void catalog.load(); }}/>} 
    </>}
  </AppShell>;
}

function PageLoading({ text }: { text: string }) { return <div className="product-page-state"><span className="product-state-spinner"/><strong>{text}</strong></div>; }
function PageError({ message, onRetry, actionLabel = "Reintentar" }: { message: string; onRetry: () => void; actionLabel?: string }) { return <div className="product-page-state error" role="alert"><Ban size={26}/><strong>No pudimos cargar esta pantalla</strong><span>{message}</span><button type="button" className="button secondary" onClick={onRetry}>{actionLabel === "Reintentar" && <RotateCcw size={15}/>} {actionLabel}</button></div>; }
