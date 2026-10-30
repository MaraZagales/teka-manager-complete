import { apiRequest, responseFormatError } from './apiClient';
import { validateState } from './dailyCashApi';

export type CashFinancialRow = {
  cajaConceptoId?:number|null;conceptoClasificado?:string|null;
  fuente: 'Caja' | 'Financiero'; movimientoId: number; fecha: string; fechaRegistro: string; tipo: string;
  tipoCaja: string | null; medio: string; importe: number; estado: string; concepto: string; origenTipo: string;
  referencia: string | null; observaciones: string | null; responsable?: string; cajaSesionId: number | null;
  canal: string | null; cuenta: string | null;
  caja: string | null; documentoOrigen: string | null; estadoOrigen: string | null; medioOrigen: string | null;
  origenId: number; cobroId: number | null; pedidoId: number | null;
  comprobantes?: { tipo: string; puntoVenta: number; numeroComprobante: number; importeAplicado: number }[];
};
export type CashClosure = {
  cajaSesionId: number; caja: string; fechaApertura: string; fechaCierre: string; estado: string;
  responsable: string; efectivoInicial: number; ingresos: number; egresos: number;
  efectivoEsperadoCierre: number; efectivoContadoCierre: number; diferenciaCierre: number; observacionCierre: string | null;
};
export type CashQueryFilters = { desde: string; hasta: string; buscar: string; tipo: string; medio: string; estado: string; origen: string; concepto: string; cuenta: string; canal: string };
export type CashFilterOptions = { tipo: string[]; medio: string[]; estado: string[]; origen: string[]; canales: {id:number;descripcion:string;activo:boolean}[] };
export type CashReportRow = { medio: string; cantidad: number; ingresos: number; egresos: number };
export type CashPage<T> = { total: number; filas: T[]; resumen?: CashReportRow[] | Record<string,unknown> };

// Las consultas JSON SQL conservan PascalCase; normalización local, sin afectar otros servicios.
function camel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camel);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key[0].toLowerCase() + key.slice(1), camel(item)]));
  return value;
}
export {camel as normalizeCashJson};
function financial(value: unknown): CashFinancialRow {
  const row = camel(value) as CashFinancialRow;
  if (!row || !['Caja','Financiero'].includes(row.fuente) || !Number.isSafeInteger(row.movimientoId) || row.movimientoId<=0 || !Number.isFinite(row.importe) || row.importe<=0 || !['concepto','fecha','fechaRegistro','tipo','medio','estado','origenTipo'].every(key=>typeof row[key as keyof CashFinancialRow]==='string')) throw responseFormatError();
  if (row.comprobantes!==undefined && (!Array.isArray(row.comprobantes)||row.comprobantes.some(item=>typeof item.tipo!=='string'||![item.puntoVenta,item.numeroComprobante,item.importeAplicado].every(Number.isFinite)))) throw responseFormatError();
  return row;
}
function closure(value: unknown): CashClosure {
  const row=camel(value) as CashClosure;
  if (!row || !['cajaSesionId','efectivoInicial','ingresos','egresos','efectivoEsperadoCierre','efectivoContadoCierre','diferenciaCierre'].every(key=>typeof row[key as keyof CashClosure]==='number' && Number.isFinite(row[key as keyof CashClosure])) || typeof row.responsable !== 'string' || typeof row.fechaCierre !== 'string') throw responseFormatError();
  return row;
}
async function list<T>(kind: string, filters: CashQueryFilters, page: number, parse: (row: unknown)=>T, signal?: AbortSignal, pageSize = 10): Promise<CashPage<T>> {
  const params=new URLSearchParams({ pagina:String(page),tamano:String(pageSize) });
  Object.entries(filters).forEach(([key,value])=>{ if (value) params.set(key,value); });
  const result=camel(await apiRequest<unknown>(`/api/caja-consultas/${kind}?${params}`,{signal})) as CashPage<unknown>;
  if (!result || !Number.isFinite(result.total) || !Array.isArray(result.filas)) throw responseFormatError();
  // Los cierres devuelven Resumen como objeto de totales; movimientos lo devuelve como arreglo.
  if (result.resumen !== undefined && result.resumen !== null && typeof result.resumen !== 'object') throw responseFormatError();
  return {total:result.total,filas:result.filas.map(parse),resumen:result.resumen};
}
export const cashQueriesApi = {
  financial: (filters:CashQueryFilters,page:number,signal?:AbortSignal,pageSize=5)=>list('movimientos',filters,page,financial,signal,pageSize),
  closures: (filters:CashQueryFilters,page:number,signal?:AbortSignal,pageSize=10)=>list('cierres',filters,page,closure,signal,pageSize),
  detail: async (source:string,id:number,signal?:AbortSignal)=>financial(await apiRequest<unknown>(`/api/caja-consultas/movimientos/${source}/${id}`,{signal})),
  session: async (id:number,signal?:AbortSignal)=>validateState(camel(await apiRequest<unknown>(`/api/caja-consultas/sesiones/${id}`,{signal}))),
  options: async (signal?:AbortSignal)=> {
    const value=camel(await apiRequest<unknown>('/api/caja-consultas/filtros',{signal})) as CashFilterOptions;
    if (!value || !['tipo','medio','origen','estado','canales'].every(key=>Array.isArray(value[key as keyof CashFilterOptions]))) throw responseFormatError();
    if (value.canales.some(item=>!Number.isFinite(item.id)||typeof item.descripcion!=='string'||typeof item.activo!=='boolean')) throw responseFormatError();
    return value;
  },
};
