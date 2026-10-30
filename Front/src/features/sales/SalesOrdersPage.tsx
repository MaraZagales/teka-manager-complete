import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Plus, SlidersHorizontal } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { salesOrdersApi, type SalesOrder, type SalesOrderBalance, type SalesOrderStatus, type SalesCustomer } from '../../services/salesOrdersApi';
import { ars, dateOnly, orderTone } from './salesOrderUtils';
import { filterSalesOrders, paginateSalesOrders, salesOrderNumber, type SalesOrderSort } from './salesOrderListRules';
import './salesOrders.css';

const pageSize = 8;

export function SalesOrdersPage() {
  const requestedCustomerId = Number(new URLSearchParams(location.search).get('clienteId')) || null;
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [requestedCustomer, setRequestedCustomer] = useState<SalesCustomer | null>(null);
  const [statuses, setStatuses] = useState<SalesOrderStatus[]>([]);
  const [balances, setBalances] = useState<Record<number, SalesOrderBalance | null | false | undefined>>({});
  const balanceRequests = useRef(new Set<number>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [channel, setChannel] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<SalesOrderSort>('recent');
  const [page, setPage] = useState(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const canCreate = hasPermission('Ventas', 'Crear');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [orderResult, statusResult] = await Promise.all([salesOrdersApi.list(), salesOrdersApi.statuses()]);
      setOrders(orderResult); setStatuses(statusResult); balanceRequests.current.clear(); setBalances({});
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se pudieron consultar los pedidos.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!requestedCustomerId) { setRequestedCustomer(null); return; }
    let active = true;
    salesOrdersApi.customers()
      .then(customers => { if (active) setRequestedCustomer(customers.find(customer => customer.clienteId === requestedCustomerId) ?? null); })
      .catch(() => { if (active) setRequestedCustomer(null); });
    return () => { active = false; };
  }, [requestedCustomerId]);

  const channels = useMemo(() => [...new Set(orders.map(order => order.canalVentaNombre).filter(Boolean))].sort(), [orders]);
  const dateError = from && to && from > to ? 'La fecha Desde no puede ser posterior a Hasta.' : '';
  const filtered = useMemo(() => {
    if (dateError) return [];
    const customerOrders = requestedCustomerId ? orders.filter(order => order.clienteId === requestedCustomerId) : orders;
    return filterSalesOrders(customerOrders, { search, from, to, channel, status, sort });
  }, [orders, search, from, to, channel, status, sort, dateError, requestedCustomerId]);

  const { actualPage, rows: visible } = paginateSalesOrders(filtered, page, pageSize);
  const visibleIds = visible.map(order => order.pedidoId).join(',');
  const hasFilters = Boolean(search || from || to || channel !== 'all' || status !== 'all' || sort !== 'recent');

  useEffect(() => {
    let active = true;
    const pending = visible.filter(order => balances[order.pedidoId] === undefined && !balanceRequests.current.has(order.pedidoId));
    if (!pending.length) return () => { active = false; };
    pending.forEach(order => balanceRequests.current.add(order.pedidoId));
    setBalances(current => Object.fromEntries([...Object.entries(current), ...pending.map(order => [order.pedidoId, null])]));
    void Promise.allSettled(pending.map(order => salesOrdersApi.balance(order.pedidoId))).then(results => {
      if (!active) return;
      setBalances(current => {
        const next = { ...current };
        results.forEach((result, index) => { next[pending[index].pedidoId] = result.status === 'fulfilled' ? result.value : false; });
        return next;
      });
    });
    return () => { active = false; };
    // The visible ID list drives lazy balance loading; balances is a cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds]);

  function clearFilters() {
    setSearch(''); setFrom(''); setTo(''); setChannel('all'); setStatus('all'); setSort('recent'); setPage(1);
  }

  const columns: DataTableColumn<SalesOrder>[] = [
    { key: 'number', header: 'N° pedido', width: '15%', render: order => <span className="sales-order-number">{salesOrderNumber(order.pedidoId)}</span> },
    { key: 'date', header: 'Fecha', width: '15%', render: order => dateOnly(order.fechaPedido) },
    { key: 'client', header: 'Cliente', width: '32%', render: order => <div className="sales-client"><strong>{`${order.clienteNombre} ${order.clienteApellido ?? ''}`.trim()}</strong><small>{order.canalVentaNombre}</small></div> },
    { key: 'status', header: 'Estado', width: '21%', render: order => { const balance = balances[order.pedidoId]; const availableBalance = balance && typeof balance !== 'boolean' ? balance : null; const isCancelled = /cancel|anulad/i.test(order.estadoPedidoNombre); const isDelivered = /entreg/i.test(order.estadoPedidoNombre); const label = !isCancelled && !isDelivered && availableBalance && availableBalance.totalCobrado > 0.01 ? (availableBalance.saldo <= 0.01 ? 'Cobro confirmado' : 'Cobro en curso') : order.estadoPedidoNombre; const visualClass = /cancel|anulad|rechaz/i.test(label) ? 'sales-status-cancelled' : /cobro confirmado|pago completo/i.test(label) ? 'sales-status-payment' : /cobro en curso|en proceso|producci[oó]n/i.test(label) ? 'sales-status-in-progress' : /listo\s+para\s+entrega/i.test(label) ? 'sales-status-ready' : /entreg/i.test(label) ? 'sales-status-delivered' : /confirmad/i.test(label) ? 'sales-status-confirmed' : /pendiente|nuevo|recibido/i.test(label) ? 'sales-status-pending' : ''; return <span className={visualClass}><StatusBadge tone={/cobro confirmado/i.test(label) ? 'success' : /cobro en curso/i.test(label) ? 'warning' : orderTone(label)}>{label}</StatusBadge></span>; } },
    { key: 'total', header: 'Total', width: '17%', className: 'sales-money', render: order => <strong>{ars.format(order.total)}</strong> },
  ];

  return <AppShell title="Pedidos" breadcrumb="Ventas / Pedidos">
    <div className="sales-orders-page">
      <PageHeader title="Pedidos" action={canCreate && <a className="button primary" href="/ventas/pedidos/nuevo"><Plus size={17}/> Registrar pedido</a>}/>
      {requestedCustomerId && <div className="sales-success" role="status"><span>Mostrando pedidos de {requestedCustomer ? `${requestedCustomer.tipoDocumentoNombre}${requestedCustomer.documento ? ` ${requestedCustomer.documento}` : ''} · ${[requestedCustomer.nombre, requestedCustomer.apellido].filter(Boolean).join(' ')}` : (orders.find(order => order.clienteId === requestedCustomerId) ? [orders.find(order => order.clienteId === requestedCustomerId)?.clienteNombre, orders.find(order => order.clienteId === requestedCustomerId)?.clienteApellido].filter(Boolean).join(' ') : 'cliente seleccionado')}.</span><a className="button secondary" href="/ventas/pedidos">Ver todos</a></div>}
      <DataTableFilters search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Buscar cliente o número de pedido" onClear={clearFilters} clearDisabled={!hasFilters} className="sales-filters">
        <label className="data-table-filter-field sales-status-filter"><span>Estado</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">Todos</option>{statuses.map(item => <option value={item.id} key={item.id}>{item.descripcion}</option>)}</select></label>
        <label className="data-table-filter-field sales-from-filter"><span>Fecha desde</span><input type="date" value={from} max={to || undefined} aria-invalid={Boolean(dateError)} onChange={event => { setFrom(event.target.value); setPage(1); }}/></label>
        <label className="data-table-filter-field sales-to-filter"><span>Fecha hasta</span><input type="date" value={to} min={from || undefined} aria-invalid={Boolean(dateError)} onChange={event => { setTo(event.target.value); setPage(1); }}/></label>
        <button type="button" className="button secondary sales-advanced-toggle" aria-expanded={advancedOpen} aria-controls="sales-advanced-filters" onClick={() => setAdvancedOpen(open => !open)}><SlidersHorizontal size={16}/> Más filtros</button>
      </DataTableFilters>
      {advancedOpen && <div id="sales-advanced-filters" className="sales-advanced-filters"><label className="data-table-filter-field"><span>Canal de venta</span><select value={channel} onChange={event => { setChannel(event.target.value); setPage(1); }}><option value="all">Todos los canales</option>{channels.map(item => <option key={item}>{item}</option>)}</select></label><label className="data-table-filter-field"><span>Ordenar por</span><select value={sort} onChange={event => { setSort(event.target.value as SalesOrderSort); setPage(1); }}><option value="recent">Más recientes</option><option value="oldest">Más antiguos</option><option value="total-desc">Mayor importe</option><option value="total-asc">Menor importe</option></select></label></div>}
      {dateError && <div className="sales-error" role="alert"><AlertCircle size={18}/><span>{dateError}</span></div>}
      {error && <div className="sales-error" role="alert"><AlertCircle size={18}/><span>{error}</span><button type="button" className="button secondary" onClick={() => void load()}>Reintentar</button></div>}
      <DataTable rows={visible} columns={columns} rowKey={order => order.pedidoId} loading={loading} loadingText="Consultando pedidos…" emptyState={<div className="state-box">{hasFilters ? 'No hay pedidos que coincidan con los filtros.' : 'Todavía no hay pedidos registrados.'}</div>} page={actualPage} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} onRowClick={order => { location.href = `/ventas/pedidos/${order.pedidoId}`; }} tableClassName="sales-orders-table"/>
    </div>
  </AppShell>;
}
