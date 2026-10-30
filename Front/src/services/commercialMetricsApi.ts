import { apiRequest } from './apiClient';

/** Contrato existente: GET /api/ventas, PedidoDTO. */
export type PedidoComercial = {
  pedidoId: number;
  fechaPedido: string;
  estadoPedidoId: number;
  estadoPedidoNombre: string;
  total: number;
};
export const obtenerPedidosParaIndicadores = () => apiRequest<PedidoComercial[]>('/api/ventas');
