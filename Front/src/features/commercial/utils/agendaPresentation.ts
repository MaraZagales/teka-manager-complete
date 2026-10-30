import type { Actividad } from "../../../services/commercialOperationsApi";

export const activityStates = ["Pendiente", "Realizada", "Cancelada"] as const;
export const activityTypes = ["Visita", "Seguimiento", "Llamada", "WhatsApp", "Email", "Reunion", "Otro"] as const;
export type AgendaView = "calendar" | "table";
export type ActivityAction = "reschedule" | "finish" | "cancel";

export function businessToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function activityDateKey(value?: string | null) { return value ? String(value).slice(0, 10) : ""; }
export function activityTime(value?: string | null) { const text = String(value || ""); return text.length >= 16 ? text.slice(11, 16) : "—"; }
export function toLocalDateTimeInput(value?: string | null) { return value ? String(value).slice(0, 16) : ""; }
export function formatActivityDate(value?: string | null) {
  const key = activityDateKey(value); if (!key) return "—";
  const [year, month, day] = key.split("-"); return `${day}/${month}/${year}`;
}
export function formatActivityDateTime(value?: string | null) { const date = formatActivityDate(value); return date === "—" ? date : `${date} ${activityTime(value)}`; }
export function activityCustomer(activity: Pick<Actividad, "clienteNombre" | "clienteApellido">) { return [activity.clienteNombre, activity.clienteApellido].filter(Boolean).join(" ").trim() || "Cliente"; }
export function activityStateTone(state: string): "success" | "warning" | "danger" | "neutral" { return state === "Realizada" ? "success" : state === "Pendiente" ? "warning" : state === "Cancelada" ? "danger" : "neutral"; }
export function activityCanChange(activity: Actividad) { return activity.estado === "Pendiente"; }
export function monthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const last = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}
export function moveAgendaMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number); const next = new Date(year, monthNumber - 1 + delta, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}
export function filterActivities(rows: Actividad[], from: string, to: string, clientId: string, type: string, state: string) {
  return rows.filter((activity) => {
    const date = activityDateKey(activity.fechaProgramada);
    return (!from || date >= from) && (!to || date <= to) && (!clientId || activity.clienteId === Number(clientId)) && (!type || activity.tipo === type) && (!state || activity.estado === state);
  }).sort((left, right) => left.fechaProgramada.localeCompare(right.fechaProgramada) || left.actividadComercialId - right.actividadComercialId);
}
