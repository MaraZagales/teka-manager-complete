export const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
export const count = new Intl.NumberFormat('es-AR');

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-AR');
}

export function todayInput() { return new Date().toLocaleDateString('en-CA'); }
export function monthStartInput() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; }
export function movementTypeLabel(type: string) {
  return ({ IngresoManual: 'Ingreso de caja', Gasto: 'Egreso de caja', Retiro: 'Retiro', Reposicion: 'Reposición', IngresoCobro: 'Cobro en efectivo' } as Record<string, string>)[type] || type;
}
export function sourceLabel(source?: string | null) {
  return ({ Caja: 'Caja', Cobro: 'Cobro', OrdenPagoProveedor: 'Pago a proveedor', Devolucion: 'Devolución', Gasto: 'Gasto', AjusteAutorizado: 'Ajuste autorizado', Otro: 'Otro' } as Record<string, string>)[source || ''] || source || '—';
}
export function paymentMethodLabel(code: string) {
  return ({ OtroElectronico: 'Otro electrónico', Deposito: 'Depósito' } as Record<string,string>)[code] || code;
}
