import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronRight, ExternalLink, RefreshCw, RotateCcw, Search, ShoppingCart, X } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { PageHeader } from '../../components/data/PageHeader';
import { consultarEstadosPedido, consultarPedido, consultarPedidosOnline, type EstadoPedidoLookup, type Pedido, type PedidoCompleto } from '../../services/onlineOrdersApi';
import './onlineOrders.css';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const localDate = (value: string) => new Date(value).toLocaleDateString('es-AR');
const dateKey = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };

export function OnlineOrdersPage() {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [statuses, setStatuses] = useState<EstadoPedidoLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelNotice, setChannelNotice] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PedidoCompleto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(''); setChannelNotice('');
    try {
      const [online, stateCatalog] = await Promise.all([consultarPedidosOnline(), consultarEstadosPedido()]);
      setOrders(online.pedidos);
      setStatuses(stateCatalog);
      if (!online.identificacionEstable) setChannelNotice('El catálogo de canales no permitió identificar un ID estable. Se mantuvo la identificación compatible por nombre.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudieron consultar los pedidos online.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (selectedId === null) { setDetail(null); setDetailError(''); return; }
    let active = true; setDetailLoading(true); setDetailError('');
    void consultarPedido(selectedId).then(value => { if (active) setDetail(value); }).catch(caught => { if (active) setDetailError(caught instanceof Error ? caught.message : 'No se pudo consultar el pedido.'); }).finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const dateError = from && to && from > to ? 'La fecha Desde no puede ser posterior a Hasta.' : '';
  const filtered = useMemo(() => orders.filter(order => {
    const orderDate = dateKey(order.fechaPedido);
    const text = `${order.pedidoId} ${order.clienteNombre} ${order.clienteApellido || ''}`.toLocaleLowerCase('es-AR');
    return !dateError && (!from || orderDate >= from) && (!to || orderDate <= to)
      && (status === 'all' || order.estadoPedidoId === Number(status))
      && text.includes(search.trim().toLocaleLowerCase('es-AR'));
  }), [orders, from, to, status, search, dateError]);
  const pageSize = 10;
  const actualPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((actualPage - 1) * pageSize, actualPage * pageSize);
  const total = filtered.reduce((sum, order) => sum + order.total, 0);
  const clear = () => { setSearch(''); setFrom(''); setTo(''); setStatus('all'); setPage(1); };

  const columns: DataTableColumn<Pedido>[] = [
    { key: 'number', header: 'Pedido', render: order => <strong>#{order.pedidoId}</strong> },
    { key: 'date', header: 'Fecha', render: order => localDate(order.fechaPedido) },
    { key: 'customer', header: 'Cliente', render: order => <span>{order.clienteNombre} {order.clienteApellido || ''}</span> },
    { key: 'channel', header: 'Origen', render: order => order.canalVentaNombre },
    { key: 'status', header: 'Estado real', render: order => <span className="online-pill">{order.estadoPedidoNombre}</span> },
    { key: 'total', header: 'Importe', render: order => <strong>{money.format(order.total)}</strong> },
    { key: 'open', header: '', render: () => <ChevronRight size={16}/> },
  ];

  return <AppShell title="Actividad online" breadcrumb="E-commerce / Actividad online">
    <main className="online-orders">
      <PageHeader kicker="E-COMMERCE" title="Actividad online" description="Seguimiento de los pedidos originados en el canal digital. La gestión administrativa continúa en Ventas." action={<button type="button" className="button secondary" onClick={() => void load()}><RefreshCw size={16}/>Actualizar</button>}/>
      <section className="online-filter-panel">
        <div className="online-filters">
          <label>Desde<input type="date" value={from} max={to || undefined} onChange={event => { setFrom(event.target.value); setPage(1); }}/></label>
          <label>Hasta<input type="date" value={to} min={from || undefined} onChange={event => { setTo(event.target.value); setPage(1); }}/></label>
          <label>Estado<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">Todos los estados</option>{statuses.map(item => <option key={item.estadoPedidoId} value={item.estadoPedidoId}>{item.nombre}</option>)}</select></label>
          <label>Buscar pedido o cliente<div className="online-search"><Search size={16}/><input value={search} placeholder="Número o cliente" onChange={event => { setSearch(event.target.value); setPage(1); }}/></div></label>
          <button type="button" className="online-clear" onClick={clear}><RotateCcw size={16}/>Limpiar</button>
        </div>
        {dateError && <p className="online-error" role="alert">{dateError}</p>}
      </section>
      {error && <div className="online-error" role="alert"><AlertCircle size={18}/><span>{error}</span><button onClick={() => void load()}>Reintentar</button></div>}
      {channelNotice && <div className="online-muted" role="status">{channelNotice}</div>}
      <div className="ec-catalog-summary"><strong>{filtered.length}</strong> pedidos online · <strong>{money.format(total)}</strong> de importe registrado <span>Los importes corresponden a pedidos, no a cobros.</span></div>
      <section className={`online-erp-layout ${selectedId !== null ? 'has-detail' : ''}`}>
        <div className="online-erp-list"><DataTable rows={visible} columns={columns} rowKey={order => order.pedidoId} loading={loading} page={actualPage} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} onRowClick={order => setSelectedId(order.pedidoId)} selectedRowKey={selectedId} emptyState={<div className="state-box">No hay pedidos online para los filtros seleccionados.</div>}/></div>
        {selectedId !== null && <aside className="online-erp-detail" aria-label={`Seguimiento del pedido ${selectedId}`}>
          <header className="online-erp-detail-head"><div className="online-erp-mark"><ShoppingCart size={22}/></div><div className="online-erp-detail-heading"><h2>Pedido #{selectedId}</h2><p>Consulta resumida del canal online</p></div><button className="online-erp-close" type="button" aria-label="Cerrar detalle" onClick={() => setSelectedId(null)}><X size={19}/></button></header>
          {detailLoading ? <div className="online-erp-state">Consultando pedido…</div> : detailError ? <div className="online-error" role="alert">{detailError}</div> : detail && <div className="online-erp-detail-body">
            <section className="online-erp-card"><h3>Resumen</h3><div className="online-erp-records"><article><span>Cliente</span><strong>{detail.clienteNombre} {detail.clienteApellido || ''}</strong></article><article><span>Estado</span><strong>{detail.estadoPedidoNombre}</strong></article><article><span>Origen</span><strong>{detail.canalVentaNombre}</strong></article><article><span>Importe del pedido</span><strong>{money.format(detail.total)}</strong></article></div></section>
            <section className="online-erp-card"><h3>Productos</h3>{detail.detalles?.length ? <div className="online-erp-records">{detail.detalles.map(line => <article key={line.detallePedidoId}><span>{line.productoCodigo}</span><strong>{line.productoNombre}</strong><span>{number.format(line.cantidad)} × {money.format(line.precioUnitario)}</span><strong>{money.format(line.subtotal)}</strong></article>)}</div> : <p className="online-erp-empty">Sin líneas disponibles.</p>}</section>
            {detail.observaciones && <section className="online-erp-card"><h3>Observaciones</h3><p>{detail.observaciones}</p></section>}
            <a className="button primary online-erp-sales" href={`/ventas/pedidos/${detail.pedidoId}`}><ExternalLink size={16}/>Continuar gestión en Ventas</a>
          </div>}
        </aside>}
      </section>
    </main>
  </AppShell>;
}
