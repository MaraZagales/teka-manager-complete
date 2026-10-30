import type { SeguimientoPedido } from '../../services/onlineOrderTrackingApi';
import type { SalesOrderDetail, SalesOrderRelated } from '../../services/salesOrdersApi';

export function productEditBlockReason(order: SalesOrderDetail, related: SalesOrderRelated, tracking: SeguimientoPedido): string | null {
  if (related.unavailable.length) return 'No se pudieron verificar todas las operaciones asociadas. Actualizá y reintentá.';
  if (order.estadoPedidoNombre.toLocaleLowerCase('es-AR') !== 'pendiente') return 'Solo se editan productos de pedidos pendientes.';
  if (related.collections.length || related.documents.length || related.deliveryNotes.length || tracking.cobros.length || tracking.reservas.length || tracking.remitos.length) {
    return 'Este pedido ya tiene cobros, reservas, comprobantes o remitos asociados. Sus productos no se pueden modificar.';
  }
  return null;
}
