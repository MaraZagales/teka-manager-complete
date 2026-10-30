import type { SalesOrder } from '../../services/salesOrdersApi';

export type SalesOrderSort = 'recent' | 'oldest' | 'total-desc' | 'total-asc';
export type SalesOrderListFilters = {
  search: string;
  from: string;
  to: string;
  channel: string;
  status: string;
  sort: SalesOrderSort;
};

export const salesOrderNumber = (id: number) => `PED-${String(id).padStart(6, '0')}`;

function dateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

export function filterSalesOrders(orders: SalesOrder[], filters: SalesOrderListFilters) {
  if (filters.from && filters.to && filters.from > filters.to) return [];
  const term = filters.search.trim().toLocaleLowerCase('es-AR');
  const digits = term.replace(/\D/g, '');
  return orders.filter(order => {
    const searchable = `${order.clienteNombre} ${order.clienteApellido ?? ''} ${salesOrderNumber(order.pedidoId)} ${order.pedidoId}`.toLocaleLowerCase('es-AR');
    const orderDate = dateKey(order.fechaPedido);
    return (!term || searchable.includes(term) || (digits && String(order.pedidoId).includes(digits)))
      && (!filters.from || orderDate >= filters.from)
      && (!filters.to || orderDate <= filters.to)
      && (filters.channel === 'all' || order.canalVentaNombre === filters.channel)
      && (filters.status === 'all' || order.estadoPedidoId === Number(filters.status));
  }).sort((left, right) => {
    if (filters.sort === 'total-desc') return right.total - left.total;
    if (filters.sort === 'total-asc') return left.total - right.total;
    const difference = new Date(left.fechaPedido).getTime() - new Date(right.fechaPedido).getTime();
    return filters.sort === 'oldest' ? difference : -difference;
  });
}

export function paginateSalesOrders(orders: SalesOrder[], page: number, pageSize: number) {
  const actualPage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(orders.length / pageSize)));
  return { actualPage, rows: orders.slice((actualPage - 1) * pageSize, actualPage * pageSize) };
}
