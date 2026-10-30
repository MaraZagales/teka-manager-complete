import { apiRequest } from './apiClient';

export type Supply = {
  insumoId: number;
  codigo: string;
  nombre: string;
  nombreInsumoId?: number | null;
  nombreCatalogo?: string | null;
  descripcion?: string | null;
  tipoInsumoId: number;
  tipoInsumoNombre: string;
  colorId?: number | null;
  colorNombre?: string | null;
  codigoHex?: string | null;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
  unidadMedidaAbreviatura: string;
  stockMinimo: number;
  activo: boolean;
  fechaAlta: string;
  motivoInactivacionId?: number | null;
  motivoInactivacionNombre?: string | null;
  observacionInactivacion?: string | null;
  fechaInactivacion?: string | null;
};

export type Lookup = { id: number; descripcion: string };
export type UnitLookup = Lookup & { abreviatura: string };
export type ColorLookup = Lookup & { codigoHex?: string | null };

export type SupplyPayload = {
  nombre: string;
  nombreInsumoId: number;
  descripcion?: string;
  tipoInsumoId: number;
  colorId: number | null;
  unidadMedidaId: number;
  stockMinimo: number;
};

export const suppliesApi = {
  list: () => apiRequest<Supply[]>('/api/insumos'),
  getById: (id: number) => apiRequest<Supply>(`/api/insumos/${id}`),
  create: (payload: SupplyPayload) => apiRequest<{ insumoId: number }>('/api/insumos', {
    method: 'POST', body: JSON.stringify(payload),
  }),
  update: (id: number, payload: SupplyPayload) => apiRequest<void>(`/api/insumos/${id}`, {
    method: 'PUT', body: JSON.stringify(payload),
  }),
  deactivate: (id: number, motivoInactivacionId: number, observacionInactivacion?: string) =>
    apiRequest<void>(`/api/insumos/${id}`, {
      method: 'DELETE', body: JSON.stringify({ motivoInactivacionId, observacionInactivacion }),
    }),
  activate: (id: number) => apiRequest<void>(`/api/insumos/${id}/activar`, { method: 'POST' }),
  supplyTypes: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-insumo'),
  supplyNames: (tipoInsumoId: number) => apiRequest<Lookup[]>(`/api/auxiliares/nombres-insumo?tipoInsumoId=${encodeURIComponent(tipoInsumoId)}`),
  colors: () => apiRequest<ColorLookup[]>('/api/auxiliares/colores'),
  units: () => apiRequest<UnitLookup[]>('/api/auxiliares/unidades-medida'),
  inactivationReasons: () => apiRequest<Lookup[]>('/api/auxiliares/motivos-inactivacion'),
};
