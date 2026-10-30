import { useState } from 'react';
import type { CustomerEvolution, ProductPreference } from '../../services/onlineCustomersApi';
import type { OrderSeriesPoint } from './ecommerceAnalytics';

const integer=new Intl.NumberFormat('es-AR');
const decimal=new Intl.NumberFormat('es-AR',{maximumFractionDigits:2});
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});

export function OrdersEvolutionChart({points}: {points:OrderSeriesPoint[]}) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) return <ChartEmpty text="No hay pedidos para representar en el período." />;
  const width = 960, height = 330, left = 50, right = 22, top = 35, bottom = 55;
  const chartWidth = width-left-right, chartHeight = height-top-bottom;
  const max = Math.max(1, ...points.map(p => p.orders));
  const x = (i:number) => left + (points.length === 1 ? chartWidth/2 : i*chartWidth/(points.length-1));
  const y = (n:number) => top + chartHeight - (n/max)*chartHeight;
  const line = points.map((p,i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.orders)}`).join(' ');
  const area = `${line} L ${x(points.length-1)} ${top+chartHeight} L ${x(0)} ${top+chartHeight} Z`;
  const labels = Math.max(1,Math.ceil(points.length/8));
  const total = points.reduce((sum,p)=>sum+p.orders,0);
  return <div className="ecom-hero-chart">
    <div className="ecom-chart-highlight"><span>Pedidos registrados en el período</span><strong>{integer.format(total)}</strong><small>Actividad agrupada según el rango seleccionado</small></div>
    <div className="ecom-chart ecom-chart-line"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tendencia de pedidos online">
      <defs><linearGradient id="ecomOrdersArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#83b395" stopOpacity=".40"/><stop offset="100%" stopColor="#83b395" stopOpacity=".015"/></linearGradient><linearGradient id="ecomOrdersLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b3d1ad"/><stop offset="100%" stopColor="#e4c17e"/></linearGradient></defs>
      {[0,.25,.5,.75,1].map(ratio=><g key={ratio}><line x1={left} x2={width-right} y1={top+ratio*chartHeight} y2={top+ratio*chartHeight}/><text x={left-12} y={top+ratio*chartHeight+4}>{integer.format(max*(1-ratio))}</text></g>)}
      <path d={area} fill="url(#ecomOrdersArea)"/><path d={line} fill="none" stroke="url(#ecomOrdersLine)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((point,i)=><g key={point.key} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}><circle cx={x(i)} cy={y(point.orders)} r={hover===i?8:5} fill={hover===i?'#e4c17e':'#e6f2e7'} stroke="#557d61" strokeWidth="3"/><rect x={x(i)-Math.max(12,chartWidth/points.length/2)} y={top} width={Math.max(24,chartWidth/points.length)} height={chartHeight} fill="transparent"/>{(i%labels===0||i===points.length-1)&&<text className="x" x={x(i)} y={height-20}>{point.label}</text>}</g>)}
    </svg>{hover!==null&&<div className="ecom-chart-tooltip"><strong>{points[hover].label}</strong><span>{integer.format(points[hover].orders)} pedidos ingresados</span></div>}</div>
  </div>;
}

export function SalesEvolutionChart({points}:{points:CustomerEvolution[]}){
  const [hover,setHover]=useState<number|null>(null);if(!points.length)return <ChartEmpty text="No hay ventas entregadas con fecha verificable para representar."/>;
  const width=900,height=260,padding={l:65,r:20,t:20,b:42},max=Math.max(1,...points.map(point=>point.importePedidosEntregados)),slot=(width-padding.l-padding.r)/points.length,bar=Math.min(48,slot*.6);
  const monthDate=(value:string)=>new Date(`${value.slice(0,7)}-15T12:00:00`);
  return <div className="ecom-chart sales"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución del importe de ventas entregadas">{[0,.5,1].map(ratio=><g key={ratio}><line x1={padding.l} x2={width-padding.r} y1={padding.t+ratio*(height-padding.t-padding.b)} y2={padding.t+ratio*(height-padding.t-padding.b)}/><text x={padding.l-8} y={padding.t+ratio*(height-padding.t-padding.b)+4}>{money.format(max*(1-ratio))}</text></g>)}{points.map((point,index)=>{const h=point.importePedidosEntregados/max*(height-padding.t-padding.b);return <g key={point.mes} onMouseEnter={()=>setHover(index)} onMouseLeave={()=>setHover(null)}><rect x={padding.l+index*slot+(slot-bar)/2} y={height-padding.b-h} width={bar} height={h||1} rx="4"/><text className="x" x={padding.l+index*slot+slot/2} y={height-15}>{monthDate(point.mes).toLocaleDateString('es-AR',{month:'short',year:'2-digit'})}</text></g>})}</svg>{hover!==null&&<div className="ecom-chart-tooltip"><strong>{monthDate(points[hover].mes).toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</strong><span>{money.format(points[hover].importePedidosEntregados)}</span><span>{integer.format(points[hover].comprasEntregadas)} ventas entregadas</span></div>}</div>;
}

export function StateDistribution({rows}:{rows:{name:string;count:number;percentage:number}[]}){return rows.length?<div className="ecom-state-bars">{rows.map(row=><div key={row.name}><span><strong>{row.name}</strong><small>{integer.format(row.count)} pedidos · {decimal.format(row.percentage)}%</small></span><i><em style={{width:`${row.percentage}%`}}/></i></div>)}</div>:<ChartEmpty text="No hay pedidos en el período seleccionado."/>;}

export function ProductRanking({rows}:{rows:ProductPreference[]}){const max=Math.max(1,...rows.map(row=>row.unidadesEntregadas));return rows.length?<div className="ecom-product-ranking">{rows.map((row,index)=><div key={row.productoId}><b>{index+1}</b><span><strong>{row.nombre}</strong><small>{row.codigo} · {integer.format(row.pedidosConProducto)} pedidos</small></span><i><em style={{width:`${row.unidadesEntregadas/max*100}%`}}/></i><strong>{decimal.format(row.unidadesEntregadas)} u.</strong><em>{money.format(row.importeLineas)}</em></div>)}</div>:<ChartEmpty text="No hay productos entregados para el período."/>;}

function ChartEmpty({text}:{text:string}){return <div className="ecom-chart-empty">{text}</div>;}
