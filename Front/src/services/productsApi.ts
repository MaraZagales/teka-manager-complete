import { apiRequest } from './apiClient';

export type Product = {
  productoId: number;
  codigo: string;
  nombre: string;
  nombreProductoId?: number | null;
  nombreCatalogo?: string | null;
  descripcion?: string | null;
  tipoProductoId: number;
  tipoProductoNombre: string;
  colorId?: number | null;
  colorNombre?: string | null;
  codigoHex?: string | null;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
  unidadMedidaAbreviatura: string;
  stockMinimo: number;
  anchoCm?: number | null;
  altoCm?: number | null;
  profundidadCm?: number | null;
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

export type ProductPayload = {
  nombre: string;
  nombreProductoId: number | null;
  descripcion?: string;
  tipoProductoId: number;
  colorId: number | null;
  unidadMedidaId: number;
  stockMinimo: number;
  anchoCm: number;
  altoCm: number;
  profundidadCm: number;
};

export const productsApi = {
  list: () => apiRequest<Product[]>('/api/productos'),
  getById: (id: number) => apiRequest<Product>(`/api/productos/${id}`),
  create: (payload: ProductPayload) => apiRequest<{ productoId: number }>('/api/productos', {
    method: 'POST', body: JSON.stringify(payload),
  }),
  update: (id: number, payload: ProductPayload) => apiRequest<void>(`/api/productos/${id}`, {
    method: 'PUT', body: JSON.stringify(payload),
  }),
  deactivate: (id: number, motivoInactivacionId: number, observacionInactivacion?: string) =>
    apiRequest<void>(`/api/productos/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ motivoInactivacionId, observacionInactivacion }),
    }),
  activate: (id: number) => apiRequest<void>(`/api/productos/${id}/activar`, { method: 'POST' }),
  productTypes: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-producto'),
  productNames: (tipoProductoId: number) => apiRequest<Lookup[]>(`/api/auxiliares/nombres-producto?tipoProductoId=${encodeURIComponent(tipoProductoId)}`),
  colors: () => apiRequest<ColorLookup[]>('/api/auxiliares/colores'),
  units: () => apiRequest<UnitLookup[]>('/api/auxiliares/unidades-medida'),
  inactivationReasons: () => apiRequest<Lookup[]>('/api/auxiliares/motivos-inactivacion'),
};
