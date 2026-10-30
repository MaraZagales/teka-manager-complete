import { apiRequest } from './apiClient';
import type { Lookup, UnitLookup, ColorLookup, Supply } from './suppliesApi';

export type Recorte = {
  recorteId: number; ordenProduccionId: number | null; insumoId: number;
  insumoCodigo: string; insumoNombre: string; tipoRecorteId: number | null;
  tipoRecorteNombre: string | null; estadoRecorteId: number;
  estadoRecorteNombre: string; colorId: number | null; colorNombre: string | null;
  dimension: number | null; largoMm: number | null; anchoMm: number | null;
  espesorMm: number | null; orientacionVeta: string | null;
  calidadGeometrica: string; elegibleParaIa: boolean; unidadMedidaId: number;
  unidadMedidaNombre: string; unidadMedidaAbreviatura: string;
  cantidad: number; observaciones: string | null; fechaAlta: string;
};
export type StockRecorte = Recorte & {
  stockRecorteId: number; depositoId: number; depositoNombre: string; cantidadActual: number;
};
export type MovimientoRecorte = {
  movimientoRecorteId: number; recorteId: number; depositoId: number;
  depositoNombre: string; fechaMovimiento: string; tipoMovimiento: string;
  cantidad: number; observaciones: string | null; insumoId: number | null;
  insumoCodigo: string | null; insumoNombre: string | null;
  dimension: number | null; unidadMedidaAbreviatura: string | null;
};
export type HistorialRecorte = {
  historialEstadoRecorteId: number; recorteId: number; estadoRecorteId: number;
  estadoRecorteNombre: string; fechaCambio: string; observaciones: string | null;
};
export type RecorteDetalle = Recorte & {
  stocks: StockRecorte[]; movimientos: MovimientoRecorte[]; historialEstados: HistorialRecorte[];
};
export type DepositoLookup = Lookup;

const base = '/api/recortes';
export const recortesApi = {
  list: () => apiRequest<Recorte[]>(base),
  detail: (id: number) => apiRequest<RecorteDetalle>(`${base}/${id}`),
  stock: () => apiRequest<StockRecorte[]>(`${base}/stock`),
  movements: () => apiRequest<MovimientoRecorte[]>(`${base}/movimientos`),
  changeState: (id: number, estadoRecorteId: number, observaciones: string) =>
    apiRequest<void>(`${base}/${id}/estado`, {
      method: 'POST', body: JSON.stringify({ estadoRecorteId, observaciones }),
    }),
  move: (id: number, depositoId: number, tipoMovimiento: string, cantidad: number, observaciones: string) =>
    apiRequest<void>(`${base}/${id}/movimientos`, {
      method: 'POST', body: JSON.stringify({ depositoId, tipoMovimiento, cantidad, observaciones }),
    }),
  states: () => apiRequest<Lookup[]>('/api/auxiliares/estados-recorte'),
  types: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-recorte'),
  units: () => apiRequest<UnitLookup[]>('/api/auxiliares/unidades-medida'),
  colors: () => apiRequest<ColorLookup[]>('/api/auxiliares/colores'),
  deposits: () => apiRequest<DepositoLookup[]>('/api/auxiliares/depositos'),
  supplies: () => apiRequest<Supply[]>('/api/insumos'),
};
