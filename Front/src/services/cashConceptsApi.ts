import { apiRequest, responseFormatError } from './apiClient';
import type { DailyCashType } from './dailyCashApi';
export type CashConcept={cajaConceptoId:number;codigo:string;nombre:string;tipo:string;activo:boolean;utilizado:boolean};
export type CashConceptCatalog={disponible:boolean;mensaje:string|null;tipos:DailyCashType[];conceptos:CashConcept[]};
export function parseCashConceptCatalog(value:unknown):CashConceptCatalog {
  if(!value||typeof value!=='object')throw responseFormatError();
  const result=value as CashConceptCatalog;
  if(typeof result.disponible!=='boolean'||!Array.isArray(result.tipos)||!Array.isArray(result.conceptos))throw responseFormatError();
  if(result.tipos.some(row=>!row||typeof row.codigo!=='string'||typeof row.descripcion!=='string'))throw responseFormatError();
  const conceptos=result.conceptos.map(value=>{
    if(!value||typeof value!=='object'||Array.isArray(value))throw responseFormatError();
    const row=Object.fromEntries(Object.entries(value).map(([key,item])=>[key.charAt(0).toLowerCase()+key.slice(1),item])) as CashConcept;
    if(!Number.isSafeInteger(row.cajaConceptoId)||row.cajaConceptoId<=0||typeof row.codigo!=='string'||typeof row.nombre!=='string'||typeof row.tipo!=='string'||typeof row.activo!=='boolean'||typeof row.utilizado!=='boolean')throw responseFormatError();
    return row;
  });
  return {...result,conceptos};
}
export const cashConceptsApi={
  list:async(signal?:AbortSignal):Promise<CashConceptCatalog>=>{
    return parseCashConceptCatalog(await apiRequest<unknown>('/api/caja-conceptos',{signal}));
  },
  save:(id:number|null,payload:{codigo:string;nombre:string;tipo:string})=>apiRequest(`/api/caja-conceptos${id?`/${id}`:''}`,{method:id?'PUT':'POST',body:JSON.stringify(payload)}),
  state:(id:number,activo:boolean)=>apiRequest(`/api/caja-conceptos/${id}/estado`,{method:'PUT',body:JSON.stringify({activo})}),
};
