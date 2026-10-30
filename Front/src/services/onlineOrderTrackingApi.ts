import { apiRequest } from './apiClient';
export type CobroPedido = { cobroId:number; estadoCobroNombre:string; medioCobroNombre:string; fechaCobro:string; importeFinal:number; referenciaExterna:string|null };
export type ReservaPedido = { reservaStockOnlineId:number; productoId:number; productoCodigo:string; productoNombre:string; depositoId:number; depositoNombre:string; cantidad:number; estado:string; fechaReserva:string; fechaCierre:string|null };
export type RemitoPedido = { remitoId:number; numeroRemito:string|null; fechaRemito:string; domicilioEntrega:string|null; entregado:boolean; fechaEntrega:string|null };
export type SeguimientoPedido = { pedidoId:number; cobros:CobroPedido[]; reservas:ReservaPedido[]; remitos:RemitoPedido[] };
export const consultarSeguimientoPedido=(id:number)=>apiRequest<SeguimientoPedido>(`/api/ecommerce/pedidos/${id}/seguimiento`);
