import { useState } from "react";
import { ArchiveRestore, Ban, Power } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { formatSupplyName } from "../../../../services/supplyDisplay";
import { suppliesApi, type Lookup, type Supply } from "../../../../services/suppliesApi";

type Props = { supply: Supply; reasons: Lookup[]; onClose: () => void; onChanged: (message: string) => void };

export function SupplyStateDialog({ supply, reasons, onClose, onChanged }: Props) {
  const action = supply.activo ? "deactivate" : "activate";
  const [reasonId, setReasonId] = useState("");
  const [observation, setObservation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirmChange() {
    if (action === "deactivate" && !reasonId) { setError("Seleccioná un motivo de inactivación."); return; }
    if (observation && !observation.trim()) { setError("La observación no puede contener solo espacios."); return; }
    if (observation.trim().length > 250) { setError("La observación no puede superar 250 caracteres."); return; }
    setSaving(true); setError("");
    try {
      if (action === "deactivate") await suppliesApi.deactivate(supply.insumoId, Number(reasonId), observation.trim() || undefined);
      else await suppliesApi.activate(supply.insumoId);
      onChanged(action === "deactivate" ? "Insumo inactivado correctamente." : "Insumo reactivado correctamente.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo actualizar el estado del insumo."); setSaving(false); }
  }

  return <Modal title={action === "deactivate" ? "Inactivar insumo" : "Reactivar insumo"} subtitle={`${supply.codigo} · ${formatSupplyName(supply)}`} onClose={() => { if (!saving) onClose(); }}>
    <div className="product-state-dialog">
      {error && <div className="product-form-alert" role="alert"><Ban size={17}/><span>{error}</span></div>}
      {action === "deactivate" ? <>
        <div className="product-state-intro"><Power size={20}/><p>¿Estás seguro de que querés inactivar <strong>{formatSupplyName(supply)}</strong>? El insumo dejará de estar disponible para los procesos que lo consultan.</p></div>
        <label className={`product-field ${error && !reasonId ? "field-invalid" : ""}`}><span>Motivo de inactivación <b>*</b></span><select value={reasonId} onChange={(event) => { setReasonId(event.target.value); setError(""); }}><option value="">Seleccioná un motivo</option>{reasons.map((reason) => <option key={reason.id} value={reason.id}>{reason.descripcion}</option>)}</select></label>
        <label className="product-field"><span>Observación</span><textarea maxLength={250} value={observation} onChange={(event) => { setObservation(event.target.value); setError(""); }} placeholder="Información adicional (opcional)"/><small>{observation.length}/250</small></label>
      </> : <div className="product-state-message"><ArchiveRestore size={22}/><p>El insumo volverá a estar activo y disponible para los procesos que lo consultan.</p></div>}
      <footer><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Cancelar</button><button type="button" className={action === "deactivate" ? "button danger" : "button primary"} disabled={saving} onClick={() => void confirmChange()}>{saving ? "Guardando…" : action === "deactivate" ? "Inactivar insumo" : "Reactivar insumo"}</button></footer>
    </div>
  </Modal>;
}
