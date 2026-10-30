import { apiRequest } from './apiClient';
import type { Lookup } from './salesCustomersApi';

export type RecentCustomerOrder = {
  pedidoId: number;
  fechaPedido: string;
  estadoPedidoNombre: string;
  total: number;
  saldo: number | null;
};

export type CustomerAccountMovement = {
  movimientoCuentaCorrienteClienteId: number;
  fechaMovimiento: string;
  tipoMovimientoCuentaCorrienteId: number;
  tipoMovimientoNombre: string;
  pedidoId: number | null;
  comprobanteId: number | null;
  cobroId: number | null;
  debe: number;
  haber: number;
  saldo: number;
  observaciones: string | null;
};

export type CustomerAccountSummary = {
  debe: number;
  haber: number;
  saldo: number;
  ultimosMovimientos: CustomerAccountMovement[];
  desglose: { tipoMovimientoCuentaCorrienteId: number; nombre: string; signo: number; importe: number }[];
};

export type CustomerAccountPage = {
  total: number;
  pagina: number;
  tamano: number;
  debe: number;
  haber: number;
  saldo: number;
  movimientos: CustomerAccountMovement[];
};

export const customerOverviewApi = {
  recentOrders: (customerId: number) => apiRequest<RecentCustomerOrder[]>(`/api/clientes/${customerId}/pedidos-recientes`),
  accountSummary: (customerId: number) => apiRequest<CustomerAccountSummary>(`/api/clientes/${customerId}/cuenta-corriente/resumen`),
  accountMovements: (customerId: number, filters: { desde?: string; hasta?: string; tipoMovimientoId?: number; pagina: number; tamano: number }) => {
    const params = new URLSearchParams();
    if (filters.desde) params.set('desde', filters.desde);
    if (filters.hasta) params.set('hasta', filters.hasta);
    if (filters.tipoMovimientoId) params.set('tipoMovimientoId', String(filters.tipoMovimientoId));
    params.set('pagina', String(filters.pagina)); params.set('tamano', String(filters.tamano));
    return apiRequest<CustomerAccountPage>(`/api/clientes/${customerId}/cuenta-corriente/movimientos?${params}`);
  },
  movementTypes: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-movimiento-cuenta-corriente'),
};
