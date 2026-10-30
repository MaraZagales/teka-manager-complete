import { useEffect, useMemo, useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { DataTableFilters } from "../../../components/data/DataTableFilters";
import { PageHeader } from "../../../components/data/PageHeader";
import { StockTable } from "../components/stock/StockTable";
import { StockViewSelector } from "../components/stock/StockViewSelector";
import { useInventoryStock } from "../hooks/useInventoryStock";
import type { StockKind, StockSortKey, StockState } from "../types/stock";
import { filterAndSortStock } from "../utils/stockPresentation";
import "../styles/stock-page.css";

const PAGE_SIZE = 8;
type ViewState = { search: string; state: StockState | ""; sort: StockSortKey; ascending: boolean; page: number };
const emptyView = (): ViewState => ({ search: "", state: "", sort: "code", ascending: true, page: 1 });

export function StockPage() {
  const stock = useInventoryStock();
  const [kind, setKind] = useState<StockKind>("products");
  const [views, setViews] = useState<Record<StockKind, ViewState>>({ products: emptyView(), supplies: emptyView() });
  const view = views[kind];
  const rows = kind === "products" ? stock.productRows : stock.supplyRows;
  const filtered = useMemo(() => filterAndSortStock(rows, view.search, view.state, view.sort, view.ascending), [rows, view]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (view.page > totalPages) updateView("page", totalPages);
  }, [totalPages, view.page]);

  function updateView<K extends keyof ViewState>(key: K, value: ViewState[K]) {
    setViews((current) => ({ ...current, [kind]: { ...current[kind], [key]: value, page: key === "page" ? Number(value) : 1 } }));
  }
  function changeSort(key: StockSortKey) {
    if (view.sort === key) updateView("ascending", !view.ascending);
    else setViews((current) => ({ ...current, [kind]: { ...current[kind], sort: key, ascending: true, page: 1 } }));
  }
  function clearFilters() {
    setViews((current) => ({ ...current, [kind]: { ...current[kind], search: "", state: "", page: 1 } }));
  }
  const hasFilters = Boolean(view.search.trim() || view.state);

  return <AppShell title="Existencias" breadcrumb="Inventario / Existencias">
    <main className="stock-query-page">
      <PageHeader title="Existencias"/>
      <StockViewSelector value={kind} onChange={setKind}/>
      {stock.error ? <div className="product-page-state error" role="alert"><Ban size={26}/><strong>No pudimos cargar las existencias</strong><span>{stock.error}</span><button type="button" className="button secondary" onClick={() => void stock.load()}><RotateCcw size={15}/>Reintentar</button></div> : <>
        <DataTableFilters search={view.search} onSearchChange={(value) => updateView("search", value)} searchPlaceholder="Buscar por código o nombre" onClear={clearFilters} clearDisabled={!hasFilters} clearLabel="Limpiar filtros" className="stock-query-filters">
          <label className="data-table-filter-field"><span>Estado de stock</span><select value={view.state} onChange={(event) => updateView("state", event.target.value as StockState | "")}><option value="">Todos</option><option value="available">Disponible</option><option value="critical">Crítico</option><option value="out">Sin stock</option></select></label>
        </DataTableFilters>
        <StockTable kind={kind} rows={filtered} loading={stock.loading} page={view.page} pageSize={PAGE_SIZE} sort={view.sort} ascending={view.ascending} hasFilters={hasFilters} onPageChange={(page) => updateView("page", page)} onSort={changeSort}/>
      </>}
    </main>
  </AppShell>;
}
