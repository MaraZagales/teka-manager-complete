import { useState } from "react";
import { Ban, CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { cancelarActividad, finalizarActividad, type Actividad } from "../../../../services/commercialOperationsApi";
import { activityCustomer } from "../../utils/agendaPresentation";

type Props = { activity: Actividad; action: "finish" | "cancel"; onClose: () => void; onChanged: (activity: Actividad, message: string) => void };
export function ActivityStateDialog({ activity, action, onClose, onChanged }: Props) {
  const [result, setResult] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function confirm() {
    const trimmed = result.trim();
    if (action === "finish" && !trimmed) { setError("Ingresá el resultado de la actividad."); return; }
    if (trimmed.length > 1000) { setError("El resultado no puede superar 1000 caracteres."); return; }
    setSaving(true); setError("");
    try {
      if (action === "finish") await finalizarActividad(activity.actividadComercialId, trimmed); else await cancelarActividad(activity.actividadComercialId);
      onChanged({ ...activity, estado: action === "finish" ? "Realizada" : "Cancelada", resultado: action === "finish" ? trimmed : activity.resultado }, action === "finish" ? "Actividad finalizada correctamente." : "Actividad cancelada correctamente.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo actualizar la actividad."); setSaving(false); }
  }
  return <Modal title={action === "finish" ? "Finalizar actividad" : "Cancelar actividad"} subtitle={`${activity.titulo} · ${activityCustomer(activity)}`} onClose={() => { if (!saving) onClose(); }}><div className="product-state-dialog activity-dialog">{error && <div className="product-form-alert" role="alert"><Ban size={17}/><span>{error}</span></div>}<div className={`activity-dialog-summary ${action === "cancel" ? "danger" : ""}`}>{action === "finish" ? <CheckCircle2 size={21}/> : <XCircle size={21}/>}<p>{action === "finish" ? "Confirmá que la gestión fue realizada e ingresá su resultado." : "La actividad quedará cancelada y ya no podrá reprogramarse ni finalizarse."}</p></div>{action === "finish" && <label className={`product-field ${error && !result.trim() ? "field-invalid" : ""}`}><span>Resultado <b>*</b></span><textarea maxLength={1000} value={result} disabled={saving} onChange={(event) => { setResult(event.target.value); setError(""); }} placeholder="Resultado del contacto o gestión"/><small>{result.length}/1000</small></label>}<footer><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Volver</button><button type="button" className={action === "cancel" ? "button danger" : "button primary"} disabled={saving} onClick={() => void confirm()}>{saving ? "Guardando…" : action === "finish" ? "Finalizar actividad" : "Cancelar actividad"}</button></footer></div></Modal>;
}
