import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Toast } from '../../components/ui/Toast';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { salesCustomersApi, type CustomerPayload, type Lookup } from '../../services/salesCustomersApi';
import type { SalesCustomer } from '../../services/salesOrdersApi';
import { CustomerForm } from './CustomerForm';
import { CustomerAddresses } from './CustomerAddresses';
import { MapPin, Save } from 'lucide-react';
import { cleanAddress, CustomerAddressFields, emptyAddress, useAddressCatalog, validateAddress, type AddressErrors } from './CustomerAddressFields';
import type { CustomerAddressPayload } from '../../services/salesCustomersApi';
import '../inventory/styles/products.css';
import './salesCustomers.css';

const empty: CustomerPayload = { nombre: '', apellido: null, tipoDocumentoId: 0, documento: null, telefono: null, email: null, condicionIVAId: 0, observaciones: null };

export function CustomerEditorPage({ customerId }: { customerId?: number }) {
  const fromOrder = new URLSearchParams(location.search).get('volver') === 'pedido';
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Lookup[]>([]);
  const [ivaConditions, setIvaConditions] = useState<Lookup[]>([]);
  const [value, setValue] = useState<CustomerPayload>(empty);
  const [customer, setCustomer] = useState<SalesCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState('');
  const [addressError, setAddressError] = useState('');
  const [address, setAddress] = useState<CustomerAddressPayload>(emptyAddress);
  const [addressFields, setAddressFields] = useState<AddressErrors>({});
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [partialError, setPartialError] = useState('');
  const attemptedAddress = useRef<CustomerAddressPayload | null>(null);
  const addressCatalog = useAddressCatalog(address.provinciaId, !customerId);
  const canCreate = hasPermission('Ventas', 'Crear');
  const canEdit = hasPermission('Ventas', 'Editar');
  const canInactivate = hasPermission('Ventas', 'Inactivar');
  useEffect(() => { let active = true; setLoading(true); setError(''); setLoadError('');
    void Promise.all([salesCustomersApi.list(), salesCustomersApi.documentTypes(), salesCustomersApi.ivaConditions(), customerId ? salesCustomersApi.get(customerId) : Promise.resolve(null)])
      .then(([items, documents, conditions, customer]) => {
        if (!active) return;
        setCustomers(items); setDocumentTypes(documents); setIvaConditions(conditions);
        if (customer) { setCustomer(customer); setValue({ nombre: customer.nombre, apellido: customer.apellido, tipoDocumentoId: customer.tipoDocumentoId, documento: customer.documento, telefono: customer.telefono, email: customer.email, condicionIVAId: customer.condicionIVAId, observaciones: customer.observaciones ?? null }); }
        else if (customerId) setLoadError('No se encontró el cliente solicitado.');
      }).catch(cause => { if (active) setLoadError(apiErrorMessage(cause, 'No se pudo cargar el formulario.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, retry]);
  async function save(payload: CustomerPayload) {
    if (saving) return;
    if (!customerId) {
      const invalid = validateAddress(address, addressCatalog.types, addressCatalog.provinces, addressCatalog.localities);
      setAddressFields(invalid);
      if (Object.keys(invalid).length || addressCatalog.loading || addressCatalog.error) return;
    }
    setSaving(true); setError('');
    try {
      if (customerId) {
        await salesCustomersApi.update(customerId, payload);
        sessionStorage.setItem('customer-notice', 'Cliente actualizado.');
        location.href = `/ventas/clientes/${customerId}`;
      } else {
        const { clienteId } = await salesCustomersApi.create(payload);
        setCreatedId(clienteId);
        await saveCreatedAddress(clienteId);
      }
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo guardar el cliente.')); setSaving(false); }
  }
  async function saveCreatedAddress(id: number) {
    try {
      if (createdId && attemptedAddress.current && await addressWasSaved(id, attemptedAddress.current)) { finishCreate(id); return; }
      const payload = cleanAddress(address);
      attemptedAddress.current = payload;
      await salesCustomersApi.createAddress(id, payload);
      finishCreate(id);
    } catch (cause) {
      if (attemptedAddress.current && await addressWasSaved(id, attemptedAddress.current)) { finishCreate(id); return; }
      setPartialError(apiErrorMessage(cause, 'No se pudo guardar la dirección.'));
      setSaving(false);
    }
  }
  function finishCreate(id: number) {
    if (fromOrder) { location.href = `/ventas/pedidos/nuevo?clienteId=${id}`; return; }
    sessionStorage.setItem('customer-notice', 'Cliente y dirección registrados correctamente.');
    location.href = `/ventas/clientes/${id}`;
  }
  async function addressWasSaved(id: number, expected: CustomerAddressPayload) {
    try {
      const rows = await salesCustomersApi.addresses(id);
      return rows.some(row => row.tipoDomicilioId === expected.tipoDomicilioId && row.calle.trim() === expected.calle && row.altura.trim() === expected.altura && row.provinciaId === expected.provinciaId && row.localidadId === expected.localidadId && (row.pisoDepto || null) === expected.pisoDepto && (row.barrio || null) === expected.barrio && (row.codigoPostal || null) === expected.codigoPostal);
    } catch { return false; }
  }
  async function retryAddress() {
    if (!createdId || saving) return;
    const invalid = validateAddress(address, addressCatalog.types, addressCatalog.provinces, addressCatalog.localities);
    setAddressFields(invalid); if (Object.keys(invalid).length) return;
    setSaving(true); setPartialError('');
    await saveCreatedAddress(createdId);
  }
  const addressSection = !customerId && <section className="product-form-section customer-new-address">
    <header><span><MapPin size={18}/></span><div><h2>Dirección</h2></div></header>
    {addressCatalog.error && <div className="product-form-alert" role="alert">{addressCatalog.error}</div>}
    {!addressCatalog.loading && !addressCatalog.types.some(type => type.activo) && <p className="sales-muted-hint">No hay tipos de domicilio activos. Configuralos en Administración → Configuración → Ventas → Tipos de domicilio.</p>}
    <CustomerAddressFields value={address} onChange={next => { setAddress(next); setAddressFields({}); }} types={addressCatalog.types} provinces={addressCatalog.provinces} localities={addressCatalog.localities} errors={addressFields} disabled={saving || addressCatalog.loading}/>
  </section>;
  const title = customerId ? 'Editar cliente' : 'Nuevo cliente';
  return <AppShell title={title} breadcrumb={`Ventas / Clientes / ${title}`}>
    <Toast message={notice} onClose={() => setNotice('')}/>
    {loading ? <div className="product-page-state"><strong>Cargando cliente…</strong></div>
      : loadError ? <div className="product-page-state error" role="alert"><strong>No pudimos cargar el formulario</strong><span>{loadError}</span><button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div>
      : <div className="customer-editor-page">{createdId ? <form className="product-editor" onSubmit={event => { event.preventDefault(); void retryAddress(); }}><header className="product-editor-header"><div className="product-editor-heading"><h1>Completar dirección</h1></div><div className="product-editor-actions"><button type="submit" className="button primary" disabled={saving || Boolean(addressCatalog.error)}><Save size={16}/>{saving ? 'Guardando…' : 'Reintentar guardar dirección'}</button></div></header><div className="product-form-alert" role="status">El cliente ya fue registrado. Su dirección quedó pendiente; el reintento guardará solo la dirección.</div>{partialError && <div className="product-form-alert" role="alert">{partialError}</div>}{addressSection}</form>
      : <CustomerForm key={customerId ?? 'new'} mode={customerId ? 'edit' : 'create'} value={value} customers={customers} editingId={customerId} documentTypes={documentTypes} ivaConditions={ivaConditions} saving={saving} error={error} onChange={setValue} onCancel={() => { location.href = customerId ? `/ventas/clientes/${customerId}` : fromOrder ? '/ventas/pedidos/nuevo' : '/ventas/clientes'; }} onSave={save} addressSection={addressSection} addressDirty={JSON.stringify(address) !== JSON.stringify(emptyAddress)}/>}
        {customerId && customer && <><p className="customer-address-save-note">Las direcciones se guardan por separado de los datos del cliente.</p>{addressError && <div className="product-form-alert" role="alert">{addressError}</div>}<CustomerAddresses customerId={customerId} customerActive={customer.activo} canCreate={canCreate} canEdit={canEdit} canInactivate={canInactivate} onFeedback={(message, failed) => { if (failed) setAddressError(message); else { setAddressError(''); setNotice(message); } }}/></>}
      </div>}
  </AppShell>;
}
