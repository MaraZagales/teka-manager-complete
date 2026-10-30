import { apiRequest } from './apiClient';

export type FabricationTemplate = {
  plantillaFabricacionId: number; productoId: number; nombreProductoId: number;
  productoNombre: string; productoColorId: number | null; version: string;
  estado: string; listaMaterialesId: number | null; productoActivo: boolean;
  bomActiva: boolean | null; piezas: number;
};
export type FabricationPiece = {
  piezaId: number; productoId: number; insumoId: number; colorId: number | null;
  nombre: string; cantidadPorUnidad: number; largoMm: number; anchoMm: number;
  espesorMm: number; orientacionVeta: string; cantosTerminados: string;
  observaciones: string | null; persistida: boolean;
};
export type CutRectangle = { xmm: number; ymm: number; lengthMm: number; widthMm: number };
export type CutPlacement = {
  pieceId: number; productId: number; surfaceNumber: number; cutId: number | null;
  xmm: number; ymm: number; lengthMm: number; widthMm: number; rotated: boolean;
};
export type CutSurface = {
  number: number; cutId: number | null; supplyId: number; colorId: number;
  thicknessMm: number; lengthMm: number; widthMm: number;
  remainders: CutRectangle[];
};
export type FabricationPreview = {
  plantillas: FabricationTemplate[];
  piezas: FabricationPiece[];
  corte: {
    placements: CutPlacement[]; surfaces: CutSurface[]; errors: string[];
    isComplete: boolean; newSheetCount: number; plannedCutIds: number[];
  } | null;
  planPersistido: {
    placements: CutPlacement[]; surfaces: CutSurface[]; errors: string[];
    isComplete: boolean; newSheetCount: number; plannedCutIds: number[];
  } | null;
  insumosBom: Array<{
    insumoId: number; unidad: string; cantidadRequerida: number;
    stockDisponible: number; faltante: number;
  }> | null;
  materiales: Array<{
    insumoId: number; colorId: number; placasNuevas: number; metrosCuadrados: number;
    stockDisponibleM2: number | null; faltanteM2: number | null;
  }>;
  costos: Array<{
    productoId: number; cantidad: number; estado: string;
    costoMaterialesUnitario: number | null; costoMaterialesLote: number | null;
    advertencias: string[];
  }>;
  pendientes: string[];
  habilitable: boolean;
};
export const productionFabricationApi = {
  approvalCheck: (templateId: number) => apiRequest<{
    plantillaFabricacionId: number; estado: string; puedeAprobar: boolean;
    bloqueantes: string[]; advertencias: string[];
  }>('/api/produccion/fabricacion/plantillas/' + templateId + '/validacion-aprobacion'),
  approve: (templateId: number) => apiRequest<{ plantillaFabricacionId: number; estado: string; bomActivada: boolean }>(
    '/api/produccion/fabricacion/plantillas/' + templateId + '/aprobar', { method: 'POST' }),
  bomActivationCheck: (templateId: number) => apiRequest<{
    plantillaFabricacionId: number; listaMaterialesId: number; bomActivaAnteriorId: number | null;
    puedeActivar: boolean; bloqueantes: string[];
  }>('/api/produccion/fabricacion/plantillas/' + templateId + '/activacion-bom'),
  activateTemplateBom: (templateId: number, bomActivaAnteriorId: number | null) =>
    apiRequest<{ listaMaterialesId: number; activada: boolean }>(
      '/api/produccion/fabricacion/plantillas/' + templateId + '/activar-bom',
      { method: 'POST', body: JSON.stringify({ bomActivaAnteriorId }) }),
  templates: () => apiRequest<FabricationTemplate[]>('/api/produccion/fabricacion/plantillas'),
  preview: (payload: {
    lineas: Array<{ plantillaFabricacionId: number; cantidad: number }>;
    vetaPlacaPorInsumo: Array<{ insumoId: number; orientacionVeta: string }>;
    margenMm: number; anchoSierraMm: number;
  }) => apiRequest<FabricationPreview>('/api/produccion/fabricacion/plan-corte', {
    method: 'POST', body: JSON.stringify(payload),
  }),
  createDraftVersion: (templateId: number, pieces: FabricationPiece[]) =>
    apiRequest<{ plantillaFabricacionId: number; estado: string }>('/api/produccion/fabricacion/plantillas/' + templateId + '/versiones', {
      method: 'POST', body: JSON.stringify({ piezas: pieces.map(piece => ({
        nombre: piece.nombre, insumoId: piece.insumoId,
        cantidadPorUnidad: piece.cantidadPorUnidad, largoMm: piece.largoMm,
        anchoMm: piece.anchoMm, espesorMm: piece.espesorMm,
        orientacionVeta: piece.orientacionVeta,
        cantosTerminados: piece.cantosTerminados,
        observaciones: piece.observaciones,
      })) }),
    }),
};
