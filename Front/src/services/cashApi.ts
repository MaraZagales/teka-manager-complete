import { apiRequest, responseFormatError } from './apiClient';

export type Lookup = { id: number; descripcion: string };
export type CashSession = {
  cajaSesionId: number;
  cajaId: number;
  estado: string;
  fechaApertura: string;
  usuarioAperturaId: number;
  fondoObjetivoApertura: number;
  efectivoInicial: number;
  observacionApertura: string | null;
  fechaCierre: string | null;
  usuarioCierreId: number | null;
  efectivoEsperadoCierre: number | null;
  efectivoContadoCierre: number | null;
  diferenciaCierre: number | null;
  observacionCierre: string | null;
  nombreCaja: string;
  efectivoEsperadoActual: number | null;
  cantidadMovimientos: number | null;
};
export type DailyCashMovement = {
  cajaMovimientoId: number;
  cajaSesionId: number;
  fecha: string;
  tipo: string;
  importe: number;
  concepto: string;
  referencia: string | null;
  observaciones: string | null;
  usuarioId: number;
  cobroId: number | null;
};
export type CashCount = {
  cajaArqueoId: number;
  cajaSesionId: number;
  fecha: string;
  usuarioId: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  observaciones: string | null;
};
export type FinancialMovement = {
  fuente: string | null;
  movimientoId: number;
  fecha: string;
  tipo: string;
  medio: string | null;
  importe: number;
  estado: string | null;
  concepto: string | null;
  origenTipo: string | null;
  canalVentaId: number | null;
  cuentaBancariaId: number | null;
  referencia: string | null;
  totalRegistros: number;
};
export type BankAccount = { cuentaBancariaId: number; nombre: string; banco: string; moneda: string; activa: boolean };
export type BankMovement = {
  bancoMovimientoId: number;
  bancoImportacionId: number;
  cuentaBancariaId: number;
  fechaMovimiento: string;
  tipo: string;
  importe: number;
  descripcion: string;
  referenciaBanco: string | null;
  claveMovimiento: string;
  estado: string;
  fechaAlta: string;
  movimientoFinancieroId: number | null;
  fechaConciliacion: string | null;
  metodo: string | null;
};
export type ReconciliationSuggestion = {
  bancoMovimientoId: number;
  movimientoFinancieroId: number;
  fechaMovimiento: string;
  fechaOperacion: string;
  importe: number;
  referenciaBanco: string | null;
  evaluacion: string;
};

type Raw = Record<string, unknown>;
const key = (name: string) => `${name[0].toLowerCase()}${name.slice(1)}`;
function value(row: Raw, name: string) { return row[name] ?? row[key(name)]; }
function numberValue(row: Raw, name: string) { const result = Number(value(row, name)); return Number.isFinite(result) ? result : 0; }
function nullableNumber(row: Raw, name: string) { const result = value(row, name); return result === null || result === undefined ? null : Number(result); }
function stringValue(row: Raw, name: string) { return String(value(row, name) ?? ''); }
function nullableString(row: Raw, name: string) { const result = value(row, name); return result === null || result === undefined ? null : String(result); }
function rows(data: unknown): Raw[] { if (!Array.isArray(data)) throw responseFormatError(); return data as Raw[]; }
function query(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([name, entry]) => { if (entry !== null && entry !== undefined && entry !== '') search.set(name, String(entry)); });
  const result = search.toString();
  return result ? `?${result}` : '';
}

const mapSession = (row: Raw): CashSession => ({
  cajaSesionId: numberValue(row, 'CajaSesionId'), cajaId: numberValue(row, 'CajaId'), estado: stringValue(row, 'Estado'),
  fechaApertura: stringValue(row, 'FechaApertura'), usuarioAperturaId: numberValue(row, 'UsuarioAperturaId'),
  fondoObjetivoApertura: numberValue(row, 'FondoObjetivoApertura'), efectivoInicial: numberValue(row, 'EfectivoInicial'),
  observacionApertura: nullableString(row, 'ObservacionApertura'), fechaCierre: nullableString(row, 'FechaCierre'),
  usuarioCierreId: nullableNumber(row, 'UsuarioCierreId'), efectivoEsperadoCierre: nullableNumber(row, 'EfectivoEsperadoCierre'),
  efectivoContadoCierre: nullableNumber(row, 'EfectivoContadoCierre'), diferenciaCierre: nullableNumber(row, 'DiferenciaCierre'),
  observacionCierre: nullableString(row, 'ObservacionCierre'), nombreCaja: stringValue(row, 'NombreCaja'),
  efectivoEsperadoActual: nullableNumber(row, 'EfectivoEsperadoActual'), cantidadMovimientos: nullableNumber(row, 'CantidadMovimientos'),
});
const mapDailyMovement = (row: Raw): DailyCashMovement => ({
  cajaMovimientoId: numberValue(row, 'CajaMovimientoId'), cajaSesionId: numberValue(row, 'CajaSesionId'), fecha: stringValue(row, 'Fecha'),
  tipo: stringValue(row, 'Tipo'), importe: numberValue(row, 'Importe'), concepto: stringValue(row, 'Concepto'),
  referencia: nullableString(row, 'Referencia'), observaciones: nullableString(row, 'Observaciones'), usuarioId: numberValue(row, 'UsuarioId'), cobroId: nullableNumber(row, 'CobroId'),
});
const mapFinancial = (row: Raw): FinancialMovement => ({
  fuente: nullableString(row, 'Fuente'), movimientoId: numberValue(row, 'MovimientoId'), fecha: stringValue(row, 'Fecha'), tipo: stringValue(row, 'Tipo'),
  medio: nullableString(row, 'Medio'), importe: numberValue(row, 'Importe'), estado: nullableString(row, 'Estado'), concepto: nullableString(row, 'Concepto'),
  origenTipo: nullableString(row, 'OrigenTipo'), canalVentaId: nullableNumber(row, 'CanalVentaId'), cuentaBancariaId: nullableNumber(row, 'CuentaBancariaId'),
  referencia: nullableString(row, 'Referencia'), totalRegistros: numberValue(row, 'TotalRegistros'),
});
const mapBankMovement = (row: Raw): BankMovement => ({
  bancoMovimientoId: numberValue(row, 'BancoMovimientoId'), bancoImportacionId: numberValue(row, 'BancoImportacionId'), cuentaBancariaId: numberValue(row, 'CuentaBancariaId'),
  fechaMovimiento: stringValue(row, 'FechaMovimiento'), tipo: stringValue(row, 'Tipo'), importe: numberValue(row, 'Importe'), descripcion: stringValue(row, 'Descripcion'),
  referenciaBanco: nullableString(row, 'ReferenciaBanco'), claveMovimiento: stringValue(row, 'ClaveMovimiento'), estado: stringValue(row, 'Estado'), fechaAlta: stringValue(row, 'FechaAlta'),
  movimientoFinancieroId: nullableNumber(row, 'MovimientoFinancieroId'), fechaConciliacion: nullableString(row, 'FechaConciliacion'), metodo: nullableString(row, 'Metodo'),
});

export const cashApi = {
  boxes: () => apiRequest<Lookup[]>('/api/auxiliares/cajas'),
  channels: () => apiRequest<Lookup[]>('/api/auxiliares/canales-venta'),
  paymentMethods: () => apiRequest<Array<Lookup & { requiereReferencia: boolean }>>('/api/auxiliares/medios-cobro'),
  sessions: async (cajaId?: number, soloAbiertas = false) => rows(await apiRequest<unknown>(`/api/caja-diaria/sesiones${query({ cajaId, soloAbiertas })}`)).map(mapSession),
  sessionMovements: async (sessionId: number) => rows(await apiRequest<unknown>(`/api/caja-diaria/sesiones/${sessionId}/movimientos`)).map(mapDailyMovement),
  setFixedFund: (cashBoxId: number, importe: number) => apiRequest<unknown>(`/api/caja-diaria/cajas/${cashBoxId}/fondo-fijo`, { method: 'PUT', body: JSON.stringify({ importe }) }),
  open: async (cashBoxId: number, efectivoInicial: number, observacion?: string) => mapSession(rows(await apiRequest<unknown>(`/api/caja-diaria/cajas/${cashBoxId}/abrir`, { method: 'POST', body: JSON.stringify({ efectivoInicial, observacion: observacion || null }) }))[0]),
  addDailyMovement: (sessionId: number, payload: { tipo: string; importe: number; concepto: string; referencia?: string; observaciones?: string }) =>
    apiRequest<unknown>(`/api/caja-diaria/sesiones/${sessionId}/movimientos`, { method: 'POST', body: JSON.stringify(payload) }),
  count: async (sessionId: number, efectivoContado: number, observaciones?: string) => {
    const row = rows(await apiRequest<unknown>(`/api/caja-diaria/sesiones/${sessionId}/arqueos`, { method: 'POST', body: JSON.stringify({ efectivoContado, observaciones: observaciones || null }) }))[0];
    return { cajaArqueoId: numberValue(row, 'CajaArqueoId'), cajaSesionId: numberValue(row, 'CajaSesionId'), fecha: stringValue(row, 'Fecha'), usuarioId: numberValue(row, 'UsuarioId'), efectivoEsperado: numberValue(row, 'EfectivoEsperado'), efectivoContado: numberValue(row, 'EfectivoContado'), diferencia: numberValue(row, 'Diferencia'), observaciones: nullableString(row, 'Observaciones') } as CashCount;
  },
  close: (sessionId: number, observacion?: string) => apiRequest<unknown>(`/api/caja-diaria/sesiones/${sessionId}/cerrar`, { method: 'POST', body: JSON.stringify({ observacion: observacion || null }) }),
  financialMovements: async (filters: { desde?: string; hasta?: string; tipo?: string; medio?: string; estado?: string; canalVentaId?: number; cuentaBancariaId?: number; origenTipo?: string; pagina?: number; tamanoPagina?: number }) =>
    rows(await apiRequest<unknown>(`/api/caja-movimientos${query(filters)}`)).map(mapFinancial),
  bankAccounts: async () => rows(await apiRequest<unknown>('/api/caja-bancos/cuentas')).map(row => ({ cuentaBancariaId: numberValue(row, 'CuentaBancariaId'), nombre: stringValue(row, 'Nombre'), banco: stringValue(row, 'Banco'), moneda: stringValue(row, 'Moneda'), activa: Boolean(value(row, 'Activa')) })),
  bankMovements: async (accountId: number, filters: { estado?: string; desde?: string; hasta?: string }) => rows(await apiRequest<unknown>(`/api/caja-bancos/movimientos${query({ cuentaBancariaId: accountId, ...filters })}`)).map(mapBankMovement),
  suggestions: async (accountId: number, days = 3) => rows(await apiRequest<unknown>(`/api/caja-bancos/sugerencias${query({ cuentaBancariaId: accountId, diasTolerancia: days })}`)).map(row => ({ bancoMovimientoId: numberValue(row, 'BancoMovimientoId'), movimientoFinancieroId: numberValue(row, 'MovimientoFinancieroId'), fechaMovimiento: stringValue(row, 'FechaMovimiento'), fechaOperacion: stringValue(row, 'FechaOperacion'), importe: numberValue(row, 'Importe'), referenciaBanco: nullableString(row, 'ReferenciaBanco'), evaluacion: stringValue(row, 'Evaluacion') })),
  reconcile: (bancoMovimientoId: number, movimientoFinancieroId: number, observaciones?: string) => apiRequest<unknown>('/api/caja-bancos/conciliaciones', { method: 'POST', body: JSON.stringify({ bancoMovimientoId, movimientoFinancieroId, observaciones: observaciones || null }) }),
};
