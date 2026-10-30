import { clearSession, getSession } from './session';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export type ApiErrorKind = 'connection' | 'authorization' | 'validation' | 'response' | 'server';

export class ApiError extends Error {
  constructor(message: string, public readonly kind: ApiErrorKind, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function responseFormatError(): ApiError {
  return new ApiError('La información recibida no tiene el formato esperado. Intentá nuevamente.', 'response');
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getSession()?.accessToken;
  let response: Response;

  try {
    response = await fetch(`${API}${url}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch (error) {
    console.error('No se pudo completar la solicitud HTTP.', error);
    throw new ApiError('No se pudo conectar con TEKA Manager. Revisá la conexión e intentá nuevamente.', 'connection');
  }

  if (response.status === 401) {
    clearSession();
    location.href = '/';
    throw new ApiError('La sesión venció. Volvé a iniciar sesión.', 'authorization', response.status);
  }
  if (response.status === 403) {
    throw new ApiError('No tenés permisos para realizar esta acción.', 'authorization', response.status);
  }
  if (response.status === 204) return undefined as T;

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    console.error('La respuesta no contiene JSON válido.', error);
    throw responseFormatError();
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string'
      ? data.mensaje
      : 'No se pudo completar la operación.';
    throw new ApiError(message, response.status === 400 || response.status === 422 ? 'validation' : 'server', response.status);
  }
  return data as T;
}

/** Obtiene documentos binarios con el mismo token de sesión que el resto de la API. */
export async function apiBlob(path: string): Promise<Blob> {
  const token = getSession()?.accessToken;
  let response: Response;
  try { response = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); }
  catch { throw new ApiError('No se pudo conectar con TEKA Manager.', 'connection'); }
  if (response.status === 401) { clearSession(); location.href = '/'; throw new ApiError('La sesión venció.', 'authorization', 401); }
  if (response.status === 403) throw new ApiError('No tenés permisos para consultar el PDF.', 'authorization', 403);
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message = data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string' ? data.mensaje : 'No se pudo obtener el PDF.';
    throw new ApiError(message, response.status >= 500 ? 'server' : 'validation', response.status);
  }
  const blob = await response.blob();
  if (!blob.size || !blob.type.includes('pdf')) throw responseFormatError();
  return blob;
}
