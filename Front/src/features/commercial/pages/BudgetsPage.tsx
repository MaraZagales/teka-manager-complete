import { useEffect, useMemo, useState } from "react";
import { Ban, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { DataTableFilters } from "../../../components/data/DataTableFilters";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import type { Presupuesto } from "../../../services/commercialOperationsApi";
import { BudgetForm } from "../components/budgets/BudgetForm";
import { BudgetStateDialog } from "../components/budgets/BudgetStateDialog";
import { BudgetsTable } from "../components/budgets/BudgetsTable";
import { useBudgetsCatalog } from "../hooks/useBudgetsCatalog";
import { useBudgetRecord } from "../hooks/useBudgetRecord";
import { budgetStates, filterAndSortBudgets, type BudgetSortKey } from "../utils/budgetPresentation";
import "../../inventory/styles/products.css";
import "../styles/budgets.css";

const PAGE_SIZE = 8;
export type BudgetsPageMode = "list" | "create" | "detail" | "edit";
type Props = { mode?: BudgetsPageMode; budgetId?: number };

export function BudgetsPage({ mode = "list", budgetId }: Props) {
  const params = new URLSearchParams(location.search);
  const linkedCustomerId = positiveNumber(params.get("clienteId"));
  const linkedConsultationId = positiveNumber(params.get("consultaId"));
  const linkedOpportunityId = positiveNumber(params.get("oportunidadId"));
  const linkedProductId = positiveNumber(params.get("productoId"));
  const linkedQuantity = positiveDecimal(params.get("cantidad"));
  const resolvedMode: BudgetsPageMode = mode === "list" && (linkedConsultationId || linkedOpportunityId) ? "create" : mode;
  const canCreate = hasPermission("Comercial", "Crear");
  const canEdit = hasPermission("Comercial", "Editar");
  const catalog = useBudgetsCatalog(resolvedMode === "detail" ? "view" : resolvedMode);
  const record = useBudgetRecord(resolvedMode === "detail" || resolvedMode === "edit" ? budgetId : undefined);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [state, setState] = useState("");
  const [sort, setSort] = useState<BudgetSortKey>("emision");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [stateBudget, setStateBudget] = useState<Presupuesto | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => setPage(1), [search, dateFrom, dateTo, state, sort, ascending]);
  useEffect(() => { const saved = sessionStorage.getItem("budget-notice"); if (saved) { setNotice(saved); sessionStorage.removeItem("budget-notice"); } }, []);
  const filtered = useMemo(() => filterAndSortBudgets(catalog.budgets, search, dateFrom, dateTo, state, sort, ascending), [catalog.budgets, search, dateFrom, dateTo, state, sort, ascending]);
  const hasFilters = Boolean(search.trim() || dateFrom || dateTo || state);
  function changeSort(key: BudgetSortKey) { if (sort === key) setAscending((value) => !value); else { setSort(key); setAscending(true); } }
  function clearFilters() { setSearch(""); setDateFrom(""); setDateTo(""); setState(""); }
  function stateChanged(message: string, nextState: string) {
    const changedId = stateBudget?.presupuestoComercialId;
    setStateBudget(null); setNotice(message);
    if (resolvedMode === "detail" && changedId) void record.load(true);
    else if (changedId) catalog.patchBudget(changedId, { estado: nextState });
  }

  if (resolvedMode === "create") {
    return <AppShell title="Registrar presupuesto" breadcrumb="Comercial / Presupuestos / Registrar presupuesto" backHref="/comercial/presupuestos" backLabel="Volver a Presupuestos"><Toast message={notice} onClose={() => setNotice("")}/>{catalog.loading ? <PageLoading text="Cargando catálogos…"/> : catalog.catalogError ? <PageError message={catalog.catalogError} onRetry={() => void catalog.load(true)}/> : <BudgetForm mode="create" customers={catalog.customers} products={catalog.products} opportunities={catalog.opportunities} initialCustomerId={linkedCustomerId} initialConsultationId={linkedConsultationId} initialOpportunityId={linkedOpportunityId} initialProductId={linkedProductId} initialQuantity={linkedQuantity}/>}</AppShell>;
  }

  if (resolvedMode === "detail" || resolvedMode === "edit") {
    const title = resolvedMode === "edit" ? "Editar presupuesto" : "Consultar presupuesto";
    return <AppShell title={title} breadcrumb={`Comercial / Presupuestos / ${title}`} backHref="/comercial/presupuestos" backLabel="Volver a Presupuestos"><Toast message={notice} onClose={() => setNotice("")}/>{record.error ? <PageError message={record.error} onRetry={() => void record.load(true)}/> : record.loading || (resolvedMode === "edit" && catalog.loading) ? <PageLoading text="Cargando presupuesto…"/> : catalog.catalogError && resolvedMode === "edit" ? <PageError message={catalog.catalogError} onRetry={() => void catalog.load(true)}/> : !record.budget ? <PageError message="No se encontró el presupuesto solicitado." onRetry={() => { location.href = "/comercial/presupuestos"; }} actionLabel="Volver al listado"/> : resolvedMode === "edit" ? (record.budget.presupuesto.estado !== "Borrador" ? <PageError message="Solo pueden editarse presupuestos en estado Borrador." onRetry={() => { location.href = `/comercial/presupuestos/${budgetId}`; }} actionLabel="Consultar presupuesto"/> : <BudgetForm mode="edit" detail={record.budget} products={catalog.products}/>) : <BudgetForm mode="view" detail={record.budget} products={catalog.products} canEdit={canEdit} onStateChange={setStateBudget}/>} {stateBudget && <BudgetStateDialog budget={stateBudget} onClose={() => setStateBudget(null)} onChanged={stateChanged}/>}</AppShell>;
  }

  return <AppShell title="Presupuestos" breadcrumb="Comercial / Presupuestos"><Toast message={notice} onClose={() => setNotice("")}/><PageHeader title="Presupuestos" action={canCreate ? <div className="products-header-actions"><a className="button primary" href="/comercial/presupuestos/new"><Plus size={17}/>Registrar presupuesto</a></div> : undefined}/>{catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load()}/> : <><DataTableFilters balanced search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por número o cliente" onClear={clearFilters} clearDisabled={!hasFilters} clearLabel="Limpiar" className="budgets-filters"><label className="data-table-filter-field"><span>Desde</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)}/></label><label className="data-table-filter-field"><span>Hasta</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)}/></label><label className="data-table-filter-field"><span>Estado</span><select value={state} onChange={(event) => setState(event.target.value)}><option value="">Todos</option>{budgetStates.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></DataTableFilters><BudgetsTable budgets={filtered} loading={catalog.loading} page={page} pageSize={PAGE_SIZE} sort={sort} ascending={ascending} hasFilters={hasFilters} canCreate={canCreate} canEdit={canEdit} onPageChange={setPage} onSort={changeSort} onStateChange={setStateBudget}/>{stateBudget && <BudgetStateDialog budget={stateBudget} onClose={() => setStateBudget(null)} onChanged={stateChanged}/>}</>}</AppShell>;
}

function positiveNumber(value: string | null) { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null; }
function positiveDecimal(value:string|null){const parsed=Number(value);return Number.isFinite(parsed)&&parsed>0?parsed:null}
function PageLoading({ text }: { text: string }) { return <div className="product-page-state"><span className="product-state-spinner"/><strong>{text}</strong></div>; }
function PageError({ message, onRetry, actionLabel = "Reintentar" }: { message: string; onRetry: () => void; actionLabel?: string }) { return <div className="product-page-state error" role="alert"><Ban size={26}/><strong>No pudimos cargar esta pantalla</strong><span>{message}</span><button type="button" className="button secondary" onClick={onRetry}>{actionLabel === "Reintentar" && <RotateCcw size={15}/>} {actionLabel}</button></div>; }
