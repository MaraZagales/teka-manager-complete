import { useEffect, useMemo, useState } from "react";
import { Ban, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { DataTableFilters } from "../../../components/data/DataTableFilters";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import { motivosPerdidaOportunidad, usuariosOportunidad, type OpportunityLookup, type OpportunityUser } from "../../../services/commercialOperationsApi";
import { OpportunitiesTable } from "../components/opportunities/OpportunitiesTable";
import { OpportunityForm } from "../components/opportunities/OpportunityForm";
import { OpportunityStateDialog } from "../components/opportunities/OpportunityStateDialog";
import { useOpportunitiesCatalog } from "../hooks/useOpportunitiesCatalog";
import { useOpportunityRecord } from "../hooks/useOpportunityRecord";
import { filterAndSortOpportunities, isOpportunityClosed, type OpportunityAction, type OpportunitySortKey } from "../utils/opportunityPresentation";
import "../../inventory/styles/products.css";
import "../styles/opportunities.css";

const PAGE_SIZE = 8;
export type OpportunitiesPageMode = "list" | "create" | "detail" | "edit";
type Props = { mode?: OpportunitiesPageMode; opportunityId?: number };

export function OpportunitiesPage({ mode = "list", opportunityId }: Props) {
  const params = new URLSearchParams(location.search);
  const linkedCustomerId = positiveNumber(params.get("clienteId"));
  const linkedConsultationId = positiveNumber(params.get("consultaId"));
  const linkedProductId = positiveNumber(params.get("productoId"));
  const linkedQuantity = positiveDecimal(params.get("cantidad"));
  const linkedChannelId = positiveNumber(params.get("canalId"));
  const linkedInterest = params.get("interes")?.slice(0,150) || undefined;
  const resolvedMode: OpportunitiesPageMode = mode === "list" && (linkedCustomerId || linkedConsultationId) ? "create" : mode;
  const canCreate = hasPermission("Comercial", "Crear");
  const canEdit = hasPermission("Comercial", "Editar");
  const canConvert = hasPermission("Ventas", "Crear");
  const catalog = useOpportunitiesCatalog(resolvedMode === "detail" ? "view" : resolvedMode);
  const record = useOpportunityRecord(resolvedMode === "detail" || resolvedMode === "edit" ? opportunityId : undefined, resolvedMode === "detail" || resolvedMode === "edit");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState("");
  const [responsible, setResponsible] = useState("");
  const [sort, setSort] = useState<OpportunitySortKey>("fecha");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<OpportunityAction | null>(null);
  const [users, setUsers] = useState<OpportunityUser[]>([]);
  const [reasons, setReasons] = useState<OpportunityLookup[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => setPage(1), [search, from, to, state, responsible, sort, ascending]);
  useEffect(() => { const saved = sessionStorage.getItem("opportunity-notice"); if (saved) { setNotice(saved); sessionStorage.removeItem("opportunity-notice"); } }, []);
  useEffect(() => { if (record.relationsError) setNotice(record.relationsError); }, [record.relationsError]);

  const filtered = useMemo(() => filterAndSortOpportunities(catalog.opportunities, catalog.activities, search, from, to, state, responsible, sort, ascending), [catalog.opportunities, catalog.activities, search, from, to, state, responsible, sort, ascending]);
  const states = useMemo(() => [...new Set(catalog.opportunities.map((item) => item.estadoOportunidadNombre).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "es-AR")), [catalog.opportunities]);
  const responsibles = useMemo(() => { const map = new Map<number, string>(); catalog.opportunities.forEach((item) => { if (item.usuarioResponsableId && item.responsableNombre) map.set(item.usuarioResponsableId, item.responsableNombre); }); return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "es-AR")); }, [catalog.opportunities]);
  const hasFilters = Boolean(search.trim() || from || to || state || responsible);

  function clear() { setSearch(""); setFrom(""); setTo(""); setState(""); setResponsible(""); }
  function changeSort(key: OpportunitySortKey) { if (sort === key) setAscending((value) => !value); else { setSort(key); setAscending(true); } }
  async function openAction(next: OpportunityAction) {
    setActionLoading(true);
    try {
      if (next === "assign" && !users.length) setUsers(await usuariosOportunidad());
      if (next === "lose" && !reasons.length) setReasons(await motivosPerdidaOportunidad());
      setAction(next);
    } catch (caught) { setNotice(caught instanceof Error ? caught.message : "No se pudo preparar la operación."); }
    finally { setActionLoading(false); }
  }
  function actionChanged(message: string) { setAction(null); setNotice(message); void record.load(true); }

  if (resolvedMode === "create") return <AppShell title="Registrar oportunidad" breadcrumb="Comercial / Oportunidades / Registrar oportunidad" backHref="/comercial/oportunidades" backLabel="Volver a Oportunidades"><Toast message={notice} onClose={() => setNotice("")}/>{!canCreate ? <PageError message="No tenés permisos para registrar oportunidades." onRetry={() => { location.href = "/comercial/oportunidades"; }} actionLabel="Volver a Oportunidades"/> : catalog.loading ? <PageLoading text="Cargando catálogos…"/> : catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load(true)}/> : <OpportunityForm mode="create" customers={catalog.customers} products={catalog.products} channels={catalog.channels} states={catalog.states} initialCustomerId={linkedCustomerId} initialConsultationId={linkedConsultationId} initialProductId={linkedProductId} initialQuantity={linkedQuantity} initialChannelId={linkedChannelId} initialInterest={linkedInterest}/>}</AppShell>;

  if (resolvedMode === "detail" || resolvedMode === "edit") {
    const title = resolvedMode === "edit" ? "Editar oportunidad" : "Consultar oportunidad";
    return <AppShell title={title} breadcrumb={`Comercial / Oportunidades / ${title}`} backHref="/comercial/oportunidades" backLabel="Volver a Oportunidades"><Toast message={notice} onClose={() => setNotice("")}/>{record.error ? <PageError message={record.error} onRetry={() => void record.load(true)}/> : record.loading || (resolvedMode === "edit" && catalog.loading) ? <PageLoading text="Cargando oportunidad…"/> : resolvedMode === "edit" && catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load(true)}/> : !record.opportunity ? <PageError message="No se encontró la oportunidad solicitada." onRetry={() => { location.href = "/comercial/oportunidades"; }} actionLabel="Volver al listado"/> : resolvedMode === "edit" && isOpportunityClosed(record.opportunity) ? <PageError message="La oportunidad está cerrada y no admite modificaciones." onRetry={() => { location.href = `/comercial/oportunidades/${opportunityId}`; }} actionLabel="Consultar oportunidad"/> : <OpportunityForm key={`${record.opportunity.estadoOportunidadNombre}-${record.opportunity.responsableNombre}-${record.opportunity.productos.map((item) => `${item.productoId}:${item.cantidad}`).join("|")}`} mode={resolvedMode === "edit" ? "edit" : "view"} detail={record.opportunity} activities={record.activities} budgets={record.budgets} customers={catalog.customers} products={catalog.products} channels={catalog.channels} states={catalog.states} canEdit={canEdit && !actionLoading} canCreate={canCreate} canConvert={canConvert} onAction={(next) => void openAction(next)} onReload={() => record.load(true)}/>} {action && record.opportunity && <OpportunityStateDialog opportunity={record.opportunity} action={action} users={users} reasons={reasons} onClose={() => setAction(null)} onChanged={actionChanged}/>}</AppShell>;
  }

  return <AppShell title="Oportunidades comerciales" breadcrumb="Comercial / Oportunidades"><Toast message={notice} onClose={() => setNotice("")}/><PageHeader title="Oportunidades comerciales" action={canCreate ? <div className="products-header-actions"><a className="button primary" href="/comercial/oportunidades/new"><Plus size={17}/>Nueva oportunidad</a></div> : undefined}/>{catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load(true)}/> : <><DataTableFilters balanced search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por cliente, interés o responsable" onClear={clear} clearDisabled={!hasFilters} className="opportunities-filters"><label className="data-table-filter-field"><span>Desde</span><input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)}/></label><label className="data-table-filter-field"><span>Hasta</span><input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)}/></label><label className="data-table-filter-field"><span>Estado</span><select value={state} onChange={(event) => setState(event.target.value)}><option value="">Todos</option>{states.map((item) => <option key={item}>{item}</option>)}</select></label><label className="data-table-filter-field"><span>Responsable</span><select value={responsible} onChange={(event) => setResponsible(event.target.value)}><option value="">Todos</option><option value="unassigned">Sin asignar</option>{responsibles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label></DataTableFilters><OpportunitiesTable rows={filtered} activities={catalog.activities} loading={catalog.loading} page={page} pageSize={PAGE_SIZE} sort={sort} ascending={ascending} hasFilters={hasFilters} canCreate={canCreate} canEdit={canEdit} onPageChange={setPage} onSort={changeSort}/></>}</AppShell>;
}

function positiveNumber(value: string | null) { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null; }
function positiveDecimal(value:string|null){const parsed=Number(value);return Number.isFinite(parsed)&&parsed>0?parsed:null}
function PageLoading({ text }: { text: string }) { return <div className="product-page-state"><span className="product-state-spinner"/><strong>{text}</strong></div>; }
function PageError({ message, onRetry, actionLabel = "Reintentar" }: { message: string; onRetry: () => void; actionLabel?: string }) { return <div className="product-page-state error" role="alert"><Ban size={26}/><strong>No pudimos cargar esta pantalla</strong><span>{message}</span><button type="button" className="button secondary" onClick={onRetry}>{actionLabel === "Reintentar" && <RotateCcw size={15}/>} {actionLabel}</button></div>; }
