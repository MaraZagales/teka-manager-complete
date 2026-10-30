import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Plus, Search, Trash2 } from 'lucide-react';
import { apiErrorMessage } from '../../services/apiClient';
import { obtenerDisponibilidadOnline, type DisponibilidadOnline } from '../../services/ecommerceApi';
import { inventoryStockApi, type StockProduct } from '../../services/inventoryStockApi';
import { consultarSeguimientoPedido } from '../../services/onlineOrderTrackingApi';
import { productsApi, type Product } from '../../services/productsApi';
import { formatProductName } from '../../services/productDisplay';
import { salesOrdersApi, type SalesOrderDetail } from '../../services/salesOrdersApi';
import { ars, decimal } from './salesOrderUtils';
import { productEditBlockReason } from './salesOrderEditRules';

const quantityPattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const quantityValue = (value: string) => Number(value.replace(',', '.'));

async function editableOrder(orderId: number) {
  const [order, related, tracking] = await Promise.all([
    salesOrdersApi.get(orderId), salesOrdersApi.related(orderId), consultarSeguimientoPedido(orderId),
  ]);
  const blocked = productEditBlockReason(order, related, tracking);
  if (blocked) throw new Error(blocked);
  return order;
}

export function SalesOrderProductsEditor({ order, onSaved, onClose }: {
  order: SalesOrderDetail; onSaved: () => Promise<void>; onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockProduct[] | null>(null);
  const [online, setOnline] = useState<DisponibilidadOnline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [stockError, setStockError] = useState('');
  const [blocked, setBlocked] = useState('');
  const [query, setQuery] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [lineQuantities, setLineQuantities] = useState<Record<number, string>>({});
  const [fieldError, setFieldError] = useState('');
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [operationError, setOperationError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([editableOrder(order.pedidoId), productsApi.list(), inventoryStockApi.products(), obtenerDisponibilidadOnline()])
      .then(([guard, catalog, stockResult, onlineResult]) => {
        if (!active) return;
        if (guard.status === 'rejected') setBlocked(apiErrorMessage(guard.reason, 'No se pudo verificar si el pedido es editable.'));
        if (catalog.status === 'fulfilled') setProducts(catalog.value.filter(item => item.activo));
        else setLoadError(apiErrorMessage(catalog.reason, 'No se pudo consultar el catálogo.'));
        if (stockResult.status === 'fulfilled') setStock(stockResult.value);
        if (onlineResult.status === 'fulfilled') setOnline(onlineResult.value);
        if (stockResult.status === 'rejected' || onlineResult.status === 'rejected') setStockError('La disponibilidad está incompleta. No se puede asegurar el stock libre para este pedido.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [order.pedidoId]);

  const matches = useMemo(() => products.filter(item => !order.detalles.some(line => line.productoId === item.productoId)
    && `${item.codigo} ${formatProductName(item)}`.toLocaleLowerCase('es-AR').includes(query.trim().toLocaleLowerCase('es-AR'))).slice(0, 10), [products, order.detalles, query]);
  const selected = products.find(item => item.productoId === Number(productId));

  function stockSummary(id: number, requested: number) {
    const physical = stock === null ? null : stock.filter(item => item.productoId === id).reduce((sum, item) => sum + item.cantidadActual, 0);
    const onlineRows = online?.filter(item => item.productoId === id) ?? [];
    const onlineFree = onlineRows.length ? onlineRows.reduce((sum, item) => sum + item.stockLibre, 0) : null;
    const onlineReserved = onlineRows.length ? onlineRows.reduce((sum, item) => sum + item.reservado, 0) : null;
    const insufficient = physical !== null && requested > physical;
    const onlineShortage = onlineFree !== null && requested > onlineFree;
    return { physical, onlineFree, onlineReserved, insufficient, onlineShortage };
  }

  async function run(operation: (fresh: SalesOrderDetail) => Promise<void>) {
    if (busy.current || loading || blocked) return;
    busy.current = true;
    setSaving(true);
    setOperationError('');
    try {
      const fresh = await editableOrder(order.pedidoId);
      await operation(fresh);
      await onSaved();
    } catch (error) {
      const message = apiErrorMessage(error, 'No se pudo modificar el pedido. Actualizá y reintentá.');
      setOperationError(message);
      if (/pendiente|asociad|verificar/i.test(message)) setBlocked(message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  function validateQuantity(value: string) {
    const amount = quantityValue(value.trim());
    return quantityPattern.test(value.trim()) && Number.isFinite(amount) && amount >= 0.01 ? '' : 'Ingresá una cantidad mayor a cero, con hasta dos decimales.';
  }

  async function add() {
    const error = validateQuantity(quantity);
    if (!selected) { setFieldError('Seleccioná un producto del catálogo.'); return; }
    if (error) { setFieldError(error); return; }
    setFieldError('');
    await run(async fresh => {
      if (fresh.detalles.some(item => item.productoId === selected.productoId)) throw new Error('El producto ya está en el pedido. Modificá su cantidad.');
      const price = await salesOrdersApi.currentPrice(selected.productoId);
      if (!price.activo || !Number.isFinite(price.precio) || price.precio <= 0) throw new Error('Este producto no tiene un precio vigente válido.');
      await salesOrdersApi.addLine(fresh.pedidoId, { productoId: selected.productoId, cantidad: quantityValue(quantity.trim()) });
      setProductId(''); setQuery(''); setQuantity('1');
    });
  }

  async function update(lineId: number, value: string) {
    const error = validateQuantity(value);
    if (error) { setRowError(current => ({ ...current, [lineId]: error })); return; }
    setRowError(current => ({ ...current, [lineId]: '' }));
    await run(async fresh => {
      if (!fresh.detalles.some(item => item.detallePedidoId === lineId)) throw new Error('El producto ya no está en el pedido. Actualizá la ficha.');
      await salesOrdersApi.updateLine(lineId, { cantidad: quantityValue(value.trim()) });
    });
  }

  async function remove(lineId: number) {
    await run(async fresh => {
      if (fresh.detalles.length <= 1) throw new Error('El pedido debe conservar al menos un producto.');
      if (!fresh.detalles.some(item => item.detallePedidoId === lineId)) throw new Error('El producto ya no está en el pedido. Actualizá la ficha.');
      await salesOrdersApi.removeLine(lineId);
    });
  }

  return <section className="sales-card sales-products-editor">
    <div className="sales-collection-list-head"><div><h3>Editar productos</h3><p className="sales-section-help">Cada cambio se guarda por separado. El precio pactado de las líneas existentes se conserva; el total se recarga desde el pedido.</p></div><button type="button" className="button secondary" onClick={onClose} disabled={saving}>Cerrar edición</button></div>
    {loading && <p className="sales-section-help">Verificando pedido, catálogo y stock…</p>}
    {blocked && <div className="sales-error" role="alert"><AlertCircle size={17}/>{blocked}</div>}
    {loadError && <div className="sales-error" role="alert"><AlertCircle size={17}/>{loadError}</div>}
    {operationError && <div className="sales-error" role="alert"><AlertCircle size={17}/>{operationError}</div>}
    {stockError && <div className="sales-warning" role="status"><AlertCircle size={17}/>{stockError}</div>}
    {!loading && !blocked && <>
      <div className="sales-product-edit-list">{order.detalles.map(line => {
        const value = lineQuantities[line.detallePedidoId] ?? String(line.cantidad).replace('.', ',');
        const availability = stockSummary(line.productoId, quantityValue(value) || 0);
        return <div className="sales-product-edit-row" key={line.detallePedidoId}>
          <div><strong>{line.productoNombre}</strong><small>{line.productoCodigo} · Precio pactado {ars.format(line.precioUnitario)} · Subtotal actual {ars.format(line.subtotal)}</small><StockNote {...availability}/></div>
          <label className="sales-collection-field"><span>Cantidad</span><input inputMode="decimal" value={value} onChange={event => { setLineQuantities(current => ({ ...current, [line.detallePedidoId]: event.target.value })); setRowError(current => ({ ...current, [line.detallePedidoId]: '' })); }} disabled={saving}/>{rowError[line.detallePedidoId] && <small className="field-error">{rowError[line.detallePedidoId]}</small>}</label>
          <button type="button" className="button secondary" disabled={saving || value === String(line.cantidad).replace('.', ',')} onClick={() => void update(line.detallePedidoId, value)}>Guardar</button>
          <button type="button" className="sales-remove-line" disabled={saving || order.detalles.length <= 1} aria-label={`Quitar ${line.productoNombre}`} title={order.detalles.length <= 1 ? 'El pedido debe conservar un producto' : 'Quitar producto'} onClick={() => void remove(line.detallePedidoId)}><Trash2 size={16}/></button>
        </div>;
      })}</div>
      <div className="sales-product-add"><label className="sales-collection-field"><span>Agregar producto del catálogo</span><span className="sales-product-search"><Search size={16}/><input value={query} onChange={event => { setQuery(event.target.value); setProductId(''); setFieldError(''); }} placeholder="Buscar por código o nombre" disabled={saving || Boolean(loadError)}/></span><select value={productId} onChange={event => { setProductId(event.target.value); setFieldError(''); }} disabled={saving || Boolean(loadError)}><option value="">Seleccionar producto</option>{matches.map(item => <option key={item.productoId} value={item.productoId}>{item.codigo} · {formatProductName(item)}</option>)}</select></label><label className="sales-collection-field"><span>Cantidad</span><input inputMode="decimal" value={quantity} onChange={event => { setQuantity(event.target.value); setFieldError(''); }} disabled={saving}/></label><button type="button" className="button primary" disabled={saving || Boolean(loadError)} onClick={() => void add()}><Plus size={16}/> Agregar</button></div>
      {selected && <StockNote {...stockSummary(selected.productoId, quantityValue(quantity) || 0)}/>}
      {fieldError && <small className="field-error">{fieldError}</small>}
      <p className="sales-section-help">El stock es informativo: el pedido puede anticipar reposición. El disponible online corresponde solo al depósito configurado para ese canal; no representa disponibilidad general de Ventas.</p>
    </>}
  </section>;
}

function StockNote({ physical, onlineFree, onlineReserved, insufficient, onlineShortage }: { physical: number | null; onlineFree: number | null; onlineReserved: number | null; insufficient: boolean; onlineShortage: boolean }) {
  return <small className={insufficient || onlineShortage ? 'sales-stock-warning' : 'sales-stock-note'}>
    {physical === null ? 'Stock físico no disponible' : `Stock físico: ${decimal.format(physical)}`}
    {onlineReserved !== null && ` · Reservado online: ${decimal.format(onlineReserved)}`}
    {onlineFree !== null && ` · Libre online (depósito configurado): ${decimal.format(onlineFree)}`}
    {insufficient && ' · Cantidad solicitada mayor al stock físico registrado; puede requerir reposición.'}
    {!insufficient && onlineShortage && ' · Supera lo libre en el depósito online; otros depósitos podrían tener stock.'}
  </small>;
}
