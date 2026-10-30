import { apiRequest } from './apiClient';

export type CustomerPeriod = { desde?: string; hasta?: string };
export type ExplorerSegment = 'TODOS' | 'RECURRENTES' | 'UNA_COMPRA';
type SetsResponse = { conjuntos: Record<string, unknown>[][] };

export type OnlineCustomersSummary = {
  compradoresPeriodo: number; comprasEntregadasPeriodo: number; importePedidosEntregadosPeriodo: number;
  compradoresRecurrentes: number; nuevosCompradoresVerificables: number; porcentajeRecurrentes: number;
};
export type UndatedSummary = { comprasHistoricasSinFecha: number; clientesHistoricosConComprasSinFecha: number; importeHistoricoSinFecha: number };
export type HistoricalSummary = { comprasHistoricasEntregadas: number; compradoresHistoricos: number; importeHistoricoEntregado: number };
export type SummaryResponse = { periodo: OnlineCustomersSummary; sinFecha: UndatedSummary; historico: HistoricalSummary };

export type OnlineCustomerRow = {
  clienteId: number; nombre: string; apellido: string; email: string | null; telefono: string | null; activo: boolean;
  comprasHistoricas: number; importeHistorico: number; ultimaEntregaConFecha: string | null; comprasSinFecha: number;
  comprasPeriodo: number; importePeriodo: number; tieneCuentaDigital: boolean; totalFilas: number;
};
export type ExplorerResponse = { items: OnlineCustomerRow[]; totalFilas: number };
export type ProductPreference = { productoId: number; codigo: string; nombre: string; tipoProductoId: number; pedidosConProducto: number; compradoresDistintos: number; unidadesEntregadas: number; importeLineas: number };
export type CustomerEvolution = { mes: string; comprasEntregadas: number; compradores: number; importePedidosEntregados: number; nuevosVerificables: number; compradoresConCompraPreviaFechada: number; compradoresConHistorialSinFecha: number };
export type CustomerSegment = { frecuencia: 'UNA_COMPRA' | 'DOS_TRES' | 'CUATRO_MAS'; actividad: 'ACTIVO' | 'INACTIVO' | 'SIN_FECHA'; clientesHistoricos: number; clientesConComprasPeriodo: number; comprasHistoricas: number; importeHistorico: number; comprasPeriodo: number; importePeriodo: number; clientesConComprasSinFecha: number };
export type CustomerRanking = { clienteId: number; nombre: string; apellido: string; email: string | null; comprasHistoricas: number; importeHistorico: number; ultimaEntregaConFecha: string | null; comprasSinFecha: number; comprasPeriodo: number; importePeriodo: number; ticketPromedioPeriodo: number };
export type CustomerProfile = { clienteId: number; nombre: string; apellido: string; documento: string | null; telefono: string | null; email: string | null; activo: boolean; fechaAlta: string; cuentaClienteEcommerceId: number | null; emailVerificado: boolean | null; cuentaActiva: boolean | null; fechaRegistroDigital: string | null; fechaUltimoAcceso: string | null; comprasHistoricas: number; importeHistorico: number; primeraEntregaConFecha: string | null; ultimaEntregaConFecha: string | null; comprasSinFecha: number };
export type CustomerOrder = { pedidoId: number; fechaPedido: string; estadoPedidoId: number; total: number; observaciones: string | null; fechaEntregaAnalitica: string | null; origenFecha: 'HISTORIAL' | 'REMITO' | null; cuentaComoCompraEntregada: boolean };
export type CustomerOrderLine = { pedidoId: number; productoId: number; codigo: string; nombre: string; cantidad: number; precioUnitario: number; subtotal: number };
export type CustomerProfileResponse = { cliente: CustomerProfile; pedidos: CustomerOrder[]; detalle: CustomerOrderLine[] };
export type DigitalAccount = { clienteId: number; nombre: string; apellido: string; email: string | null; emailNormalizado: string; emailVerificado: boolean; cuentaActiva: boolean; fechaRegistroDigital: string; fechaUltimoAcceso: string | null; comprasHistoricas: number; ultimaEntregaConFecha: string | null };
export type ExportDetail = { pedidoId: number; clienteId: number; nombre: string; apellido: string; email: string | null; fechaPedido: string; fechaEntregaAnalitica: string | null; origenFecha: 'HISTORIAL' | 'REMITO' | 'SIN_FECHA'; totalPedido: number; detallePedidoId: number; productoId: number; codigoProducto: string; producto: string; cantidad: number; precioUnitario: number; importeLinea: number };

const camel = (key: string) => key.charAt(0).toLowerCase() + key.slice(1);
function rows<T>(response: SetsResponse, index = 0): T[] {
  return (response.conjuntos[index] || []).map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [camel(key), value])) as T);
}
function query(values: Record<string, string | number | boolean | undefined | null>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params.set(key, String(value)); });
  return params.toString();
}
async function request(path: string, values: Record<string, string | number | boolean | undefined | null> = {}) {
  const suffix = query(values); return apiRequest<SetsResponse>(`/api/ecommerce/clientes/analitica/${path}${suffix ? `?${suffix}` : ''}`);
}

export const onlineCustomersApi = {
  summary: async (period: CustomerPeriod): Promise<SummaryResponse> => { const result = await request('resumen', period); return { periodo: rows<OnlineCustomersSummary>(result, 0)[0], sinFecha: rows<UndatedSummary>(result, 1)[0], historico: rows<HistoricalSummary>(result, 2)[0] }; },
  explorer: async (params: CustomerPeriod & { busqueda?: string; segmento?: ExplorerSegment; pagina?: number; tamanoPagina?: number }): Promise<ExplorerResponse> => { const result = await request('explorador', params); const items = rows<OnlineCustomerRow>(result); return { items, totalFilas: Number(items[0]?.totalFilas || 0) }; },
  products: async (params: CustomerPeriod & { clienteId?: number; top?: number }) => rows<ProductPreference>(await request('productos', params)),
  evolution: async (period: CustomerPeriod) => rows<CustomerEvolution>(await request('evolucion', period)),
  segments: async (params: CustomerPeriod & { fechaCorte?: string; diasInactividad?: number }) => rows<CustomerSegment>(await request('segmentos', params)),
  ranking: async (params: CustomerPeriod & { top?: number }) => rows<CustomerRanking>(await request('ranking', params)),
  profile: async (clienteId: number, period: CustomerPeriod): Promise<CustomerProfileResponse> => { const result = await request(`ficha/${clienteId}`, period); return { cliente: rows<CustomerProfile>(result, 0)[0], pedidos: rows<CustomerOrder>(result, 1), detalle: rows<CustomerOrderLine>(result, 2) }; },
  accounts: async (params: CustomerPeriod & { soloSinCompras?: boolean }) => rows<DigitalAccount>(await request('cuentas', params)),
  exportDetail: async (params: CustomerPeriod & { clienteId?: number; incluirSinFecha?: boolean }) => rows<ExportDetail>(await request('exportacion', params)),
};
