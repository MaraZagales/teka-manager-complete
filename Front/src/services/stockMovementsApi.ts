import { apiRequest } from './apiClient';

export type MovementClass = 'PRODUCTO' | 'INSUMO';
export type MovementState = 'VIGENTE' | 'ANULADO' | 'REVERSA';
export type MovementMode = 'MANUAL' | 'AUTOMATICO' | 'REVERSA';

export type MovementFilters = {
  desde: string; hasta: string; clase?: MovementClass; depositoId?: number;
  articuloId?: number; origen?: string; estado?: MovementState;
  modalidad?: MovementMode; buscar?: string;
};

export type AnalyticMovement = {
  movimientoStockId: number; fechaMovimiento: string; clase: MovementClass; articuloId: number;
  codigo: string; articulo: string; depositoId: number; deposito: string;
  tipoMovimientoStockId: number; tipoMovimiento: string; signo: number; cantidad: number;
  motivo?: string | null; entidadOrigen?: string | null; origenId?: number | null;
  activo: boolean; fechaAnulacion?: string | null; motivoAnulacion?: string | null;
  observacionAnulacion?: string | null; movimientoStockIdReversaDe?: number | null;
  modalidad: MovementMode; estado: MovementState; totalFilas: number;
};

export type MovementPage = { pagina: number; tamanoPagina: number; totalFilas: number; items: AnalyticMovement[] };
export type MovementSummary = {
  totalMovimientos: number; cantidadEntradas: number; cantidadSalidas: number;
  cantidadManuales: number; cantidadAutomaticos: number; cantidadReversas: number; cantidadAnulados: number;
};
export type MovementSeriesPoint = { fecha: string; modalidad: MovementMode; origen: string; signo: number; cantidadMovimientos: number };
export type MovementLookup = { id: number; descripcion: string; signo?: number };

export type MovementDetail = {
  movimientoStockId: number; fechaMovimiento: string; tipoMovimientoStockId: number; tipoMovimientoNombre: string;
  signo: number; depositoId: number; depositoNombre: string; productoId?: number | null; productoCodigo?: string | null;
  productoNombre?: string | null; insumoId?: number | null; insumoCodigo?: string | null; insumoNombre?: string | null;
  cantidad: number; motivo?: string | null; entidadOrigen?: string | null; origenId?: number | null; activo: boolean;
  fechaAnulacion?: string | null; motivoAnulacion?: string | null; observacionAnulacion?: string | null;
  movimientoStockIdReversaDe?: number | null;
};

export type ManualMovementPayload = {
  tipoMovimientoStockId: number; depositoId: number; cantidad: number; motivo: string;
  productoId?: number; insumoId?: number;
};

function query(filters: MovementFilters, pagination?: { pagina: number; tamanoPagina: number }) {
  const values: Record<string, string | number | undefined> = { ...filters, ...pagination };
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return params.toString();
}

export const stockMovementsApi = {
  all: () => apiRequest<MovementDetail[]>('/api/MovimientosStock'),
  list: (filters: MovementFilters, pagina: number, tamanoPagina: number) =>
    apiRequest<MovementPage>(`/api/MovimientosStock/analitica/movimientos?${query(filters, { pagina, tamanoPagina })}`),
  summary: (filters: MovementFilters) =>
    apiRequest<MovementSummary>(`/api/MovimientosStock/analitica/resumen?${query(filters)}`),
  series: (filters: MovementFilters) =>
    apiRequest<MovementSeriesPoint[]>(`/api/MovimientosStock/analitica/series?${query(filters)}`),
  detail: (id: number) => apiRequest<MovementDetail>(`/api/MovimientosStock/${id}`),
  movementTypes: () => apiRequest<MovementLookup[]>('/api/Auxiliares/tipos-movimiento-stock'),
  movementReasons: () => apiRequest<MovementLookup[]>('/api/Auxiliares/motivos-movimiento-stock'),
  deposits: () => apiRequest<MovementLookup[]>('/api/Auxiliares/depositos'),
  createManual: (clase: MovementClass, payload: ManualMovementPayload) =>
    apiRequest<void>(`/api/MovimientosStock/${clase === 'PRODUCTO' ? 'producto' : 'insumo'}/manual`, { method: 'POST', body: JSON.stringify(payload) }),
  annul: (id: number, clase: MovementClass, motivoAnulacion: string, observacionAnulacion?: string) =>
    apiRequest<void>(`/api/MovimientosStock/${id}/anular/${clase === 'PRODUCTO' ? 'producto' : 'insumo'}`, {
      method: 'POST', body: JSON.stringify({ motivoAnulacion, observacionAnulacion }),
    }),
};
