import { apiRequest, responseFormatError } from './apiClient';

export type DailyCashType = { codigo: string; descripcion: string; sentido: 'Ingreso' | 'Egreso' };
export type DailyCashSession = {
  estado: string; fechaCierre: string | null; responsableCierre: string | null;
  efectivoEsperadoCierre: number | null; efectivoContadoCierre: number | null; diferenciaCierre: number | null; observacionCierre: string | null;
  cajaSesionId: number; fechaApertura: string; responsable: string; fondoObjetivoApertura: number;
  efectivoInicial: number; ingresos: number; egresos: number; efectivoEsperado: number; observacionApertura: string | null;
};
export type DailyCashEntry = {
  conceptoClasificado?:string|null;
  cajaMovimientoId: number; fecha: string; tipo: string; sentido: 'Ingreso' | 'Egreso'; importe: number;
  concepto: string; referencia: string | null; observaciones: string | null; responsable: string;
};
export type DailyCashCount = {
  cajaArqueoId: number; fecha: string; efectivoEsperado: number; efectivoContado: number; diferencia: number;
  responsable: string; vigente: boolean; observaciones: string | null;
};
export type DailyCashState = {
  caja: { cajaId: number; nombre: string; fondoFijoObjetivo: number | null };
  sesion: DailyCashSession | null; movimientos: DailyCashEntry[]; ultimoArqueo: DailyCashCount | null;
  tiposMovimiento: DailyCashType[];
};
export type DailyMovementPayload = { tipo: string; importe: number; concepto: string; referencia: string; observaciones: string; cajaConceptoId?:number; claveOperacion?: string };

// Las respuestas de dinero incompletas son un error de contrato, nunca un saldo cero.
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw responseFormatError();
  return value as Record<string, unknown>;
}
function fields(value: unknown, strings: string[], numbers: string[]) {
  const row = record(value);
  if (strings.some(key => typeof row[key] !== 'string') || numbers.some(key => typeof row[key] !== 'number' || !Number.isFinite(row[key]))) throw responseFormatError();
  return row;
}
export function validateState(value: unknown): DailyCashState {
  const state = record(value);
  const box = fields(state.caja, ['nombre'], ['cajaId']);
  if (box.fondoFijoObjetivo !== null && (typeof box.fondoFijoObjetivo !== 'number' || !Number.isFinite(box.fondoFijoObjetivo))) throw responseFormatError();
  if (state.sesion !== null) fields(state.sesion, ['responsable', 'fechaApertura'], ['cajaSesionId', 'fondoObjetivoApertura', 'efectivoInicial', 'ingresos', 'egresos', 'efectivoEsperado']);
  if (state.ultimoArqueo !== null) {
    const count = fields(state.ultimoArqueo, ['responsable', 'fecha'], ['cajaArqueoId', 'efectivoEsperado', 'efectivoContado', 'diferencia']);
    if (typeof count.vigente !== 'boolean') throw responseFormatError();
  }
  if (!Array.isArray(state.movimientos) || !Array.isArray(state.tiposMovimiento)) throw responseFormatError();
  state.movimientos.forEach(item => {
    const entry = fields(item, ['fecha', 'tipo', 'sentido', 'concepto', 'responsable'], ['cajaMovimientoId', 'importe']);
    if (!['Ingreso', 'Egreso'].includes(String(entry.sentido))) throw responseFormatError();
  });
  state.tiposMovimiento.forEach(item => fields(item, ['codigo', 'descripcion', 'sentido'], []));
  return value as DailyCashState;
}

const post = (path: string, payload: unknown) => apiRequest<unknown>(path, { method: 'POST', body: JSON.stringify(payload) });
export const dailyCashApi = {
  state: async (signal?: AbortSignal) => validateState(await apiRequest<unknown>('/api/caja-diaria/estado', { signal })),
  open: (boxId: number, efectivoInicial: number, observacion: string) => post(`/api/caja-diaria/cajas/${boxId}/abrir`, { efectivoInicial, observacion }),
  fixedFund: (boxId: number, importe: number) => apiRequest<unknown>(`/api/caja-diaria/cajas/${boxId}/fondo-fijo`, { method: 'PUT', body: JSON.stringify({ importe }) }),
  movement: (sessionId: number, payload: DailyMovementPayload) => post(`/api/caja-diaria/sesiones/${sessionId}/movimientos`, payload),
  count: (sessionId: number, efectivoContado: number, observaciones: string) => post(`/api/caja-diaria/sesiones/${sessionId}/arqueos`, { efectivoContado, observaciones }),
  close: (sessionId: number, observacion: string) => post(`/api/caja-diaria/sesiones/${sessionId}/cerrar`, { observacion }),
};
