import { useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { ArrowUpRight, AlertCircle, FileText } from 'lucide-react';
import { PageHeader } from '../../components/data/PageHeader';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { productionOrdersApi, type ProductionOrder, type ProductionLookup } from '../../services/productionOrdersApi';
import './productionReportsDashboard.css';

type Model = { productoId:number; productoNombre:string; cantidadPlanificada:number; cantidadIngresada:number };
type Material = { insumoId:number; insumoNombre:string; unidad:string; cantidadConsumida:number };
type Cut = { insumoNombre:string; unidad:string; cantidad:number };
const fmt = new Intl.NumberFormat('es-AR',{maximumFractionDigits:1});
const date = new Date();
const defaultTo = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const defaultFrom = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-01`;
function Chart({ option, empty }: {option:EChartsOption;empty?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(empty)return;let disposed=false;let chart:import('echarts').ECharts|undefined;let observer:ResizeObserver|undefined;
    void import('echarts').then(ec=>{if(disposed||!ref.current)return;chart=ec.init(ref.current);chart.setOption(option);observer=new ResizeObserver(()=>chart?.resize());observer.observe(ref.current);});
    return()=>{disposed=true;observer?.disconnect();chart?.dispose();};
  },[option,empty]);
  return empty?<div className="prod-dash-empty">Sin registros para este período</div>:<div ref={ref} className="prod-dash-chart"/>;
}
function group<T>(items:T[],key:(item:T)=>string,value:(item:T)=>number){const map=new Map<string,number>();items.forEach(item=>{const k=key(item);map.set(k,(map.get(k)||0)+value(item));});return [...map].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);}
function bars(items:{name:string;value:number}[],color='#2fa779'):EChartsOption{return {color:[color],grid:{top:8,bottom:22,left:120,right:48},tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},xAxis:{type:'value',axisLabel:{fontSize:10},splitLine:{lineStyle:{color:'#edf1f3'}}},yAxis:{type:'category',data:[...items].reverse().map(x=>x.name.length>21?x.name.slice(0,20)+'…':x.name),axisLabel:{fontSize:11},axisTick:{show:false}},series:[{type:'bar',barMaxWidth:17,data:[...items].reverse().map(x=>x.value),label:{show:true,position:'right',formatter:(p:any)=>fmt.format(Number(p.value))},itemStyle:{borderRadius:[0,4,4,0]}}]};}
export function ProductionReportsDashboard(){
 const [from,setFrom]=useState(defaultFrom);const [to,setTo]=useState(defaultTo);const [type,setType]=useState('all');
 const [orders,setOrders]=useState<ProductionOrder[]>([]);const [types,setTypes]=useState<ProductionLookup[]>([]);
 const [models,setModels]=useState<Model[]>([]);const [materials,setMaterials]=useState<Material[]>([]);const [cuts,setCuts]=useState<Cut[]>([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [partial,setPartial]=useState<string[]>([]);
 useEffect(()=>{let active=true;Promise.all([productionOrdersApi.list(),productionOrdersApi.types()]).then(([o,t])=>{if(active){setOrders(o);setTypes(t);}}).catch(e=>{if(active)setError(apiErrorMessage(e,'No se pudieron cargar las órdenes.'));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{if(!from||!to||from>to)return;let active=true;setLoading(true);setPartial([]);
 const jobs = [
    productionOrdersApi.report<Model>('modelos', from, to),
    productionOrdersApi.report<Material>('consumos', from, to),
    productionOrdersApi.report<Cut>('recortes-recuperados', from, to),
  ] as const;
 void Promise.allSettled(jobs).then(results=>{if(!active)return;const missing:string[]=[];
 if(results[0].status==='fulfilled')setModels(results[0].value);else{setModels([]);missing.push('modelos fabricados');}
 if(results[1].status==='fulfilled')setMaterials(results[1].value);else{setMaterials([]);missing.push('materiales consumidos');}
 if(results[2].status==='fulfilled')setCuts(results[2].value);else{setCuts([]);missing.push('recortes recuperados');}
 setPartial(missing);setLoading(false);});return()=>{active=false;};},[from,to]);
 const selected=useMemo(()=>orders.filter(o=>o.fechaCreacion.slice(0,10)>=from&&o.fechaCreacion.slice(0,10)<=to&&(type==='all'||o.tipoProduccionId===Number(type))),[orders,from,to,type]);
 const states=useMemo(()=>group(selected,o=>o.estadoOrdenProduccionNombre,()=>1),[selected]);
 const finished=useMemo(()=>group(models,m=>m.productoNombre,m=>m.cantidadIngresada).filter(x=>x.value>0).slice(0,5),[models]);
 const materialUnits=useMemo(()=>[...new Set(materials.map(m=>m.unidad))],[materials]);
 const [unit,setUnit]=useState('');const chosenUnit=materialUnits.includes(unit)?unit:(materialUnits.includes('M2')?'M2':materialUnits[0]||'');
 const topMaterials=useMemo(()=>group(materials.filter(m=>m.unidad===chosenUnit),m=>m.insumoNombre,m=>m.cantidadConsumida).slice(0,5),[materials,chosenUnit]);
 const recovered=useMemo(()=>group(cuts.filter(c=>c.unidad.toUpperCase().replace('²','2')==='M2'),c=>c.insumoNombre,c=>c.cantidad).slice(0,5),[cuts]);
 const attention=useMemo(()=>selected.filter(o=>!/(finaliz|cancel)/i.test(o.estadoOrdenProduccionNombre)).sort((a,b)=>a.fechaCreacion.localeCompare(b.fechaCreacion)).slice(0,4),[selected]);
 const statusOption=useMemo<EChartsOption>(()=>({color:['#34ad78','#e7a54e','#ed6970','#7296ba'],tooltip:{trigger:'item'},legend:{bottom:0,textStyle:{fontSize:10}},series:[{type:'pie',radius:['52%','72%'],center:['50%','43%'],label:{show:false},data:states.map(s=>({name:s.name,value:s.value}))}]}),[states]);

 return <AppShell title="Reportes de producción" breadcrumb="Producción / Reportes"><main className="prod-dash-page">
 <PageHeader title="Reportes de producción" action={<button className="prod-dash-primary" onClick={()=>window.location.assign(`/production/reports/generate?from=${from}&to=${to}&type=${type}`)}><FileText size={16}/> Generar informe</button>}/>
 <section className="prod-dash-filters"><label>Desde<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Hasta<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><label>Tipo de producción<select value={type} onChange={e=>setType(e.target.value)}><option value="all">Todos</option>{types.map(t=><option key={t.id} value={t.id}>{t.descripcion}</option>)}</select></label><span className="prod-dash-scope">{loading?'Actualizando…':`${selected.length} órdenes creadas en el período`}</span></section>
 {from>to&&<div className="prod-dash-warning">La fecha Desde debe ser anterior a Hasta.</div>}{error&&<div className="prod-dash-warning"><AlertCircle size={15}/>{error}</div>}{partial.length>0&&<div className="prod-dash-warning">No se pudieron consultar: {partial.join(', ')}. No se muestran valores estimados.</div>}
 <div className="prod-dash-grid">
 <section className="prod-dash-panel"><header><h3>Estado de órdenes</h3><button onClick={()=>window.location.assign(`/production/reports/detail?mode=orders&from=${from}&to=${to}&type=${type}`)} title="Ver órdenes"><ArrowUpRight size={16}/></button></header><div className="prod-dash-state"><Chart option={statusOption} empty={!states.length}/><div className="prod-dash-state-list">{states.map(s=><div key={s.name}><span>{s.name}</span><strong>{s.value}</strong></div>)}</div></div></section>
 <section className="prod-dash-panel"><header><h3>Órdenes que requieren seguimiento</h3><button onClick={()=>window.location.assign(`/production/reports/detail?mode=orders&from=${from}&to=${to}&type=${type}`)} title="Ver órdenes"><ArrowUpRight size={16}/></button></header><div className="prod-dash-table"><div className="prod-dash-tr heading"><span>Orden</span><span>Estado</span><span>Fecha</span></div>{attention.length?attention.map(o=><a className="prod-dash-tr" href={`/production/orders/${o.ordenProduccionId}`} key={o.ordenProduccionId}><strong>OP-{o.ordenProduccionId}</strong><span>{o.estadoOrdenProduccionNombre}</span><span>{new Date(o.fechaCreacion).toLocaleDateString('es-AR')}</span></a>):<div className="prod-dash-empty">Sin órdenes pendientes o en proceso</div>}</div></section>
 <section className="prod-dash-panel"><header><h3>Modelos más fabricados</h3><button onClick={()=>window.location.assign(`/production/reports/detail?mode=models&from=${from}&to=${to}&type=${type}`)} title="Ver producción por modelo"><ArrowUpRight size={16}/></button></header><Chart option={bars(finished)} empty={!finished.length||partial.includes('modelos fabricados')}/></section>
 <section className="prod-dash-panel"><header><h3>Materiales más consumidos</h3><div className="prod-dash-actions">{materialUnits.length>1&&<select aria-label="Unidad de materiales" value={chosenUnit} onChange={e=>setUnit(e.target.value)}>{materialUnits.map(u=><option key={u}>{u}</option>)}</select>}<button onClick={()=>window.location.assign(`/production/reports/detail?mode=materials&from=${from}&to=${to}&type=${type}`)} title="Ver consumo"><ArrowUpRight size={16}/></button></div></header><div className="prod-dash-material-list">{topMaterials.length ? topMaterials.map((m,index)=><a key={m.name} href={`/production/reports/detail?mode=materials&from=${from}&to=${to}&type=${type}`} className="prod-dash-material-row"><span className="prod-dash-material-rank">{index+1}</span><span className="prod-dash-material-name" title={m.name}>{m.name}</span><span className="prod-dash-material-value">{fmt.format(m.value)} {chosenUnit}</span><span className="prod-dash-material-track"><span style={{width:`${topMaterials[0].value>0?100*m.value/topMaterials[0].value:0}%`}}/></span></a>) : <div className="prod-dash-empty">Sin consumos registrados en esta unidad</div>}</div><small className="prod-dash-foot">Cantidades por insumo; no se suman unidades incompatibles.</small></section>
 </div><footer className="prod-dash-footer"><span>Recortes recuperados en M²: <strong>{fmt.format(recovered.reduce((a,b)=>a+b.value,0))}</strong>{partial.includes('recortes recuperados')?' · Consulta no disponible':''}</span><button onClick={()=>window.location.assign(`/production/reports/detail?mode=cuts-recovered&from=${from}&to=${to}&type=${type}`)}>Consultar recuperación de recortes →</button></footer>
 </main></AppShell>;
}
