import {useEffect,useState} from 'react';
import {FileSpreadsheet,FileText} from 'lucide-react';
import {AppShell} from '../../components/layout/AppShell';
import {PageHeader} from '../../components/data/PageHeader';
import {cashReportDefinitions,cashReportRows,loadCompleteCashReport,type CashReportFilters,type CashReportKind} from '../../services/cashReportsApi';
import {inventoryAnalyticsExcel,inventoryAnalyticsPdf} from '../../services/inventoryAnalyticsReports';
import {apiErrorMessage} from '../../services/apiClient';
import {cashQueriesApi} from '../../services/cashQueriesApi';
import {formatDateTime,money} from './cashFormat';
import {getSession} from '../../services/session';
import {monthStartInput,todayInput} from './cashFormat';
import '../inventory/styles/reports.css';
import '../sales/salesReports.css';
import './cashReportsDashboard.css';
const kinds:[CashReportKind,string,string][]=[['financieros','Movimientos financieros','Detalle de ingresos, egresos, conceptos, origen y medio de pago.'],['medios','Cobros por medio de pago','Operaciones e importes por efectivo, transferencias y tarjetas.'],['cierres','Historial de cierres de caja','Responsables, efectivo esperado, contado y diferencias.'],['bancos','Conciliaciones bancarias','Estado de movimientos de transferencias conciliadas o pendientes.']];
const url=new URLSearchParams(location.search);
export function CashReportGeneratePage(){
 const [filters,setFilters]=useState<CashReportFilters>({desde:url.get('desde')||monthStartInput(),hasta:url.get('hasta')||todayInput(),buscar:'',cuenta:'',estado:''});
 const [kind,setKind]=useState<CashReportKind>(kinds.some(k=>k[0]===url.get('tipo'))?url.get('tipo') as CashReportKind:'financieros');
 const [format,setFormat]=useState<'pdf'|'excel'>('pdf'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [accounts,setAccounts]=useState<{cuentaBancariaId:number;nombre:string;moneda:string}[]>([]);
 useEffect(()=>{let active=true;import('../../services/cashApi').then(m=>m.cashApi.bankAccounts()).then(rows=>{if(active)setAccounts(rows)}).catch(()=>{});return()=>{active=false}},[]);
 useEffect(()=>{if(accounts.length===1&&!filters.cuenta)setFilters(f=>({...f,cuenta:String(accounts[0].cuentaBancariaId)}))},[accounts,filters.cuenta]);
 const invalid=!filters.desde||!filters.hasta||filters.desde>filters.hasta||(kind==='bancos'&&!filters.cuenta);
 async function generate(){if(invalid||busy)return;setBusy(true);setError('');try{const result=await loadCompleteCashReport(kind,filters);if(result.total>0&&result.filas.length===0)throw new Error('El servicio devolvió un informe vacío pese a informar registros.');const def=cashReportDefinitions[kind];let rows=cashReportRows(kind,result.filas);
if(kind==='cierres'&&result.filas.length){
  if(result.filas.length>100)throw new Error('Para exportar el detalle de cierres, seleccioná un período de hasta 100 sesiones.');
  // Cada cierre se presenta como unidad documental: encabezado, movimientos y totales.
  const detailed:typeof rows=[];
  for(const closure of result.filas){
    const sessionId=Number(closure.cajaSesionId);
    if(!Number.isSafeInteger(sessionId)||sessionId<=0)throw new Error('Un cierre no tiene identificador de sesión válido.');
    const state=await cashQueriesApi.session(sessionId);
    detailed.push({fecha:`CIERRE DE CAJA N.º ${sessionId}`,cuenta:String(closure.caja||''),responsable:String(closure.responsable||''),inicial:'',ingresos:'',egresos:'',esperado:'',contado:'',diferencia:''});
    detailed.push({fecha:'Fecha / hora',cuenta:'Movimiento / concepto',responsable:'Responsable',inicial:'',ingresos:'Ingreso',egresos:'Egreso',esperado:'',contado:'',diferencia:'Referencia'});
    for(const m of state.movimientos){
      detailed.push({fecha:formatDateTime(m.fecha),cuenta:m.conceptoClasificado||m.concepto,responsable:m.responsable,inicial:'',ingresos:m.sentido==='Ingreso'?m.importe:'',egresos:m.sentido==='Egreso'?m.importe:'',esperado:'',contado:'',diferencia:m.referencia||''});
    }
    if(!state.movimientos.length)detailed.push({fecha:'Sin movimientos registrados',cuenta:'',responsable:'',inicial:'',ingresos:'',egresos:'',esperado:'',contado:'',diferencia:''});
    detailed.push({fecha:'TOTALES DEL CIERRE',cuenta:'',responsable:'',inicial:Number(closure.efectivoInicial),ingresos:Number(closure.ingresos),egresos:Number(closure.egresos),esperado:Number(closure.efectivoEsperadoCierre),contado:Number(closure.efectivoContadoCierre),diferencia:Number(closure.diferenciaCierre)});
    detailed.push({fecha:'',cuenta:'',responsable:'',inicial:'',ingresos:'',egresos:'',esperado:'',contado:'',diferencia:''});
  }
  rows=detailed;
}const session=getSession();const responsible=session?.usuario?`${session.usuario.nombre} ${session.usuario.apellido||''}`.trim():undefined;if(result.total===0)throw new Error('No se encontraron registros para el período y los filtros seleccionados. No se generó un informe vacío.');const warning='Los datos provienen de libros registrados. El canal de venta no está disponible en el contrato actual de Caja y no se infiere. Los totales no representan facturación ni rentabilidad.';const exportFn=format==='pdf'?inventoryAnalyticsPdf:inventoryAnalyticsExcel;exportFn(def.title,`Desde ${filters.desde} hasta ${filters.hasta}`,def.columns,rows,warning,[{label:'Registros',value:result.total,denominator:'Conjunto filtrado completo'}],{objective:def.title,responsible,period:`${filters.desde} a ${filters.hasta}`,executiveSummary:`${result.total} registros del período consultado.`,interpretations:[],limitations:[warning]});}catch(e){setError(apiErrorMessage(e,'No se pudo generar el informe.'))}finally{setBusy(false)}}
 return <AppShell title="Generar informe" breadcrumb="Caja / Reportes / Generar informe" backHref="/caja/reportes"><main className="inventory-reports-page inventory-report-generator cash-report-generator"><PageHeader title="Generar informe"/><section className="inventory-report-form-card inventory-report-filter-card"><h2>1. Filtros</h2><div className="cash-generator-filters"><label>Desde<input type="date" value={filters.desde} onChange={e=>setFilters(f=>({...f,desde:e.target.value}))}/></label><label>Hasta<input type="date" value={filters.hasta} onChange={e=>setFilters(f=>({...f,hasta:e.target.value}))}/></label><label>Buscar referencia o descripción<input value={filters.buscar} onChange={e=>setFilters(f=>({...f,buscar:e.target.value}))} placeholder="Todas"/></label>{kind==='bancos'&&<label>Cuenta bancaria<select value={filters.cuenta} onChange={e=>setFilters(f=>({...f,cuenta:e.target.value}))}><option value="">Seleccionar cuenta</option>{accounts.map(a=><option key={a.cuentaBancariaId} value={a.cuentaBancariaId}>{a.nombre} · {a.moneda}</option>)}</select></label>}</div></section><div className="inventory-report-generator-grid"><section className="inventory-report-form-card"><h2>2. Tipo de informe</h2>{kinds.map(([value,label,description])=><label key={value} className={kind===value?'selected':''}><input type="radio" name="report" checked={kind===value} onChange={()=>setKind(value)}/><span><strong>{label}</strong><small>{description}</small></span></label>)}</section><section className="inventory-report-form-card"><h2>3. Formato de exportación</h2><label className={format==='pdf'?'selected':''}><input type="radio" name="format" checked={format==='pdf'} onChange={()=>setFormat('pdf')}/><FileText/><span><strong>PDF</strong><small>Documento institucional con detalle y alcance de los datos.</small></span></label><label className={format==='excel'?'selected':''}><input type="radio" name="format" checked={format==='excel'} onChange={()=>setFormat('excel')}/><FileSpreadsheet/><span><strong>Excel</strong><small>Información completa del informe seleccionado.</small></span></label></section></div>{error&&<div className="inventory-report-error" role="alert">{error}</div>}<div className="inventory-report-generate-action"><button className="button primary" disabled={invalid||busy} onClick={()=>void generate()}>{format==='pdf'?<FileText size={17}/>:<FileSpreadsheet size={17}/>} {busy?'Generando…':`Generar informe ${format.toUpperCase()}`}</button></div></main></AppShell>;
}
