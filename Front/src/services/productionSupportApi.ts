import { apiRequest } from './apiClient';

export type Lookup = { id: number; descripcion: string };
export type CutStock = { stockRecorteId: number; recorteId: number; ordenProduccionId: number | null; insumoId: number; insumoCodigo: string; insumoNombre: string; tipoRecorteId: number | null; tipoRecorteNombre: string | null; estadoRecorteId: number; estadoRecorteNombre: string; colorId: number | null; colorNombre: string | null; dimension: number | null; unidadMedidaId: number; unidadMedidaNombre: string; unidadMedidaAbreviatura: string; depositoId: number; depositoNombre: string; cantidadActual: number };

export const productionSupportApi = {
  cutTypes: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-recorte'),
  cutStates: () => apiRequest<Lookup[]>('/api/auxiliares/estados-recorte'),
  cutStock: () => apiRequest<CutStock[]>('/api/recortes/stock'),
};
