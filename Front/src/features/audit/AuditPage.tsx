import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, FileSpreadsheet, Search, ShieldAlert, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell";
import { PageHeader } from "../../components/data/PageHeader";
import { DataTable, type DataTableColumn } from "../../components/data/DataTable";
import { StatusBadge } from "../../components/data/StatusBadge";
import { auditApi, type AuditEvent, type AuditSession } from "../../services/auditApi";
import { auditExcel, auditPdf } from "../../services/securityReports";

const PAGE = 10;
const formatDateTime = (value: string) => new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const dateOnly = (value: string) => new Date(`${value}T00:00:00`);
const endOfDate = (value: string) => new Date(`${value}T23:59:59.999`);

export function AuditPage() {
  const [sessions, setSessions] = useState<AuditSession[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"events" | "sessions">("events");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [user, setUser] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([auditApi.sessions(), auditApi.events()])
      .then(([sessionRows, eventRows]) => { setSessions(sessionRows); setEvents(eventRows); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudo cargar la auditoría."))
      .finally(() => setLoading(false));
  }, []);

  const users = useMemo(() => [...new Set([...sessions.map(x => x.username), ...events.map(x => x.username)])].sort(), [sessions, events]);
  const modules = useMemo(() => [...new Set(events.map(x => x.modulo).filter(Boolean))].sort(), [events]);
  const actions = useMemo(() => [...new Set(events.map(x => x.accion).filter(Boolean))].sort(), [events]);

  const filteredEvents = useMemo(() => events.filter((item) => {
    const date = new Date(item.fechaEvento);
    if (fromDate && date < dateOnly(fromDate)) return false;
    if (toDate && date > endOfDate(toDate)) return false;
    if (user && item.username !== user) return false;
    if (module && item.modulo !== module) return false;
    if (action && item.accion !== action) return false;
    const haystack = `${item.username} ${item.modulo} ${item.entidad} ${item.accion} ${item.descripcion || ""}`.toLocaleLowerCase("es-AR");
    return !query.trim() || haystack.includes(query.trim().toLocaleLowerCase("es-AR"));
  }), [events, fromDate, toDate, user, module, action, query]);

  const filteredSessions = useMemo(() => sessions.filter((item) => {
    const date = new Date(item.fechaLogin);
    if (fromDate && date < dateOnly(fromDate)) return false;
    if (toDate && date > endOfDate(toDate)) return false;
    if (user && item.username !== user) return false;
    const haystack = `${item.username} ${item.nombre} ${item.apellido || ""} ${item.ipOrigen || ""} ${item.observaciones || ""}`.toLocaleLowerCase("es-AR");
    return !query.trim() || haystack.includes(query.trim().toLocaleLowerCase("es-AR"));
  }), [sessions, fromDate, toDate, user, query]);

  useEffect(() => setPage(1), [query, view, fromDate, toDate, user, module, action]);

  const currentRows = view === "events" ? filteredEvents : filteredSessions;
  const visible = currentRows.slice((page - 1) * PAGE, page * PAGE);
  const activeUsers = new Set([...filteredSessions.map(x => x.usuarioId), ...filteredEvents.map(x => x.usuarioId)]).size;
  const openSessions = filteredSessions.filter(x => !x.fechaLogout).length;
  const sensitiveEvents = filteredEvents.filter(x => /bloq|fall|inactiv|elimin|cancel|password|contrase/i.test(`${x.accion} ${x.descripcion || ""}`)).length;
  const periodLabel = fromDate || toDate ? `${fromDate || "Inicio"} a ${toDate || "Hoy"}` : "Todo el historial";

  const eventCols: DataTableColumn<AuditEvent>[] = [
    { key: "fecha", header: "Fecha y hora", render: row => formatDateTime(row.fechaEvento) },
    { key: "usuario", header: "Usuario", render: row => <><strong>{row.username}</strong><small>{`${row.nombre} ${row.apellido || ""}`.trim()}</small></> },
    { key: "modulo", header: "Módulo", render: row => row.modulo },
    { key: "accion", header: "Acción", render: row => <strong>{row.accion}</strong> },
    { key: "detalle", header: "Detalle", render: row => row.descripcion || "—" },
  ];
  const sessionCols: DataTableColumn<AuditSession>[] = [
    { key: "fecha", header: "Ingreso", render: row => formatDateTime(row.fechaLogin) },
    { key: "usuario", header: "Usuario", render: row => <><strong>{row.username}</strong><small>{`${row.nombre} ${row.apellido || ""}`.trim()}</small></> },
    { key: "ip", header: "Origen / IP", render: row => row.ipOrigen || "—" },
    { key: "salida", header: "Salida", render: row => row.fechaLogout ? formatDateTime(row.fechaLogout) : <StatusBadge tone="warning">Sesión abierta</StatusBadge> },
    { key: "resultado", header: "Resultado", render: row => <StatusBadge tone={row.exitoso ? "success" : "danger"}>{row.exitoso ? "Exitoso" : "Fallido"}</StatusBadge> },
    { key: "obs", header: "Observación", render: row => row.observaciones || "—" },
  ];

  function clearFilters() { setQuery(""); setFromDate(""); setToDate(""); setUser(""); setModule(""); setAction(""); }
  const reportFilters = `Período: ${periodLabel} · Usuario: ${user || "Todos"} · Módulo: ${module || "Todos"} · Acción: ${action || "Todas"}`;

  return <AppShell title="Auditoría" breadcrumb="Administración / Auditoría">
    <PageHeader kicker="ADMINISTRACIÓN" title="Auditoría" description="Trazabilidad de accesos y operaciones relevantes realizadas en TEKA Manager." action={<div className="report-actions"><button className="button secondary" onClick={() => auditExcel(filteredSessions, filteredEvents, reportFilters)}><FileSpreadsheet size={17}/> Exportar Excel</button><button className="button primary" onClick={() => auditPdf(filteredSessions, filteredEvents, reportFilters)}><Download size={17}/> Generar reporte</button></div>}/>

    <section className="audit-toolbar">
      <div className="audit-view-tabs" role="tablist" aria-label="Vista de auditoría">
        <button className={view === "events" ? "active" : ""} onClick={() => setView("events")}>Eventos <span>{filteredEvents.length}</span></button>
        <button className={view === "sessions" ? "active" : ""} onClick={() => setView("sessions")}>Sesiones <span>{filteredSessions.length}</span></button>
      </div>
      <span className="audit-period"><CalendarDays size={15}/>{periodLabel}</span>
    </section>

    <section className="audit-filter-card">
      <div className="audit-filter-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar usuario, acción, entidad o detalle..."/></div>
      <label><span>Desde</span><input type="date" value={fromDate} max={toDate || undefined} onChange={e => setFromDate(e.target.value)}/></label>
      <label><span>Hasta</span><input type="date" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)}/></label>
      <label><span>Usuario</span><select value={user} onChange={e => setUser(e.target.value)}><option value="">Todos</option>{users.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      {view === "events" && <label><span>Módulo</span><select value={module} onChange={e => setModule(e.target.value)}><option value="">Todos</option>{modules.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
      {view === "events" && <label><span>Acción</span><select value={action} onChange={e => setAction(e.target.value)}><option value="">Todas</option>{actions.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
      <button className="button ghost audit-clear" onClick={clearFilters}>Limpiar filtros</button>
    </section>

    <section className="audit-summary-strip" aria-label="Resumen del período filtrado">
      <div><ShieldCheck/><span><b>{filteredEvents.length}</b> eventos</span></div>
      <div><UsersRound/><span><b>{activeUsers}</b> usuarios con actividad</span></div>
      <div className={sensitiveEvents ? "attention" : ""}><ShieldAlert/><span><b>{sensitiveEvents}</b> eventos sensibles</span></div>
      <div><ShieldCheck/><span><b>{openSessions}</b> sesiones abiertas</span></div>
      <p>Resumen calculado sobre los filtros y fechas seleccionados.</p>
    </section>

    {error && <div className="inline-alert error"><ShieldAlert size={18}/><span>{error}</span></div>}
    {view === "events" ? <DataTable columns={eventCols} rows={visible as AuditEvent[]} rowKey={row => row.auditoriaEventoId} loading={loading} emptyState={<div className="state-box">No hay eventos para los filtros seleccionados.</div>} page={page} pageSize={PAGE} totalRecords={filteredEvents.length} onPageChange={setPage}/>
      : <DataTable columns={sessionCols} rows={visible as AuditSession[]} rowKey={row => row.auditoriaSesionId} loading={loading} emptyState={<div className="state-box">No hay sesiones para los filtros seleccionados.</div>} page={page} pageSize={PAGE} totalRecords={filteredSessions.length} onPageChange={setPage}/>} 


  </AppShell>;
}
