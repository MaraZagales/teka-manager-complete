import {apiRequest,responseFormatError} from './apiClient';
import {normalizeCashJson,cashQueriesApi,type CashQueryFilters} from './cashQueriesApi';
import type {ReportColumn,ReportRecord} from './inventoryAnalyticsReports';
import {formatDateTime,formatDate,movementTypeLabel,sourceLabel,paymentMethodLabel} from '../features/cash/cashFormat';
export type CashReportKind='financieros'|'cierres'|'medios'|'bancos';
export type CashReportFilters={desde:string;hasta:string;buscar:string;cuenta:string;estado:string};
export type CashReportData={total:number;filas:Record<string,unknown>[];resumen?:Record<string,number>|Record<string,unknown>[]};
export const cashReportDefinitions:Record<CashReportKind,{title:string;columns:ReportColumn[];money:string[]}>= {
  financieros:{title:'Movimientos financieros por período',columns:[{header:'Fecha',key:'fecha'},{header:'Tipo',key:'tipo'},{header:'Concepto / descripción',key:'concepto'},{header:'Origen',key:'origen'},{header:'Medio',key:'medio'},{header:'Caja / cuenta',key:'cuenta'},{header:'Referencia',key:'referencia'},{header:'Importe',key:'importe'},{header:'Estado',key:'estado'}],money:['importe']},
  cierres:{title:'Cierres y diferencias de caja',columns:[{header:'Cierre',key:'fecha'},{header:'Caja',key:'cuenta'},{header:'Responsable',key:'responsable'},{header:'Inicial',key:'inicial'},{header:'Ingresos',key:'ingresos'},{header:'Egresos',key:'egresos'},{header:'Esperado',key:'esperado'},{header:'Contado',key:'contado'},{header:'Diferencia',key:'diferencia'}],money:['inicial','ingresos','egresos','esperado','contado','diferencia']},
  medios:{title:'Movimientos por medio de pago o cobro',columns:[{header:'Medio',key:'medio'},{header:'Operaciones',key:'cantidad'},{header:'Ingresos registrados',key:'ingresos'},{header:'Egresos registrados',key:'egresos'}],money:['ingresos','egresos']},
  bancos:{title:'Estado de conciliaciones bancarias',columns:[{header:'Fecha bancaria',key:'fecha'},{header:'Descripción',key:'concepto'},{header:'Referencia',key:'referencia'},{header:'Tipo',key:'tipo'},{header:'Importe',key:'importe'},{header:'Estado',key:'estado'},{header:'Conciliado el',key:'conciliado'},{header:'Responsable',key:'responsable'}],money:['importe']},
};
export async function loadCashReport(kind:CashReportKind,filters:CashReportFilters,page:number,exporting=false,signal?:AbortSignal,pageSize=10):Promise<CashReportData>{
  const params=new URLSearchParams({pagina:String(page),tamano:String(pageSize)});Object.entries(filters).forEach(([key,value])=>{if(value)params.set(key,value);});
  const result=normalizeCashJson(await apiRequest<unknown>(`/api/caja-consultas/reportes/${kind}${exporting?'/exportar':''}?${params}`,{signal})) as CashReportData;
  if(!result||!Number.isFinite(result.total)||!Array.isArray(result.filas))throw responseFormatError();return result;
}
export function cashReportRows(kind:CashReportKind,rows:Record<string,unknown>[]):ReportRecord[]{
  const text=(value:unknown)=>value==null?'':String(value);
  const numeric=(value:unknown)=>{if(typeof value!=='number'||!Number.isFinite(value))throw responseFormatError();return value;};
  return rows.map(row=>{
    if(kind==='medios')return {medio:paymentMethodLabel(text(row.medio)),cantidad:numeric(row.cantidad),ingresos:numeric(row.ingresos),egresos:numeric(row.egresos)};
    if(kind==='cierres')return {fecha:formatDateTime(text(row.fechaCierre)),cuenta:text(row.caja),responsable:text(row.responsable),inicial:numeric(row.efectivoInicial),ingresos:numeric(row.ingresos),egresos:numeric(row.egresos),esperado:numeric(row.efectivoEsperadoCierre),contado:numeric(row.efectivoContadoCierre),diferencia:numeric(row.diferenciaCierre)};
    if(kind==='bancos')return {fecha:formatDate(text(row.fechaMovimiento)),concepto:text(row.descripcion),referencia:text(row.referenciaBanco),tipo:text(row.tipo),importe:numeric(row.importe),estado:row.estadoConsulta==='SinCoincidencia'?'Sin coincidencia':text(row.estadoConsulta),conciliado:formatDateTime(text(row.fechaConciliacion)),responsable:text(row.responsableConciliacion)};
    return {fecha:formatDateTime(text(row.fecha)),tipo:row.tipoCaja?movementTypeLabel(text(row.tipoCaja)):text(row.tipo),concepto:text(row.conceptoClasificado||row.concepto),origen:sourceLabel(text(row.origenTipo)),medio:paymentMethodLabel(text(row.medio)),cuenta:text(row.caja||row.cuenta),referencia:text(row.referencia||row.documentoOrigen),importe:numeric(row.importe),estado:text(row.estado)};
  });
}

// El endpoint /exportar no debe ser la única fuente del documento: se recorren
// páginas reales del mismo reporte que utiliza la pantalla, sin filas ficticias.
const queryFilters=(f:CashReportFilters):CashQueryFilters=>({desde:f.desde,hasta:f.hasta,buscar:f.buscar,tipo:'',medio:'',estado:f.estado,origen:'',concepto:'',cuenta:'',canal:''});
async function collectPages<T>(fetchPage:(page:number)=>Promise<{total:number;filas:T[]}>):Promise<T[]>{
 const first=await fetchPage(1);
 if(first.total>20000)throw new Error('El informe supera 20.000 registros. Reducí el período.');
 if(first.total>0&&!first.filas.length)throw responseFormatError();
 const rows=[...first.filas];
 const size=first.filas.length;
 if(!size)return rows;
 for(let page=2;rows.length<first.total;page++){
  const next=await fetchPage(page);
  if(!next.filas.length||next.total!==first.total)throw responseFormatError();
  rows.push(...next.filas);
 }
 return rows;
}
export async function loadCompleteCashReport(kind:CashReportKind,filters:CashReportFilters):Promise<CashReportData>{
 // IMPORTANTE: 'cuenta' es el ID de cuenta bancaria para conciliaciones.
 // No aplicar ese ID a movimientos ni cierres: excluye efectivo y tarjetas.
 // Los reportes financieros y cierres reutilizan las consultas que alimentan los listados
 // funcionales de Caja; no dependen del exportador SQL que puede devolver cero filas.
 if(kind==='financieros'){
  const rows=await collectPages(page=>cashQueriesApi.financial(queryFilters(filters),page,undefined,200));
  return {total:rows.length,filas:rows.map(r=>({...r,origenTipo:r.origenTipo,conceptoClasificado:r.conceptoClasificado}))};
 }
 if(kind==='cierres'){
  const rows=await collectPages(page=>cashQueriesApi.closures(queryFilters(filters),page,undefined,200));
  return {total:rows.length,filas:rows};
 }
 if(kind==='medios'){
  const rows=await collectPages(page=>cashQueriesApi.financial(queryFilters(filters),page,undefined,200));
  const totals=new Map<string,{medio:string;cantidad:number;ingresos:number;egresos:number}>();
  for(const r of rows){
   const medio=r.medio||'Sin identificar';
   const item=totals.get(medio)||{medio,cantidad:0,ingresos:0,egresos:0};
   const isOut=r.tipo==='Egreso'||/egreso|salida/i.test(r.tipo);
   item.cantidad++;
   if(isOut)item.egresos+=r.importe;else item.ingresos+=r.importe;
   totals.set(medio,item);
  }
  const filas=[...totals.values()];return {total:filas.length,filas};
 }
 const first=await loadCashReport(kind,filters,1,false,undefined,200);
 if(first.total<=first.filas.length)return first;
 const rows=await collectPages(page=>loadCashReport(kind,filters,page,false,undefined,200));
 return {...first,filas:rows};
}
