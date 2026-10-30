import { apiRequest } from './apiClient';

export type CostPriceParameter = {
  parametroCostoPrecioId: number;
  tipoProductoId: number | null;
  porcentajeManoObra: number;
  porcentajeCostosFijos: number;
  porcentajeOtrosVariables: number;
  porcentajeMargen: number;
  activo: boolean;
  fechaModificacion: string;
  usuarioModificacionId: number;
};

export type SaveCostPriceParameter = Pick<CostPriceParameter,
  'tipoProductoId' | 'porcentajeManoObra' | 'porcentajeCostosFijos' | 'porcentajeOtrosVariables' | 'porcentajeMargen'>;

export type PriceCalculation = {
  productoId: number;
  tipoProductoId: number;
  parametroCostoPrecioId: number;
  configuracionGeneral: boolean;
  costoMateriales: number;
  costoManoObra: number;
  costosFijos: number;
  otrosVariables: number;
  costoTotal: number;
  porcentajeMargen: number;
  precioSugerido: number;
  origenCostoMateriales: string;
};

export type EstimatedMaterial = {
  insumoId: number;
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number | null;
  subtotal: number | null;
  compraProveedorId: number | null;
  fechaCompra: string | null;
  estado: string;
};

export type EstimatedProductCost = {
  productoId: number;
  listaMaterialesId: number | null;
  estado: 'SIN_BOM' | 'LISTAS_MULTIPLES' | 'INCOMPLETO' | 'SIN_PARAMETROS' | 'COMPLETO';
  costoMateriales: number | null;
  precio: PriceCalculation | null;
  insumos: EstimatedMaterial[];
  advertencias: string[];
};

export const costPriceParametersApi = {
  list: () => apiRequest<CostPriceParameter[]>('/api/parametros-costos-precios'),
  save: (payload: SaveCostPriceParameter) => apiRequest<CostPriceParameter>('/api/parametros-costos-precios', {
    method: 'PUT', body: JSON.stringify(payload),
  }),
  estimate: (productId: number) => apiRequest<EstimatedProductCost>(`/api/parametros-costos-precios/producto/${productId}/costo-estimado`),
  simulate: (productoId: number, costoMateriales: number) => apiRequest<PriceCalculation>('/api/parametros-costos-precios/simular-con-costo-informado', {
    method: 'POST', body: JSON.stringify({ productoId, costoMateriales }),
  }),
};
