import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Printer, Mail } from 'lucide-react';
import { apiErrorMessage } from '../../services/apiClient';
import { salesOrdersApi, type SalesDocumentDetail, type DocumentEmailHistory, type SalesOrderDetail, type SalesDeliveryNote, type SalesDeliveryNoteDetail } from '../../services/salesOrdersApi';
import { ars, dateTime, decimal } from './salesOrderUtils';
import { canConfirmDelivery, canIssueDeliveryNote } from './salesOperationRules';

export function DocumentDetail({ id, order }: { id: number; order: SalesOrderDetail }) {
  const [document, setDocument] = useState<SalesDocumentDetail | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [recipient, setRecipient] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [history, setHistory] = useState<DocumentEmailHistory[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    let active = true;
    setDocument(null); setError(''); setSuccess(''); setHistory([]); setHistoryError('');
    salesOrdersApi.document(id).then(value => {
      if (!active) return;
      if (value.pedidoId !== order.pedidoId) setError('El comprobante no corresponde a este pedido.');
      else setDocument(value);
    }).catch(err => { if (active) setError(apiErrorMessage(err, 'No se pudo consultar el comprobante.')); });
    salesOrdersApi.documentEmailHistory(id).then(value => { if (active) setHistory(value); })
      .catch(err => { if (active) setHistoryError(apiErrorMessage(err, 'No se pudo consultar el historial de envíos.')); });
    salesOrdersApi.customers().then(customers => {
      if (!active) return;
      const email = customers.find(c => c.clienteId === order.clienteId)?.email?.trim() || '';
      setCustomerEmail(email); setRecipient(email);
    }).catch(() => { /* El correo puede ingresarse manualmente. */ });
    return () => { active = false; };
  }, [id, order.pedidoId, order.clienteId]);

  async function openPdf() {
    if (!document || loadingPdf) return;
    setError(''); setLoadingPdf(true);
    // Abrir la pestaña inmediatamente desde el clic evita bloqueos de ventanas emergentes.
    const tab = window.open('', '_blank');
    if (tab) { tab.document.title = 'Preparando comprobante TEKA…'; tab.document.body.textContent = 'Preparando PDF…'; }
    try {
      const pdf = await salesOrdersApi.documentPdf(id);
      const url = URL.createObjectURL(pdf);
      if (tab && !tab.closed) { tab.location.href = url; setTimeout(() => URL.revokeObjectURL(url), 120000); }
      else {
        const link = window.document.createElement('a'); link.href = url;
        link.download = `TEKA-Comprobante-${id}.pdf`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 120000);
        setSuccess('PDF descargado. Abrilo para imprimirlo.');
      }
    } catch (err) { if (tab && !tab.closed) tab.close(); setError(apiErrorMessage(err, 'No se pudo abrir el PDF.')); }
    finally { setLoadingPdf(false); }
  }

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const email = recipient.trim();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Ingresá una dirección de correo válida.'); return; }
    setSending(true); setError(''); setSuccess('');
    try {
      await salesOrdersApi.sendDocumentEmail(id, email);
      setSuccess(`Comprobante enviado a ${email}.`); setEmailOpen(false);
      try { setHistory(await salesOrdersApi.documentEmailHistory(id)); setHistoryError(''); }
      catch (err) { setHistoryError(apiErrorMessage(err, 'No se pudo actualizar el historial.')); }
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo enviar el comprobante. Consultá el historial antes de reintentar.'));
      try { setHistory(await salesOrdersApi.documentEmailHistory(id)); } catch { /* conservar historial anterior */ }
    } finally { setSending(false); }
  }

  return <section className="sales-card sales-operation-panel sales-document-detail">
    {error && <div className="sales-error" role="alert"><AlertCircle size={17}/>{error}</div>}
    {success && <p className="sales-document-success" role="status">{success}</p>}
    {!document && !error && <p className="sales-section-help">Consultando documento…</p>}
    {document && <>
      <div className="teka-document-sheet">
        <header className="teka-document-sheet-head">
          <div className="teka-document-issuer"><div className="teka-document-brand"><span className="teka-brand-emblem" aria-hidden="true">T</span><div><strong>TEKA</strong><span>MUEBLES · CÓRDOBA</span></div></div><small>Comprobante administrativo interno</small></div>
          <div className="teka-document-sheet-identification"><span>{/nota de cr[eé]dito/i.test(document.tipoComprobanteNombre) ? "NOTA DE CRÉDITO INTERNA · EGRESO" : "COMPROBANTE INTERNO DE VENTA · INGRESO"}</span><strong>N.º {String(document.puntoVenta).padStart(4, '0')}-{document.numeroComprobante === null ? 'S/N' : String(document.numeroComprobante).padStart(8, '0')}</strong><small>Emisión: {dateTime(document.fechaComprobante)}</small><small>Pedido: #{order.pedidoId}</small></div>
        </header>
        <div className="teka-document-sheet-parties"><div><small>Cliente</small><strong>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</strong></div><div><small>Estado del comprobante</small><strong>{document.estadoComprobante}</strong></div></div>
        <div className="teka-document-sheet-table-wrap"><table className="teka-document-sheet-table"><thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio unitario</th><th>Importe</th></tr></thead><tbody>{document.detalles.map(item => <tr key={item.detalleComprobanteId}><td>{item.descripcionItem}</td><td>{decimal.format(item.cantidad)}</td><td>{ars.format(item.precioUnitario)}</td><td>{ars.format(item.importeTotalItem)}</td></tr>)}</tbody></table></div>
        <div className="teka-document-sheet-totals"><strong>Total del comprobante</strong><strong>{ars.format(document.importeTotal)}</strong></div>
        {document.observaciones && <p className="teka-document-sheet-notes"><strong>Observaciones:</strong> {document.observaciones}</p>}
        <footer className="teka-document-sheet-disclaimer">Documento administrativo interno. No válido como factura fiscal. No constituye comprobante autorizado por ARCA.</footer>
      </div>
      <div className="sales-document-actions"><button type="button" className="button primary" disabled={loadingPdf} onClick={() => void openPdf()}><Printer size={16}/>{loadingPdf ? 'Preparando PDF…' : 'Imprimir / guardar PDF'}</button><button type="button" className="button secondary" onClick={() => { setEmailOpen(value => !value); setError(''); }}><Mail size={16}/>Enviar</button></div>
      {emailOpen && <form className="sales-document-email" onSubmit={event => void sendEmail(event)} noValidate><label className="sales-collection-field"><span>Correo destinatario *</span><input type="email" maxLength={254} required value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="cliente@correo.com" disabled={sending}/></label>{customerEmail && <small>Correo registrado del cliente: {customerEmail}</small>}<p className="sales-section-help">Se enviará el PDF del comprobante mediante el correo configurado en la API.</p><div className="sales-collection-actions"><button className="button secondary" type="button" onClick={() => setEmailOpen(false)} disabled={sending}>Cancelar</button><button className="button primary" type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Confirmar envío'}</button></div></form>}
      <div className="sales-document-history"><button type="button" className="teka-history-toggle" aria-expanded={historyExpanded} onClick={() => setHistoryExpanded(value => !value)}>Historial de envíos ({history.length}) {historyExpanded ? "−" : "+"}</button>{historyExpanded && <>{historyError && <p className="sales-section-help">{historyError}</p>}{!historyError && history.length === 0 && <p className="sales-section-help">Todavía no hay envíos registrados.</p>}{history.map(item => <div key={item.envioComprobanteCorreoId} className="sales-document-history-row"><div><strong>{item.destinatario}</strong><small>{dateTime(item.fechaSolicitud)}</small></div><span>{item.estado}</span>{item.mensajeError && <small className="sales-document-history-error">{item.mensajeError}</small>}</div>)}</>}</div>
    </>}
  </section>;
}

export function CreateDeliveryNoteForm({ orderId, onSaved, onCancel }: { orderId: number; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [address, setAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderPreview, setOrderPreview] = useState<SalesOrderDetail | null>(null);
  const [addressOptions, setAddressOptions] = useState<Array<{ id: number; text: string }>>([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    setLoadingPreview(true);
    salesOrdersApi.get(orderId).then(async order => {
      const addresses = await salesOrdersApi.customerAddresses(order.clienteId).catch(() => []);
      if (!active) return;
      setOrderPreview(order);
      const options = addresses.filter(item => item.activo).map(item => ({ id: item.domicilioClienteId, text: [item.direccion || [item.calle, item.altura].filter(Boolean).join(' '), item.localidadNombre, item.provinciaNombre].filter(Boolean).join(', ') }));
      setAddressOptions(options);
      if (options.length === 1) setAddress(options[0].text);
    }).catch(requestError => { if (active) setError(apiErrorMessage(requestError, 'No se pudo cargar el pedido.')); })
      .finally(() => { if (active) setLoadingPreview(false); });
    return () => { active = false; };
  }, [orderId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const next: Record<string, string> = {};
    if (!orderPreview) next.order = 'No se pudo consultar el pedido.';
    if (!address.trim()) next.address = 'Indicá el domicilio de entrega.';
    if (address.trim().length > 200) next.address = 'Máximo 200 caracteres.';
    if (observations.trim().length > 500) next.observations = 'Máximo 500 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true; setSaving(true); setError('');
    try {
      const [order, related] = await Promise.all([salesOrdersApi.get(orderId), salesOrdersApi.related(orderId)]);
      if (related.unavailable.includes('balance') || related.unavailable.includes('deliveryNotes')) throw new Error('No se pudo verificar saldo y remitos. Intentá nuevamente.');
      if (!canIssueDeliveryNote(order.estadoPedidoNombre, related.balance, related.documents, related.deliveryNotes)) throw new Error('El pedido debe estar confirmado, totalmente cobrado y sin remito previo.');
      await salesOrdersApi.createDeliveryNote({ pedidoId: orderId, numeroRemito: null, domicilioEntrega: address.trim() || null, observaciones: observations.trim() || null });
      await onSaved();
    } catch (requestError) { setError(apiErrorMessage(requestError, 'No se pudo emitir el remito.')); }
    finally { busy.current = false; setSaving(false); }
  }

  return createPortal(<div className="sales-remito-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) onCancel(); }}>
    <form className="sales-remito-modal" role="dialog" aria-modal="true" aria-labelledby="sales-remito-modal-title" onSubmit={event => void submit(event)} noValidate>
      <header className="sales-remito-modal-header">
        <div><h2 id="sales-remito-modal-title">REMITO</h2><div className="sales-remito-number">N.º <input aria-label="Número de remito" value="Se asignará al emitir" disabled readOnly /></div><p>Fecha: {new Intl.DateTimeFormat('es-AR').format(new Date())} · Pedido #{orderId}</p></div>
        <button type="button" className="sales-remito-modal-close" onClick={onCancel} disabled={saving} aria-label="Cerrar">×</button>
      </header>
      {error && <div className="sales-error" role="alert"><AlertCircle size={17}/>{error}</div>}
      {loadingPreview ? <p>Consultando pedido…</p> : orderPreview && <>
        <div className="sales-remito-modal-parties">
          <div><span className="sales-remito-modal-label">Destinatario</span><strong>{`${orderPreview.clienteNombre} ${orderPreview.clienteApellido ?? ''}`.trim()}</strong></div>
          <label className="sales-remito-modal-address"><span className="sales-remito-modal-label">Domicilio de entrega *</span>
            {addressOptions.length ? <select value={addressOptions.some(item => item.text === address) ? address : '__other'} onChange={event => { setAddress(event.target.value === '__other' ? '' : event.target.value); setErrors(current => { const next = { ...current }; delete next.address; return next; }); }} disabled={saving}><option value="__other">Ingresar otro domicilio</option>{addressOptions.map(item => <option key={item.id} value={item.text}>{item.text}</option>)}</select> : null}
            {(!addressOptions.length || !addressOptions.some(item => item.text === address)) && <input maxLength={200} value={address} onChange={event => { setAddress(event.target.value); setErrors(current => { const next = { ...current }; delete next.address; return next; }); }} disabled={saving} placeholder="Domicilio de entrega"/>}
            {errors.address && <small className="field-error">{errors.address}</small>}
          </label>
        </div>
        <div className="sales-remito-modal-table"><table><thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>{orderPreview.detalles.map(item => <tr key={item.detallePedidoId}><td>{item.productoCodigo}</td><td>{item.productoNombre}</td><td>{decimal.format(item.cantidad)}</td></tr>)}</tbody></table></div>
        <label className="sales-remito-modal-observations"><span className="sales-remito-modal-label">Observaciones (opcional)</span><input maxLength={500} value={observations} onChange={event => { setObservations(event.target.value); setErrors(current => { const next = { ...current }; delete next.observations; return next; }); }} disabled={saving} placeholder="Indicaciones de entrega"/>{errors.observations && <small className="field-error">{errors.observations}</small>}</label>
        <div className="sales-remito-modal-footer"><div className="sales-remito-modal-buttons"><button type="button" className="button secondary" onClick={onCancel} disabled={saving}>Cancelar</button><button type="submit" className="button primary" disabled={saving || loadingPreview}>{saving ? 'Emitiendo…' : 'Emitir remito'}</button></div></div>
      </>}
    </form>
  </div>, document.body);
}

export function MarkDeliveredForm({ note, orderId, onSaved, onCancel }: { note: SalesDeliveryNote; orderId: number; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [observations, setObservations] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (observations.trim().length > 500) { setFieldError('Máximo 500 caracteres.'); return; }
    setFieldError(''); setError(''); busy.current = true; setSaving(true);
    try {
      const [order, balance, current] = await Promise.all([salesOrdersApi.get(orderId), salesOrdersApi.balance(orderId), salesOrdersApi.deliveryNote(note.remitoId)]);
      if (current.pedidoId !== orderId || current.entregado) throw new Error('El remito ya no está pendiente de entrega. Actualizá la ficha.');
      if (!canConfirmDelivery(order.estadoPedidoNombre, balance, [], current)) throw new Error('La entrega requiere un pedido listo para entrega, totalmente cobrado y un remito pendiente.');
      await salesOrdersApi.markDelivered(note.remitoId, { observaciones: observations.trim() || null });
      await onSaved();
    } catch (requestError) { setError(apiErrorMessage(requestError, 'No se pudo confirmar la entrega.')); }
    finally { busy.current = false; setSaving(false); }
  }

  return <form className="sales-card sales-operation-panel" onSubmit={event => void submit(event)} noValidate><h3>Confirmar entrega</h3><p className="sales-section-help">El sistema registrará la fecha efectiva al confirmar. Esta acción no se puede deshacer desde la ficha.</p>{error && <div className="sales-error" role="alert"><AlertCircle size={17}/>{error}</div>}<label className="sales-collection-field"><span>Observaciones (opcional)</span><textarea value={observations} onChange={event => { setObservations(event.target.value); setFieldError(''); }} disabled={saving}/>{fieldError && <small className="field-error">{fieldError}</small>}</label><div className="sales-collection-actions"><button type="button" className="button secondary" disabled={saving} onClick={onCancel}>Cancelar</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Confirmando…' : 'Confirmar entrega'}</button></div></form>;
}

export function DeliveryNoteDetail({ id, orderId, onSaved, canManage = false }: { id: number; orderId: number; onSaved: () => Promise<void>; canManage?: boolean }) {
  const [note, setNote] = useState<SalesDeliveryNoteDetail | null>(null);
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [annulling, setAnnulling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [reason, setReason] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([salesOrdersApi.deliveryNote(id), salesOrdersApi.get(orderId)]).then(([value, currentOrder]) => {
      if (!active) return;
      if (value.pedidoId !== orderId) setError('El remito no corresponde a este pedido.');
      else { setNote(value); setOrder(currentOrder); setAddress(value.domicilioEntrega || ''); setObservations(value.observaciones || ''); }
    }).catch(requestError => { if (active) setError(apiErrorMessage(requestError, 'No se pudo consultar el remito.')); });
    return () => { active = false; };
  }, [id, orderId]);

  function print() {
    if (!note || !order) return;
    const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
    const rows = note.detalles.map(item => `<tr><td>${escape(item.productoCodigo || '—')}</td><td>${escape(item.productoNombre)}</td><td>${decimal.format(item.cantidad)}</td></tr>`).join('');
    const copy = window.open('', '_blank');
    if (!copy) { setError('El navegador bloqueó la ventana de impresión.'); return; }
    copy.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Remito ${escape(note.numeroRemito || String(note.remitoId))}</title><style>body{font:14px Arial,sans-serif;color:#1e3028;margin:36px}.brand{display:flex;align-items:center;gap:14px;border-bottom:2px solid #176747;padding-bottom:16px;margin-bottom:20px}.brandmark{background:#176747;color:white;border-radius:9px;padding:11px 16px;font-size:25px;font-weight:800}.brandname{font-size:26px;font-weight:800;letter-spacing:3px;color:#176747}.brand small{display:block;color:#65746c;letter-spacing:1px;font-size:10px}h1{font-size:24px;margin-bottom:4px}.muted{color:#617268}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:26px 0}table{border-collapse:collapse;width:100%;margin:25px 0}th,td{text-align:left;padding:10px;border-bottom:1px solid #dbe4df}th:last-child,td:last-child{text-align:right}.sign{margin-top:70px;border-top:1px solid #999;padding-top:8px;width:260px}.notice{font-size:11px;color:#59645d;margin-top:40px}@media print{body{margin:20mm}}</style></head><body><div class="brand"><span class="brandmark">T</span><div><div class="brandname">TEKA</div><small>MUEBLES · CÓRDOBA</small></div></div><h1>Remito ${escape(note.numeroRemito || `#${note.remitoId}`)}</h1><div class="muted">Fecha: ${escape(dateTime(note.fechaRemito))} · Pedido #${orderId}</div><div class="grid"><div><strong>Destinatario</strong><p>${escape(`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim())}</p></div><div><strong>Domicilio de entrega</strong><p>${escape(note.domicilioEntrega || 'No consignado')}</p></div></div><table><thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>${rows}</tbody></table>${note.observaciones ? `<p><strong>Observaciones:</strong> ${escape(note.observaciones)}</p>` : ''}<div class="sign">Firma y aclaración de recepción</div><p class="notice">Documento interno de TEKA Manager. No acredita por sí solo cumplimiento fiscal ni autorización de ARCA.</p></body></html>`);
    copy.document.close();
    copy.focus();
    copy.print();
  }
  async function save() {
    if (!note || !address.trim() || address.length > 200 || observations.length > 500 || busy) return;
    setBusy(true); setError('');
    try {
      await salesOrdersApi.editDeliveryNote(note.remitoId, { domicilioEntrega: address.trim(), observaciones: observations.trim() || null });
      setNote(await salesOrdersApi.deliveryNote(note.remitoId));
      setEditing(false);
      await onSaved();
    } catch (err) { setError(apiErrorMessage(err, 'No se pudo editar el remito.')); }
    finally { setBusy(false); }
  }
  async function annul() {
    if (!note || reason.trim().length < 3 || busy) return;
    setBusy(true); setError('');
    try {
      await salesOrdersApi.annulDeliveryNote(note.remitoId, reason.trim());
      setAnnulling(false);
      await onSaved();
    } catch (err) { setError(apiErrorMessage(err, 'No se pudo anular el remito.')); }
    finally { setBusy(false); }
  }
  return <div className="sales-remito-inline">
    {error && <div className="sales-error" role="alert"><AlertCircle size={17}/>{error}</div>}
    {!note && !error && <p>Consultando remito…</p>}
    {note && <>
      <header className="sales-remito-inline-header">
        <div><h3>REMITO N.º {note.numeroRemito || note.remitoId}</h3><p>Fecha: {dateTime(note.fechaRemito)} · Pedido #{orderId}</p></div>
        <span className="sales-remito-view-status">{note.anulado ? 'Anulado' : note.entregado ? 'Entregado' : 'Pendiente de entrega'}</span>
      </header>
      <div className="sales-remito-modal-parties">
        <div><span className="sales-remito-modal-label">Destinatario</span><strong>{order ? `${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim() : '—'}</strong></div>
        <div><span className="sales-remito-modal-label">Domicilio de entrega</span>
          {editing ? <input aria-label="Domicilio de entrega" maxLength={200} value={address} onChange={event => setAddress(event.target.value)}/> : <strong>{note.domicilioEntrega || 'No consignado'}</strong>}
        </div>
      </div>
      <div className="sales-remito-modal-table"><table><thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th></tr></thead><tbody>{note.detalles.map(item => <tr key={item.detalleRemitoId}><td>{item.productoCodigo || '—'}</td><td>{item.productoNombre}</td><td>{decimal.format(item.cantidad)}</td></tr>)}</tbody></table></div>
      {note.anulado && <div className="sales-remito-annul-history"><strong>Remito anulado</strong><span>{note.fechaAnulacion ? dateTime(note.fechaAnulacion) : ''}</span><p>{note.motivoAnulacion || 'Sin motivo informado'}</p></div>}
      {(editing || note.observaciones) && <label className="sales-remito-view-observations"><span className="sales-remito-modal-label">Observaciones</span>{editing ? <input maxLength={500} value={observations} onChange={event => setObservations(event.target.value)}/> : <p>{note.observaciones}</p>}</label>}
      {annulling && <div className="sales-remito-annul"><label>Motivo de anulación *<textarea maxLength={250} value={reason} onChange={event => setReason(event.target.value)} placeholder="Indicá el motivo"/></label><p>Se conservará el remito anulado en la base y el pedido volverá a Confirmado.</p><div className="sales-remito-inline-actions"><button type="button" className="button secondary" onClick={() => setAnnulling(false)}>Volver</button><button type="button" className="button danger" disabled={busy || reason.trim().length < 3} onClick={() => void annul()}>Confirmar anulación</button></div></div>}
      <footer className="sales-remito-inline-actions">
        {!editing && !annulling && !note.entregado && !note.anulado && canManage && <><button type="button" className="button secondary" onClick={() => setEditing(true)}>Editar</button><button type="button" className="button secondary" onClick={() => setAnnulling(true)}>Anular remito</button></>}
        {editing && <><button type="button" className="button secondary" disabled={busy} onClick={() => { setEditing(false); setAddress(note.domicilioEntrega || ''); setObservations(note.observaciones || ''); }}>Cancelar</button><button type="button" className="button primary" disabled={busy || !address.trim()} onClick={() => void save()}>Guardar cambios</button></>}
        {!editing && !annulling && <button type="button" className="button primary" onClick={print} disabled={!order}><Printer size={16}/> Imprimir / Guardar PDF</button>}
      </footer>
    </>}
  </div>;
}

/** Alta real de comprobantes desde pedidos: los catálogos se consultan a la API. */
export function CreateInternalDocumentForm({ orderId, onSaved, onCancel }: { orderId: number; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [lookups, setLookups] = useState<{types: Array<{id:number;descripcion:string;codigoARCA?:number|null}>; concepts: Array<{id:number;descripcion:string}>; currencies: Array<{id:number;descripcion:string}>} | null>(null);
  const [typeId, setTypeId] = useState('');
  const [conceptId, setConceptId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [point, setPoint] = useState('1');
  const [orderPreview, setOrderPreview] = useState<SalesOrderDetail | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    setLoadingOrder(true);
    salesOrdersApi.get(orderId)
      .then(order => { if (active) setOrderPreview(order); })
      .catch(err => { if (active) setError(apiErrorMessage(err, 'No se pudo consultar el detalle del pedido.')); })
      .finally(() => { if (active) setLoadingOrder(false); });
    return () => { active = false; };
  }, [orderId]);
  useEffect(() => {
    let active = true;
    Promise.all([salesOrdersApi.documentTypes(), salesOrdersApi.documentConcepts(), salesOrdersApi.currencies()])
      .then(([types, concepts, currencies]) => {
        if (!active) return;
        setLookups({types, concepts, currencies});
        const pesos = currencies.find(item => /^(ars|ars\s*[-–]|peso(?:s)?(?:\s+argentino(?:s)?)?)$/i.test(item.descripcion.trim()))
          ?? currencies.find(item => /peso(?:s)?\s+argentino(?:s)?|\bars\b/i.test(item.descripcion));
        if (pesos) setCurrencyId(String(pesos.id));
      })
      .catch(err => { if (active) setError(apiErrorMessage(err, 'No se pudieron consultar los catálogos del comprobante.')); });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const selectedType = lookups?.types.find(item => item.id === Number(typeId));
    if (!selectedType || selectedType.codigoARCA != null) { setError('Seleccioná un tipo de comprobante interno no fiscal, validado en el catálogo.'); return; }
    if (!Number(conceptId) || !Number(currencyId) || !Number.isInteger(Number(point)) || Number(point) < 1) { setError('Completá tipo, concepto y punto de venta válido. Verificá que exista la moneda pesos argentinos en el catálogo.'); return; }
    if (!orderPreview || loadingOrder || orderPreview.detalles.length === 0) { setError('No se pudo validar el detalle del pedido.'); return; }
    busy.current = true; setSaving(true); setError('');
    try {
      const currentOrder = await salesOrdersApi.get(orderId);
      if (currentOrder.estadoPedidoNombre.toLocaleLowerCase('es-AR') !== 'entregado') throw new Error('El comprobante interno se genera después de confirmar la entrega.');
      await salesOrdersApi.createDocument({pedidoId:orderId,tipoComprobanteId:Number(typeId),conceptoComprobanteId:Number(conceptId),monedaId:Number(currencyId),puntoVenta:Number(point),numeroComprobante:null,observaciones:notes.trim() || null});
      await onSaved();
    } catch(err) { setError(apiErrorMessage(err, 'No se pudo emitir el comprobante.')); }
    finally { busy.current = false; setSaving(false); }
  }
  return <form className="sales-card sales-operation-panel" onSubmit={event => void submit(event)}>
    <h3>Generar comprobante interno</h3>
    <p className="sales-section-help">Pedido #{orderId} · El comprobante tomará los productos y los importes registrados en el pedido.</p>
    {error && <div className="sales-error" role="alert"><AlertCircle size={17}/>{error}</div>}
    {!lookups && !error && <p>Consultando catálogos…</p>}
    {lookups && <div className="sales-collection-fields">
      <label className="sales-collection-field"><span>Punto de venta</span><input type="number" min="1" step="1" required value={point} onChange={e=>setPoint(e.target.value)}/></label>
      <label className="sales-collection-field"><span>Número de comprobante</span><input value="Se asignará al emitir" readOnly disabled aria-label="Número de comprobante asignado automáticamente"/></label>
      <label className="sales-collection-field"><span>Tipo de comprobante interno</span><select required value={typeId} onChange={e=>setTypeId(e.target.value)}><option value="">Seleccionar</option>{lookups.types.filter(item => item.codigoARCA == null && !/factura|fiscal|nota de cr[eé]dito|nota de d[eé]bito/i.test(item.descripcion)).map(item=><option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
      <label className="sales-collection-field"><span>Concepto</span><select required value={conceptId} onChange={e=>setConceptId(e.target.value)}><option value="">Seleccionar</option>{lookups.concepts.map(item=><option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
      <div className="sales-collection-wide">
        <strong>Detalle del pedido</strong>
        {loadingOrder && <p className="sales-section-help">Consultando productos e importes…</p>}
        {!loadingOrder && orderPreview && <>
          <div className="sales-remito-modal-table"><table>
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
            <tbody>{orderPreview.detalles.map(item => <tr key={item.detallePedidoId}>
              <td>{item.productoCodigo} · {item.productoNombre}</td>
              <td>{decimal.format(item.cantidad)}</td>
              <td>{ars.format(item.precioUnitario)}</td>
              <td>{ars.format(item.subtotal)}</td>
            </tr>)}</tbody>
          </table></div>
          <p style={{textAlign:'right', marginTop:12}}><strong>Total del pedido: {ars.format(orderPreview.total)}</strong></p>
        </>}
      </div>
      <label className="sales-collection-field sales-collection-wide"><span>Observaciones</span><textarea maxLength={500} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
    </div>}
    <div className="sales-collection-actions"><button type="button" className="button secondary" disabled={saving} onClick={onCancel}>Cancelar</button><button type="submit" className="button primary" disabled={saving || !lookups || !currencyId || loadingOrder || !orderPreview}>{saving ? 'Generando…' : 'Generar comprobante'}</button></div>
  </form>;
}
