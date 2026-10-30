import { apiRequest } from "./apiClient";
export type MaterialList = { listaMaterialesId: number; productoId: number; productoCodigo: string; productoNombre: string; nombre: string; version: string | null; activa: boolean; fechaAlta: string };
export type MaterialDetail = { detalleListaMaterialesId: number; listaMaterialesId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; cantidad: number; observaciones: string | null };
export type ExpectedCut = { listaMaterialesRecortePrevistoId: number; listaMaterialesId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; tipoRecorteId: number | null; tipoRecorteNombre: string | null; colorId: number | null; colorNombre: string | null; dimension: number | null; unidadMedidaId: number; unidadMedidaNombre: string; unidadMedidaAbreviatura: string; cantidadPorUnidad: number; observaciones: string | null };
export type ConfigurationPayload = { productoId: number; nombre: string; version: string; activar: boolean; materiales: Array<{ insumoId: number; cantidad: number; observaciones: string | null }>; recortesPrevistos: Array<{ insumoId: number; tipoRecorteId: number | null; colorId: number | null; dimension: number | null; unidadMedidaId: number; cantidadPorUnidad: number; observaciones: string | null }> };
// Endpoints existentes, verificados en ProduccionController.cs. No se modifican datos.
export const productionRecipesApi = {
  lists: () => apiRequest<MaterialList[]>("/api/produccion/listas-materiales"),
  details: (id: number) => apiRequest<MaterialDetail[]>(`/api/produccion/listas-materiales/${id}/detalles`),
  expectedCuts: (id: number) => apiRequest<ExpectedCut[]>(`/api/produccion/listas-materiales/${id}/recortes-previstos`),
  createVersion: (payload: ConfigurationPayload) => apiRequest<{ listaMaterialesId: number }>('/api/produccion/configuraciones/versiones', { method: 'POST', body: JSON.stringify(payload) }),
  activate: (id: number) => apiRequest<void>(`/api/produccion/listas-materiales/${id}/activar`, { method: 'POST' }),
  deactivate: (id: number) => apiRequest<void>(`/api/produccion/listas-materiales/${id}/inactivar`, { method: 'POST' }),
};
