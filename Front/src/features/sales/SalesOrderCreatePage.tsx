import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, Package, ClipboardList, Wallet, FileCheck2, Truck, FileText, ChevronLeft, ChevronRight, ImageOff, Plus, Search, Trash2, UserRound, MapPin, ShoppingBag, RotateCcw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { EcommerceImage } from '../ecommerce/EcommerceImage';
import { ApiError, apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { detalleOportunidad } from '../../services/commercialOperationsApi';
import { obtenerResumenCatalogoEcommerce, type ResumenCatalogoEcommerce } from '../../services/ecommerceApi';
import { inventoryStockApi, type StockProduct } from '../../services/inventoryStockApi';
import { productsApi, type Product } from '../../services/productsApi';
import { formatProductName } from '../../services/productDisplay';
import { salesOrdersApi, type SalesChannel, type SalesCustomer, type SalesCustomerAddress, type SalesPrice } from '../../services/salesOrdersApi';
import { ars, decimal } from './salesOrderUtils';
import './salesOrders.css';
import './salesOrderCreate.css';

type Step = 1 | 2 | 3;
type PriceState = SalesPrice | 'loading' | 'missing' | 'error' | undefined;
type Line = { product: Product; quantity: string; price: number; stock: number };
type FieldErrors = { customer?: string; channel?: string; products?: string; observations?: string; quantities?: Record<number, string> };
const quantityPattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const customerName = (customer: SalesCustomer) => `${customer.nombre} ${customer.apellido ?? ''}`.trim();
const productName = (product: Product) => formatProductName(product);
const quantityValue = (value: string) => Number(value.replace(',', '.')) || 0;
const lineSubtotal = (line: Line) => Math.round((line.price * quantityValue(line.quantity) + Number.EPSILON) * 100) / 100;
const isPrice = (price: PriceState): price is SalesPrice => typeof price === 'object' && price !== null && Number.isFinite(price.precio) && price.precio > 0;

export function SalesOrderCreatePage() {
  const canCreate = hasPermission('Ventas', 'Crear');
  const [step, setStep] = useState<Step>(1);
  const returningCustomerId = Number(new URLSearchParams(location.search).get('clienteId') || 0);
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockProduct[]>([]);
  const [covers, setCovers] = useState<ResumenCatalogoEcommerce[]>([]);
  const [prices, setPrices] = useState<Record<number, PriceState>>({});
  const priceRequests = useRef(new Set<number>());
  const [addresses, setAddresses] = useState<SalesCustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'available'>('all');
  const [channelId, setChannelId] = useState('');
  const [observations, setObservations] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const submitting = useRef(false);
  const [opportunityId, setOpportunityId] = useState<number | null>(null);
  const requestedStep = useRef<Step | null>(null);
  const draftCustomerId = useRef<number | null>(null);
  const draftChannelId = useRef("");
  const draftOpportunityId = useRef<number | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem('teka-pedido-borrador');
    if (draft) {
      try {
        const saved = JSON.parse(draft) as { origin?: 'opportunity'; opportunityId?: number; requestedStep?: Step; channelId?: string; observations?: string; customerId?: number; customerQuery?: string; productQuery?: string; productFilter?: 'all' | 'available'; lines?: Array<{id:number;quantity:string}> };
        const validOpportunityId = saved.origin === 'opportunity' && Number.isSafeInteger(saved.opportunityId) && Number(saved.opportunityId) > 0 ? Number(saved.opportunityId) : null;
        setOpportunityId(validOpportunityId);
        draftOpportunityId.current = validOpportunityId;
        requestedStep.current = validOpportunityId && saved.requestedStep === 3 ? 3 : null;
        draftCustomerId.current = returningCustomerId || saved.customerId || null;
        draftChannelId.current = saved.channelId || '';
        setChannelId(saved.channelId || ''); setObservations(saved.observations || '');
        setCustomerId(returningCustomerId || saved.customerId || null);
        setCustomerQuery(returningCustomerId ? '' : saved.customerQuery || '');
        setProductQuery(saved.productQuery || ''); setProductFilter(saved.productFilter || 'all');
        if (saved.lines?.length) sessionStorage.setItem('teka-pedido-lineas-pendientes', JSON.stringify(saved.lines));
      } catch { /* borrador no válido */ }
      sessionStorage.removeItem('teka-pedido-borrador');
    } else if (returningCustomerId) setCustomerId(returningCustomerId);
  }, []);
  useEffect(() => {
    let active = true;
    const originRequest = draftOpportunityId.current ? detalleOportunidad(draftOpportunityId.current).catch(() => null) : Promise.resolve(null);
    Promise.all([salesOrdersApi.customers(), salesOrdersApi.channels(), productsApi.list(), inventoryStockApi.products(), obtenerResumenCatalogoEcommerce(), originRequest])
      .then(([customerResult, channelResult, productResult, stockResult, coverResult, origin]) => {
        if (!active) return;
        const invalidOrigin = Boolean(draftOpportunityId.current) && (!origin || origin.clienteId !== draftCustomerId.current || /convertida|perdida|cancelada/i.test(origin.estadoOportunidadNombre || ''));
        if (invalidOrigin) {
          setOpportunityId(null); requestedStep.current = null;
          setCustomerId(null); setCustomerQuery(''); setChannelId(''); setObservations('');
          sessionStorage.removeItem('teka-pedido-lineas-pendientes');
          setSubmitError('La oportunidad de origen ya no es válida. No se precargaron datos ni se creó ningún pedido.');
        }
        setCustomers(customerResult.filter(customer => customer.activo));
        if (returningCustomerId) {
          const returned = customerResult.find(customer => customer.clienteId === returningCustomerId);
          if (returned) setCustomerQuery(customerName(returned));
        }
        setChannels(channelResult.filter(item => !/^e-?commerce$/i.test(item.descripcion.trim())));
        setProducts(productResult.filter(product => product.activo));
        const raw = sessionStorage.getItem('teka-pedido-lineas-pendientes');
        if (raw && !invalidOrigin) {
          try {
            const stored = JSON.parse(raw) as Array<{id:number;quantity:string}>;
            void Promise.allSettled(stored.map(async item => {
              const product = productResult.find(candidate => candidate.productoId === item.id);
              if (!product) throw new Error('Producto no disponible.');
              const price = await salesOrdersApi.currentPrice(item.id);
              const available = stockResult.filter(row => row.productoId === item.id).reduce((sum,row) => sum + row.cantidadActual, 0);
              return {product, quantity:item.quantity, price:price.precio, stock:available};
            })).then(results => {
              if (!active) return;
              const restored = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
              setLines(restored);
              if (requestedStep.current === 3) {
                const activeChannels = channelResult.filter(item => !/^e-?commerce$/i.test(item.descripcion.trim()));
                const validCustomer = customerResult.some(customer => customer.activo && customer.clienteId === draftCustomerId.current);
                const validChannel = activeChannels.some(channel => channel.id === Number(draftChannelId.current));
                const validProducts = restored.length === stored.length && restored.length > 0 && restored.every(line => quantityValue(line.quantity) > 0 && line.price > 0 && quantityValue(line.quantity) <= line.stock);
                if (!validCustomer || !validChannel) {
                  setStep(1);
                  setSubmitError('Completá los datos obligatorios del cliente y del canal antes de confirmar el pedido.');
                } else if (!validProducts) {
                  setStep(2);
                  setSubmitError('Revisá productos, precios vigentes y disponibilidad antes de confirmar el pedido.');
                } else setStep(3);
              }
            });
          } catch { /* datos inválidos */ }
          sessionStorage.removeItem('teka-pedido-lineas-pendientes');
        }
        setStock(stockResult);
        setCovers(coverResult);
      })
      .catch(error => { if (active) setCatalogError(apiErrorMessage(error, 'No se pudieron consultar los datos para registrar el pedido.')); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  function goRegisterCustomer() {
    sessionStorage.setItem('teka-pedido-borrador', JSON.stringify({ ...(opportunityId ? { origin: 'opportunity', opportunityId, requestedStep: step } : {}), customerId, customerQuery, channelId, observations, productQuery, productFilter, lines: lines.map(line => ({id:line.product.productoId,quantity:line.quantity})) }));
    location.href = '/ventas/clientes/nuevo?volver=pedido';
  }
  const selectedCustomer = customers.find(customer => customer.clienteId === customerId) ?? null;
  useEffect(() => {
    let active = true;
    setAddresses([]);
    if (!customerId) return () => { active = false; };
    setAddressesLoading(true);
    void salesOrdersApi.customerAddresses(customerId)
      .then(result => { if (active) setAddresses(result.filter(address => address.activo)); })
      .catch(() => { if (active) setAddresses([]); })
      .finally(() => { if (active) setAddressesLoading(false); });
    return () => { active = false; };
  }, [customerId]);

  const stockByProduct = useMemo(() => {
    const totals = new Map<number, number>();
    stock.forEach(item => totals.set(item.productoId, (totals.get(item.productoId) ?? 0) + item.cantidadActual));
    return totals;
  }, [stock]);
  const coverByProduct = useMemo(() => new Map(covers.map(item => [item.productoId, item.urlPortada])), [covers]);
  const customerMatches = useMemo(() => {
    const query = customerQuery.trim().toLocaleLowerCase('es-AR');
    return customers.filter(customer => !query || `${customerName(customer)} ${customer.documento ?? ''} ${customer.email ?? ''}`.toLocaleLowerCase('es-AR').includes(query)).slice(0, 8);
  }, [customers, customerQuery]);
  const productMatches = useMemo(() => {
    const query = productQuery.trim().toLocaleLowerCase('es-AR');
    return products.filter(product => !lines.some(line => line.product.productoId === product.productoId)
      && (productFilter === 'all' || (stockByProduct.get(product.productoId) ?? 0) > 0)
      && (!query || `${product.codigo} ${productName(product)} ${product.tipoProductoNombre}`.toLocaleLowerCase('es-AR').includes(query)));
  }, [products, productQuery, productFilter, stockByProduct, lines]);
  const productMatchIds = productMatches.slice(0, 4).map(product => product.productoId).join(',');

  useEffect(() => {
    const pending = productMatches.slice(0, 4).filter(product => !priceRequests.current.has(product.productoId));
    if (!pending.length) return;
    pending.forEach(product => priceRequests.current.add(product.productoId));
    setPrices(current => ({ ...current, ...Object.fromEntries(pending.map(product => [product.productoId, 'loading'])) }));
    void Promise.allSettled(pending.map(product => salesOrdersApi.currentPrice(product.productoId))).then(results => {
      setPrices(current => {
        const next = { ...current };
        results.forEach((result, index) => {
          next[pending[index].productoId] = result.status === 'fulfilled'
            ? (isPrice(result.value) ? result.value : 'error')
            : result.reason instanceof ApiError && result.reason.status === 404 ? 'missing' : 'error';
        });
        return next;
      });
    });
    // Product IDs drive one request per product; prices are cached separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productMatchIds]);

  const previewTotal = lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
  const hasDraft = Boolean(customerId || customerQuery.trim() || channelId || lines.length || observations.trim());

  function cancel() {
    if (hasDraft) { setCancelOpen(true); return; }
    location.href = opportunityId ? `/comercial/oportunidades/${opportunityId}` : '/ventas/pedidos';
  }

  function addProduct(product: Product) {
    const price = prices[product.productoId];
    const available = Math.max(0, stockByProduct.get(product.productoId) ?? 0);
    if (!isPrice(price) || available <= 0 || lines.some(line => line.product.productoId === product.productoId)) return;
    setLines(current => [...current, { product, quantity: '1', price: price.precio, stock: available }]);
    setErrors(current => ({ ...current, products: undefined }));
  }

  function validate(target: Step = 3): FieldErrors {
    const next: FieldErrors = {};
    if (!customerId || !selectedCustomer) next.customer = 'Seleccioná un cliente activo.';
    if (!channelId || !channels.some(channel => channel.id === Number(channelId))) next.channel = 'Seleccioná un canal de venta.';
    if (target >= 2) {
      if (!lines.length) next.products = 'Agregá al menos un producto con precio vigente.';
      const quantities: Record<number, string> = {};
      lines.forEach(line => {
        const quantity = quantityValue(line.quantity);
        if (!quantityPattern.test(line.quantity.trim()) || quantity < 0.01) quantities[line.product.productoId] = 'Ingresá una cantidad mayor a cero, con hasta dos decimales.';
        else if (quantity > line.stock) quantities[line.product.productoId] = `Supera el stock disponible (${decimal.format(line.stock)}).`;
      });
      if (Object.keys(quantities).length) next.quantities = quantities;
    }
    if (observations.length > 500) next.observations = 'Las observaciones no pueden superar 500 caracteres.';
    return next;
  }

  function nextStep() {
    const nextErrors = validate(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep(current => Math.min(3, current + 1) as Step);
  }

  async function save() {
    if (step !== 3 || submitting.current) return;
    const nextErrors = validate(3); setErrors(nextErrors); setSubmitError('');
    if (Object.keys(nextErrors).length) return;
    submitting.current = true; setSaving(true);
    try {
      const created = await salesOrdersApi.create({ clienteId: customerId!, canalVentaId: Number(channelId), ...(opportunityId ? { oportunidadComercialId: opportunityId } : {}), observaciones: observations.trim() || null, detalles: lines.map(line => ({ productoId: line.product.productoId, cantidad: quantityValue(line.quantity) })) });
      if (!Number.isSafeInteger(created.pedidoId) || created.pedidoId <= 0) throw new Error('El pedido se registró, pero la respuesta no incluyó un número válido. Consultá el listado antes de reintentar.');
      location.href = `/ventas/pedidos/${created.pedidoId}?registrado=1`;
    } catch (error) {
      setSubmitError(apiErrorMessage(error, 'No se pudo registrar el pedido. Revisá los datos e intentá nuevamente.'));
      submitting.current = false; setSaving(false);
    }
  }

  return <AppShell title="Registrar pedido" breadcrumb="Ventas / Pedidos / Registrar">
    <div className="sales-create-page">
      <PageHeader title="Registrar pedido"/>
      <WizardProgress step={step}/>
      {!canCreate ? <div className="sales-error" role="alert"><AlertCircle size={18}/>No tenés permiso para registrar pedidos.</div> : catalogLoading ? <div className="sales-detail-state">Cargando datos del pedido…</div> : catalogError ? <div className="sales-error" role="alert"><AlertCircle size={18}/><span>{catalogError}</span><button type="button" className="button secondary" onClick={() => location.reload()}>Reintentar</button></div> :
      <div className="sales-wizard-form">
        {opportunityId && <div className="form-alert opportunity-order-origin"><ShoppingBag size={17}/><span>Pedido originado desde una oportunidad comercial. Revisá los datos antes de guardarlo.</span></div>}
        {submitError && <div className="form-alert" role="alert"><AlertCircle size={17}/><span>{submitError}</span></div>}
        {step === 1 && <CustomerStep customers={customerMatches} selected={selectedCustomer} query={customerQuery} open={customerOpen} channelId={channelId} channels={channels} addresses={addresses} addressesLoading={addressesLoading} errors={errors} observations={observations} onObservations={setObservations} onQuery={value => { setCustomerQuery(value); setCustomerId(null); setCustomerOpen(true); }} onOpen={setCustomerOpen} onSelect={customer => { setCustomerId(customer.clienteId); setCustomerQuery(customerName(customer)); setCustomerOpen(false); setErrors(current => ({ ...current, customer: undefined })); }} onRegister={goRegisterCustomer} onChannel={value => { setChannelId(value); setErrors(current => ({ ...current, channel: undefined })); }}/>} 
        {step === 2 && <ProductsStep products={productMatches.slice(0, 4)} prices={prices} stockByProduct={stockByProduct} coverByProduct={coverByProduct} query={productQuery} filter={productFilter} lines={lines} errors={errors} total={previewTotal} onQuery={setProductQuery} onFilter={setProductFilter} onAdd={addProduct} onQuantity={(id, value) => { setLines(current => current.map(line => line.product.productoId === id ? { ...line, quantity: value } : line)); setErrors(current => ({ ...current, quantities: { ...current.quantities, [id]: '' } })); }} onRemove={id => setLines(current => current.filter(line => line.product.productoId !== id))}/>} 
        {step === 3 && <ReviewStep customer={selectedCustomer!} channel={channels.find(item => item.id === Number(channelId))!} addresses={addresses} lines={lines} coverByProduct={coverByProduct} observations={observations} total={previewTotal} onEdit={setStep}/>} 
        <div className="sales-wizard-actions">{step === 1 ? <button type="button" className="button secondary" disabled={saving} onClick={cancel}>Cancelar</button> : <button type="button" className="button secondary" disabled={saving} onClick={() => setStep(current => (current - 1) as Step)}><ChevronLeft size={16}/> Anterior</button>}<span/>{step < 3 ? <button type="button" className="button primary" onClick={nextStep}>Siguiente <ChevronRight size={16}/></button> : <button type="button" onClick={() => void save()} className="button primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar pedido'} <Check size={16}/></button>}</div>
      </div>}
    </div>
    {cancelOpen && <div className="sales-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCancelOpen(false); }}><section className="sales-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="sales-cancel-title"><h2 id="sales-cancel-title">Descartar pedido</h2><p>¿Querés salir sin guardar los datos cargados?</p><div className="sales-confirm-actions"><button type="button" className="button secondary" onClick={() => setCancelOpen(false)}>Seguir editando</button><button type="button" className="button primary" onClick={() => { location.href = opportunityId ? `/comercial/oportunidades/${opportunityId}` : '/ventas/pedidos'; }}>Descartar pedido</button></div></section></div>}
  </AppShell>;
}

function WizardProgress({ step }: { step: Step }) {
  const stages = [{ label: 'Cliente', icon: UserRound }, { label: 'Productos', icon: Package }, { label: 'Resumen', icon: ClipboardList }, { label: 'Cobro', icon: Wallet }, { label: 'Remito', icon: FileCheck2 }, { label: 'Entrega', icon: Truck }, { label: 'Comprobante', icon: FileText }] as const;
  return <nav className="sales-wizard-progress" aria-label="Progreso del registro">{stages.map(({ label, icon: StageIcon }, index) => {
    const number = index + 1;
    return <div key={number} aria-current={number === step ? 'step' : undefined} className={number < step ? 'completed' : number === step ? 'current' : ''}>
      <span className="sales-step-circle"><StageIcon size={18} strokeWidth={1.9}/></span><strong>{label}</strong>
    </div>;
  })}</nav>;
}

type CustomerStepProps = { customers: SalesCustomer[]; selected: SalesCustomer | null; query: string; open: boolean; channelId: string; channels: SalesChannel[]; addresses: SalesCustomerAddress[]; addressesLoading: boolean; errors: FieldErrors; observations: string; onObservations: (value: string) => void; onQuery: (value: string) => void; onOpen: (value: boolean) => void; onSelect: (customer: SalesCustomer) => void; onChannel: (value: string) => void; onRegister: () => void };
function CustomerStep({ customers, selected, query, open, channelId, channels, addresses, addressesLoading, errors, observations, onObservations, onQuery, onOpen, onSelect, onChannel, onRegister }: CustomerStepProps) {
  return <section className="sales-wizard-columns sales-customer-step">
    <div className="sales-card sales-wizard-panel sales-customer-panel">
      <div className="sales-panel-heading"><div><h2>Cliente</h2></div><button type="button" className="button secondary" onClick={onRegister}><Plus size={15}/> Registrar cliente</button></div>
      
      <label className={`plain-field ${errors.customer ? 'field-invalid' : ''}`}><span>Buscar cliente <span className="required-mark">*</span></span><div className="sales-picker"><Search size={17}/><input role="combobox" aria-expanded={open} autoComplete="off" value={query} placeholder="Buscar por nombre, documento o correo…" onFocus={() => onOpen(true)} onBlur={() => window.setTimeout(() => onOpen(false), 120)} onChange={event => onQuery(event.target.value)}/>{open && !selected && <div className="sales-picker-options" role="listbox">{customers.length ? customers.map(customer => <button type="button" role="option" aria-selected="false" key={customer.clienteId} onMouseDown={event => event.preventDefault()} onClick={() => onSelect(customer)}><strong>{customerName(customer)}</strong><small>{customer.tipoDocumentoNombre} {customer.documento || 'sin número'} · {customer.email || customer.telefono || 'sin contacto'}</small></button>) : <p>No se encontraron clientes activos.</p>}</div>}</div>{errors.customer && <p className="field-error">{errors.customer}</p>}</label>
      {selected ? <div className="sales-selected-customer"><div className="sales-customer-avatar">{customerName(selected).slice(0, 2).toUpperCase()}</div><div className="sales-customer-identity"><strong>{customerName(selected)}</strong><small>{selected.tipoDocumentoNombre}: {selected.documento || 'No informado'}</small><small>{selected.telefono || 'Teléfono no informado'}</small><small>{selected.email || 'Correo no informado'}</small></div><span className="sales-selected-indicator"><Check size={14}/> Seleccionado</span></div> : <div className="sales-customer-placeholder"><UserRound size={19}/> Elegí un cliente para consultar sus datos registrados.</div>}
      <div className="sales-address-block"><h3><MapPin size={16}/> Domicilios registrados</h3>{addressesLoading ? <p>Consultando domicilios…</p> : addresses.length ? <div className="sales-address-list">{addresses.map(address => <div className="sales-address-row" key={address.domicilioClienteId}><MapPin size={16}/><div><strong>{address.tipoDomicilio}</strong><span>{address.direccion || `${address.calle} ${address.altura}`}, {address.localidadNombre}</span></div></div>)}</div> : <p className="sales-muted-hint">{selected ? 'El cliente no tiene domicilios activos.' : 'Los domicilios aparecerán al seleccionar un cliente.'}</p>}</div>
    </div>
    <div className="sales-card sales-wizard-panel sales-order-info-panel">
      <div className="sales-panel-heading"><div><h2>Datos del pedido</h2></div><ShoppingBag size={19} className="sales-panel-icon"/></div>
      <label className={`plain-field ${errors.channel ? 'field-invalid' : ''}`}><span>Canal de venta <span className="required-mark">*</span></span><select value={channelId} onChange={event => onChannel(event.target.value)}><option value="">Seleccioná un canal de venta</option>{channels.map(channel => <option value={channel.id} key={channel.id}>{channel.descripcion}</option>)}</select>{errors.channel && <p className="field-error">{errors.channel}</p>}</label>
      <label className={`plain-field ${errors.observations ? 'field-invalid' : ''}`}><span>Observaciones <span className="sales-optional">Opcional</span></span><textarea value={observations} maxLength={500} placeholder="Indicaciones o comentarios para este pedido…" onChange={event => onObservations(event.target.value)}/><small className="sales-character-count">{observations.length}/500 caracteres</small>{errors.observations && <p className="field-error">{errors.observations}</p>}</label>
      
    </div>
  </section>;
}

type ProductsStepProps = { products: Product[]; prices: Record<number, PriceState>; stockByProduct: Map<number, number>; coverByProduct: Map<number, string | null>; query: string; filter: 'all' | 'available'; lines: Line[]; errors: FieldErrors; total: number; onQuery: (value: string) => void; onFilter: (value: 'all' | 'available') => void; onAdd: (product: Product) => void; onQuantity: (id: number, value: string) => void; onRemove: (id: number) => void };
function ProductsStep({ products, prices, stockByProduct, coverByProduct, query, filter, lines, errors, total, onQuery, onFilter, onAdd, onQuantity, onRemove }: ProductsStepProps) {
  return <section className="sales-wizard-columns sales-products-step">
    <div className="sales-card sales-wizard-panel sales-catalog-panel"><div className="sales-panel-heading"><div><h2>Agregar productos</h2></div></div><div className="sales-catalog-tools"><div className="sales-picker"><Search size={16}/><input aria-label="Buscar producto" value={query} placeholder="Buscar por nombre o código" onChange={event => onQuery(event.target.value)}/></div><select aria-label="Filtrar productos" value={filter} onChange={event => onFilter(event.target.value as 'all' | 'available')}><option value="all">Todos</option><option value="available">Con stock</option></select></div><div className="sales-product-catalog">{products.length ? products.map(product => { const price = prices[product.productoId]; const available = Math.max(0, stockByProduct.get(product.productoId) ?? 0); const cover = coverByProduct.get(product.productoId); return <article key={product.productoId}><div className="sales-product-cover">{cover ? <EcommerceImage url={cover} alt={productName(product)}/> : <ImageOff size={26}/>}</div><div className="sales-product-info"><strong title={productName(product)}>{productName(product)}</strong><small>{product.codigo}</small><small>Stock: {decimal.format(available)} {product.unidadMedidaAbreviatura}</small><span className={price === 'missing' || price === 'error' ? 'sales-price-unavailable' : ''}>{isPrice(price) ? ars.format(price.precio) : price === 'missing' ? 'Sin precio vigente' : price === 'error' ? 'Error al consultar precio' : 'Consultando precio…'}</span></div><button type="button" className="button primary" disabled={!isPrice(price) || available <= 0} onClick={() => onAdd(product)}><Plus size={14}/> Agregar</button></article>; }) : <div className="sales-empty">No hay productos para esta búsqueda.</div>}</div></div>
    <div className="sales-card sales-wizard-panel sales-selected-panel"><div className="sales-panel-heading"><div><h2>Productos del pedido <span className="sales-count-pill">{lines.length}</span></h2></div>{lines.length > 0 && <button type="button" className="sales-text-action" onClick={() => lines.forEach(line => onRemove(line.product.productoId))}><RotateCcw size={14}/> Limpiar</button>}</div><div className="sales-selected-list">{lines.length === 0 ? <div className="sales-empty sales-cart-empty"><ShoppingBag size={28}/><strong>Tu pedido está vacío</strong><span>Agregá productos del catálogo para comenzar.</span></div> : lines.map(line => <div className="sales-create-line" key={line.product.productoId}><div className="sales-line-cover">{coverByProduct.get(line.product.productoId) ? <EcommerceImage url={coverByProduct.get(line.product.productoId)} alt={productName(line.product)}/> : <ImageOff size={17}/>}</div><div className="sales-line-detail"><strong>{productName(line.product)}</strong><small>{ars.format(line.price)} c/u</small><div className="sales-line-bottom"><label className={errors.quantities?.[line.product.productoId] ? 'field-invalid' : ''}><span className="sr-only">Cantidad de {productName(line.product)}</span><button type="button" aria-label={`Reducir ${productName(line.product)}`} onClick={() => onQuantity(line.product.productoId, String(Math.max(1, quantityValue(line.quantity) - 1)))}>−</button><input type="text" inputMode="decimal" value={line.quantity} onChange={event => onQuantity(line.product.productoId, event.target.value)}/><button type="button" aria-label={`Aumentar ${productName(line.product)}`} onClick={() => onQuantity(line.product.productoId, String(quantityValue(line.quantity) + 1))}>+</button></label><b>{quantityPattern.test(line.quantity) ? ars.format(lineSubtotal(line)) : '—'}</b></div>{errors.quantities?.[line.product.productoId] && <p className="field-error">{errors.quantities[line.product.productoId]}</p>}</div><button type="button" className="sales-remove-line" aria-label={`Quitar ${productName(line.product)}`} onClick={() => onRemove(line.product.productoId)}><Trash2 size={16}/></button></div>)}</div>{errors.products && <p className="field-error">{errors.products}</p>}<div className="sales-selected-total"><span>Total del pedido</span><strong>{ars.format(total)}</strong></div></div>
  </section>;
}

function ReviewStep({ customer, channel, addresses, lines, coverByProduct, observations, total, onEdit }: { customer: SalesCustomer; channel: SalesChannel; addresses: SalesCustomerAddress[]; lines: Line[]; coverByProduct: Map<number, string | null>; observations: string; total: number; onEdit: (step: Step) => void }) {
  return <section className="sales-review-layout">
    <div className="sales-card sales-review-primary">
      <div className="sales-panel-heading"><h2>Resumen del pedido</h2></div>
      <div className="sales-review-customer-card">
        <div><strong>Cliente</strong><p>{customerName(customer)}</p><small>{customer.tipoDocumentoNombre}: {customer.documento || 'No informado'} · {channel.descripcion}</small></div>
        <button type="button" className="button secondary" onClick={() => onEdit(1)}>Editar</button>
      </div>
      <div className="sales-review-facts sales-review-facts-compact">
        <div><span>Domicilio registrado</span><strong>{addresses[0]?.direccion || (addresses[0] ? `${addresses[0].calle} ${addresses[0].altura}, ${addresses[0].localidadNombre}` : 'No informado')}</strong></div>
        {observations && <div><span>Observaciones</span><strong>{observations}</strong></div>}
      </div>
      <div className="sales-panel-heading sales-review-products-title"><h2>Productos ({lines.length})</h2><button type="button" className="sales-text-action" onClick={() => onEdit(2)}>Editar</button></div>
      <div className="sales-review-table-head"><span>Producto</span><span>Cantidad</span><span>Precio unit.</span><span>Subtotal</span></div>
      <div className="sales-review-lines">{lines.map(line => <div key={line.product.productoId}><div className="sales-review-product"><div className="sales-line-cover">{coverByProduct.get(line.product.productoId) ? <EcommerceImage url={coverByProduct.get(line.product.productoId)} alt={productName(line.product)}/> : <ImageOff size={17}/>}</div><strong>{productName(line.product)}</strong></div><span>{decimal.format(quantityValue(line.quantity))}</span><span>{ars.format(line.price)}</span><b>{ars.format(lineSubtotal(line))}</b></div>)}</div>
    </div>
    <aside className="sales-review-aside"><div className="sales-card sales-review-totals"><h2>Totales</h2><div><span>Subtotal</span><strong>{ars.format(total)}</strong></div><div className="sales-review-grand-total"><span>Total del pedido</span><strong>{ars.format(total)}</strong></div></div><div className="sales-review-confirmation">Al confirmar, el pedido quedará registrado y podrás continuar con el cobro.</div></aside>
  </section>;
}

