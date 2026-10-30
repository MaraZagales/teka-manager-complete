import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { productionOrdersApi, type ProductionOrder, type ProductionLookup } from '../../services/productionOrdersApi';
import { exportCommercialList, type ExportColumn } from '../../services/commercialListExport';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import '../inventory/styles/reports.css';
import './productionReportsDashboard.css';

type Kind = 'orders' | 'models' | 'materials' | 'cuts-used' | 'cuts-recovered';
const options: Array<[Kind,string,string]> = [
 ['orders','Órdenes de producción','Estado, tipo y unidades planificadas.'],
 ['models','Producción por modelo','Unidades planificadas y realmente fabricadas.'],
 ['materials','Consumo de materiales','Cantidades por insumo y unidad de medida.'],
 ['cuts-used','Recortes utilizados','Recortes existentes consumidos en fabricación.'],
 ['cuts-recovered','Recortes recuperados','Recortes generados al finalizar órdenes.'],
];
const qs = new URLSearchParams(window.location.search);
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const month = `${today.slice(0,7)}-01`;
export function ProductionReportGeneratePage(){
 const [from,setFrom]=useState(qs.get('from')||month);const [to,setTo]=useState(qs.get('to')||today);
 const [type,setType]=useState(qs.get('type')||'all');const [types,setTypes]=useState<ProductionLookup[]>([]);
 const [kind,setKind]=useState<Kind>('orders');const [format,setFormat]=useState<'pdf'|'excel'>('pdf');
 const [orders,setOrders]=useState<ProductionOrder[]>([]);const [rows,setRows]=useState<Record<string,unknown>[]>([]);
 const [loading,setLoading]=useState(false);const [generating,setGenerating]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.all([productionOrdersApi.list(),productionOrdersApi.types()]).then(([o,t])=>{if(active){setOrders(o);setTypes(t)}}).catch(e=>{if(active)setError(apiErrorMessage(e,'No se pudieron cargar los datos.'))});return()=>{active=false}},[]);
 useEffect(()=>{if(kind==='orders'||!from||!to||from>to){setRows([]);return}let active=true;setLoading(true);setError('');const endpoint=({models:'modelos',materials:'consumos','cuts-used':'recortes-consumidos','cuts-recovered':'recortes-recuperados'} as const)[kind];productionOrdersApi.report<Record<string,unknown>>(endpoint,from,to).then(r=>{if(active)setRows(r)}).catch(e=>{if(active)setError(apiErrorMessage(e,'No se pudo consultar el informe.'))}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[kind,from,to]);
 const selected=useMemo(()=>orders.filter(o=>o.fechaCreacion.slice(0,10)>=from&&o.fechaCreacion.slice(0,10)<=to&&(type==='all'||o.tipoProduccionId===Number(type))),[orders,from,to,type]);
 const data=kind==='orders'?selected as unknown as Record<string,unknown>[]:rows;
 const columns:ExportColumn<Record<string,unknown>>[]=kind==='orders' ? [
 {header:'Orden',value:r=>`OP-${r.ordenProduccionId}`},{header:'Fecha',value:r=>String(r.fechaCreacion||'').slice(0,10)},{header:'Estado',value:r=>String(r.estadoOrdenProduccionNombre||'')},{header:'Unidades planificadas',value:r=>Number(r.cantidadTotalPlanificada||0)}
 ]:kind==='models' ? [
 {header:'Orden',value:r=>r.ordenProduccionId as number},{header:'Modelo',value:r=>String(r.productoNombre||'')},{header:'Planificado',value:r=>Number(r.cantidadPlanificada||0)},{header:'Fabricado',value:r=>Number(r.cantidadIngresada||0)}
 ]:kind==='materials' ? [
 {header:'Orden',value:r=>r.ordenProduccionId as number},{header:'Insumo',value:r=>String(r.insumoNombre||'')},{header:'Cantidad',value:r=>Number(r.cantidadConsumida||0)},{header:'Unidad',value:r=>String(r.unidad||'')}
 ]:[{header:'Orden',value:r=>r.ordenProduccionId as number},{header:'Recorte',value:r=>r.recorteId as number},{header:'Material',value:r=>String(r.insumoNombre||'')},{header:'Cantidad',value:r=>Number(r.cantidad||0)},{header:'Unidad',value:r=>String(r.unidad||'')}];
 async function generate(){if(!hasPermission('Producción','Exportar')||loading||generating||error||from>to)return;setGenerating(true);try{await exportCommercialList(format,options.find(o=>o[0]===kind)?.[1]||'Producción',`TEKA_produccion_${kind}_${from}_${to}`,data,columns,`Desde ${from} hasta ${to}; tipo ${type==='all'?'Todos':types.find(t=>t.id===Number(type))?.descripcion||type}`)}catch(e){setError(apiErrorMessage(e,'No se pudo generar el archivo.'))}finally{setGenerating(false)}}
 return <AppShell title="Generar informe" breadcrumb="Producción / Reportes / Generar informe" backHref="/production/reports"><main className="inventory-reports-page inventory-report-generator"><PageHeader title="Generar informe"/>
 <section className="inventory-report-form-card inventory-report-filter-card"><h2>1. Filtros</h2><div className="prod-dash-filters prod-generator-filters"><label>Desde<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Hasta<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><label>Tipo de producción<select value={type} onChange={e=>setType(e.target.value)}><option value="all">Todos</option>{types.map(t=><option key={t.id} value={t.id}>{t.descripcion}</option>)}</select></label><button className="button secondary" onClick={()=>{setFrom(month);setTo(today);setType('all')}}>Limpiar filtros</button></div></section>
 <div className="inventory-report-generator-grid"><section className="inventory-report-form-card"><h2>2. Tipo de informe</h2>{options.map(([value,label,description])=><label key={value} className={kind===value?'selected':''}><input type="radio" name="report" checked={kind===value} onChange={()=>setKind(value)}/><span><strong>{label}</strong><small>{description}</small></span></label>)}</section><section className="inventory-report-form-card"><h2>3. Formato de exportación</h2><label className={format==='pdf'?'selected':''}><input type="radio" name="format" checked={format==='pdf'} onChange={()=>setFormat('pdf')}/><FileText size={20}/><span><strong>PDF</strong><small>Informe con detalle de los registros consultados.</small></span></label><label className={format==='excel'?'selected':''}><input type="radio" name="format" checked={format==='excel'} onChange={()=>setFormat('excel')}/><FileSpreadsheet size={20}/><span><strong>Excel</strong><small>Listado completo para análisis y filtros.</small></span></label>{kind!=='orders'&&type!=='all'&&<p className="prod-generator-note">Los reportes de detalle de la API solo permiten filtrar por fechas. El tipo de producción no se aplicará a este informe.</p>}</section></div>
 {error&&<div className="inventory-report-error">{error}</div>}{from>to&&<div className="inventory-report-error">La fecha Desde no puede superar Hasta.</div>}
 <div className="inventory-report-generate-action"><button className="button primary" onClick={()=>void generate()} disabled={!hasPermission('Producción','Exportar')||loading||generating||!!error||from>to}>{format==='pdf'?<FileText size={17}/>:<FileSpreadsheet size={17}/>} {generating?'Generando…':`Generar informe ${format.toUpperCase()}`}</button></div>
 </main></AppShell>}
