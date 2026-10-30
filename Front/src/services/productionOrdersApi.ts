import { apiRequest } from './apiClient';

export type ProductionLookup = { id: number; descripcion: string };

export type ProductionOrder = {
  ordenProduccionId: number;
  tipoProduccionId: number;
  estadoOrdenProduccionId: number;
  estadoOrdenProduccionNombre: string;
  fechaCreacion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  observaciones: string | null;
  cantidadModelos: number;
  cantidadTotalPlanificada: number;
};

export type ProductionOrderProduct = {
  ordenProduccionDetalleId: number;
  ordenProduccionId: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  listaMaterialesId: number | null;
  cantidadPlanificada: number;
  productoCircularId: number | null;
  cantidadProducida: number;
};

export type ProductionOrderCutPlan = {
  recorteId: number;
  cantidadPlanificada: number;
};

export type ProductionOrderDetail = {
  ordenProduccionId: number;
  tipoProduccionId: number;
  estadoOrdenProduccionId: number;
  estadoOrdenProduccionNombre: string;
  fechaCreacion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  observaciones: string | null;
  productos: ProductionOrderProduct[];
  recortesPlanificados: ProductionOrderCutPlan[];
};

export type ProductionConsumption = {
  consumoProduccionId: number;
  ordenProduccionId: number;
  insumoId: number;
  insumoCodigo: string;
  insumoNombre: string;
  depositoId: number;
  depositoNombre: string;
  fechaConsumo: string;
  cantidadConsumida: number;
  observaciones: string | null;
};

export type ProductionResult = {
  resultadoProduccionId: number;
  ordenProduccionId: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  depositoId: number;
  depositoNombre: string;
  fechaResultado: string;
  cantidadIngresada: number;
  observaciones: string | null;
};

export type ProductionCutConsumption = {
  consumoRecorteProduccionId: number;
  ordenProduccionId: number;
  recorteId: number;
  depositoId: number;
  depositoNombre: string;
  fechaConsumo: string;
  cantidadConsumida: number;
  observaciones: string | null;
  insumoId: number;
  insumoCodigo: string;
  insumoNombre: string;
  dimension: number | null;
  unidadMedidaNombre: string;
  unidadMedidaAbreviatura: string;
};

export type ProductionHistory = { historialEstadoOrdenProduccionId: number; ordenProduccionId: number; estadoOrdenProduccionId: number; estadoOrdenProduccionNombre: string; fechaCambio: string; observaciones: string | null };
export type ProductionStartPreview = { ordenProduccionId: number; estadoOrdenProduccionId: number; estado: string; fechaCreacion: string; tieneFaltantes: boolean; modelos: Array<{ ordenProduccionDetalleId: number; productoId: number; productoCodigo: string; productoNombre: string; cantidadPlanificada: number; listaMaterialesId: number | null }>; materiales: Array<{ insumoId: number; insumoCodigo: string; insumoNombre: string; unidad: string; cantidadRequerida: number; depositoId: number; depositoNombre: string; cantidadDisponible: number; faltante: number }>; recortes: Array<{ recorteId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; dimension: number | null; unidad: string; cantidadRequerida: number; depositoId: number; depositoNombre: string; cantidadDisponible: number; faltante: number }> };
export type ProductionFinishPreview = { modelos: Array<{ productoId: number; productoCodigo: string; productoNombre: string; cantidadPlanificada: number }>; recortesPrevistos: Array<{ ordenProduccionRecortePrevistoSnapshotId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; tipoRecorteId: number | null; tipoRecorteNombre: string | null; colorId: number | null; colorNombre: string | null; dimension: number | null; unidadMedidaId: number; unidadMedidaNombre: string; unidadMedidaAbreviatura: string; cantidadPorUnidad: number; cantidadSugerida: number; observaciones: string | null }>; recortesRecuperados: Array<{ recorteId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; tipoRecorteId: number | null; tipoRecorteNombre: string | null; estadoRecorteId: number; estadoRecorteNombre: string; colorId: number | null; colorNombre: string | null; dimension: number | null; unidadMedidaId: number; unidadMedidaNombre: string; unidadMedidaAbreviatura: string; cantidad: number; fechaAlta: string; observaciones: string | null }> };
export type ProductionTemplate = { plantillaOrdenProduccionId: number; nombre: string; observaciones: string | null; activa: boolean; fechaAlta: string; cantidadModelos: number; cantidadTotal: number; detalles: Array<{ plantillaOrdenProduccionDetalleId: number; productoId: number; productoCodigo: string; productoNombre: string; cantidad: number }> };

export type ProductionOrderPayload = {
  tipoProduccionId: number;
  observaciones: string | null;
  productos: Array<{
    productoId: number;
    listaMaterialesId: number;
    cantidadPlanificada: number;
  }>;
  recortes: Array<{ recorteId: number; cantidad: number }>;
};

export type ProductionDesignValidation = {
  recorteDisenoId: number;
  productoId: number | null;
  estadoRevision: string;
  cantidadAsignaciones: number;
  cantidadInsumosComplementarios: number;
  cantidadSugerida: number;
  recortesAsignados: number;
  recortesNoDisponibles: number;
  listaMaterialesId: number | null;
  plantillaFabricacionId: number | null;
  ordenProduccionId: number | null;
  circuitoHabilitado: boolean;
  puedeContinuar: boolean;
  bloqueantes: string[];
};

export const productionOrdersApi = {
  validateDesign: (id: number) => apiRequest<ProductionDesignValidation>(`/api/produccion/ordenes/desde-diseno/${id}/validacion`),
  createFromDesign: (id: number) => apiRequest<{ ordenProduccionId: number }>(`/api/produccion/ordenes/desde-diseno/${id}`, { method: 'POST' }),
  list: () => apiRequest<ProductionOrder[]>('/api/produccion/ordenes'),
  getById: (id: number) => apiRequest<ProductionOrderDetail>(`/api/produccion/ordenes/${id}`),
  create: (payload: ProductionOrderPayload) => apiRequest<{ ordenProduccionId: number }>('/api/produccion/ordenes', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  cancel: (id: number, observations: string | null) => apiRequest<void>(`/api/produccion/ordenes/${id}/cancelar`, {
    method: 'POST', body: JSON.stringify({ observaciones: observations }),
  }),
  consumptions: (id: number) => apiRequest<ProductionConsumption[]>(`/api/produccion/ordenes/${id}/consumos`),
  results: (id: number) => apiRequest<ProductionResult[]>(`/api/produccion/ordenes/${id}/resultados`),
  cutConsumptions: (id: number) => apiRequest<ProductionCutConsumption[]>(`/api/recortes/ordenes/${id}/consumos`),
  history: (id: number) => apiRequest<ProductionHistory[]>(`/api/produccion/ordenes/${id}/historial`),
  startPreview: (id: number) => apiRequest<ProductionStartPreview>(`/api/produccion/ordenes/${id}/inicio`),
  start: (id: number, recortes: Array<{ recorteId: number; cantidad: number }>, observaciones: string | null) => apiRequest<void>(`/api/produccion/ordenes/${id}/iniciar`, { method: 'POST', body: JSON.stringify({ recortes, observaciones }) }),
  finishPreview: (id: number) => apiRequest<ProductionFinishPreview>(`/api/produccion/ordenes/${id}/finalizacion`),
  finish: (id: number, payload: { resultados: Array<{ productoId: number; cantidad: number }>; recortesConfirmados: Array<{ insumoId: number; tipoRecorteId: number | null; estadoRecorteId: number; colorId: number | null; dimension: number | null; unidadMedidaId: number; cantidad: number; observaciones: string | null }>; observaciones: string | null }) => apiRequest<void>(`/api/produccion/ordenes/${id}/finalizar`, { method: 'POST', body: JSON.stringify(payload) }),
  templates: () => apiRequest<ProductionTemplate[]>('/api/produccion/plantillas'),
  template: (id: number) => apiRequest<ProductionTemplate>(`/api/produccion/plantillas/${id}`),
  saveTemplate: (payload: { plantillaOrdenProduccionId?: number; nombre: string; observaciones: string | null; detalles: Array<{ productoId: number; cantidad: number }> }) => apiRequest<{ plantillaOrdenProduccionId: number }>('/api/produccion/plantillas', { method: 'POST', body: JSON.stringify(payload) }),
  deactivateTemplate: (id: number) => apiRequest<void>(`/api/produccion/plantillas/${id}/inactivar`, { method: 'POST' }),
  report: <T>(kind: 'consumos' | 'modelos' | 'recortes-consumidos' | 'recortes-recuperados', from: string, to: string) => apiRequest<T[]>(`/api/produccion/reportes/${kind}?desde=${encodeURIComponent(from)}&hasta=${encodeURIComponent(to)}`),
  statuses: () => apiRequest<ProductionLookup[]>('/api/auxiliares/estados-orden-produccion'),
  types: () => apiRequest<ProductionLookup[]>('/api/auxiliares/tipos-produccion'),
};
