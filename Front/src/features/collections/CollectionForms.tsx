import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { FormField } from '../../components/ui/FormField';
import { ApiError, apiErrorMessage } from '../../services/apiClient';
import { collectionsApi, type CollectionLookup, type CollectionMethod } from '../../services/collectionsApi';
import type { SalesCollection, SalesOrderBalance } from '../../services/salesOrdersApi';
import { salesOrdersApi } from '../../services/salesOrdersApi';
import { ars } from '../sales/salesOrderUtils';
import { collectionAvailability, collectionPreview } from './collectionAmounts';

const moneyPattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const percentPattern = /^\d{1,3}(?:[.,]\d{1,2})?$/;
const parseDecimal = (value: string) => Number(value.replace(',', '.'));
const isCash = (value: string) => /^efectivo$/i.test(value.trim());
const isCreditCard = (value: string) => /^tarjeta cr[eé]dito$/i.test(value.trim());
const cents = (value: number) => Math.round(value * 100);

type RegisterErrors = { amount?: string; method?: string; reference?: string; surcharge?: string; observations?: string; box?: string };

export function RegisterCollectionForm({ orderId, customerId, customerName, collections, editing, onSaved, onCancel }: {
  orderId: number; customerId: number; customerName: string; collections: SalesCollection[]; editing?: SalesCollection;
  onSaved: () => Promise<void>; onCancel: () => void;
}) {
  const [methods, setMethods] = useState<CollectionMethod[]>([]);
  const [boxes, setBoxes] = useState<CollectionLookup[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupError, setLookupError] = useState('');
  const [methodId, setMethodId] = useState(editing ? String(editing.medioCobroId) : '');
  const [boxId, setBoxId] = useState(editing?.cajaId ? String(editing.cajaId) : '');
  const [amount, setAmount] = useState(editing ? editing.importeBase.toFixed(2).replace('.', ',') : '');
  const [balance, setBalance] = useState<SalesOrderBalance | null>(null);
  const [currentCollections, setCurrentCollections] = useState(collections);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');
  const amountEdited = useRef(Boolean(editing));
  const [editingLoading, setEditingLoading] = useState(Boolean(editing));
  const [editingError, setEditingError] = useState('');
  const [surcharge, setSurcharge] = useState(editing && editing.porcentajeAplicado > 0 ? String(editing.porcentajeAplicado).replace('.', ',') : '0');
  const [reference, setReference] = useState(editing?.referenciaExterna ?? '');
  const [observations, setObservations] = useState(editing?.observaciones ?? '');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const method = methods.find(item => item.id === Number(methodId));
  const amountValue = parseDecimal(amount.trim());
  const validAmount = moneyPattern.test(amount.trim()) && Number.isFinite(amountValue) && amountValue > 0;
  const validRate = percentPattern.test(surcharge.trim()) && parseDecimal(surcharge.trim()) <= 100;
  const availability = balance ? collectionAvailability(balance, currentCollections, editing?.cobroId) : null;
  const preview = validAmount && method && balance && (!isCreditCard(method.descripcion) || validRate)
    ? collectionPreview(amountValue, method.descripcion, parseDecimal(surcharge.trim()) || 0, balance, currentCollections, editing?.cobroId)
    : null;

  useEffect(() => {
    let active = true;
    Promise.all([collectionsApi.methods(), collectionsApi.cashBoxes()])
      .then(([methodItems, boxItems]) => { if (active) { setMethods(methodItems); setBoxes(boxItems); } })
      .catch(error => { if (active) setLookupError(apiErrorMessage(error, 'No se pudieron consultar los medios de cobro.')); })
      .finally(() => { if (active) setLookupsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([salesOrdersApi.balance(orderId), salesOrdersApi.collections()])
      .then(([result, allCollections]) => {
        if (!active) return;
        setBalance(result);
        const orderCollections = allCollections.filter(item => item.pedidoId === orderId);
        setCurrentCollections(orderCollections);
        if (!amountEdited.current) setAmount(collectionAvailability(result, orderCollections, editing?.cobroId).available.toFixed(2).replace('.', ','));
      })
      .catch(error => { if (active) setBalanceError(apiErrorMessage(error, 'No se pudo consultar el saldo del pedido.')); })
      .finally(() => { if (active) setBalanceLoading(false); });
    return () => { active = false; };
  }, [orderId, editing?.cobroId]);

  useEffect(() => {
    if (editing || boxId || boxes.length === 0 || !method || !isCash(method.descripcion)) return;
    const principal = boxes.find(item => /caja\s+principal|^principal$/i.test(item.descripcion.trim()));
    if (principal) setBoxId(String(principal.id));
  }, [boxes, boxId, editing, method]);

  useEffect(() => {
    if (!editing) return;
    let active = true;
    collectionsApi.get(editing.cobroId)
      .then(current => {
        if (!active) return;
        if (current.pedidoId !== orderId || current.clienteId !== customerId || !/^pendiente$/i.test(current.estadoCobroNombre.trim())) {
          setEditingError('El cobro ya no está pendiente o no corresponde a este pedido. Actualizá la ficha.');
          return;
        }
        setMethodId(String(current.medioCobroId));
        setBoxId(current.cajaId ? String(current.cajaId) : '');
        setAmount(current.importeBase.toFixed(2).replace('.', ','));
        setSurcharge(current.porcentajeAplicado > 0 ? String(current.porcentajeAplicado).replace('.', ',') : '0');
        setReference(current.referenciaExterna ?? '');
        setObservations(current.observaciones ?? '');
      })
      .catch(error => { if (active) setEditingError(error instanceof ApiError && error.status === 404 ? 'El cobro ya no existe. Actualizá la ficha.' : apiErrorMessage(error, 'No se pudo verificar el cobro pendiente.')); })
      .finally(() => { if (active) setEditingLoading(false); });
    return () => { active = false; };
  }, [editing, orderId, customerId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!balance || balanceError || balanceLoading || editingLoading || editingError) return;
    const next: RegisterErrors = {};
    const value = parseDecimal(amount.trim());
    const rate = parseDecimal(surcharge.trim());
    if (!moneyPattern.test(amount.trim()) || !Number.isFinite(value) || value <= 0) next.amount = 'Ingresá un importe mayor a cero, con hasta dos decimales.';
    else if (!availability || cents(value) > cents(availability.available)) next.amount = 'El importe supera lo disponible; otros cobros pendientes ya comprometen parte del saldo.';
    if (!method) next.method = 'Seleccioná un medio de cobro.';
    if (method && isCash(method.descripcion) && (!boxId || !boxes.some(item => item.id === Number(boxId)))) next.box = 'Seleccioná una caja válida para el efectivo.';
    if (method?.requiereReferencia && !reference.trim()) next.reference = 'Este medio requiere una referencia.';
    else if (reference.trim().length > 100) next.reference = 'La referencia no puede superar 100 caracteres.';
    if (observations.length > 500) next.observations = 'Las observaciones no pueden superar 500 caracteres.';
    if (method && isCreditCard(method.descripcion)) {
      if (!percentPattern.test(surcharge.trim()) || !Number.isFinite(rate) || rate < 0 || rate > 100) next.surcharge = 'Ingresá un recargo entre 0 y 100%, con hasta dos decimales.';
    }
    setErrors(next);
    setSubmitError('');
    if (Object.keys(next).length || !method) return;
    submitting.current = true;
    setSaving(true);
    try {
      const [current, allCollections] = await Promise.all([salesOrdersApi.balance(orderId), salesOrdersApi.collections()]);
      setBalance(current);
      const orderCollections = allCollections.filter(item => item.pedidoId === orderId);
      setCurrentCollections(orderCollections);
      const currentAvailable = collectionAvailability(current, orderCollections, editing?.cobroId).available;
      if (cents(value) > cents(currentAvailable) || currentAvailable <= 0) {
        setErrors(previous => ({ ...previous, amount: 'El importe disponible cambió o ya está comprometido. Revisá los cobros pendientes.' }));
        return;
      }
      if (editing) {
        const fresh = await collectionsApi.get(editing.cobroId);
        if (fresh.pedidoId !== orderId || fresh.clienteId !== customerId || !/^pendiente$/i.test(fresh.estadoCobroNombre.trim())) {
          setEditingError('Este cobro ya no está pendiente. Actualizá la ficha.');
          return;
        }
      }
      const payload = {
        cajaId: isCash(method.descripcion) && boxId ? Number(boxId) : null,
        medioCobroId: method.id, importeBase: value,
        porcentajeRecargoTarjeta: isCreditCard(method.descripcion) ? rate : 0,
        referenciaExterna: reference.trim() || null, observaciones: observations.trim() || null,
      };
      if (editing) await collectionsApi.updatePending(editing.cobroId, payload);
      else await collectionsApi.register({ clienteId: customerId, pedidoId: orderId, ...payload });
      await onSaved();
    } catch (error) {
      setSubmitError(apiErrorMessage(error, 'No se pudo registrar el cobro. Revisá los datos e intentá nuevamente.'));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <form className="sales-card sales-collection-form" onSubmit={event => void submit(event)} noValidate>
    <div className="sales-collection-form-head"><div><h3>{editing ? 'Editar cobro pendiente' : 'Registrar cobro'}</h3><p>Pedido de {customerName}</p></div><strong>Disponible: {balanceLoading ? 'Consultando…' : availability ? ars.format(availability.available) : 'No disponible'}</strong></div>
    {lookupError && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{lookupError}</span></div>}
    {balanceError && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{balanceError} Actualizá el pedido para reintentar.</span></div>}
    {availability && availability.available <= 0 && <div className="sales-warning" role="status"><AlertCircle size={17}/><span>No hay importe disponible para {editing ? 'editar este cobro' : 'registrar otro cobro'}. Revisá los cobros pendientes o actualizá la ficha.</span></div>}
    {editingError && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{editingError}</span></div>}
    {submitError && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{submitError}</span></div>}
    {availability && <p className="sales-section-help">Saldo por cobrar: <strong>{ars.format(balance!.saldo)}</strong>{availability.pendingBase > 0 && <> · Pendiente de confirmación: {ars.format(availability.pendingBase)}</>}</p>}
    <div className="sales-collection-fields sales-collection-modal-fields">
      {method && isCash(method.descripcion) && <label className="sales-collection-field"><span>Caja</span><select value={boxId} onChange={event => { setBoxId(event.target.value); setErrors(current => ({ ...current, box: undefined })); }} disabled={saving || lookupsLoading || editingLoading || Boolean(editingError)}><option value="">Seleccionar caja</option>{boxes.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.box && <small className="field-error">{errors.box}</small>}</label>}
      <label className="sales-collection-field"><span>Medio de cobro</span><select value={methodId} onChange={event => { setMethodId(event.target.value); setBoxId(''); setSurcharge('0'); setReference(''); setErrors(current => ({ ...current, method: undefined, surcharge: undefined })); }} disabled={saving || lookupsLoading || editingLoading || Boolean(editingError)}><option value="">Seleccionar medio</option>{methods.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.method && <small className="field-error">{errors.method}</small>}</label>
      <div className="sales-collection-wide sales-collection-amount"><FormField label="Importe del cobro" inputMode="decimal" value={amount} onChange={event => { amountEdited.current = true; setAmount(event.target.value); setErrors(current => ({ ...current, amount: undefined })); }} error={errors.amount} placeholder="0,00" disabled={saving || balanceLoading || editingLoading || Boolean(balanceError || editingError)}/></div>
      {method && isCreditCard(method.descripcion) && <FormField label="Recargo de tarjeta (%)" inputMode="decimal" value={surcharge} onChange={event => { setSurcharge(event.target.value); setErrors(current => ({ ...current, surcharge: undefined })); }} error={errors.surcharge} disabled={saving || editingLoading || Boolean(editingError)}/>}
      {method?.requiereReferencia && <FormField label="N.º de transacción" value={reference} onChange={event => { setReference(event.target.value); setErrors(current => ({ ...current, reference: undefined })); }} error={errors.reference} maxLength={101} disabled={saving || editingLoading || Boolean(editingError)}/>}
    </div>
    {availability && validAmount && cents(amountValue) <= cents(availability.available) && method && <div className="sales-collection-preview sales-collection-modal-preview" aria-live="polite">
      <div><span>Importe original</span><strong>{ars.format(amountValue)}</strong></div>
      <div><span>{preview && preview.adjustment < 0 ? 'Descuento' : preview && preview.adjustment > 0 ? 'Recargo' : 'Ajuste'}</span><strong className={preview?.adjustment && preview.adjustment < 0 ? 'sales-discount-value' : preview?.adjustment && preview.adjustment > 0 ? 'sales-surcharge-value' : ''}>{preview ? `${preview.adjustment > 0 ? '+' : ''}${ars.format(preview.adjustment)}` : '—'}</strong></div>
      <div className="sales-collection-preview-total"><span>Total a cobrar</span><strong>{preview ? ars.format(preview.final) : '—'}</strong></div>
      <div><span>Saldo posterior al cobro</span><strong>{preview ? ars.format(preview.remainingBalanceIfConfirmed) : '—'}</strong></div>
    </div>}
    <label className="sales-collection-field sales-collection-modal-observations"><span>Observaciones (opcional)</span><textarea rows={2} value={observations} onChange={event => { setObservations(event.target.value); setErrors(current => ({ ...current, observations: undefined })); }} disabled={saving || editingLoading || Boolean(editingError)} placeholder="Agregar una aclaración sobre el cobro…"/>{errors.observations && <small className="field-error">{errors.observations}</small>}</label>
    <div className="sales-collection-actions"><button type="button" className="button secondary" onClick={onCancel} disabled={saving}>Cancelar</button><button type="submit" className="button primary" disabled={saving || balanceLoading || !balance || Boolean(balanceError) || (availability?.available ?? 0) <= 0 || editingLoading || Boolean(editingError) || lookupsLoading || Boolean(lookupError)}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar cobro'}</button></div>
  </form>;
}

export function ConfirmCollectionForm({ collection, orderId, onSaved, onCancel }: {
  collection: SalesCollection; orderId: number; onSaved: () => Promise<void>; onCancel: () => void;
}) {
  const [currentCollection, setCurrentCollection] = useState<SalesCollection | null>(null);
  const [balance, setBalance] = useState<SalesOrderBalance | null>(null);
  const [checking, setChecking] = useState(true);
  const [preflightError, setPreflightError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([collectionsApi.get(collection.cobroId), salesOrdersApi.balance(orderId)])
      .then(([freshCollection, freshBalance]) => {
        if (!active) return;
        if (freshCollection.pedidoId !== orderId || !/^pendiente$/i.test(freshCollection.estadoCobroNombre.trim())) {
          setPreflightError('Este cobro ya no está pendiente o no corresponde al pedido. Actualizá la ficha.');
          return;
        }
        setCurrentCollection(freshCollection);
        setBalance(freshBalance);
      })
      .catch(requestError => { if (active) setPreflightError(requestError instanceof ApiError && requestError.status === 404 ? 'El cobro ya no existe. Actualizá la ficha.' : apiErrorMessage(requestError, 'No se pudo verificar el cobro y el saldo actual.')); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [collection.cobroId, orderId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || checking || preflightError || !currentCollection || !balance) return;
    setError('');
    submitting.current = true;
    setSaving(true);
    try {
      const [freshCollection, freshBalance] = await Promise.all([collectionsApi.get(collection.cobroId), salesOrdersApi.balance(orderId)]);
      if (freshCollection.pedidoId !== orderId || !/^pendiente$/i.test(freshCollection.estadoCobroNombre.trim())) {
        setPreflightError('Este cobro ya no está pendiente. Actualizá la ficha antes de continuar.');
        return;
      }
      setCurrentCollection(freshCollection);
      setBalance(freshBalance);
      // El stock ya se descontó al confirmar el pedido. Cada seña se confirma por separado.
      await collectionsApi.confirm(collection.cobroId, { depositoId: null, observaciones: null });
      await onSaved();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se pudo confirmar el cobro. Intentá nuevamente.'));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <form className="sales-card sales-collection-form" onSubmit={event => void submit(event)} noValidate>
    <div className="sales-collection-form-head"><div><h3>Confirmar cobro</h3><p>{currentCollection?.medioCobroNombre ?? collection.medioCobroNombre} · {ars.format(currentCollection?.importeFinal ?? collection.importeFinal)}</p></div></div>
    <p className="sales-section-help">La confirmación acredita este cobro, incluso si es una seña. El stock ya fue descontado al confirmar el pedido.</p>
    {checking && <p className="sales-section-help">Verificando cobro y saldo actual…</p>}
    {preflightError && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{preflightError}</span></div>}
    {error && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}
    {balance && <p className="sales-collection-balance">Saldo por cobrar actual: <strong>{ars.format(balance.saldo)}</strong></p>}
    <div className="sales-collection-actions"><button type="button" className="button secondary" onClick={onCancel} disabled={saving}>Cancelar</button><button type="submit" className="button primary" disabled={saving || checking || !currentCollection || !balance || Boolean(preflightError)}>{saving ? 'Confirmando…' : 'Confirmar cobro'}</button></div>
  </form>;
}

export function AnnulCollectionForm({ collection, orderId, onSaved, onCancel }: {
  collection: SalesCollection; orderId: number; onSaved: () => Promise<void>; onCancel: () => void;
}) {
  const [observations, setObservations] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (observations.trim().length > 250) {
      setFieldError('La observación no puede superar 250 caracteres.');
      return;
    }
    setFieldError('');
    setError('');
    submitting.current = true;
    setSaving(true);
    try {
      const current = await collectionsApi.get(collection.cobroId);
      if (current.pedidoId !== orderId || !/^pendiente$/i.test(current.estadoCobroNombre.trim())) {
        setError('Este cobro ya no está pendiente o no corresponde al pedido. Actualizá la ficha.');
        return;
      }
      await collectionsApi.annulPending(collection.cobroId, { observaciones: observations.trim() || null });
      await onSaved();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se pudo anular el cobro. Revisá su estado e intentá nuevamente.'));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <form className="sales-card sales-collection-form" onSubmit={event => void submit(event)} noValidate>
    <div className="sales-collection-form-head"><div><h3>Anular cobro pendiente</h3><p>{collection.medioCobroNombre} · {ars.format(collection.importeFinal)}</p></div></div>
    <p className="sales-section-help">El cobro dejará de comprometer el saldo. Esta acción no modifica los cobros confirmados.</p>
    {error && <div className="sales-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}
    <label className="sales-collection-field"><span>Observación (opcional)</span><textarea value={observations} onChange={event => { setObservations(event.target.value); setFieldError(''); }} disabled={saving} maxLength={251}/>{fieldError && <small className="field-error">{fieldError}</small>}</label>
    <div className="sales-collection-actions"><button type="button" className="button secondary" onClick={onCancel} disabled={saving}>Cancelar</button><button type="submit" className="button danger" disabled={saving}>{saving ? 'Anulando…' : 'Anular cobro'}</button></div>
  </form>;
}
