import { useEffect, useState } from 'react';
import { Modal } from '../../components/data/Modal';
import { apiErrorMessage } from '../../services/apiClient';
import { salesCustomersApi, type Lookup } from '../../services/salesCustomersApi';
import type { SalesCustomer } from '../../services/salesOrdersApi';

export function CustomerStateDialog({ customer, onClose, onChanged }: {
  customer: SalesCustomer; onClose: () => void; onChanged: (message: string) => void;
}) {
  const [reasons, setReasons] = useState<Lookup[]>([]);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(customer.activo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (!customer.activo) return;
    let active = true;
    void salesCustomersApi.inactivationReasons().then(rows => { if (active) setReasons(rows); })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar los motivos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customer.activo]);
  async function submit() {
    if (saving) return;
    if (customer.activo && !reason) { setError('Seleccioná un motivo de inactivación.'); return; }
    setSaving(true); setError('');
    try {
      if (customer.activo) await salesCustomersApi.inactivate(customer.clienteId, { motivoInactivacionId: Number(reason), observacionInactivacion: note.trim() || null });
      else await salesCustomersApi.activate(customer.clienteId);
      onChanged(customer.activo ? 'Cliente inactivado. Sus antecedentes se conservaron.' : 'Cliente reactivado.');
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo cambiar el estado del cliente.')); setSaving(false); }
  }
  return <Modal title={customer.activo ? 'Inactivar cliente' : 'Reactivar cliente'} onClose={saving ? () => {} : onClose}>
    <div className="customer-state-dialog"><p>{customer.activo ? 'El cliente dejará de estar disponible para nuevas operaciones. Sus antecedentes se conservan.' : 'El cliente volverá a estar disponible para nuevas operaciones.'}</p>
      {error && <div className="product-form-alert" role="alert">{error}</div>}
      {customer.activo && <><label className="product-field"><span>Motivo *</span><select value={reason} disabled={loading || saving} onChange={event => setReason(event.target.value)}><option value="">Seleccionar</option>{reasons.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><label className="product-field"><span>Observación</span><textarea maxLength={250} rows={3} value={note} disabled={saving} onChange={event => setNote(event.target.value)}/></label></>}
      <div className="customer-dialog-actions"><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Cancelar</button><button type="button" className="button primary" disabled={saving || loading} onClick={() => void submit()}>{saving ? 'Guardando…' : customer.activo ? 'Inactivar cliente' : 'Reactivar cliente'}</button></div>
    </div>
  </Modal>;
}
