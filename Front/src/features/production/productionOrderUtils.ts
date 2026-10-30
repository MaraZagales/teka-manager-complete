import type { ProductionOrder } from '../../services/productionOrdersApi';

export type ProductionOrderFilters = {
  search: string;
  from: string;
  to: string;
  status: string;
};

const integer = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
export const quantity = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

export function productionOrderNumber(id: number) {
  return `OP-${String(id).padStart(6, '0')}`;
}

export function productionDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-AR');
}

export function productionDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function productionStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (/finaliz/i.test(status)) return 'success';
  if (/proceso/i.test(status)) return 'warning';
  if (/cancel/i.test(status)) return 'danger';
  return 'neutral';
}

export function productionActivityDate(order: ProductionOrder) {
  if (order.fechaFin) return { label: 'Finalizada', value: productionDate(order.fechaFin) };
  if (order.fechaInicio) return { label: 'Iniciada', value: productionDate(order.fechaInicio) };
  return { label: 'Creada', value: productionDate(order.fechaCreacion) };
}

export function filterProductionOrders(orders: ProductionOrder[], filters: ProductionOrderFilters) {
  const search = filters.search.trim().toLocaleLowerCase('es-AR').replace(/^op[-\s]*/i, '').replace(/^0+/, '');
  return orders.filter(order => {
    const creation = order.fechaCreacion.slice(0, 10);
    return (!search || String(order.ordenProduccionId).includes(search))
      && (!filters.from || creation >= filters.from)
      && (!filters.to || creation <= filters.to)
      && (filters.status === 'all' || order.estadoOrdenProduccionId === Number(filters.status));
  });
}

export function paginateProductionOrders(orders: ProductionOrder[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const actualPage = Math.min(Math.max(1, page), totalPages);
  return { actualPage, rows: orders.slice((actualPage - 1) * pageSize, actualPage * pageSize) };
}

export function productionPlanLabel(order: ProductionOrder) {
  const models = `${integer.format(order.cantidadModelos)} ${order.cantidadModelos === 1 ? 'modelo' : 'modelos'}`;
  return { models, units: `${quantity.format(order.cantidadTotalPlanificada)} unidades planificadas` };
}
