import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CircleDollarSign,
  ClipboardList,
  FileText,
  MapPin,
  UserRound,
  Check,
  FileCheck2,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Toast } from '../../components/ui/Toast';
import { getSession } from '../../services/session';
import { cashApi, type Lookup } from '../../services/cashApi';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { ApiError, apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { AnnulCollectionForm, ConfirmCollectionForm, RegisterCollectionForm } from '../collections/CollectionForms';
import { collectionAvailability } from '../collections/collectionAmounts';
import {
  salesOrdersApi,
  type SalesCollection,
  type SalesDeliveryNote,
  type SalesDocument,
  type SalesOrderDetail,
  type SalesOrderRelated,
} from '../../services/salesOrdersApi';
import { SalesOrderProductsEditor } from './SalesOrderProductsEditor';
import { canConfirmDelivery, canIssueDeliveryNote } from './salesOperationRules';
import { CreateDeliveryNoteForm, DeliveryNoteDetail, DocumentDetail, MarkDeliveredForm, CreateInternalDocumentForm } from './SalesOrderOperations';
import { ars, collectionSituation, dateTime, decimal, orderTone } from './salesOrderUtils';
import './salesOrders.css';
import { DeliveryRouteMap } from './DeliveryRouteMap';

type Tab = 'summary' | 'products' | 'collections' | 'documents' | 'remitos' | 'delivery' | 'history';
const emptyRelated: SalesOrderRelated = { balance: null, collections: [], documents: [], deliveryNotes: [], warnings: [], unavailable: [] };

export function SalesOrderDetailPage({ orderId, embedded = false, initialTab = 'summary' }: { orderId: number | null; embedded?: boolean; initialTab?: Tab }) {
  const registered = new URLSearchParams(location.search).get('registrado') === '1';
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);
  const [related, setRelated] = useState<SalesOrderRelated>(emptyRelated);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>(registered ? 'collections' : initialTab);
  const [annulOpen, setAnnulOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<number | null>(null);
  const [annulStep, setAnnulStep] = useState<1 | 2>(1);
  const [issuedCreditId, setIssuedCreditId] = useState<number | null>(null);
  const [annulReason, setAnnulReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('Transferencia');
  const [refundReference, setRefundReference] = useState('');
  const [refundCashId, setRefundCashId] = useState('');
  const [refundBoxes, setRefundBoxes] = useState<Lookup[]>([]);
  const [goodsReceived, setGoodsReceived] = useState(false);
  const [refundCompleted, setRefundCompleted] = useState(false);
  const [annulBusy, setAnnulBusy] = useState(false);
  const [annulError, setAnnulError] = useState('');
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelOrderError, setCancelOrderError] = useState('');
  const [collectionMode, setCollectionMode] = useState<'register' | 'confirm' | 'edit' | 'annul' | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<SalesCollection | null>(null);
  const [collectionMessage, setCollectionMessage] = useState('');
  const [editingProducts, setEditingProducts] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [productRefreshWarning, setProductRefreshWarning] = useState(false);
  const [operationMessage, setOperationMessage] = useState('');
  const [operationRefreshWarning, setOperationRefreshWarning] = useState(false);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'create' | 'confirm' | 'view' | null>(null);
  const [selectedNote, setSelectedNote] = useState<SalesDeliveryNote | null>(null);
  const load = useCallback(async () => {
    if (orderId === null) {
      setError('El identificador del pedido no es válido.');
      setLoading(false);
      setRelatedLoading(false);
      return;
    }
    setLoading(true);
    setRelatedLoading(true);
    setError('');
    setOrder(null);
    setRelated(emptyRelated);
    try {
      // Tras crear un pedido, tolerar una breve demora de lectura sin repetir el POST.
      let loadedOrder: Awaited<ReturnType<typeof salesOrdersApi.get>> | null = null;
      for (let attempt = 0; attempt < (embedded ? 3 : 1); attempt++) {
        try { loadedOrder = await salesOrdersApi.get(orderId); break; }
        catch (error) {
          if (!(error instanceof ApiError && error.status === 404) || attempt === (embedded ? 2 : 0)) throw error;
          await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
        }
      }
      if (!loadedOrder) throw new Error('No se pudo recuperar el pedido registrado.');
      setOrder(loadedOrder);
    } catch (requestError) {
      setError(requestError instanceof ApiError && requestError.status === 404
        ? 'No se encontró el pedido solicitado.'
        : apiErrorMessage(requestError, 'No se pudo consultar el pedido.'));
      setRelatedLoading(false);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
    try {
      setRelated(await salesOrdersApi.related(orderId));
    } finally {
      setRelatedLoading(false);
    }
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  const refreshAfterCollection = async (message: string) => {
    setRelatedLoading(true);
    const [orderResult, relatedResult] = await Promise.allSettled([salesOrdersApi.get(orderId!), salesOrdersApi.related(orderId!)]);
    if (orderResult.status === 'fulfilled') setOrder(orderResult.value);
    if (relatedResult.status === 'fulfilled') setRelated(relatedResult.value);
    setRelatedLoading(false);
    setCollectionMode(null);
    setSelectedCollection(null);
    setCollectionMessage(relatedResult.status === 'fulfilled' && !relatedResult.value.unavailable.includes('balance') && !relatedResult.value.unavailable.includes('collections')
      ? message : `${message} No se pudo actualizar toda la información; usá Actualizar para reintentar.`);
    setTab('collections');
  };

  const hasConfirmedPayment = related.collections.some(item => /confirm/i.test(item.estadoCobroNombre));
  const canCancelDirectly = !relatedLoading && !related.unavailable.includes('collections')
    && !hasConfirmedPayment && !related.documents.length && !related.deliveryNotes.length;

  const cancelOrder = async () => {
    if (!orderId || cancellingOrder || !cancelReason.trim() || !canCancelDirectly) return;
    setCancellingOrder(true); setCancelOrderError('');
    try {
      await salesOrdersApi.cancel(orderId, cancelReason.trim());
      setCancelOrderOpen(false);
      await load();
    } catch (requestError) {
      setCancelOrderError(apiErrorMessage(requestError, 'No se pudo cancelar el pedido.'));
    } finally { setCancellingOrder(false); }
  };
  // TEKA utiliza comprobantes internos de venta, no facturas fiscales.
  const validInvoices = related.documents.filter(item =>
    /comprobante interno de venta/i.test(item.tipoComprobanteNombre)
    && /emitido/i.test(item.estadoComprobante)
    && !/anul|rechaz/i.test(item.estadoComprobante));
  const canAnnulSale = Boolean(order && /entregado/i.test(order.estadoPedidoNombre)
    && validInvoices.length > 0 && !relatedLoading && !related.unavailable.includes('documents')
    && !related.unavailable.includes('collections') && hasPermission('Ventas', 'Inactivar'));
  useEffect(() => {
    if (!annulOpen) return;
    let active = true;
    cashApi.boxes().then(items => { if (active) setRefundBoxes(items); })
      .catch(() => { if (active) setAnnulError('No se pudieron cargar las cajas. No se podrá reintegrar en efectivo.'); });
    return () => { active = false; };
  }, [annulOpen]);
  const annulSale = async () => {
    const userId = Number(getSession()?.usuario?.usuarioId);
    if (!orderId || !canAnnulSale || annulBusy || !Number.isInteger(userId) || userId <= 0) {
      setAnnulError('No se pudo identificar al usuario responsable o la venta no cumple las condiciones.');
      return;
    }
    if (!annulReason.trim() || !goodsReceived || !refundCompleted || (refundMethod === 'Efectivo' && !refundCashId)) return;
    setAnnulBusy(true); setAnnulError('');
    try {
      const result = await salesOrdersApi.annulIntegral(orderId, {
        usuarioId: userId, motivo: annulReason.trim(), medioReintegro: refundMethod,
        cajaId: refundMethod === 'Efectivo' ? Number(refundCashId) : null,
        referenciaReintegro: refundReference.trim() || null,
        mercaderiaRecibidaApta: goodsReceived, reintegroRealizado: refundCompleted,
      });
      setIssuedCreditId(result.notaCreditoId);
      setDocumentId(result.notaCreditoId);
      setAnnulStep(2);
      setOperationMessage(`Venta anulada. Nota de crédito N.º ${result.numeroNotaCredito} emitida. Reintegro: ${ars.format(result.importeReintegrado)}.`);
      await load();
      setTab('documents');
    } catch (requestError) {
      setAnnulError(apiErrorMessage(requestError, 'No se pudo anular la venta.'));
    } finally { setAnnulBusy(false); }
  };
  const financial = related.balance ? collectionSituation(related.balance.totalCobrado, related.balance.saldo) : null;
  const canEditProducts = hasPermission('Ventas', 'Editar') && !relatedLoading && related.unavailable.length === 0
    && order?.estadoPedidoNombre.toLocaleLowerCase('es-AR') === 'pendiente'
    && related.collections.length === 0 && related.documents.length === 0 && related.deliveryNotes.length === 0;
  const refreshAfterProducts = async () => {
    const id = orderId!;
    const [orderResult, relatedResult] = await Promise.allSettled([salesOrdersApi.get(id), salesOrdersApi.related(id)]);
    if (orderResult.status === 'fulfilled') setOrder(orderResult.value);
    if (relatedResult.status === 'fulfilled') setRelated(relatedResult.value);
    const refreshed = orderResult.status === 'fulfilled' && relatedResult.status === 'fulfilled' && relatedResult.value.unavailable.length === 0;
    setProductRefreshWarning(!refreshed);
    setProductMessage(refreshed
      ? 'Producto actualizado. Total y estados consultados nuevamente.'
      : 'La operación se guardó, pero no se pudo actualizar toda la ficha. Usá Actualizar antes de continuar.');
    if (orderResult.status !== 'fulfilled' || relatedResult.status !== 'fulfilled' || relatedResult.value.unavailable.length) setEditingProducts(false);
  };
  const refreshAfterDelivery = async (message: string, target: 'remitos' | 'delivery' = 'delivery') => {
    const id = orderId!;
    setRelatedLoading(true);
    const [orderResult, relatedResult] = await Promise.allSettled([salesOrdersApi.get(id), salesOrdersApi.related(id)]);
    if (orderResult.status === 'fulfilled') setOrder(orderResult.value);
    if (relatedResult.status === 'fulfilled') setRelated(relatedResult.value);
    setRelatedLoading(false);
    setDeliveryMode(null);
    setSelectedNote(null);
    const refreshed = orderResult.status === 'fulfilled' && relatedResult.status === 'fulfilled' && relatedResult.value.unavailable.length === 0;
    setOperationRefreshWarning(!refreshed);
    setOperationMessage(refreshed
      ? message : `${message} No se pudo actualizar toda la ficha; usá Actualizar para reintentar.`);
    setTab(target);
  };
  const canRegisterCollection = hasPermission('Cobros', 'Crear') && !relatedLoading && !related.unavailable.includes('balance')
    && !related.unavailable.includes('collections') && Boolean(order?.detalles.length)
    && order?.estadoPedidoNombre.toLocaleLowerCase('es-AR') === 'confirmado'
    && Boolean(related.balance && collectionAvailability(related.balance, related.collections).available > 0);
  const canConfirmCollection = hasPermission('Cobros', 'Editar') && !relatedLoading && Boolean(related.balance)
    && !related.unavailable.includes('collections') && order?.estadoPedidoNombre.toLocaleLowerCase('es-AR') === 'confirmado';
  const canEditCollection = canConfirmCollection;
  const canAnnulCollection = hasPermission('Cobros', 'Inactivar') && !relatedLoading && !related.unavailable.includes('collections');
  const delivered = related.deliveryNotes.some(note => note.entregado);
  const pendingDelivery = related.deliveryNotes.some(note => !note.entregado);
  const nextAction = /cancel/i.test(order?.estadoPedidoNombre ?? '')
    ? 'El pedido está cancelado.'
    : relatedLoading
    ? 'Consultando situación operativa…'
    : related.unavailable.includes('balance') || related.unavailable.includes('deliveryNotes')
      ? 'La información operativa está incompleta. Actualizá el pedido para reintentar.'
    : related.balance && related.balance.saldo > 0.01
      ? 'Resolver el saldo por cobrar antes de la entrega.'
      : pendingDelivery
        ? 'La entrega asociada todavía no fue confirmada.'
        : delivered
          ? (related.documents.some(item => !/anul|rechaz/i.test(item.estadoComprobante)) ? 'Circuito comercial completado.' : 'Entrega confirmada. Podés generar el comprobante interno.')
          : order?.estadoPedidoNombre.toLocaleLowerCase('es-AR') === 'confirmado'
            ? 'El pedido está en condiciones de emitir remito.'
            : 'No hay una próxima acción documentada por la API.';

  // Una sola navegación para el alta y la consulta posterior del pedido.
  const steps: Array<{ label: string; target: Tab; icon: typeof UserRound }> = [
    { label: 'Cliente', target: 'summary', icon: UserRound },
    { label: 'Productos', target: 'products', icon: Package },
    { label: 'Resumen', target: 'summary', icon: ClipboardList },
    { label: 'Cobro', target: 'collections', icon: Wallet },
    { label: 'Remito', target: 'remitos', icon: FileCheck2 },
    { label: 'Entrega', target: 'delivery', icon: Truck },
    { label: 'Comprobante', target: 'documents', icon: FileText },
  ];
  const activeStep = tab === 'summary' ? 2 : steps.findIndex(step => step.target === tab);
  const goToTab = (target: Tab) => { setTab(target); setCollectionMode(null); setDeliveryMode(null); setCreatingDocument(false); };
  const nextStep = activeStep >= 0 && activeStep < steps.length - 1 ? steps[activeStep + 1] : null;
  const previousStep = activeStep > 0 ? steps[activeStep - 1] : null;

  const content = (
      <div className="sales-order-detail-page">
        <PageHeader
          kicker={undefined}
          title={orderId ? `Pedido ${orderId}` : 'Pedido no válido'}
          description={undefined}
          action={<div className="sales-detail-actions"><a className="button secondary" href="/ventas/pedidos"><ArrowLeft size={16}/> Volver a pedidos</a>{canAnnulSale && <button type="button" className="button secondary sales-cancel-action" onClick={() => { setAnnulError(''); setAnnulStep(1); setIssuedCreditId(null); setAnnulOpen(true); }}>Anular venta</button>}{order && hasPermission('Ventas', 'Inactivar') && canCancelDirectly && !/cancel|anulad|entreg/i.test(order.estadoPedidoNombre) && <button type="button" className="button secondary sales-cancel-action" onClick={() => setCancelOrderOpen(true)}>Cancelar pedido</button>}</div>}
        />

        {error && <div className="sales-error" role="alert"><AlertCircle size={18}/><span>{error}</span>{orderId !== null && <button type="button" className="button secondary" onClick={() => void load()}>Reintentar</button>}</div>}
        {loading && <div className="sales-detail-state">Consultando la ficha del pedido…</div>}

        {!loading && order && <>
          {collectionMessage && <Toast message={collectionMessage} onClose={() => setCollectionMessage('')} />}
          {productMessage && (productRefreshWarning ? <div className="sales-warning" role="alert">{productMessage}</div> : <Toast message={productMessage} onClose={() => setProductMessage('')} />)}
          {operationMessage && (operationRefreshWarning ? <div className="sales-warning" role="alert">{operationMessage}</div> : <Toast message={operationMessage} onClose={() => setOperationMessage('')} />)}
          <nav className="sales-seven-stages" aria-label="Etapas del circuito comercial">
            {steps.map((step, index) => {
              const completed = index < 3 || (index === 3 && related.balance !== null && related.balance.saldo <= 0.01)
                || (index === 4 && related.deliveryNotes.length > 0)
                || (index === 5 && related.deliveryNotes.some(note => note.entregado))
                || (index === 6 && related.documents.some(document => !/anul|rechaz/i.test(document.estadoComprobante)));
              return <button key={`${step.label}-${index}`} type="button"
                className={`${activeStep === index ? 'current' : ''} ${completed ? 'registered' : ''}`}
                aria-current={activeStep === index ? 'step' : undefined}
                onClick={() => goToTab(step.target)}>
                <span className="sales-stage-icon">{<step.icon size={18} strokeWidth={1.9}/>}</span><small>{step.label}</small>
              </button>;
            })}
          </nav>
          <section className="sales-detail-hero">
            <div className="sales-detail-hero-mark"><ShoppingCart size={24}/></div>
            <div><span>PEDIDO</span><h2>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</h2><p>{order.canalVentaNombre} · {dateTime(order.fechaPedido)}</p></div>
            <StatusBadge tone={orderTone(order.estadoPedidoNombre)}>{order.estadoPedidoNombre}</StatusBadge>
            <div className="sales-detail-total"><span>Total acordado</span><strong>{ars.format(order.total)}</strong></div>
          </section>

          {related.warnings.length > 0 && <div className="sales-warning" role="status"><AlertCircle size={17}/><span>{related.warnings.join(' ')}</span></div>}


          {tab === 'summary'  && <div className="sales-detail-content">
            <section className="sales-card sales-detail-customer-overview"><div><span className="sales-overview-label">Cliente</span><strong>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</strong><small>{order.canalVentaNombre}</small></div><div><span className="sales-overview-label">Fecha del pedido</span><strong>{dateTime(order.fechaPedido)}</strong></div><div><span className="sales-overview-label">Total del pedido</span><strong>{ars.format(order.total)}</strong></div><button type="button" className="sales-text-action" onClick={() => setTab('history')}>Ver historial</button></section>

            <div className="sales-summary-grid">
              <section className="sales-card"><SectionTitle icon={<Wallet/>} title="Cobro"/><p className="sales-summary-status">{relatedLoading ? 'Consultando…' : financial?.label ?? 'No disponible'}</p><SummaryRow label="Saldo por cobrar" value={related.balance ? ars.format(related.balance.saldo) : 'No disponible'} strong/><button type="button" className="sales-text-action" onClick={() => setTab('collections')}>Ver cobros</button></section>
              <section className="sales-card"><SectionTitle icon={<Truck/>} title="Entrega"/><p className="sales-summary-status">{relatedLoading ? 'Consultando…' : related.unavailable.includes('deliveryNotes') ? 'No disponible' : delivered && pendingDelivery ? 'Entregas parciales' : delivered ? 'Entrega registrada' : pendingDelivery ? 'Entrega pendiente' : 'Sin remito asociado'}</p>{related.deliveryNotes.length > 0 && <SummaryRow label="Remitos" value={String(related.deliveryNotes.length)}/>}<button type="button" className="sales-text-action" onClick={() => setTab('remitos')}>Ver entrega y remitos</button></section>
            </div>
            <section className="sales-card sales-brief"><div><SectionTitle icon={<ClipboardList/>} title="Próxima acción"/><p>{nextAction}</p></div><div><SectionTitle icon={<Package/>} title="Productos"/><p>{order.detalles.length} artículos · {order.detalles.slice(0, 2).map(item => item.productoNombre).join(', ')}{order.detalles.length > 2 ? '…' : ''}</p><button type="button" className="sales-text-action" onClick={() => setTab('products')}>Ver productos</button></div></section>
            {order.observaciones && <section className="sales-card"><SectionTitle icon={<ClipboardList/>} title="Observaciones"/><p className="sales-notes">{order.observaciones}</p></section>}
          </div>}

          {tab === 'products' && <div className="sales-detail-content"><Products order={order} canEdit={canEditProducts && !editingProducts} onEdit={() => { setEditingProducts(true); setProductMessage(''); }}/>{editingProducts && <SalesOrderProductsEditor order={order} onSaved={refreshAfterProducts} onClose={() => setEditingProducts(false)}/>}</div>}
          {tab === 'collections' && <div className="sales-detail-content">
            {related.unavailable.includes('collections') ? <Unavailable name="cobros"/> : <Collections loading={relatedLoading} items={related.collections} balance={related.balance} canRegister={canRegisterCollection && collectionMode === null} canConfirm={canConfirmCollection} canEdit={canEditCollection} canAnnul={canAnnulCollection} onRegister={() => { setCollectionMode('register'); setSelectedCollection(null); setCollectionMessage(''); }} onConfirm={item => { setSelectedCollection(item); setCollectionMode('confirm'); setCollectionMessage(''); }} onEdit={item => { setSelectedCollection(item); setCollectionMode('edit'); setCollectionMessage(''); }} onAnnul={item => { setSelectedCollection(item); setCollectionMode('annul'); setCollectionMessage(''); }}/>}</div>}
          {tab === 'documents' && <div className="sales-detail-content">
            {!relatedLoading && related.documents.length === 0 && <section className="sales-card teka-document-compact">
              <div className="teka-document-compact-heading"><div><h3>Comprobante del pedido</h3><p>Datos comerciales del pedido, disponibles antes de emitir el documento.</p></div><div className="teka-document-heading-actions"><span className="teka-document-pending">Pendiente de emisión</span>{order.estadoPedidoNombre.toLocaleLowerCase('es-AR') === 'entregado' && !related.unavailable.includes('documents') && hasPermission('Ventas', 'Crear') && <button type="button" className="button primary" onClick={() => setCreatingDocument(true)}>Generar comprobante interno</button>}</div></div>
              <div className="teka-document-compact-info"><div><small>Cliente</small><strong>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</strong></div><div><small>Pedido</small><strong>#{order.pedidoId}</strong></div><div><small>Fecha del pedido</small><strong>{dateTime(order.fechaPedido)}</strong></div></div>
              <div className="teka-document-compact-table"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Importe</th></tr></thead><tbody>{order.detalles.map(item => <tr key={item.detallePedidoId}><td>{item.productoNombre}</td><td>{decimal.format(item.cantidad)}</td><td>{ars.format(item.precioUnitario)}</td><td>{ars.format(item.subtotal)}</td></tr>)}</tbody></table></div>
              <div className="teka-document-compact-total"><span>Total del pedido</span><strong>{ars.format(order.total)}</strong></div>
              <p className="teka-document-compact-disclaimer">El comprobante interno no constituye una factura fiscal autorizada.</p>
            </section>}


            {creatingDocument && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCreatingDocument(false); }}><section className="teka-document-create-modal" role="dialog" aria-modal="true" aria-label="Generar comprobante interno"><div className="teka-document-create-intro"><div className="teka-document-create-intro-icon"><FileCheck2 size={22}/></div><div><span>VENTAS · EMISIÓN</span><h2>Nuevo comprobante interno</h2><p>Pedido #{order.pedidoId} · {`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()} · {ars.format(order.total)}</p></div></div><CreateInternalDocumentForm orderId={order.pedidoId} onCancel={() => setCreatingDocument(false)} onSaved={async () => { setCreatingDocument(false); await refreshAfterDelivery('Comprobante registrado correctamente.'); setTab('documents'); }}/></section></div>}
            {related.unavailable.includes('documents') ? <Unavailable name="comprobantes"/> : relatedLoading ? <Empty text="Consultando comprobantes…"/> : related.documents.length === 0 ? <p className="sales-section-help">No hay comprobantes emitidos. Los datos del pedido se muestran arriba para su revisión.</p> : <>
              <section className="sales-card sales-remitos-section teka-compact-workspace" aria-label="Comprobantes del pedido">
                <div className="sales-collection-list-head"><SectionTitle icon={<FileCheck2/>} title="Comprobantes del pedido"/><span className="teka-compact-count">{related.documents.length} {related.documents.length === 1 ? 'documento' : 'documentos'}</span></div>
                {related.documents.length > 1 && <div className="teka-compact-document-list">{[...related.documents].sort((a,b) => Number(/nota de cr[eé]dito/i.test(a.tipoComprobanteNombre)) - Number(/nota de cr[eé]dito/i.test(b.tipoComprobanteNombre))).map(item => <button key={item.comprobanteId} type="button" className="teka-compact-document-choice" onClick={() => setPreviewDocumentId(item.comprobanteId)}><span><strong>{/nota de cr[eé]dito/i.test(item.tipoComprobanteNombre) ? 'Nota de crédito · Egreso' : 'Comprobante · Ingreso'}</strong><small>N.º {String(item.puntoVenta).padStart(4, '0')}-{item.numeroComprobante === null ? 'S/N' : String(item.numeroComprobante).padStart(8, '0')}</small></span><span><strong>{ars.format(item.importeTotal)}</strong><small>{item.estadoComprobante}</small></span><span className="teka-compact-view">Ver documento →</span></button>)}</div>}
                {related.documents.length === 1 && (() => { const item = related.documents[0]; return <div className="teka-single-document"><div><strong>{/nota de cr[eé]dito/i.test(item.tipoComprobanteNombre) ? 'Nota de crédito interna · Egreso' : 'Comprobante interno · Ingreso'}</strong><small>N.º {String(item.puntoVenta).padStart(4, '0')}-{item.numeroComprobante === null ? 'S/N' : String(item.numeroComprobante).padStart(8, '0')} · {item.estadoComprobante}</small></div><strong>{ars.format(item.importeTotal)}</strong><button type="button" className="button secondary" onClick={() => setPreviewDocumentId(item.comprobanteId)}>Ver documento / Imprimir / Enviar</button></div>; })()}
              </section>
              {previewDocumentId !== null && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPreviewDocumentId(null); }}><section className="teka-compact-preview-dialog" role="dialog" aria-modal="true" aria-label="Detalle del comprobante"><div className="teka-compact-preview-head"><strong>Detalle del comprobante</strong><button type="button" className="button secondary" onClick={() => setPreviewDocumentId(null)}>Cerrar</button></div><div className="teka-compact-preview-body"><DocumentDetail key={previewDocumentId} id={previewDocumentId} order={order}/></div></section></div>}


            </>}
          </div>}
          {(tab === 'delivery' || tab === 'remitos') && <div className="sales-detail-content">{related.unavailable.includes('deliveryNotes') ? <Unavailable name="remitos"/> : <Delivery mode={tab === 'remitos' ? 'remitos' : 'delivery'} loading={relatedLoading} items={related.deliveryNotes} order={order} balance={related.balance} documents={related.documents} canManage={hasPermission('Ventas', 'Editar')} onCreate={() => { setDeliveryMode('create'); setSelectedNote(null); setOperationMessage(''); }} onConfirm={note => { setDeliveryMode('confirm'); setSelectedNote(note); setOperationMessage(''); }} onView={note => { setDeliveryMode('view'); setSelectedNote(note); }} onSaved={() => refreshAfterDelivery('Remito actualizado.', 'remitos')} / >}{deliveryMode === 'create' && <CreateDeliveryNoteForm orderId={order.pedidoId} onCancel={() => setDeliveryMode(null)} onSaved={() => refreshAfterDelivery('Remito emitido.', 'remitos')}/ >}{deliveryMode === 'confirm' && selectedNote && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDeliveryMode(null); }}><div className="sales-delivery-confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirmar entrega"><MarkDeliveredForm note={selectedNote} orderId={order.pedidoId} onCancel={() => setDeliveryMode(null)} onSaved={() => refreshAfterDelivery('Entrega confirmada. La fecha efectiva y el seguimiento se actualizaron.')}/></div></div>}{deliveryMode === 'view' && selectedNote && tab === 'delivery' && <DeliveryNoteDetail key={selectedNote.remitoId} id={selectedNote.remitoId} orderId={order.pedidoId} onSaved={() => refreshAfterDelivery('Remito actualizado.', 'remitos')} canManage={hasPermission('Ventas', 'Editar')}/>}</div>}
          {tab === 'history' && <div className="sales-detail-content"><section className="sales-card sales-history"><SectionTitle icon={<ClipboardList/>} title="Historial comercial del pedido"/><OrderTimeline eventos={order.historialEstados}/></section><RelatedActivity related={related} loading={relatedLoading}/></div>}
          <nav className="sales-detail-bottom-nav" aria-label="Navegación del pedido"><button type="button" className="button secondary" disabled={!previousStep} onClick={() => previousStep && goToTab(previousStep.target)}><ArrowLeft size={16}/> Anterior</button><button type="button" className="button primary" disabled={!nextStep} onClick={() => nextStep && goToTab(nextStep.target)}>Siguiente: {nextStep?.label ?? "Finalizado"} →</button></nav>
        </>}
        {collectionMode !== null && tab === 'collections' && <div className="sales-modal-backdrop sales-collection-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) { setCollectionMode(null); setSelectedCollection(null); } }}><section className="sales-collection-modal" role="dialog" aria-modal="true" aria-label="Gestión de cobro">            {collectionMode === 'register' && order && related.balance && <RegisterCollectionForm orderId={order.pedidoId} customerId={order.clienteId} customerName={`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()} collections={related.collections} onCancel={() => setCollectionMode(null)} onSaved={() => refreshAfterCollection('Cobro registrado. Está pendiente de confirmación.')}/>}
            {collectionMode === 'edit' && selectedCollection && order && related.balance && <RegisterCollectionForm key={selectedCollection.cobroId} orderId={order.pedidoId} customerId={order.clienteId} customerName={`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()} collections={related.collections} editing={selectedCollection} onCancel={() => { setCollectionMode(null); setSelectedCollection(null); }} onSaved={() => refreshAfterCollection('Cobro pendiente actualizado.')}/>}
            {collectionMode === 'confirm' && selectedCollection && order && <ConfirmCollectionForm collection={selectedCollection} orderId={order.pedidoId} onCancel={() => { setCollectionMode(null); setSelectedCollection(null); }} onSaved={() => refreshAfterCollection('Cobro confirmado. La ficha y el saldo se actualizaron.')}/>}
            {collectionMode === 'annul' && selectedCollection && order && <AnnulCollectionForm collection={selectedCollection} orderId={order.pedidoId} onCancel={() => { setCollectionMode(null); setSelectedCollection(null); }} onSaved={() => refreshAfterCollection('Cobro pendiente anulado.')}/>}
</section></div>}
        {annulOpen && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !annulBusy) setAnnulOpen(false); }}>
          <section className="sales-confirm-dialog teka-annul-dialog" role="dialog" aria-modal="true" aria-labelledby="teka-annul-title">
            <h2 id="teka-annul-title">{annulStep === 1 ? 'Paso 1 de 2 · Anular venta' : 'Paso 2 de 2 · Nota de crédito emitida'}</h2>
            {annulStep === 2 ? <><p>La venta fue anulada y la nota de crédito interna se generó correctamente. Podés consultar el documento, imprimirlo o enviarlo desde su detalle.</p>{issuedCreditId && order && <DocumentDetail key={issuedCreditId} id={issuedCreditId} order={order}/>}<div className="sales-confirm-actions"><button type="button" className="button primary" onClick={() => { setAnnulOpen(false); setDocumentId(issuedCreditId); setTab('documents'); }}>Finalizar</button></div></> : <>
            <p>Esta operación revierte la venta, registra el reintegro, actualiza la cuenta corriente y repone los muebles devueltos al stock. No puede deshacerse desde esta pantalla.</p>
            <p><strong>Pedido:</strong> {orderId} · <strong>Comprobante original:</strong> {validInvoices.map(item => `${item.puntoVenta}-${item.numeroComprobante ?? 'S/N'}`).join(', ')}</p>
            <label className="plain-field"><span>Motivo de anulación *</span><textarea maxLength={250} value={annulReason} onChange={event => setAnnulReason(event.target.value)} disabled={annulBusy}/></label>
            <label className="plain-field"><span>Medio de reintegro *</span><select value={refundMethod} onChange={event => setRefundMethod(event.target.value)} disabled={annulBusy}>{['Transferencia','Efectivo','Tarjeta','Plataforma'].map(method => <option key={method}>{method}</option>)}</select></label>
            {refundMethod === 'Efectivo' && <label className="plain-field"><span>Caja *</span><select value={refundCashId} onChange={event => setRefundCashId(event.target.value)} disabled={annulBusy}><option value="">Seleccionar caja</option>{refundBoxes.map(box => <option key={box.id} value={box.id}>{box.descripcion}</option>)}</select></label>}
            <label className="plain-field"><span>Referencia del reintegro (opcional)</span><input maxLength={100} value={refundReference} onChange={event => setRefundReference(event.target.value)} disabled={annulBusy}/></label>
            <label className="teka-annul-check"><input type="checkbox" checked={goodsReceived} onChange={event => setGoodsReceived(event.target.checked)} disabled={annulBusy}/> Confirmo que los muebles fueron recibidos y están aptos para reingresar al stock.</label>
            <label className="teka-annul-check"><input type="checkbox" checked={refundCompleted} onChange={event => setRefundCompleted(event.target.checked)} disabled={annulBusy}/> Confirmo que el reintegro al cliente ya se realizó.</label>
            {annulError && <p className="sales-error" role="alert">{annulError}</p>}
            <div className="sales-confirm-actions"><button type="button" className="button secondary" disabled={annulBusy} onClick={() => setAnnulOpen(false)}>Volver</button><button type="button" className="button primary" disabled={annulBusy || !annulReason.trim() || !goodsReceived || !refundCompleted || (refundMethod === 'Efectivo' && !refundCashId)} onClick={() => void annulSale()}>{annulBusy ? 'Procesando…' : 'Confirmar anulación y generar nota de crédito'}</button></div></>}
          </section></div>}
                {cancelOrderOpen && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !cancellingOrder) setCancelOrderOpen(false); }}><section className="sales-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="sales-cancel-order-title"><h2 id="sales-cancel-order-title">Cancelar pedido</h2><p>Solo se permite cancelar directamente un pedido sin cobros confirmados ni documentos asociados. Las devoluciones y notas de crédito requieren un circuito financiero específico.</p><label className="plain-field"><span>Motivo de cancelación</span><textarea maxLength={250} value={cancelReason} onChange={event => setCancelReason(event.target.value)} placeholder="Indicá el motivo"/></label>{cancelOrderError && <p className="sales-error" role="alert">{cancelOrderError}</p>}<div className="sales-confirm-actions"><button type="button" className="button secondary" disabled={cancellingOrder} onClick={() => setCancelOrderOpen(false)}>Volver</button><button type="button" className="button primary" disabled={cancellingOrder || !cancelReason.trim()} onClick={() => void cancelOrder()}>{cancellingOrder ? 'Cancelando…' : 'Confirmar cancelación'}</button></div></section></div>}
      </div>
  );
  return embedded ? content : <AppShell title="Pedido" breadcrumb="Ventas / Pedidos / Detalle">{content}</AppShell>;
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="sales-section-title">{icon}<h3>{title}</h3></div>;
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`sales-summary-row ${strong ? 'emphasis' : ''}`}><span>{label}</span><strong>{value}</strong></div>;
}

function Products({ order, canEdit, onEdit }: { order: SalesOrderDetail; canEdit: boolean; onEdit: () => void }) {
  return <section className="sales-card"><div className="sales-collection-list-head"><SectionTitle icon={<Package/>} title="Productos del pedido"/>{canEdit && <button type="button" className="button secondary" onClick={onEdit}>Editar productos</button>}</div>{order.detalles.length === 0 ? <Empty text="El pedido no tiene productos registrados."/> : <div className="sales-products"><div className="sales-product-head"><span>Artículo</span><span>Código</span><span>Cantidad</span><span>Precio pactado</span><span>Subtotal</span></div>{order.detalles.map(item => <div className="sales-product-row" key={item.detallePedidoId}><strong>{item.productoNombre}</strong><span>{item.productoCodigo}</span><span>{decimal.format(item.cantidad)}</span><span>{ars.format(item.precioUnitario)}</span><strong>{ars.format(item.subtotal)}</strong></div>)}<div className="sales-products-total"><span>Total del pedido</span><strong>{ars.format(order.total)}</strong></div></div>}</section>;
}

function Collections({ loading, items, balance, canRegister, canConfirm, canEdit, canAnnul, onRegister, onConfirm, onEdit, onAnnul }: {
  loading: boolean; items: SalesCollection[]; balance: SalesOrderRelated['balance'];
  canRegister: boolean; canConfirm: boolean; canEdit: boolean; canAnnul: boolean;
  onRegister: () => void; onConfirm: (item: SalesCollection) => void; onEdit: (item: SalesCollection) => void; onAnnul: (item: SalesCollection) => void;
}) {
  const pendingBase = balance ? collectionAvailability(balance, items).pendingBase : 0;
  return <section className="sales-card sales-collections-clean">
    <div className="sales-collection-list-head">
      <div><SectionTitle icon={<Wallet/>} title="Cobros del pedido"/><p className="sales-section-help">Registrá, confirmá y consultá los pagos de esta venta.</p></div>
      {canRegister && <button type="button" className="button primary" onClick={onRegister}><CircleDollarSign size={16}/> Registrar cobro</button>}
    </div>
    {loading ? <Empty text="Consultando cobros…"/> : <>
      <div className="sales-financial-summary">
        <SummaryRow label="Total del pedido" value={balance ? ars.format(balance.totalPedido) : 'No disponible'}/>
        <SummaryRow label="Cobrado confirmado" value={balance ? ars.format(balance.totalCobrado) : 'No disponible'}/>
        <SummaryRow label="Saldo por cobrar" value={balance ? ars.format(balance.saldo) : 'No disponible'} strong/>
      </div>
      {pendingBase > 0 && <p className="sales-collection-hint">Hay {ars.format(pendingBase)} comprometidos en cobros pendientes de confirmación. No se consideran cobrados hasta confirmarlos.</p>}
      {items.length === 0 ? <Empty text="Todavía no hay cobros registrados para este pedido."/> : <div className="sales-collection-table-scroll"><table className="sales-collection-table">
        <thead><tr><th>Fecha</th><th>Medio de pago</th><th>Importe</th><th>Ajuste</th><th>Total a cobrar</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{items.map(item => {
          const pending = /^pendiente$/i.test(item.estadoCobroNombre.trim());
          return <tr key={item.cobroId}>
            <td>{dateTime(item.fechaCobro)}</td>
            <td>{item.medioCobroNombre}</td>
            <td className="sales-money-cell">{ars.format(item.importeBase)}</td>
            <td className={`sales-money-cell ${item.porcentajeAplicado < 0 ? 'sales-discount-cell' : item.porcentajeAplicado > 0 ? 'sales-surcharge-cell' : ''}`}>
              {item.importeAjuste === 0 ? '—' : <>{item.porcentajeAplicado < 0 ? 'Descuento' : 'Recargo'} {decimal.format(Math.abs(item.porcentajeAplicado))}%<small>{ars.format(item.importeAjuste)}</small></>}
            </td>
            <td className="sales-money-cell"><strong>{ars.format(item.importeFinal)}</strong></td>
            <td><StatusBadge tone={/confirm/i.test(item.estadoCobroNombre) ? 'success' : /anul/i.test(item.estadoCobroNombre) ? 'danger' : 'warning'}>{item.estadoCobroNombre}</StatusBadge></td>
            <td><div className="sales-collection-table-actions">
              {pending && canEdit && <button type="button" className="sales-text-action" onClick={() => onEdit(item)}>Editar</button>}
              {pending && canConfirm && <button type="button" className="sales-text-action sales-confirm-action" onClick={() => onConfirm(item)}>Confirmar</button>}
              {pending && canAnnul && <button type="button" className="sales-text-action sales-danger-action" onClick={() => onAnnul(item)}>Anular</button>}
              {!pending && <span className="sales-table-muted">—</span>}
            </div></td>
          </tr>;
        })}</tbody>
      </table></div>}
    </>}
  </section>;
}

function Documents({ loading, items, onView }: { loading: boolean; items: SalesDocument[]; onView: (id: number) => void }) {
  return <section className="sales-card"><SectionTitle icon={<FileText/>} title="Comprobantes vinculados"/><p className="sales-section-help">Podés consultar e imprimir una copia de los documentos existentes. La API no distingue de forma inequívoca un tipo interno de uno fiscal para emitirlo desde esta ficha.</p>{loading ? <Empty text="Consultando comprobantes…"/> : items.length === 0 ? <Empty text="No hay comprobantes vinculados a este pedido."/> : <div className="sales-record-list">{items.map(item => <article key={item.comprobanteId}><div><strong>{item.tipoComprobanteNombre} {item.numeroComprobante !== null ? `${item.puntoVenta}-${item.numeroComprobante}` : 'sin número asignado'}</strong><span>{dateTime(item.fechaComprobante)}</span></div><StatusBadge tone={/anul|rechaz/i.test(item.estadoComprobante) ? 'danger' : /emit|aprobad|confirm/i.test(item.estadoComprobante) ? 'success' : 'neutral'}>{item.estadoComprobante}</StatusBadge><div className="sales-record-amount"><strong>{ars.format(item.importeTotal)}</strong><button type="button" className="sales-text-action" onClick={() => onView(item.comprobanteId)}>Ver comprobante</button></div></article>)}</div>}</section>;
}

function Delivery({ mode, loading, items, order, balance, documents, canManage, onCreate, onConfirm, onView, onSaved }: {
  mode: 'remitos' | 'delivery';
  loading: boolean; items: SalesDeliveryNote[]; order: SalesOrderDetail; balance: SalesOrderRelated['balance']; documents: SalesDocument[];
  canManage: boolean; onCreate: () => void; onConfirm: (note: SalesDeliveryNote) => void; onView: (note: SalesDeliveryNote) => void; onSaved: () => Promise<void>;
}) {
  const [previewRemitoId, setPreviewRemitoId] = useState<number | null>(null);
  const activeItems = items.filter(note => !note.anulado);
  const annulledItems = items.filter(note => note.anulado);
  const canCreate = canManage && !loading && canIssueDeliveryNote(order.estadoPedidoNombre, balance, documents, activeItems);
  const canDeliver = canManage && !loading && activeItems.some(note => canConfirmDelivery(order.estadoPedidoNombre, balance, documents, note));
  if (mode === 'remitos') {
    return <section className="sales-card sales-remitos-section">
      <div className="sales-collection-list-head">
        <div><SectionTitle icon={<FileCheck2/>} title="Remito del pedido"/></div>
        {canCreate && <button type="button" className="button primary" onClick={onCreate}><FileCheck2 size={16}/> Emitir remito</button>}
      </div>
      {loading ? <Empty text="Consultando remito…"/> : items.length === 0
        ? <div className="sales-remito-empty"><Package size={24}/><strong>Sin remito emitido</strong><span>{canCreate ? 'Podés emitir el remito para preparar la entrega.' : 'El remito estará disponible cuando el pedido esté confirmado y el cobro completo.'}</span></div>
        : <><div className="teka-compact-document-list">{[...activeItems,...annulledItems].map(item => <button key={item.remitoId} type="button" className="teka-compact-document-choice" onClick={() => setPreviewRemitoId(item.remitoId)}><span><strong>Remito {item.numeroRemito || `#${item.remitoId}`}</strong><small>{item.anulado ? 'Anulado' : item.entregado ? 'Entregado' : 'Pendiente de entrega'}</small></span><span className="teka-compact-view">Ver documento →</span></button>)}</div>{previewRemitoId !== null && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPreviewRemitoId(null); }}><section className="teka-compact-preview-dialog" role="dialog" aria-modal="true" aria-label="Detalle del remito"><div className="teka-compact-preview-head"><strong>Detalle del remito</strong><button type="button" className="button secondary" onClick={() => setPreviewRemitoId(null)}>Cerrar</button></div><div className="teka-compact-preview-body"><DeliveryNoteDetail key={previewRemitoId} id={previewRemitoId} orderId={order.pedidoId} canManage={canManage && activeItems.some(x => x.remitoId === previewRemitoId)} onSaved={onSaved}/></div></section></div>}</> }
    </section>;
  }
  const activeNotes = items.filter(note => !note.anulado);
  const current = activeNotes.find(note => !note.entregado) ?? activeNotes.find(note => note.entregado);
  const address = current?.domicilioEntrega?.trim() || '';
  return <section className="sales-card sales-delivery-workspace">
    <div className="sales-collection-list-head"><SectionTitle icon={<Truck/>} title="Entrega del pedido"/>{current && <StatusBadge tone={current.entregado ? 'success' : 'warning'}>{current.entregado ? 'Entregado' : 'Pendiente de entrega'}</StatusBadge>}</div>
    {loading ? <Empty text="Consultando entrega…"/> : !current ? <Empty text="No hay un remito vigente. Emití uno desde el paso Remito para gestionar la entrega."/> : <>
      <div className="teka-delivery-columns">
        <div className="teka-delivery-details">
          <div className="sales-delivery-facts">
            <div><small>Destinatario</small><strong>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</strong></div>
            <div><small>Remito</small><strong>{current.numeroRemito || `#${current.remitoId}`}</strong></div>
            <div><small>Fecha de emisión</small><strong>{dateTime(current.fechaRemito)}</strong></div>
            <div><small>Fecha de entrega</small><strong>{current.fechaEntrega ? dateTime(current.fechaEntrega) : 'Pendiente'}</strong></div>
          </div>
          <div className="sales-delivery-destination"><MapPin size={19}/><div><small>Domicilio de entrega</small><strong>{address || 'Sin domicilio registrado'}</strong></div></div>
          {current.observaciones && <p className="sales-delivery-note"><strong>Observaciones:</strong> {current.observaciones}</p>}
          <div className="sales-delivery-footer">{canDeliver && !current.entregado && <button type="button" className="button primary" onClick={() => onConfirm(current)}>Confirmar entrega</button>}</div>
        </div>
        {address ? <DeliveryRouteMap destination={address} /> : <div className="sales-remito-empty">Registrá el domicilio de entrega en el remito para visualizar el recorrido.</div>}
      </div>
    </>}
  </section>;
}

function RelatedActivity({ related, loading }: { related: SalesOrderRelated; loading: boolean }) {
  const events = [
    ...related.collections.map(item => ({ key: `c-${item.cobroId}`, date: item.fechaCobro, title: 'Cobro registrado', detail: `${item.medioCobroNombre} · ${ars.format(item.importeFinal)} · Estado actual: ${item.estadoCobroNombre}` })),
    ...related.documents.map(item => ({ key: `d-${item.comprobanteId}`, date: item.fechaComprobante, title: 'Comprobante registrado', detail: `${item.tipoComprobanteNombre} · ${item.numeroComprobante === null ? 'Sin número comercial' : `${item.puntoVenta}-${item.numeroComprobante}`}` })),
    ...related.deliveryNotes.flatMap(item => [
      { key: `r-${item.remitoId}`, date: item.fechaRemito, title: 'Remito registrado', detail: item.numeroRemito || 'Sin número comercial' },
      ...(item.fechaEntrega ? [{ key: `e-${item.remitoId}`, date: item.fechaEntrega, title: 'Entrega registrada', detail: item.numeroRemito || 'Remito sin número comercial' }] : []),
    ]),
  ].filter(event => event.date && !Number.isNaN(new Date(event.date).getTime())).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sourceNames: Record<SalesOrderRelated['unavailable'][number], string> = { balance: 'saldo', collections: 'cobros', documents: 'comprobantes', deliveryNotes: 'remitos' };
  return <section className="sales-card"><SectionTitle icon={<ClipboardList/>} title="Actividad relacionada"/>{loading ? <p className="sales-section-help">Consultando actividad…</p> : <>{related.unavailable.length > 0 && <p className="sales-section-help">Algunas fuentes no se pudieron consultar: {related.unavailable.map(key => sourceNames[key]).join(', ')}.</p>}{events.length === 0 ? <Empty text="No hay actividad relacionada con fecha verificable."/> : <div className="sales-activity-list">{events.map(event => <div key={event.key}><time dateTime={event.date}>{dateTime(event.date)}</time><strong>{event.title}</strong><span>{event.detail}</span></div>)}</div>}</>}</section>;
}

function Empty({ text }: { text: string }) {
  return <div className="sales-empty">{text}</div>;
}

function Unavailable({ name }: { name: string }) {
  return <div className="sales-error" role="alert"><AlertCircle size={18}/>No se pudieron consultar los {name}. Actualizá el pedido para reintentar.</div>;
}
