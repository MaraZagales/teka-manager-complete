import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, Ban } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { DateRangeFilter } from '../../components/data/DateRangeFilter';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { productsApi, type Product } from '../../services/productsApi';
import { hasPermission } from '../../services/authorization';
import { productionOrdersApi, type ProductionLookup, type ProductionOrder } from '../../services/productionOrdersApi';
import { filterProductionOrders, paginateProductionOrders, productionOrderNumber, productionStatusTone, quantity } from './productionOrderUtils';
import './productionOrders.css';

const pageSize = 6;

export function ProductionOrdersPage() {
  const initial = useMemo(() => new URLSearchParams(location.search), []);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [statuses, setStatuses] = useState<ProductionLookup[]>([]);
  const [types, setTypes] = useState<ProductionLookup[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [productSummaries, setProductSummaries] = useState<Record<number, Array<{productoId:number; nombre:string; cantidad:number}>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(initial.get('q') ?? '');
  const [from, setFrom] = useState(initial.get('from') ?? '');
  const [to, setTo] = useState(initial.get('to') ?? '');
  const [status, setStatus] = useState(initial.get('status') ?? 'all');
  const [page, setPage] = useState(Math.max(1, Number(initial.get('page')) || 1));
  const canCreate = hasPermission('Producción', 'Crear');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [orderResult, statusResult, typeResult] = await Promise.all([productionOrdersApi.list(), productionOrdersApi.statuses(), productionOrdersApi.types()]);
      // El catálogo enriquece el listado, pero no debe bloquear la consulta de OP.
      void productsApi.list().then(setCatalogProducts).catch(() => setCatalogProducts([]));
      setOrders(orderResult); setStatuses(statusResult); setTypes(typeResult);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se pudieron consultar las órdenes de producción.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    if (status !== 'all') query.set('status', status);
    if (page > 1) query.set('page', String(page));
    history.replaceState(null, '', `${location.pathname}${query.size ? `?${query}` : ''}`);
  }, [search, from, to, status, page]);

  const dateError = from && to && from > to ? 'La fecha Desde no puede ser posterior a Hasta.' : '';
  const filtered = useMemo(() => dateError ? [] : filterProductionOrders(orders, { search, from, to, status }), [orders, search, from, to, status, dateError]);
  const { actualPage, rows } = paginateProductionOrders(filtered, page, pageSize);
  // El listado de la API solo informa cantidades; consultamos el detalle de las
  // órdenes visibles, sin disparar una solicitud por cada registro histórico.
  useEffect(() => {
    let active = true;
    const missing = rows.filter(order => !Object.prototype.hasOwnProperty.call(productSummaries, order.ordenProduccionId));
    if (missing.length === 0) return;
    void Promise.allSettled(missing.map(async order => {
      const detail = await productionOrdersApi.getById(order.ordenProduccionId);
      const products = detail.productos;
      const summary = products.map(product => ({ productoId: product.productoId, nombre: product.productoNombre, cantidad: product.cantidadPlanificada }));
      return [order.ordenProduccionId, summary] as const;
    })).then(results => {
      if (!active) return;
      setProductSummaries(previous => {
        const next = { ...previous };
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') next[result.value[0]] = result.value[1];
          else next[missing[index].ordenProduccionId] = [];
        });
        return next;
      });
    });
    return () => { active = false; };
  }, [rows.map(order => order.ordenProduccionId).join(',')]);
  const productById = useMemo(() => new Map(catalogProducts.map(product => [product.productoId, product])), [catalogProducts]);
  const typeById = useMemo(() => new Map(types.map(item => [item.id, item.descripcion])), [types]);
  const hasFilters = Boolean(search || from || to || status !== 'all');

  function clearFilters() { setSearch(''); setFrom(''); setTo(''); setStatus('all'); setPage(1); }
  function openOrder(id: number) {
    sessionStorage.setItem('production-orders-return-url', `${location.pathname}${location.search}`);
    location.href = `/production/orders/${id}`;
  }

  const columns: DataTableColumn<ProductionOrder>[] = [
    { key: 'number', header: 'Orden', width: '12%', render: order => <button className="production-order-link" type="button" onClick={event => { event.stopPropagation(); openOrder(order.ordenProduccionId); }}>{productionOrderNumber(order.ordenProduccionId)}</button> },
    { key: 'date', header: 'Fecha', width: '10%', render: order => new Date(order.fechaCreacion).toLocaleDateString('es-AR') },
    { key: 'plan', header: 'Productos a fabricar', width: '30%', render: order => {
      const products = productSummaries[order.ordenProduccionId];
      if (!products) return 'Consultando productos…';
      if (!products.length) return 'Sin detalle disponible';
      const description = (product: typeof products[number]) => {
        const color = productById.get(product.productoId)?.colorNombre;
        return `${product.nombre}${color ? ` · ${color}` : ''} — ${quantity.format(product.cantidad)} un.`;
      };
      const remaining = products.length - 2;
      return <div className="production-order-products">
        {products.slice(0, 2).map((product, index) => <div className="production-order-product" key={`${product.productoId}-${index}`} title={description(product)}>
          <span className="production-order-product-name">{product.nombre}</span>
          {productById.get(product.productoId)?.colorNombre && <span className="production-order-product-color"> · {productById.get(product.productoId)?.colorNombre}</span>}
          <strong className="production-order-product-quantity">{quantity.format(product.cantidad)} un.</strong>
        </div>)}
        {remaining > 0 && <div className="production-order-more-wrap" onClick={event => event.stopPropagation()}>
          <button type="button" className="production-order-more" aria-label={`Ver los ${products.length} productos de la orden`} aria-describedby={`production-order-products-${order.ordenProduccionId}`}>
            + {remaining} {remaining === 1 ? 'producto más' : 'productos más'}
          </button>
          <div className="production-order-popover" id={`production-order-products-${order.ordenProduccionId}`} role="tooltip">
            <strong>Composición de la orden</strong>
            {products.map((product, index) => <div key={`${product.productoId}-${index}`} className="production-order-popover-line">{description(product)}</div>)}
            <div className="production-order-popover-total">Total: {quantity.format(products.reduce((sum, product) => sum + product.cantidad, 0))} un.</div>
          </div>
        </div>}
      </div>;
    } },
    { key: 'type', header: 'Tipo', width: '15%', render: order => typeById.get(order.tipoProduccionId) ?? `Tipo ${order.tipoProduccionId}` },
    { key: 'status', header: 'Estado', width: '15%', render: order => <StatusBadge tone={productionStatusTone(order.estadoOrdenProduccionNombre)}>{order.estadoOrdenProduccionNombre}</StatusBadge> },
    { key: 'actions', header: 'Acciones', width: '18%', className: 'production-actions', render: order => /pendiente/i.test(order.estadoOrdenProduccionNombre) && hasPermission('Producción', 'Inactivar') ? <a className="production-order-cancel-icon" href={`/production/orders/${order.ordenProduccionId}?accion=cancelar`} onClick={event => event.stopPropagation()} title="Anular orden pendiente" aria-label={`Anular ${productionOrderNumber(order.ordenProduccionId)}`}><Ban size={17}/></a> : <span className="production-action-unavailable" title="Sin acciones disponibles para este estado">—</span> },
  ];

  return <AppShell title="Órdenes de producción" breadcrumb="Producción / Órdenes de producción">
    <main className="production-orders-page">
      <PageHeader title="Órdenes de producción" action={canCreate && <a className="button primary production-register-button" href="/production/orders/new"><Plus size={17}/> Registrar orden de producción</a>}/>
      <DataTableFilters search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Buscar OP" onClear={clearFilters} clearDisabled={!hasFilters} className="production-order-filters">
        <DateRangeFilter from={from} to={to} fromLabel="Desde" toLabel="Hasta" onFromChange={value => { setFrom(value); setPage(1); }} onToChange={value => { setTo(value); setPage(1); }}/>
        <label className="data-table-filter-field"><span>Estado</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">Todos</option>{statuses.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
      </DataTableFilters>
      {dateError && <div className="production-message error" role="alert"><AlertCircle size={18}/><span>{dateError}</span></div>}
      {error && <div className="production-message error" role="alert"><AlertCircle size={18}/><span>{error}</span><button type="button" className="button secondary" onClick={() => void load()}>Reintentar</button></div>}
      <DataTable rows={rows} columns={columns} rowKey={order => order.ordenProduccionId} loading={loading} loadingText="Consultando órdenes de producción…" emptyState={<div className="state-box"><strong>{hasFilters ? 'No hay órdenes para estos filtros.' : 'Todavía no hay órdenes de producción.'}</strong><span>{hasFilters ? 'Probá con otros criterios o limpiá los filtros.' : canCreate ? 'Creá la primera orden para comenzar a planificar.' : 'No hay registros disponibles para consultar.'}</span></div>} page={actualPage} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} onRowClick={order => openOrder(order.ordenProduccionId)} tableClassName="production-orders-table"/>
    </main>
  </AppShell>;
}
