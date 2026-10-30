import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Pencil, Plus, Power, RefreshCw } from 'lucide-react';
import { Modal } from '../../components/data/Modal';
import { StatusBadge } from '../../components/data/StatusBadge';
import { apiErrorMessage } from '../../services/apiClient';
import { salesCustomersApi, type CustomerAddress, type CustomerAddressPayload } from '../../services/salesCustomersApi';
import { cleanAddress, CustomerAddressFields, emptyAddress, useAddressCatalog, validateAddress, type AddressErrors } from './CustomerAddressFields';

type Props = {
  customerId: number;
  customerActive: boolean;
  readOnly?: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canInactivate: boolean;
  onFeedback: (message: string, error?: boolean) => void;
};

export function CustomerAddresses({ customerId, customerActive, readOnly = false, canCreate, canEdit, canInactivate, onFeedback }: Props) {
  const feedbackRef = useRef(onFeedback);
  feedbackRef.current = onFeedback;
  const [items, setItems] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<CustomerAddress | null | undefined>();
  const [form, setForm] = useState<CustomerAddressPayload>(emptyAddress);
  const [initialForm, setInitialForm] = useState<CustomerAddressPayload>(emptyAddress);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [confirm, setConfirm] = useState<CustomerAddress | null>(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AddressErrors>({});
  const catalog = useAddressCatalog(form.provinciaId, editor !== undefined);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await salesCustomersApi.addresses(customerId)); }
    catch (cause) { feedbackRef.current(apiErrorMessage(cause, 'No se pudieron consultar las direcciones.'), true); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { void load(); }, [load]);

  function open(item?: CustomerAddress) {
    setEditor(item ?? null);
    const next = item ? {
      tipoDomicilioId: item.tipoDomicilioId ?? 0, calle: item.calle, altura: item.altura,
      pisoDepto: item.pisoDepto, barrio: item.barrio, codigoPostal: item.codigoPostal,
      localidadId: item.localidadId, provinciaId: item.provinciaId,
    } : { ...emptyAddress };
    setForm(next); setInitialForm(next); setDiscardOpen(false);
    setFormError(''); setFieldErrors({});
  }
  function closeEditor() {
    if (saving) return;
    if (JSON.stringify(form) !== JSON.stringify(initialForm)) setDiscardOpen(true);
    else setEditor(undefined);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    const missing = validateAddress(form, catalog.types, catalog.provinces, catalog.localities, editor?.tipoDomicilioId);
    setFieldErrors(missing);
    if (Object.keys(missing).length) return;
    setSaving(true); setFormError('');
    const payload = cleanAddress(form);
    try {
      if (editor) await salesCustomersApi.updateAddress(editor.domicilioClienteId, payload);
      else await salesCustomersApi.createAddress(customerId, payload);
      await load(); setEditor(undefined); setDiscardOpen(false);
      onFeedback(editor ? 'Dirección actualizada.' : 'Dirección registrada.');
    } catch (cause) { setFormError(apiErrorMessage(cause, 'No se pudo guardar la dirección.')); }
    finally { setSaving(false); }
  }
  async function changeState(item: CustomerAddress) {
    if (saving) return;
    setSaving(true);
    try {
      if (item.activo) await salesCustomersApi.inactivateAddress(item.domicilioClienteId);
      else await salesCustomersApi.activateAddress(item.domicilioClienteId);
      await load(); setConfirm(null);
      onFeedback(item.activo ? 'Dirección inactivada.' : 'Dirección reactivada.');
    } catch (cause) { onFeedback(apiErrorMessage(cause, 'No se pudo cambiar el estado de la dirección.'), true); }
    finally { setSaving(false); }
  }

  return <section className="product-form-section customer-section sales-addresses-section">
    <header><span><MapPin size={18}/></span><div><h2>Direcciones</h2><p>{loading ? 'Consultando…' : `${items.length} registrada${items.length === 1 ? '' : 's'}`}</p></div>
      {!readOnly && customerActive && canCreate && <button type="button" className="button secondary customer-section-link" onClick={() => open()}><Plus size={15}/> Agregar dirección</button>}
    </header>
    {!loading && !items.length && <p className="sales-muted-hint">Este cliente todavía no tiene direcciones registradas.</p>}
    <div className="sales-addresses-list">{items.map(item => <article key={item.domicilioClienteId} className="sales-address-item">
      <MapPin size={17}/><div><div className="sales-address-title"><strong>{item.tipoDomicilio}</strong><StatusBadge tone={item.activo ? 'success' : 'neutral'}>{item.activo ? 'Activo' : 'Inactivo'}</StatusBadge></div>
        <span>{item.calle} {item.altura}{item.pisoDepto ? `, ${item.pisoDepto}` : ''}{item.barrio ? ` · ${item.barrio}` : ''}</span>
        <span>{item.localidadNombre}, {item.provinciaNombre}{item.codigoPostal ? ` · CP ${item.codigoPostal}` : ''}</span></div>
      {!readOnly && <div className="sales-address-actions">
        {canEdit && <button type="button" className="icon-button" aria-label="Modificar dirección" onClick={() => open(item)}><Pencil size={15}/></button>}
        {(item.activo ? canInactivate : canEdit) && <button type="button" className="icon-button" aria-label={item.activo ? 'Inactivar dirección' : 'Reactivar dirección'} onClick={() => item.activo ? setConfirm(item) : void changeState(item)}>{item.activo ? <Power size={15}/> : <RefreshCw size={15}/>}</button>}
      </div>}
    </article>)}</div>
    {editor !== undefined && <Modal wide title={editor ? 'Modificar dirección' : 'Registrar dirección'} onClose={closeEditor}>
      <form className="sales-address-form" onSubmit={event => void save(event)}>
        {(formError || catalog.error) && <div className="sales-customers-error" role="alert">{formError || catalog.error}</div>}
        {!catalog.loading && !catalog.types.some(type => type.activo) && !editor && <p className="sales-muted-hint">No hay tipos de domicilio activos. Configuralos en Administración → Configuración → Ventas → Tipos de domicilio.</p>}
        <CustomerAddressFields value={form} onChange={next => { setForm(next); setFieldErrors({}); setFormError(''); }} types={catalog.types} provinces={catalog.provinces} localities={catalog.localities} errors={fieldErrors} existingTypeId={editor?.tipoDomicilioId} disabled={catalog.loading || saving}/>
        <div className="sales-customers-actions"><button type="button" className="button secondary" disabled={saving} onClick={closeEditor}>Cancelar</button><button type="submit" className="button primary" disabled={saving || catalog.loading || Boolean(catalog.error) || (!editor && !catalog.types.some(type => type.activo))}>{saving ? 'Guardando…' : 'Guardar dirección'}</button></div>
      </form>
    </Modal>}
    {discardOpen && <Modal title="Descartar cambios" onClose={() => setDiscardOpen(false)}><div className="customer-state-dialog"><p>Hay cambios sin guardar en la dirección.</p><div className="sales-customers-actions"><button type="button" className="button secondary" onClick={() => setDiscardOpen(false)}>Seguir editando</button><button type="button" className="button danger" onClick={() => { setDiscardOpen(false); setEditor(undefined); }}>Descartar cambios</button></div></div></Modal>}
    {confirm && <Modal title="Inactivar dirección" onClose={() => !saving && setConfirm(null)}>
      <div className="customer-state-dialog"><p>La dirección dejará de estar disponible para nuevos pedidos. ¿Querés inactivar <strong>{confirm.tipoDomicilio}</strong>?</p>
        <div className="sales-customers-actions"><button type="button" className="button secondary" disabled={saving} onClick={() => setConfirm(null)}>Cancelar</button><button type="button" className="button primary" disabled={saving} onClick={() => void changeState(confirm)}>{saving ? 'Inactivando…' : 'Inactivar dirección'}</button></div></div>
    </Modal>}
  </section>;
}
