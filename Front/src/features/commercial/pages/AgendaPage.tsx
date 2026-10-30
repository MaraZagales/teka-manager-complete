import { useEffect, useMemo, useState } from "react";
import { Ban, CalendarDays, List, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import type { Actividad } from "../../../services/commercialOperationsApi";
import { ActivityForm } from "../components/agenda/ActivityForm";
import { ActivityRescheduleDialog } from "../components/agenda/ActivityRescheduleDialog";
import { ActivityStateDialog } from "../components/agenda/ActivityStateDialog";
import { AgendaCalendar } from "../components/agenda/AgendaCalendar";
import { AgendaTable } from "../components/agenda/AgendaTable";
import { useActivityRecord, rememberActivity } from "../hooks/useActivityRecord";
import { useAgendaCatalog } from "../hooks/useAgendaCatalog";
import { activityStates, activityTypes, businessToday, filterActivities, monthRange, type ActivityAction, type AgendaView } from "../utils/agendaPresentation";
import "../../inventory/styles/products.css";
import "../styles/agenda.css";

const PAGE_SIZE = 9;
export type AgendaPageMode = "list" | "create" | "detail" | "edit";
type Props = { mode?: AgendaPageMode; activityId?: number };

export function AgendaPage({ mode = "list", activityId }: Props) {
  const params = new URLSearchParams(location.search);
  const consultationId = positiveNumber(params.get("consultaId")); const linkedCustomerId = positiveNumber(params.get("clienteId")); const linkedOpportunityId = positiveNumber(params.get("oportunidadId"));
  const initialDate = validDate(params.get("fecha")) || businessToday();
  const resolvedMode: AgendaPageMode = mode === "list" && linkedCustomerId && (consultationId || linkedOpportunityId) ? "create" : mode;
  const canCreate = hasPermission("Comercial", "Crear"); const canEdit = hasPermission("Comercial", "Editar");
  const [month, setMonth] = useState(initialDate.slice(0, 7)); const [selectedDay, setSelectedDay] = useState(initialDate);
  const [view, setView] = useState<AgendaView>("calendar");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState(""); const [clientId, setClientId] = useState(""); const [type, setType] = useState(""); const [state, setState] = useState(""); const [page, setPage] = useState(1);
  const visibleRange = monthRange(month); const hasDateFilter = Boolean(dateFrom || dateTo);
  const requestFrom = hasDateFilter ? dateFrom || undefined : visibleRange.from;
  const requestTo = hasDateFilter ? dateTo || undefined : visibleRange.to;
  const catalog = useAgendaCatalog(resolvedMode === "detail" ? "view" : resolvedMode, resolvedMode === "list" ? requestFrom : undefined, resolvedMode === "list" ? requestTo : undefined);
  const record = useActivityRecord(resolvedMode === "detail" || resolvedMode === "edit" ? activityId : undefined);
  const [action, setAction] = useState<{ activity: Actividad; type: ActivityAction } | null>(null); const [notice, setNotice] = useState("");

  useEffect(() => setPage(1), [dateFrom, dateTo, clientId, type, state, view]);
  useEffect(() => { const saved = sessionStorage.getItem("agenda-notice"); if (saved) { setNotice(saved); sessionStorage.removeItem("agenda-notice"); } }, []);
  const filtered = useMemo(() => filterActivities(catalog.activities, dateFrom, dateTo, clientId, type, state), [catalog.activities, dateFrom, dateTo, clientId, type, state]);
  const hasFilters = Boolean(dateFrom || dateTo || clientId || type || state);
  function clearFilters() { setDateFrom(""); setDateTo(""); setClientId(""); setType(""); setState(""); }
  function selectActivity(activity: Actividad) { rememberActivity(activity); location.href = `/comercial/agenda/${activity.actividadComercialId}`; }
  function activityChanged(updated: Actividad, message: string) { if (resolvedMode === "list") catalog.patchActivity(updated.actividadComercialId, updated); else record.patch(updated); setAction(null); setNotice(message); }

  if (resolvedMode === "create") return <AppShell title="Registrar actividad" breadcrumb="Comercial / Agenda comercial / Registrar actividad" backHref="/comercial/agenda" backLabel="Volver a Agenda"><Toast message={notice} onClose={() => setNotice("")}/>{!canCreate ? <PageError message="No tenés permisos para registrar actividades." onRetry={() => { location.href = "/comercial/agenda"; }} actionLabel="Volver a Agenda"/> : catalog.loading ? <PageLoading text="Cargando clientes…"/> : catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load(true)}/> : <ActivityForm mode="create" customers={catalog.customers} initialCustomerId={linkedCustomerId} initialConsultationId={consultationId} initialOpportunityId={linkedOpportunityId} initialDate={initialDate}/>}</AppShell>;

  if (resolvedMode === "detail" || resolvedMode === "edit") {
    const title = resolvedMode === "edit" ? "Editar actividad" : "Consultar actividad";
    return <AppShell title={title} breadcrumb={`Comercial / Agenda comercial / ${title}`} backHref="/comercial/agenda" backLabel="Volver a Agenda"><Toast message={notice} onClose={() => setNotice("")}/>{record.error ? <PageError message={record.error} onRetry={() => void record.load(true)}/> : record.loading ? <PageLoading text="Cargando actividad…"/> : !record.activity ? <PageError message="No se encontró la actividad solicitada." onRetry={() => { location.href = "/comercial/agenda"; }} actionLabel="Volver a Agenda"/> : resolvedMode === "edit" && record.activity.estado !== "Pendiente" ? <PageError message="Solo pueden editarse actividades pendientes." onRetry={() => { location.href = `/comercial/agenda/${activityId}`; }} actionLabel="Consultar actividad"/> : <ActivityForm mode={resolvedMode === "edit" ? "edit" : "view"} activity={record.activity} canEdit={canEdit} onAction={(activity, nextAction) => setAction({ activity, type: nextAction })}/>} {action?.type === "reschedule" && <ActivityRescheduleDialog activity={action.activity} onClose={() => setAction(null)} onChanged={activityChanged}/>} {action && action.type !== "reschedule" && <ActivityStateDialog activity={action.activity} action={action.type} onClose={() => setAction(null)} onChanged={activityChanged}/>}</AppShell>;
  }

  return <AppShell title="Agenda comercial" breadcrumb="Comercial / Agenda comercial"><Toast message={notice} onClose={() => setNotice("")}/><PageHeader title="Agenda comercial" action={canCreate ? <div className="products-header-actions"><a className="button primary" href="/comercial/agenda/new"><Plus size={17}/>Registrar actividad</a></div> : undefined}/>{catalog.error ? <PageError message={catalog.error} onRetry={() => void catalog.load(true)}/> : <><section className="agenda-toolbar"><div className="agenda-view-toggle" aria-label="Vista de Agenda"><button type="button" className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><CalendarDays size={16}/>Calendario</button><button type="button" className={view === "table" ? "active" : ""} onClick={() => setView("table")}><List size={16}/>Listado</button></div></section><section className="agenda-filters"><label className="data-table-filter-field"><span>Desde</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)}/></label><label className="data-table-filter-field"><span>Hasta</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)}/></label><label className="data-table-filter-field"><span>Cliente</span><select value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Todos</option>{catalog.customers.map((customer) => <option key={customer.clienteId} value={customer.clienteId}>{customer.nombre} {customer.apellido}</option>)}</select></label><label className="data-table-filter-field"><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos</option>{activityTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="data-table-filter-field"><span>Estado</span><select value={state} onChange={(event) => setState(event.target.value)}><option value="">Todos</option>{activityStates.map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" className="button secondary filter-clear-button" disabled={!hasFilters} onClick={clearFilters}><RotateCcw size={16}/>Limpiar</button></section>{view === "calendar" ? (catalog.loading ? <PageLoading text="Cargando actividades…"/> : <AgendaCalendar month={month} selectedDay={selectedDay} activities={filtered} canCreate={canCreate} onMonthChange={setMonth} onDayChange={setSelectedDay} onSelect={selectActivity} onCreate={(day) => { location.href = `/comercial/agenda/new?fecha=${day}`; }}/>) : <AgendaTable activities={filtered} loading={catalog.loading} page={page} pageSize={PAGE_SIZE} canEdit={canEdit} onPageChange={setPage} onSelect={selectActivity} onAction={(activity, nextAction) => setAction({ activity, type: nextAction })}/>} {action?.type === "reschedule" && <ActivityRescheduleDialog activity={action.activity} onClose={() => setAction(null)} onChanged={activityChanged}/>} {action && action.type !== "reschedule" && <ActivityStateDialog activity={action.activity} action={action.type} onClose={() => setAction(null)} onChanged={activityChanged}/>}</>}</AppShell>;
}

function positiveNumber(value: string | null) { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null; }
function validDate(value: string | null) { return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""; }
function PageLoading({ text }: { text: string }) { return <div className="product-page-state agenda-page-state"><span className="product-state-spinner"/><strong>{text}</strong></div>; }
function PageError({ message, onRetry, actionLabel = "Reintentar" }: { message: string; onRetry: () => void; actionLabel?: string }) { return <div className="product-page-state error agenda-page-state" role="alert"><Ban size={26}/><strong>No pudimos cargar esta pantalla</strong><span>{message}</span><button type="button" className="button secondary" onClick={onRetry}>{actionLabel === "Reintentar" && <RotateCcw size={15}/>} {actionLabel}</button></div>; }
