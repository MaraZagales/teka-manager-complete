import { Ban, Check, FileText, PackageCheck, ShoppingCart, Truck, CircleDollarSign } from 'lucide-react';
import type { SalesOrderDetail, SalesOrderRelated } from '../../services/salesOrdersApi';
import { dateOnly } from './salesOrderUtils';

export function SalesOrderProgress({ order, related, onNavigate }: { order: SalesOrderDetail; related: SalesOrderRelated; onNavigate?: (tab: 'summary' | 'collections' | 'remitos' | 'delivery' | 'documents') => void }) {
  const recorded = order.historialEstados.find(event => /pendiente|registrad|cread/i.test(event.estadoPedidoNombre))?.fechaCambio || order.fechaPedido;
  const delivered = related.deliveryNotes.find(note => note.entregado);
  const cancelled = /cancel/i.test(order.estadoPedidoNombre);
  const collected = related.balance ? related.balance.saldo <= 0.01 : false;
  const documented = related.documents.some(document => !/anul|rechaz/i.test(document.estadoComprobante));
  const note = related.deliveryNotes[0];
  const document = related.documents.find(item => !/anul|rechaz/i.test(item.estadoComprobante));
  const stages = [
    { target: 'summary' as const, label: 'Pedido confirmado', date: recorded, complete: true, current: false, unknown: false, icon: ShoppingCart },
    { target: 'collections' as const, label: collected ? 'Cobro confirmado' : related.balance && related.balance.totalCobrado > 0.01 ? 'Cobro en curso' : 'Cobro pendiente', date: undefined, complete: collected, current: !cancelled && !collected, unknown: related.unavailable.includes('balance'), icon: CircleDollarSign },
    { target: 'remitos' as const, label: note ? 'Remito completado' : 'Remito pendiente', date: note?.fechaRemito, complete: Boolean(note), current: !cancelled && collected && !note, unknown: related.unavailable.includes('deliveryNotes'), icon: PackageCheck },
    { target: 'delivery' as const, label: delivered ? 'Entrega confirmada' : 'Entrega pendiente', date: delivered?.fechaEntrega, complete: Boolean(delivered), current: !cancelled && Boolean(note) && !delivered, unknown: related.unavailable.includes('deliveryNotes'), icon: Truck },
    { target: 'documents' as const, label: documented ? 'Comprobante emitido' : 'Comprobante pendiente', date: document?.fechaComprobante, complete: documented, current: !cancelled && Boolean(delivered) && !documented, unknown: related.unavailable.includes('documents'), icon: FileText },
  ];

  return (
    <div className="sales-progress" aria-label="Seguimiento del pedido">
      <div className="sales-progress-track">
        {stages.map(stage => {
          const Icon = stage.icon;
          return (
            <button type="button" onClick={() => onNavigate?.(stage.target)} className={`sales-progress-stage ${stage.complete ? 'completed' : ''} ${stage.current ? 'current' : ''}`} key={stage.target} aria-label={`Abrir ${stage.label}`}>
              <span className="sales-progress-dot">
                {stage.complete ? <Check size={17}/> : <Icon size={17}/>} 
              </span>
              <strong>{stage.label}</strong>
              <small>{stage.unknown ? 'No disponible' : stage.complete ? stage.date ? dateOnly(stage.date) : 'Sin fecha informada' : stage.current ? 'En curso' : 'Pendiente'}</small>
            </button>
          );
        })}
      </div>

      {cancelled && <p className="sales-progress-cancel"><Ban size={15}/> Pedido cancelado. Consultá el historial para ver el cambio registrado.</p>}
    </div>
  );
}
