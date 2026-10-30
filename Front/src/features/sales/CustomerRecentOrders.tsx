import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { StatusBadge } from '../../components/data/StatusBadge';
import { apiErrorMessage } from '../../services/apiClient';
import { customerOverviewApi, type RecentCustomerOrder } from '../../services/customerOverviewApi';
import { ars, dateOnly, orderTone } from './salesOrderUtils';
import { salesOrderNumber } from './salesOrderListRules';

export function CustomerRecentOrders({ customerId }: { customerId: number }) {
  const [orders, setOrders] = useState<RecentCustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError('');
    void customerOverviewApi.recentOrders(customerId).then(rows => { if (active) setOrders(rows); })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar los pedidos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, retry]);
  const columns: DataTableColumn<RecentCustomerOrder>[] = [
    { key: 'number', header: 'Pedido', render: order => <strong>{salesOrderNumber(order.pedidoId)}</strong> },
    { key: 'date', header: 'Fecha', render: order => dateOnly(order.fechaPedido) },
    { key: 'state', header: 'Estado', render: order => <StatusBadge tone={orderTone(order.estadoPedidoNombre)}>{order.estadoPedidoNombre}</StatusBadge> },
    { key: 'total', header: 'Total', render: order => ars.format(order.total) },
    { key: 'balance', header: 'Saldo pendiente', render: order => order.saldo === null ? 'No disponible' : ars.format(order.saldo) },
    { key: 'action', header: 'Acciones', render: order => <a className="customer-inline-action" href={`/ventas/pedidos/${order.pedidoId}`}>Consultar</a> },
  ];
  return <section className="product-form-section customer-section"><header><span><ClipboardList size={18}/></span><div><h2>Últimos pedidos</h2></div><a className="customer-section-link" href={`/ventas/pedidos?clienteId=${customerId}`}>Ver historial completo</a></header>
    {error ? <div className="product-form-alert" role="alert">{error}<button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}><RefreshCw size={15}/> Reintentar</button></div> : <DataTable rows={orders} columns={columns} rowKey={order => order.pedidoId} loading={loading} page={1} pageSize={5} totalRecords={orders.length} onPageChange={() => {}} onRowClick={order => { location.href = `/ventas/pedidos/${order.pedidoId}`; }} className="customer-embedded-table customer-recent-table" emptyState={<div className="state-box">Este cliente todavía no tiene pedidos.</div>}/>}
  </section>;
}
