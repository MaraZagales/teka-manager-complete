import { ApiError, apiRequest } from './apiClient';
import { getSession } from './session';

const base = '/api/recortes-inteligentes';
const host = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
async function allPages<T>(read: (page: number) => Promise<T[]>): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await read(page);
    items.push(...batch);
    if (batch.length < 200) return { items, truncated: false };
  }
  return { items, truncated: true };
}

export type RecorteElegible = {
  recorteId: number; insumoId: number; tipoInsumoNombre: string; colorId: number | null;
  largoMm: number | null; anchoMm: number | null; espesorMm: number | null;
  orientacionVeta: string | null; cantidadDisponible: number; depositoId: number;
};
export type Generacion = {
  RecorteGeneracionId: number; SolicitudUid: string; FechaGeneracion: string;
  Estado: string; CantidadRecibidas: number; ErrorCodigo: string | null; ErrorDetalle: string | null;
};
export type RecortesGenerationConfig = {
  habilitado: boolean; maxPropuestas: number; maxRecortes: number;
  imagenesHabilitadas: boolean; maxImagenes: number; motivoImagenes: string | null; pendingTimeoutMinutes: number;
  circuitoFabricacionHabilitado: boolean;
};
export type Propuesta = {
  RecorteDisenoId: number; RecorteGeneracionId: number; Nombre: string;
  EstadoRevision: string; VersionNumero: number; FechaCreacion: string;
};
export type FilaDetalle = Record<string, unknown>;
export type DetallePropuesta = Propuesta & {
  Descripcion: string; LargoExteriorMm: number; AnchoExteriorMm: number;
  AltoExteriorMm: number; MaterialInsumoId: number | null; ColorId: number | null;
  Piezas: FilaDetalle[]; Asignaciones: FilaDetalle[]; InsumosComplementarios: FilaDetalle[];
  Costos: FilaDetalle[]; Imagenes: FilaDetalle[]; Validaciones: Array<FilaDetalle & { Motivos: FilaDetalle[] }>;
  Historial: FilaDetalle[];
  Certificacion?: FilaDetalle | null;
  VinculoReceta?: FilaDetalle | null;
  OrdenGIR?: FilaDetalle | null;
};

export const recortesInteligentesApi = {
  configuracion: () => apiRequest<RecortesGenerationConfig>(`${base}/configuracion`),
  recuperarPendientes: () => apiRequest<{ recuperadas: number }>(`${base}/generaciones/recuperar-pendientes`, { method: 'POST' }),
  elegibles: () => apiRequest<{ total: number; recortes: RecorteElegible[] }>(`${base}/recortes-elegibles`),
  generaciones: (pagina = 1, tamano = 50) => apiRequest<Generacion[]>(`${base}/generaciones?pagina=${pagina}&tamano=${tamano}`),
  generacion: (id: number) => apiRequest<Generacion>(`${base}/generaciones/${id}`),
  propuestas: (pagina = 1, tamano = 50) => apiRequest<Propuesta[]>(`${base}/propuestas?pagina=${pagina}&tamano=${tamano}`),
  catalogo: (pagina = 1, tamano = 50) => apiRequest<Propuesta[]>(`${base}/catalogo?pagina=${pagina}&tamano=${tamano}`),
  todasGeneraciones: () => allPages(page => recortesInteligentesApi.generaciones(page, 200)),
  todasPropuestas: () => allPages(page => recortesInteligentesApi.propuestas(page, 200)),
  catalogoCompleto: () => allPages(page => recortesInteligentesApi.catalogo(page, 200)),
  detalle: (id: number) => apiRequest<DetallePropuesta>(`${base}/propuestas/${id}`),
  certificar: (id: number, evidencias: Array<{ motivoId: number; evidencia: string }>) =>
    apiRequest<void>(`${base}/propuestas/${id}/certificar`, { method: 'POST', body: JSON.stringify({ evidencias }) }),
  vincularReceta: (id: number, productoId: number, listaMaterialesId: number, plantillaFabricacionId: number) =>
    apiRequest<void>(`${base}/propuestas/${id}/vincular-receta`, {
      method: 'POST', body: JSON.stringify({ productoId, listaMaterialesId, plantillaFabricacionId }),
    }),
  decidir: (id: number, accion: 'aprobar' | 'rechazar' | 'descartar', motivo?: string) =>
    apiRequest<void>(`${base}/propuestas/${id}/${accion}`, {
      method: 'POST', ...(accion === 'aprobar' ? {} : { body: JSON.stringify({ motivo }) }),
    }),
  generar: (solicitudUid: string, recorteIds: number[]) => apiRequest<Generacion>(`${base}/generaciones`, {
    method: 'POST', body: JSON.stringify({ solicitudUid, recorteIds }),
  }),
  imagen: async (reference: string): Promise<Blob> => {
    if (!/^\/api\/recortes-inteligentes\/imagenes\/\d+\/[a-f0-9]{32}\.webp$/.test(reference))
      throw new ApiError('Referencia de imagen inválida.', 'validation');
    const token = getSession()?.accessToken;
    const response = await fetch(`${host}${reference}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new ApiError('No se pudo abrir la imagen ilustrativa.', 'server', response.status);
    const blob = await response.blob();
    if (!blob.type.includes('webp')) throw new ApiError('Formato de imagen inesperado.', 'response');
    return blob;
  },
};
