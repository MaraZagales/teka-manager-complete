import { useEffect,useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import type { EChartsOption } from 'echarts';
import type { SalesFilters } from './salesAnalytics';
import { money,defaultSalesFilters } from './salesAnalytics';
export function SalesReportFilters({value,onChange,channels}:{value:SalesFilters;onChange:(f:SalesFilters)=>void;channels:string[]}){
 const clear=()=>onChange({...value,from:defaultSalesFilters().from,to:defaultSalesFilters().to,channel:''});
 const unchanged=value.from===defaultSalesFilters().from&&value.to===defaultSalesFilters().to&&!value.channel;
 return <section className="inventory-reports-filters sales-reports-filters" aria-label="Filtros generales de reportes">
  <div className="inventory-report-period"><label><span>Desde</span><input type="date" value={value.from} max={value.to} onChange={e=>onChange({...value,from:e.target.value})}/></label><label><span>Hasta</span><input type="date" value={value.to} min={value.from} onChange={e=>onChange({...value,to:e.target.value})}/></label></div>
  <label><span>Canal comercial</span><select value={value.channel} onChange={e=>onChange({...value,channel:e.target.value})}><option value="">Todos</option>{channels.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
  <button type="button" className="button secondary" onClick={clear} disabled={unchanged}><RotateCcw size={16}/> Limpiar filtros</button>
 </section>
}
export function SalesChart({option,height=210}:{option:EChartsOption;height?:number}){const node=useRef<HTMLDivElement>(null);useEffect(()=>{let dead=false;let instance:import('echarts').ECharts|undefined;let observer:ResizeObserver|undefined;void import('echarts').then(ec=>{if(dead||!node.current)return;instance=ec.init(node.current);instance.setOption(option);observer=new ResizeObserver(()=>instance?.resize());observer.observe(node.current)});return()=>{dead=true;observer?.disconnect();instance?.dispose()}},[option]);return <div ref={node} style={{width:'100%',height}} role="img" aria-label="Gráfico comercial interactivo"/>}
export function salesBar(names:string[],values:number[],unit:'money'|'count'='money'):EChartsOption{return {color:['#28855c'],tooltip:{trigger:'axis',axisPointer:{type:'shadow'},valueFormatter:(v)=>unit==='money'?money(Number(v)):`${v} operaciones`},grid:{left:125,right:75,top:12,bottom:30},xAxis:{type:'value',axisLabel:{formatter:(v:number)=>unit==='money'?new Intl.NumberFormat('es-AR',{notation:'compact'}).format(v):String(v)},splitLine:{lineStyle:{color:'#e7eeea'}}},yAxis:{type:'category',inverse:true,data:names,axisLabel:{width:115,overflow:'truncate'}},series:[{type:'bar',barMaxWidth:21,data:values,label:{show:true,position:'right',formatter:(p:any)=>unit==='money'?money(Number(p.value)):String(p.value),fontSize:10}}]}}
