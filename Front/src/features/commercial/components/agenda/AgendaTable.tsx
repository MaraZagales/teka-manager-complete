import { CalendarClock, CheckCircle2, ListTodo, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Actividad } from "../../../../services/commercialOperationsApi";
import { activityCanChange, activityCustomer, activityStateTone, activityTime, formatActivityDate, type ActivityAction } from "../../utils/agendaPresentation";

type Props = { activities: Actividad[]; loading: boolean; page: number; pageSize: number; canEdit: boolean; onPageChange: (page: number) => void; onSelect: (activity: Actividad) => void; onAction: (activity: Actividad, action: ActivityAction) => void };
export function AgendaTable({ activities, loading, page, pageSize, canEdit, onPageChange, onSelect, onAction }: Props) {
  const visible = activities.slice((page - 1) * pageSize, page * pageSize);
  const columns: DataTableColumn<Actividad>[] = [
    { key: "date", header: "Fecha", render: (activity) => <span className="agenda-date-cell"><strong>{formatActivityDate(activity.fechaProgramada)}</strong><small>{activityTime(activity.fechaProgramada)}</small></span> },
    { key: "customer", header: "Cliente", render: activityCustomer },
    { key: "title", header: "Actividad", render: (activity) => <span className="agenda-title-cell"><strong>{activity.titulo}</strong>{activity.descripcion && <small>{activity.descripcion}</small>}</span> },
    { key: "type", header: "Tipo", render: (activity) => activity.tipo },
    { key: "state", header: "Estado", render: (activity) => <StatusBadge tone={activityStateTone(activity.estado)}>{activity.estado}</StatusBadge> },
    { key: "actions", header: "Acciones", className: "agenda-actions-cell", render: (activity) => <div className="agenda-inline-actions" onClick={(event) => event.stopPropagation()}>{canEdit && activityCanChange(activity) && <><button type="button" title="Reprogramar" aria-label={`Reprogramar ${activity.titulo}`} onClick={() => onAction(activity, "reschedule")}><CalendarClock size={16}/></button><button type="button" title="Finalizar" aria-label={`Finalizar ${activity.titulo}`} onClick={() => onAction(activity, "finish")}><CheckCircle2 size={16}/></button><button type="button" title="Cancelar" aria-label={`Cancelar ${activity.titulo}`} onClick={() => onAction(activity, "cancel")}><XCircle size={16}/></button></>}</div> },
  ];
  return <DataTable rows={visible} columns={columns} rowKey={(activity) => activity.actividadComercialId} loading={loading} loadingText="Cargando actividades…" page={page} pageSize={pageSize} totalRecords={activities.length} onPageChange={onPageChange} onRowClick={onSelect} className="agenda-table-card" tableClassName="agenda-table" emptyState={<div className="state-box agenda-empty-state"><ListTodo size={28}/><strong>No hay actividades para los filtros seleccionados</strong><span>Modificá o limpiá los filtros para ver otros resultados.</span></div>}/>;
}
