import type { SalesDocument, SalesDeliveryNote, SalesOrderBalance } from '../../services/salesOrdersApi';

// Se conserva la firma por compatibilidad con los componentes existentes.
// Los SP de remitos y entrega NO requieren un comprobante previo.
export const hasValidDocument = (documents: SalesDocument[]) => documents.some(item => !/anul|rechaz/i.test(item.estadoComprobante));

export function canIssueDeliveryNote(state: string, balance: SalesOrderBalance | null, _documents: SalesDocument[], notes: SalesDeliveryNote[]) {
  return state.toLocaleLowerCase('es-AR') === 'confirmado' && balance !== null && balance.saldo <= 0.01 && notes.every(note => note.anulado);
}

export function canConfirmDelivery(state: string, balance: SalesOrderBalance | null, _documents: SalesDocument[], note: SalesDeliveryNote) {
  return state.toLocaleLowerCase('es-AR') === 'listo para entrega' && balance !== null && balance.saldo <= 0.01 && !note.entregado && !note.anulado;
}
