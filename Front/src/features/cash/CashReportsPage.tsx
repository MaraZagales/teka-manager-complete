import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,FileBarChart,RotateCcw} from 'lucide-react';
import {AppShell} from '../../components/layout/AppShell';
import {PageHeader} from '../../components/data/PageHeader';
import {cashReportRows,loadCashReport,loadCompleteCashReport,type CashReportData,type CashReportFilters} from '../../services/cashReportsApi';
import {apiErrorMessage} from '../../services/apiClient';
import {money,monthStartInput,todayInput} from './cashFormat';
import '../inventory/styles/reports.css';
import '../sales/salesReports.css';
import './cashReportsDashboard.css';

const defaults=():CashReportFilters=>({desde:monthStartInput(),hasta:todayInput(),buscar:'',cuenta:'',estado:''});
const amount=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:0;
export function CashReportsPage(){
 const [filters,setFilters]=useState(defaults),[data,setData]=useState<Record<string,CashReportData>>({}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{const abort=new AbortController();setLoading(true);setError('');Promise.allSettled((['financieros','medios','cierres'] as const).map(kind=>kind==='financieros'?loadCompleteCashReport(kind,filters):loadCashReport(kind,filters,1,true,abort.signal))).then(results=>{if(abort.signal.aborted)return;const next:Record<string,CashReportData>={};results.forEach((result,index)=>{if(result.status==='fulfilled')next[['financieros','medios','cierres'][index]]=result.value;});setData(next);if(results.some(r=>r.status==='rejected'))setError('Algunos informes no pudieron cargarse. Los indicadores incompletos se ocultan.');}).catch(e=>{if(!abort.signal.aborted)setError(apiErrorMessage(e,'No se pudieron cargar los reportes.'));}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});return()=>abort.abort()},[filters,retry]);
 const byMethod=useMemo(()=>data.medios?cashReportRows('medios',data.medios.filas):[],[data.medios]);
 const incomes=byMethod.reduce((s,r)=>s+amount(r.ingresos),0),outcomes=byMethod.reduce((s,r)=>s+amount(r.egresos),0);
 const closing=useMemo(()=>data.cierres?cashReportRows('cierres',data.cierres.filas).slice(0,5):[],[data.cierres]);
 const expenses=useMemo(()=>{
  const rows=data.financieros?.filas||[];
  const totals=new Map<string,number>();
  for(const row of rows){
   const type=String(row.tipo||row.tipoCaja||'').toLocaleLowerCase('es-AR');
   if(!type.includes('egreso')&&!type.includes('salida')&&type!=='e')continue;
   if(row.esOperacionInterna===true||row.realizado===false)continue;
   const concept=String(row.conceptoClasificado||row.concepto||'Sin clasificar').trim()||'Sin clasificar';
   totals.set(concept,(totals.get(concept)||0)+amount(row.importe));
  }
  return [...totals].map(([concept,total])=>({concept,total})).sort((a,b)=>b.total-a.total).slice(0,5);
 },[data.financieros]);
 const maxExpense=Math.max(1,...expenses.map(x=>x.total));
 const max=Math.max(1,...byMethod.map(r=>amount(r.ingresos)));
 return <AppShell title="Reportes de caja" breadcrumb="Caja / Reportes"><main className="inventory-reports-page sales-analytics-page cash-analytics-page">
  <PageHeader title="Reportes de caja" action={<a className="button primary" href={`/caja/reportes/generar?desde=${encodeURIComponent(filters.desde)}&hasta=${encodeURIComponent(filters.hasta)}`}><FileBarChart size={17}/> Generar informe</a>}/>
  <section className="cash-analytics-filters"><label>Desde<input type="date" value={filters.desde} onChange={e=>setFilters(f=>({...f,desde:e.target.value}))}/></label><label>Hasta<input type="date" value={filters.hasta} onChange={e=>setFilters(f=>({...f,hasta:e.target.value}))}/></label><button className="button secondary" onClick={()=>setFilters(defaults())}>Limpiar</button></section>
  {filters.desde>filters.hasta?<p className="inventory-report-error">La fecha desde no puede superar a la fecha hasta.</p>:null}
  {error&&<div className="inventory-report-error" role="alert">{error} <button className="button secondary compact" onClick={()=>setRetry(n=>n+1)}><RotateCcw size={15}/> Reintentar</button></div>}
  {loading?<p>Consultando movimientos registrados…</p>:<>
   <div className="cash-analytics-kpis"><article><span>Ingresos registrados</span><strong>{data.medios?money.format(incomes):'No disponible'}</strong></article><article><span>Egresos registrados</span><strong>{data.medios?money.format(outcomes):'No disponible'}</strong></article><article><span>Resultado de movimientos</span><strong>{data.medios?money.format(incomes-outcomes):'No disponible'}</strong></article></div>
   <div className="sales-v8-dashboard"><div className="sales-v8-visuals"><section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Cobros por medio</h2><p>Ingresos registrados, agrupados por medio · ARS</p></div><a href="/caja/reportes/generar?tipo=medios">Generar informe <ArrowUpRight size={14}/></a></div>{byMethod.length?<div className="cash-method-chart">{byMethod.map((r,i)=><div className="cash-method-row" key={i}><span>{String(r.medio)}</span><div className="cash-method-track"><div style={{width:`${100*amount(r.ingresos)/max}%`}}/></div><strong>{money.format(amount(r.ingresos))}</strong></div>)}</div>:<p className="sales-decision-empty">Sin movimientos por medio para el período.</p>}</section><section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Egresos por concepto</h2><p>Egresos registrados por concepto · ARS</p></div></div>{expenses.length?<div className="cash-method-chart">{expenses.map((r,i)=><div className="cash-method-row" key={i}><span title={r.concept}>{r.concept}</span><div className="cash-method-track"><div style={{width:`${100*r.total/maxExpense}%`}}/></div><strong>{money.format(r.total)}</strong></div>)}</div>:<p className="sales-decision-empty">No hay egresos externos clasificados en el período.</p>}</section></div>
   <div className="sales-v8-tables"><section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Medios de cobro y pago</h2><p>Ingresos y egresos según el libro financiero</p></div></div><div className="sales-v8-table-wrap"><table className="sales-v8-table"><thead><tr><th>Medio</th><th className="sales-v8-right">Ingresos</th><th className="sales-v8-right">Egresos</th></tr></thead><tbody>{byMethod.slice(0,5).map((r,i)=><tr key={i}><td>{String(r.medio)}</td><td className="sales-v8-right">{money.format(amount(r.ingresos))}</td><td className="sales-v8-right">{money.format(amount(r.egresos))}</td></tr>)}</tbody></table>{!byMethod.length&&<p className="sales-decision-empty">Sin datos disponibles.</p>}</div></section><section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Últimos cierres de caja</h2><p>Sesiones cerradas del período seleccionado</p></div><a href="/caja/reportes/generar?tipo=cierres">Ver informe <ArrowUpRight size={14}/></a></div><div className="sales-v8-table-wrap"><table className="sales-v8-table"><thead><tr><th>Cierre</th><th>Responsable</th><th className="sales-v8-right">Diferencia</th></tr></thead><tbody>{closing.map((r,i)=><tr key={i}><td>{String(r.fecha)}</td><td>{String(r.responsable)}</td><td className="sales-v8-right">{money.format(amount(r.diferencia))}</td></tr>)}</tbody></table>{!closing.length&&<p className="sales-decision-empty">Sin cierres disponibles.</p>}</div></section></div></div>
   <p className="sr-disclaimer">Fuente: libros de Caja y movimientos financieros registrados. Los importes no equivalen a ventas facturadas, rentabilidad ni saldo bancario. Los egresos por concepto se agrupan según su concepto registrado, excluyendo operaciones marcadas como internas.</p>
  </>}
 </main></AppShell>;
}
