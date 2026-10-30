import { useEffect, useState } from 'react';
import { ContactRound, ExternalLink, Pencil } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/data/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { salesCustomersApi } from '../../services/salesCustomersApi';
import type { SalesCustomer } from '../../services/salesOrdersApi';
import { CustomerAddresses } from './CustomerAddresses';
import { CustomerRecentOrders } from './CustomerRecentOrders';
import { CustomerAccountSummary } from './CustomerAccountSummary';
import { customerName } from './SalesCustomersPage';
import '../inventory/styles/products.css';
import './salesCustomers.css';

function ReadField({ label, value }: { label: string; value: string | null | undefined }) {
  return <label className="product-field"><span>{label}</span><input readOnly value={value || 'No informado'}/></label>;
}

export function CustomerDetailPage({ customerId }: { customerId: number }) {
  const fromOrder = new URLSearchParams(location.search).get('volver') === 'pedido';
  const [customer, setCustomer] = useState<SalesCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const canEdit = hasPermission('Ventas', 'Editar');
  const canViewAccount = hasPermission('Cobros', 'Ver');
  const canViewCommercial = hasPermission('Comercial', 'Ver');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    void salesCustomersApi.get(customerId).then(row => { if (active) setCustomer(row); })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudo consultar el cliente.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, retry]);
  useEffect(() => {
    const saved = sessionStorage.getItem('customer-notice');
    if (saved) { setNotice(saved); sessionStorage.removeItem('customer-notice'); }
  }, []);

  return <AppShell title="Consultar cliente" breadcrumb="Ventas / Clientes / Consultar cliente" backHref="/ventas/clientes" backLabel="Volver a Clientes">
    <Toast message={notice} onClose={() => setNotice('')}/>
    {loading ? <div className="product-page-state"><strong>Cargando cliente…</strong></div>
      : error || !customer ? <div className="product-page-state error" role="alert"><strong>No pudimos consultar el cliente</strong><span>{error || 'No se encontró el cliente solicitado.'}</span><button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div>
      : <div className="product-editor product-editor-view customer-view">
        <header className="product-editor-header"><div className="product-editor-heading"><h1>Consultar cliente</h1><p>{customerName(customer)}</p></div>
          <div className="product-editor-actions">{canEdit && <a className="button primary" href={`/ventas/clientes/${customerId}/editar`}><Pencil size={16}/> Editar cliente</a>}</div>
        </header>
        {sectionError && <div className="product-form-alert" role="alert">{sectionError}</div>}
        <div className="customer-view-layout">
          <section className="product-form-section customer-section customer-main-card"><header><span><ContactRound size={18}/></span><div><h2>Información principal</h2></div></header>
            <div className="product-form-grid">
              <ReadField label="Nombre" value={customer.nombre}/>
              <ReadField label="Apellido" value={customer.apellido}/>
              <ReadField label="Documento" value={customer.documento ? `${customer.tipoDocumentoNombre} ${customer.documento}` : null}/>
              <ReadField label="Condición frente al IVA" value={customer.condicionIVANombre}/>
              <ReadField label="Teléfono" value={customer.telefono}/>
              <ReadField label="Correo electrónico" value={customer.email}/>
              <ReadField label="Fecha de alta" value={customer.fechaAlta ? new Date(customer.fechaAlta).toLocaleDateString('es-AR') : null}/>
              <div className="customer-read-status"><span>Estado</span><StatusBadge tone={customer.activo ? 'success' : 'danger'}>{customer.activo ? 'Activo' : 'Inactivo'}</StatusBadge></div>
              {!customer.activo && <><ReadField label="Motivo de inactivación" value={customer.motivoInactivacionNombre}/>{customer.fechaInactivacion && <ReadField label="Fecha de inactivación" value={new Date(customer.fechaInactivacion).toLocaleDateString('es-AR')}/>}</>}
              {customer.observaciones && <label className="product-field product-field-wide"><span>Observaciones</span><textarea readOnly value={customer.observaciones} rows={3}/></label>}
            </div>
            <div className="customer-context-actions">
              {fromOrder && customer.activo && <a className="button primary" href={`/ventas/pedidos/nuevo?clienteId=${customerId}`}>Seleccionar para pedido</a>}
              {canViewCommercial && <a className="button secondary" href={`/comercial/oportunidades?clienteId=${customerId}`}>Ver actividad comercial <ExternalLink size={15}/></a>}
            </div>
          </section>
          <div className="customer-view-right">
            <CustomerAddresses customerId={customerId} customerActive={customer.activo} readOnly canCreate={false} canEdit={false} canInactivate={false} onFeedback={(message, failed) => { if (failed) setSectionError(message); }}/>
            <CustomerRecentOrders customerId={customerId}/>
          </div>
        </div>
        {canViewAccount && <CustomerAccountSummary customerId={customerId}/>}
      </div>}
  </AppShell>;
}
