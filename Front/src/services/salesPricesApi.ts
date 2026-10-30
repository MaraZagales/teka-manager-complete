import { apiRequest } from './apiClient';

export type SalesPrice = {
  precioVentaId: number;
  productoId: number;
  productoCodigo: string | null;
  productoNombre: string | null;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string | null;
  precio: number;
  activo: boolean;
};

export type SalesPriceCorrection = {
  precioVentaCorreccionId: number;
  precioVentaId: number;
  productoId: number;
  importeAnterior: number;
  importeNuevo: number;
  motivo: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaCorreccion: string;
};

export const salesPricesApi = {
  list: () => apiRequest<SalesPrice[]>('/api/precios-venta'),
  history: (productId: number) => apiRequest<SalesPrice[]>(`/api/precios-venta/producto/${productId}`),
  corrections: (productId: number) => apiRequest<SalesPriceCorrection[]>(`/api/precios-venta/producto/${productId}/correcciones`),
  createWithCalculation: (payload: { productoId: number; precioFinal: number; origenCostoMateriales: 'BOM_ULTIMA_COMPRA_VALIDA' | 'COSTO_INFORMADO'; costoMateriales: number | null }) =>
    apiRequest<{ precioVentaId: number }>('/api/precios-venta/con-calculo', {
      method: 'POST', body: JSON.stringify(payload),
    }),
};
