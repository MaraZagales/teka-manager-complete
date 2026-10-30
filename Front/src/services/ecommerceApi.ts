import { apiRequest } from './apiClient';
import { getSession } from './session';

// Contratos tomados de los DTOs reales de TEKAManager.Core.
export type ProductoEcommerce = {
  productoId: number; codigo: string; nombre: string; descripcion?: string | null;
  tipoProductoNombre: string; colorNombre?: string | null; activo: boolean;
  stockMinimo: number;
};
export type StockEcommerce = {
  stockProductoId: number; productoId: number; depositoId: number;
  depositoNombre: string; cantidadActual: number; esStockCritico: boolean;
};
export type PrecioEcommerce = {
  precioVentaId: number; productoId: number; precio: number;
  fechaVigenciaDesde: string; fechaVigenciaHasta?: string | null; activo: boolean;
};
export async function obtenerCatalogoEcommerce() {
  const [productos, stock, precios] = await Promise.all([
    apiRequest<ProductoEcommerce[]>('/api/Productos'),
    apiRequest<StockEcommerce[]>('/api/Stock/productos'),
    apiRequest<PrecioEcommerce[]>('/api/precios-venta'),
  ]);
  return { productos, stock, precios };
}

export type FichaEcommerce = {
 productoId: number; publicado: boolean; destacado: boolean; ordenVisual: number;
 descripcionComercial: string | null; anchoCm: number | null; altoCm: number | null;
 profundidadCm: number | null; depositoId: number | null; cupoOnline: number | null;
 urlGlb: string | null; urlUsdz: string | null; escalaValidada: boolean;
};
export type ImagenEcommerce = {
 productoImagenId: number; urlArchivo: string; textoAlternativo: string | null;
 esPrincipal: boolean; ordenVisual: number;
};
export type DetalleEcommerce = { ficha: FichaEcommerce; imagenes: ImagenEcommerce[] };
export type GuardarFichaEcommerce = Omit<FichaEcommerce, 'productoId'>;
export type GuardarImagenEcommerce = Omit<ImagenEcommerce, 'productoImagenId'>;

export const obtenerFichaEcommerce = (id: number) =>
 apiRequest<DetalleEcommerce>(`/api/ecommerce/catalogo/${id}`);
export const guardarFichaEcommerce = (id: number, datos: GuardarFichaEcommerce) =>
 apiRequest<void>(`/api/ecommerce/catalogo/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const agregarImagenEcommerce = (id: number, datos: GuardarImagenEcommerce) =>
 apiRequest<{ productoImagenId: number }>(`/api/ecommerce/catalogo/${id}/imagenes`, { method: 'POST', body: JSON.stringify(datos) });
export const editarImagenEcommerce = (id: number, imagenId: number, datos: GuardarImagenEcommerce) =>
 apiRequest<{ productoImagenId: number }>(`/api/ecommerce/catalogo/${id}/imagenes/${imagenId}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarImagenEcommerce = (id: number, imagenId: number) =>
 apiRequest<void>(`/api/ecommerce/catalogo/${id}/imagenes/${imagenId}`, { method: 'DELETE' });

/** Sube una fotografía real; el backend devuelve la URL y la registra en SQL. */
export async function subirFotoEcommerce(productoId: number, archivo: File, principal: boolean, orden: number, textoAlternativo: string) {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const form = new FormData();
  form.append('archivo', archivo);
  form.append('esPrincipal', String(principal));
  form.append('ordenVisual', String(orden));
  form.append('textoAlternativo', textoAlternativo);
  const token = getSession()?.accessToken;
  const respuesta = await fetch(`${base}/api/ecommerce/catalogo/${productoId}/imagenes/archivo`, {
    method: 'POST', body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(data.mensaje || `No se pudo subir la imagen (${respuesta.status}).`);
  return data as { productoImagenId: number; urlArchivo: string };
}

export type ResumenCatalogoEcommerce = { productoId: number; configurado: boolean; publicado: boolean; urlPortada: string | null };
export const obtenerResumenCatalogoEcommerce = () => apiRequest<ResumenCatalogoEcommerce[]>('/api/ecommerce/catalogo/resumen');

/** Las URL históricas pueden ser relativas. Se resuelven contra la API, nunca contra Vite. */
export function resolverUrlImagenEcommerce(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const valor = url.trim();
  if (/^https?:\/\//i.test(valor)) return valor;
  if (!valor.startsWith('/') || valor.startsWith('//')) return null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}${valor}`;
}

/** Consulta informativa de reservas y stock del depósito configurado; checkout valida en SQL. */
export type DisponibilidadOnline = {
  productoId: number; depositoId: number; depositoNombre: string;
  cupoOnline: number | null; stockFisico: number; reservado: number;
  stockLibre: number; disponibleOnline: number;
};
export const obtenerDisponibilidadOnline = () =>
  apiRequest<DisponibilidadOnline[]>('/api/ecommerce/disponibilidad');
