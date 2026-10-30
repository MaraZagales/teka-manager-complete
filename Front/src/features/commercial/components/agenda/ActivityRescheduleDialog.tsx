import { useState } from "react";
import { Ban, CalendarClock } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { reprogramarActividad, type Actividad } from "../../../../services/commercialOperationsApi";
import { activityCustomer, formatActivityDateTime, toLocalDateTimeInput } from "../../utils/agendaPresentation";

type Props = { activity: Actividad; onClose: () => void; onChanged: (activity: Actividad, message: string) => void };
export function ActivityRescheduleDialog({ activity, onClose, onChanged }: Props) {
  const [date, setDate] = useState(toLocalDateTimeInput(activity.fechaProgramada));
  const [description, setDescription] = useState(activity.descripcion || "");
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function confirm() {
    if (!date) { setError("Indicá la nueva fecha y hora."); return; }
    if (description.length > 1000) { setError("La descripción no puede superar 1000 caracteres."); return; }
    setSaving(true); setError("");
    try { await reprogramarActividad(activity.actividadComercialId, date, description.trim() || undefined); onChanged({ ...activity, fechaProgramada: date, descripcion: description.trim() || null }, "Actividad reprogramada correctamente."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo reprogramar la actividad."); setSaving(false); }
  }
  return <Modal title="Reprogramar actividad" subtitle={`${activity.titulo} · ${activityCustomer(activity)}`} onClose={() => { if (!saving) onClose(); }}><div className="product-state-dialog activity-dialog">{error && <div className="product-form-alert" role="alert"><Ban size={17}/><span>{error}</span></div>}<div className="activity-dialog-summary"><CalendarClock size={20}/><p>Programación actual: <strong>{formatActivityDateTime(activity.fechaProgramada)}</strong></p></div><label className="product-field"><span>Nueva fecha y hora <b>*</b></span><input type="datetime-local" value={date} disabled={saving} onChange={(event) => { setDate(event.target.value); setError(""); }}/></label><label className="product-field"><span>Observaciones</span><textarea maxLength={1000} value={description} disabled={saving} onChange={(event) => setDescription(event.target.value)}/><small>{description.length}/1000</small></label><footer><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Cancelar</button><button type="button" className="button primary" disabled={saving} onClick={() => void confirm()}>{saving ? "Guardando…" : "Reprogramar"}</button></footer></div></Modal>;
}
