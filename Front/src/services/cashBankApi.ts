import {apiRequest,responseFormatError} from './apiClient';
import {normalizeCashJson} from './cashQueriesApi';
import type {BankMovement} from './cashApi';
export type BankQueryRow=BankMovement&{estadoConsulta:string;coincidencias:number;nombreArchivo:string;responsableImportacion:string;responsableConciliacion:string|null;observacionConciliacion:string|null;conceptoInterno:string|null;referenciaInterna:string|null};
export type BankCandidate={movimientoFinancieroId:number;fechaOperacion:string;tipo:string;importe:number;concepto:string;referenciaExterna:string|null;referenciaCoincide:boolean;compartido:boolean};
export type BankImportRow={fecha:string;tipo:'Ingreso'|'Egreso';importe:number;descripcion:string;referencia:string|null;idBanco:string};
export type BankImportPayload={cuentaBancariaId:number;nombreArchivo:string;filas:BankImportRow[]};
export type BankPreview={huella:string;archivoDuplicado:boolean;filas:(BankImportRow&{duplicada:boolean})[];nuevas:number;duplicadas:number};
export type BankFilters={cuenta:number;desde:string;hasta:string;estado:string;buscar:string;dias:number};
export type BankQuery={total:number;filas:BankQueryRow[];resumen:{cantidad:number;conciliados:number;pendientes:number;sinCoincidencia:number;ingresos:number;egresos:number}};
async function get(path:string,signal?:AbortSignal){return normalizeCashJson(await apiRequest<unknown>(path,{signal}));}
async function post<T>(path:string,payload:unknown){return normalizeCashJson(await apiRequest<unknown>(path,{method:'POST',body:JSON.stringify(payload)})) as T;}
export const cashBankApi={
  query:async(filters:BankFilters,page:number,signal?:AbortSignal,pageSize=10):Promise<BankQuery>=>{
    const params=new URLSearchParams({pagina:String(page),tamano:String(pageSize)});Object.entries(filters).forEach(([key,value])=>{if(value!=='')params.set(key,String(value));});
    const result=await get(`/api/caja-bancos/consulta?${params}`,signal) as BankQuery;
    if(!result||!Number.isFinite(result.total)||!Array.isArray(result.filas)||!result.resumen||!Number.isFinite(result.resumen.cantidad)||result.filas.some(row=>!Number.isFinite(row.importe)||typeof row.estadoConsulta!=='string'))throw responseFormatError();return result;
  },
  candidates:async(id:number,days:number,signal?:AbortSignal)=>{
    const rows=await get(`/api/caja-bancos/movimientos/${id}/candidatos?dias=${days}`,signal) as BankCandidate[];
    if(!Array.isArray(rows)||rows.some(row=>!Number.isFinite(row.importe)||!Number.isSafeInteger(row.movimientoFinancieroId)||typeof row.referenciaCoincide!=='boolean'))throw responseFormatError();return rows;
  },
  preview:(payload:BankImportPayload)=>post<BankPreview>('/api/caja-bancos/extractos/vista-previa',payload),
  confirm:(payload:BankImportPayload)=>post<{importadas:number;duplicadas:number}>('/api/caja-bancos/extractos/confirmar',payload),
  reconcile:(bank:number,financial:number,days:number,notes:string)=>post('/api/caja-bancos/conciliaciones',{bancoMovimientoId:bank,movimientoFinancieroId:financial,diasTolerancia:days,observaciones:notes}),
};
