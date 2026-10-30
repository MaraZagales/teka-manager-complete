import type { PermissionName } from '../../services/authorization';

export type DashboardProfile = 'admin' | 'management' | 'commercial' | 'workshop-manager' | 'workshop-operator';
export type DashboardScope = 'period' | 'current' | 'today';

export type DashboardData = {
  users: Array<{ usuarioId: number; username: string; nombre: string; apellido?: string; activo: boolean; bloqueado: boolean }>;
  roles: Array<{ rolId: number; nombre: string; activo: boolean }>;
  auditEvents: Array<{ auditoriaEventoId: number; fechaEvento: string; modulo: string; accion: string; descripcion?: string; username: string }>;
  orders: Array<{ pedidoId: number; fechaPedido: string; clienteNombre: string; clienteApellido?: string | null; estadoPedidoNombre: string; total: number; canalVentaNombre: string }>;
  documents: Array<{ fechaComprobante: string; tipoComprobanteNombre: string; estadoComprobante: string; importeTotal: number }>;
  accountMovements: Array<{ clienteId: number; signo: number; importe: number }>;
  interests: Array<{ interesComercialId: number; estadoNombre: string; clienteNombre?: string | null; clienteApellido?: string | null; fechaAlta: string; fechaUltimaActividad?: string; descripcion?: string }>;
  opportunitySummary: { oportunidadesAbiertas: number } | null;
  opportunityFunnel: Array<{ estado: string; orden: number; cantidad: number; montoEstimado: number }>;
  budgets: Array<{ presupuestoComercialId: number; estado: string; clienteNombre?: string; clienteApellido?: string; fechaEmision?: string; fechaVencimiento?: string }>;
  activities: Array<{ actividadComercialId: number; titulo: string; estado: string; fechaProgramada: string; clienteNombre?: string | null; clienteApellido?: string | null }>;
  production: Array<{ ordenProduccionId: number; estadoOrdenProduccionNombre: string; fechaCreacion: string; fechaInicio: string | null; fechaFin: string | null; cantidadTotalPlanificada: number }>;
  supplies: Array<{ insumoId: number; insumoNombre: string; cantidadActual: number; stockMinimo: number; esStockCritico: boolean }>;
  cuts: Array<{ recorteId: number; estadoRecorteNombre: string; cantidadActual: number; insumoNombre: string }>;
};

export type WidgetDefinition = {
  id: string;
  label: string;
  menu: string;
  permission: PermissionName;
  href: string;
  profiles: Partial<Record<DashboardProfile, number>>;
  scope: DashboardScope;
  value: (data: DashboardData, from: string, to: string) => number;
  format?: 'currency' | 'number';
  emptyText: string;
};

export const normalizeDashboardText = (value?: string | null) => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const inRange = (value: string | undefined, from: string, to: string) => Boolean(value && value.slice(0, 10) >= from && value.slice(0, 10) <= to);
const isVoided = (value: string) => /anulad|cancelad|rechaz/i.test(normalizeDashboardText(value));
const isCredit = (value: string) => /nota\s+de\s+credito|\bcredito\b/i.test(normalizeDashboardText(value));

function receivableBalance(data: DashboardData) {
  const byCustomer = new Map<number, number>();
  data.accountMovements.forEach(item => byCustomer.set(item.clienteId, (byCustomer.get(item.clienteId) || 0) + item.signo * item.importe));
  return [...byCustomer.values()].reduce((total, balance) => total + Math.max(0, balance), 0);
}

export const widgetDefinitions: WidgetDefinition[] = [
  { id: 'active-users', label: 'Usuarios activos', menu: 'Usuarios', permission: 'Ver', href: '/usuarios', profiles: { admin: 100 }, scope: 'current', value: d => d.users.filter(item => item.activo).length, emptyText: 'No hay usuarios activos.' },
  { id: 'blocked-users', label: 'Usuarios bloqueados', menu: 'Usuarios', permission: 'Ver', href: '/usuarios', profiles: { admin: 95 }, scope: 'current', value: d => d.users.filter(item => item.bloqueado).length, emptyText: 'No hay usuarios bloqueados.' },
  { id: 'active-roles', label: 'Roles activos', menu: 'Roles y accesos', permission: 'Ver', href: '/roles', profiles: { admin: 90 }, scope: 'current', value: d => d.roles.filter(item => item.activo).length, emptyText: 'No hay roles activos.' },
  { id: 'audit-events', label: 'Eventos de auditoría', menu: 'Auditoría', permission: 'Ver', href: '/auditoria', profiles: { admin: 85 }, scope: 'period', value: (d, from, to) => d.auditEvents.filter(item => inRange(item.fechaEvento, from, to)).length, emptyText: 'Sin eventos en el período.' },

  { id: 'internal-billing', label: 'Facturación interna', menu: 'Ventas', permission: 'Ver', href: '/ventas/reportes', profiles: { management: 100 }, scope: 'period', format: 'currency', value: (d, from, to) => d.documents.filter(item => inRange(item.fechaComprobante, from, to) && !isVoided(item.estadoComprobante)).reduce((total, item) => total + (isCredit(item.tipoComprobanteNombre) ? -item.importeTotal : item.importeTotal), 0), emptyText: 'Sin comprobantes vigentes en el período.' },
  { id: 'receivable-balance', label: 'Saldo pendiente de cobro', menu: 'Cobros', permission: 'Ver', href: '/ventas/clientes', profiles: { management: 95 }, scope: 'current', format: 'currency', value: d => receivableBalance(d), emptyText: 'No hay saldos deudores registrados.' },
  { id: 'orders-to-fulfill', label: 'Pedidos por cumplir', menu: 'Ventas', permission: 'Ver', href: '/ventas/pedidos', profiles: { management: 90 }, scope: 'current', value: d => d.orders.filter(item => /confirmado|en produccion|listo para entrega/i.test(normalizeDashboardText(item.estadoPedidoNombre))).length, emptyText: 'No hay pedidos confirmados pendientes de entrega.' },
  { id: 'critical-stock', label: 'Existencias críticas', menu: 'Inventario', permission: 'Ver', href: '/inventory/stock', profiles: { management: 85 }, scope: 'current', value: d => d.supplies.filter(item => item.esStockCritico).length, emptyText: 'No hay insumos con stock crítico.' },

  { id: 'pending-interests', label: 'Consultas por atender', menu: 'Comercial', permission: 'Ver', href: '/comercial/consultas', profiles: { commercial: 100 }, scope: 'current', value: d => d.interests.filter(item => /^(pendiente|en atencion)$/.test(normalizeDashboardText(item.estadoNombre))).length, emptyText: 'No hay consultas pendientes de atención.' },
  { id: 'sent-budgets', label: 'Presupuestos a seguir', menu: 'Comercial', permission: 'Ver', href: '/comercial/presupuestos', profiles: { commercial: 95 }, scope: 'current', value: d => d.budgets.filter(item => normalizeDashboardText(item.estado) === 'enviado').length, emptyText: 'No hay presupuestos enviados pendientes.' },
  { id: 'open-opportunities', label: 'Oportunidades activas', menu: 'Comercial', permission: 'Ver', href: '/comercial/oportunidades', profiles: { commercial: 90 }, scope: 'current', value: d => d.opportunitySummary?.oportunidadesAbiertas || 0, emptyText: 'No hay oportunidades abiertas.' },
  { id: 'commercial-orders', label: 'Pedidos a gestionar', menu: 'Ventas', permission: 'Ver', href: '/ventas/pedidos', profiles: { commercial: 85 }, scope: 'current', value: d => d.orders.filter(item => /^(pendiente|confirmado)$/.test(normalizeDashboardText(item.estadoPedidoNombre))).length, emptyText: 'No hay pedidos que requieran gestión comercial.' },

  { id: 'production-pending', label: 'Órdenes pendientes', menu: 'Producción', permission: 'Ver', href: '/production/orders', profiles: { 'workshop-manager': 100, 'workshop-operator': 100 }, scope: 'current', value: d => d.production.filter(item => /pendiente/i.test(normalizeDashboardText(item.estadoOrdenProduccionNombre))).length, emptyText: 'No hay órdenes pendientes.' },
  { id: 'production-running', label: 'Órdenes en proceso', menu: 'Producción', permission: 'Ver', href: '/production/orders', profiles: { 'workshop-manager': 95, 'workshop-operator': 95 }, scope: 'current', value: d => d.production.filter(item => /proceso/i.test(normalizeDashboardText(item.estadoOrdenProduccionNombre))).length, emptyText: 'No hay órdenes en proceso.' },
  { id: 'critical-supplies', label: 'Insumos críticos', menu: 'Inventario', permission: 'Ver', href: '/inventory/supplies', profiles: { 'workshop-manager': 90, 'workshop-operator': 85 }, scope: 'current', value: d => d.supplies.filter(item => item.esStockCritico).length, emptyText: 'No hay insumos críticos.' },
  { id: 'available-cuts', label: 'Recortes disponibles', menu: 'Recortes / GIR', permission: 'Ver', href: '/recortes/inventario', profiles: { 'workshop-manager': 85 }, scope: 'current', value: d => d.cuts.filter(item => /disponible/i.test(normalizeDashboardText(item.estadoRecorteNombre)) && item.cantidadActual > 0).length, emptyText: 'No hay recortes disponibles.' },
  { id: 'production-finished', label: 'Finalizadas en el período', menu: 'Producción', permission: 'Ver', href: '/production/orders', profiles: { 'workshop-operator': 90 }, scope: 'period', value: (d, from, to) => d.production.filter(item => /finaliz/i.test(normalizeDashboardText(item.estadoOrdenProduccionNombre)) && inRange(item.fechaFin || item.fechaCreacion, from, to)).length, emptyText: 'Sin órdenes finalizadas en el período.' },
];

export function profilesForRoles(roleNames: string[]): DashboardProfile[] {
  const profiles = new Set<DashboardProfile>();
  roleNames.map(normalizeDashboardText).forEach(role => {
    if (role.includes('administrador')) profiles.add('admin');
    if (role.includes('gerencia')) profiles.add('management');
    if (role.includes('venta') || role.includes('comercial')) profiles.add('commercial');
    if (role.includes('responsable') && role.includes('taller')) profiles.add('workshop-manager');
    if (role.includes('operario') && role.includes('taller')) profiles.add('workshop-operator');
  });
  return [...profiles];
}

export function primaryDashboardProfile(profiles: DashboardProfile[]): DashboardProfile | undefined {
  return (['admin', 'management', 'commercial', 'workshop-manager', 'workshop-operator'] as DashboardProfile[]).find(profile => profiles.includes(profile));
}

export function dashboardTitle(profile?: DashboardProfile) {
  if (profile === 'admin') return 'Panel de administración';
  if (profile === 'management') return 'Panel de gerencia';
  if (profile === 'commercial') return 'Panel comercial';
  if (profile === 'workshop-manager') return 'Panel de taller';
  if (profile === 'workshop-operator') return 'Panel operativo';
  return 'Inicio';
}

export const scopeLabel: Record<DashboardScope, string> = {
  period: 'En el período seleccionado',
  current: 'Situación actual',
  today: 'Pendientes al día de hoy',
};
