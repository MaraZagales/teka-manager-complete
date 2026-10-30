import { useMemo, useState } from "react";
import { AlertTriangle, Ban, RefreshCw } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { cambiarEstadoPresupuesto, type Presupuesto } from "../../../../services/commercialOperationsApi";
import { availableBudgetStates, budgetNumber, isBudgetExpired } from "../../utils/budgetPresentation";

type Props = { budget: Presupuesto; initialState?: string; onClose: () => void; onChanged: (message: string, nextState: string) => void };

export function BudgetStateDialog({ budget, initialState = "", onClose, onChanged }: Props) {
  const states = useMemo(() => availableBudgetStates(budget), [budget]);
  const [nextState, setNextState] = useState(initialState && states.includes(initialState) ? initialState : states[0] || "");
  const [observation, setObservation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function confirmChange() {
    const note = observation.trim();
    if (!states.includes(nextState)) { setError("Seleccioná un estado permitido."); return; }
    if (nextState === "Rechazado" && !note) { setError("Ingresá el motivo del rechazo."); return; }
    if (note.length > 500) { setError("La observación no puede superar 500 caracteres."); return; }
    setSaving(true); setError("");
    try {
      await cambiarEstadoPresupuesto(budget.presupuestoComercialId, nextState, note || undefined);
      onChanged(`Presupuesto ${budgetNumber(budget)} actualizado a ${nextState}.`, nextState);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo cambiar el estado."); setSaving(false); }
  }
  return <Modal title="Cambiar estado" subtitle={`${budgetNumber(budget)} · Estado actual: ${budget.estado}`} onClose={() => { if (!saving) onClose(); }}>
    <div className="product-state-dialog budget-state-dialog">
      {error && <div className="product-form-alert" role="alert"><Ban size={17}/><span>{error}</span></div>}
      {isBudgetExpired(budget) && <div className="budget-expiry-dialog-note"><AlertTriangle size={18}/><p>La fecha de vencimiento ya transcurrió. El estado almacenado sigue siendo <strong>{budget.estado}</strong>; solo se muestran transiciones admitidas por el backend.</p></div>}
      <div className="product-state-message"><RefreshCw size={21}/><p>Seleccioná la transición que querés aplicar. La operación quedará registrada en el historial del presupuesto.</p></div>
      <label className="product-field"><span>Nuevo estado <b>*</b></span><select value={nextState} disabled={saving} onChange={(event) => { setNextState(event.target.value); setError(""); }}>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
      <label className={`product-field ${error && nextState === "Rechazado" && !observation.trim() ? "field-invalid" : ""}`}><span>{nextState === "Rechazado" ? "Motivo del rechazo" : "Observación"}{nextState === "Rechazado" && <b> *</b>}</span><textarea maxLength={500} value={observation} onChange={(event) => { setObservation(event.target.value); setError(""); }} placeholder={nextState === "Rechazado" ? "Indicá el motivo" : "Información adicional (opcional)"}/><small>{observation.length}/500</small></label>
      <footer><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Cancelar</button><button type="button" className="button primary" disabled={saving || !nextState} onClick={() => void confirmChange()}>{saving ? "Guardando…" : "Confirmar cambio"}</button></footer>
    </div>
  </Modal>;
}
