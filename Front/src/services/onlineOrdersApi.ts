import { apiRequest } from './apiClient';
export interface Pedido { pedidoId:number; fechaPedido:string; clienteId:number; clienteNombre:string; clienteApellido?:string|null; canalVentaId:number; canalVentaNombre:string; estadoPedidoId:number; estadoPedidoNombre:string; total:number; observaciones?:string|null }
export interface DetallePedido { detallePedidoId:number; productoId:number; productoCodigo:string; productoNombre:string; cantidad:number; precioUnitario:number; subtotal:number }
export interface HistorialPedido { historialEstadoPedidoId:number; estadoPedidoId:number; estadoPedidoNombre:string; fechaCambio:string; observaciones?:string|null }
export interface PedidoCompleto extends Pedido { detalles:DetallePedido[]; historialEstados:HistorialPedido[] }
export const consultarPedidos = () => apiRequest<Pedido[]>('/api/ventas');
export const consultarPedido = (id:number) => apiRequest<PedidoCompleto>(`/api/ventas/${id}`);
export const esCanalOnline = (p:Pedido) => /e[ -]?commerce|online|tienda (web|virtual)|app m[oó]vil/i.test(p.canalVentaNombre ?? '');

export interface EstadoPedidoLookup { estadoPedidoId: number; nombre: string; activo?: boolean }
export interface CanalVentaLookup { id: number; descripcion: string; activo?: boolean }
type EstadoPedidoRaw = EstadoPedidoLookup | { id:number; descripcion:string; activo?:boolean };
export const consultarEstadosPedido = async ():Promise<EstadoPedidoLookup[]> => {
  const items=await apiRequest<EstadoPedidoRaw[]>('/api/auxiliares/estados-pedido');
  return items.map(item=>'id' in item?{estadoPedidoId:item.id,nombre:item.descripcion,activo:item.activo}:item);
};
export const consultarCanalesVenta = () => apiRequest<CanalVentaLookup[]>('/api/auxiliares/canales-venta');
export async function consultarPedidosOnline() {
  const [pedidos, canales] = await Promise.all([consultarPedidos(), consultarCanalesVenta().catch(() => [])]);
  const ids = new Set(canales.filter(canal => esCanalOnline({ canalVentaNombre: canal.descripcion } as Pedido)).map(canal => canal.id));
  return { pedidos: ids.size ? pedidos.filter(pedido => ids.has(pedido.canalVentaId)) : pedidos.filter(esCanalOnline), identificacionEstable: ids.size > 0 };
}
