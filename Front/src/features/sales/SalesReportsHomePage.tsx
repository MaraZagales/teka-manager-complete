import { useEffect, useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { ArrowUpRight, FileBarChart, RotateCcw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { consultarPedido, type PedidoCompleto } from '../../services/onlineOrdersApi';
import { defaultSalesFilters, filterQuery, money, number, useSalesAnalytics } from './salesAnalytics';
import { SalesChart, SalesReportFilters } from './SalesReportShared';
import { EcommerceImage } from '../ecommerce/EcommerceImage';
import { obtenerResumenCatalogoEcommerce, type ResumenCatalogoEcommerce } from '../../services/ecommerceApi';
import '../inventory/styles/reports.css';
import './salesReports.css';

type ProductRow = { id:number; name:string; units:number; amount:number };
function useProductRanking(orderIds:number[]) {
  const [rows,setRows]=useState<ProductRow[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const ids=orderIds.join(',');
  useEffect(()=>{
    let active=true;
    if (!orderIds.length) {setRows([]);setError('');setLoading(false);return;}
    setLoading(true);setError('');
    // Los detalles provienen del endpoint real de pedidos. No se estiman unidades ni importes.
    void Promise.allSettled(orderIds.map(id=>consultarPedido(id))).then(results=>{
      if(!active)return;
      const fulfilled=results.filter((r):r is PromiseFulfilledResult<PedidoCompleto>=>r.status==='fulfilled');
      if(fulfilled.length!==results.length){setRows([]);setError('No fue posible consultar todos los detalles de pedidos. El ranking se oculta para evitar resultados incompletos.');return;}
      const grouped=new Map<number,ProductRow>();
      fulfilled.forEach(({value:order})=>order.detalles.forEach(item=>{
        const current=grouped.get(item.productoId)||{id:item.productoId,name:item.productoNombre,units:0,amount:0};
        current.units+=item.cantidad;current.amount+=item.subtotal;grouped.set(item.productoId,current);
      }));
      setRows([...grouped.values()].sort((a,b)=>b.units-a.units));
    }).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ids]);
  return {rows,loading,error};
}
export function SalesReportsHomePage(){
 const [filters,setFilters]=useState(defaultSalesFilters);
 const d=useSalesAnalytics(filters);
 const query=filterQuery(filters);
 const selectedIds=useMemo(()=>d.orders.filter(o=>!/anulad|cancelad/i.test(o.estadoPedidoNombre)).map(o=>o.pedidoId),[d.orders]);
 const products=useProductRanking(selectedIds);
 const [photos,setPhotos]=useState<Map<number,string>>(new Map());
 useEffect(()=>{let active=true;void obtenerResumenCatalogoEcommerce().then((items:ResumenCatalogoEcommerce[])=>{
   if(active)setPhotos(new Map(items.filter(x=>x.urlPortada).map(x=>[x.productoId,x.urlPortada!])))
 }).catch(()=>{if(active)setPhotos(new Map())});return()=>{active=false}},[]);
 const chart:EChartsOption=useMemo(()=>({
   color:['#218765','#4f8edb','#e7a54c'],tooltip:{trigger:'axis',axisPointer:{type:'shadow' as const},valueFormatter:(v:unknown)=>money(Number(v))},
   grid:{left:78,right:20,top:24,bottom:42},
   xAxis:{type:'category' as const,data:d.period.map(x=>x.label),axisLabel:{hideOverlap:true,rotate:0,formatter:(value:string)=>{const v=String(value);return /^\d{4}-\d{2}-\d{2}$/.test(v)?`${v.slice(8,10)}/${v.slice(5,7)}`:v}},name:'Período de emisión',nameLocation:'middle' as const,nameGap:28},
   yAxis:{type:'value' as const,name:'Ventas netas (ARS)',axisLabel:{formatter:(v:number)=>new Intl.NumberFormat('es-AR',{notation:'compact'}).format(v)}},
   series:[{type:'bar' as const,name:'Ventas netas',barMaxWidth:42,data:d.period.map(x=>x.net)}]
 }),[d.period]);
 const cancelRate=d.orders.length?100*d.cancellations.length/d.orders.length:0;
 const topClient=d.byClient[0];
 const topShare=topClient&&d.net>0?100*topClient.net/d.net:null;
 const channelLeader=[...d.byChannel].sort((a,b)=>b.orders-a.orders)[0];
 const productsTotal=products.rows.reduce((sum,p)=>sum+p.units,0);
 return <AppShell title="Reportes de ventas" breadcrumb="Ventas / Reportes"><main className="inventory-reports-page sales-analytics-page">
   <PageHeader title="Reportes de ventas" action={<a className="button primary" href={`/ventas/reportes/generar?${query}`}><FileBarChart size={17}/> Generar informe</a>}/>
   <SalesReportFilters value={filters} onChange={setFilters} channels={d.channels}/>
   {d.error&&<div className="inventory-report-error" role="alert">{d.error} <button className="button secondary compact" onClick={d.reload}><RotateCcw size={15}/> Reintentar</button></div>}
   {d.loading?<p>Cargando análisis comerciales…</p>:<>
   <div className="sales-v8-dashboard">
     <div className="sales-v8-visuals">
       <section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Evolución de ventas</h2><p>Ventas netas según fecha de comprobante · ARS</p></div><a href={`/ventas/reportes/detalle/performance?${query}`}>Análisis completo <ArrowUpRight size={14}/></a></div><SalesChart option={chart} height={235}/></section>
       <section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Origen de los pedidos</h2><p>Participación de canales según cantidad de pedidos</p></div><a href={`/ventas/reportes/detalle/operations?${query}`}>Ver detalle <ArrowUpRight size={14}/></a></div>
         {d.byChannel.some(c=>c.orders>0)?<><SalesChart height={190} option={{color:['#087a60','#34a483','#74c4ac','#4b8ed4','#e3a34c'],tooltip:{trigger:'item',formatter:'{b}: {c} pedidos ({d} %)'},legend:{show:false},series:[{type:'pie',radius:['56%','78%'],center:['50%','50%'],label:{show:false},data:d.byChannel.filter(c=>c.orders>0).map(c=>({name:c.name,value:c.orders}))}]}}/><div className="sales-v8-channel-legend">{d.byChannel.filter(c=>c.orders>0).slice(0,4).map((c,i)=><div key={c.name}><i style={{background:['#087a60','#34a483','#74c4ac','#4b8ed4'][i]}}/><span>{c.name}</span><strong>{number(c.orders)}</strong></div>)}</div></>:<p className="sales-decision-empty">Sin pedidos por canal para el período.</p>}
       </section>
     </div>
     <div className="sales-v8-tables">
       <section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Productos más solicitados</h2><p>Unidades en pedidos no cancelados · No equivale a facturación</p></div><a href="/ventas/pedidos">Ver pedidos <ArrowUpRight size={14}/></a></div>
         {products.loading?<p className="sales-decision-empty">Consultando productos…</p>:products.error?<p className="sales-decision-empty" role="status">{products.error}</p>:products.rows.length?<div className="sales-v8-table-wrap"><table className="sales-v8-table"><thead><tr><th>#</th><th>Producto</th><th className="sales-v8-right">Unidades</th><th className="sales-v8-right">Participación</th></tr></thead><tbody>{products.rows.slice(0,5).map((p,i)=><tr key={p.id}><td>{i+1}</td><td><div className="sales-v8-product"><EcommerceImage url={photos.get(p.id)} alt={p.name} className="sales-v8-product-photo"/><span title={p.name}>{p.name}</span></div></td><td className="sales-v8-right">{number(p.units)}</td><td className="sales-v8-right">{productsTotal?(p.units/productsTotal*100).toFixed(1):'0'} %</td></tr>)}</tbody></table></div>:<p className="sales-decision-empty">No hay productos en pedidos no cancelados.</p>}
       </section>
       <section className="sales-v8-panel"><div className="sales-v8-panel-head"><div><h2>Principales clientes</h2><p>Ventas netas de comprobantes internos</p></div><a href={`/ventas/reportes/detalle/customers?${query}`}>Ver análisis <ArrowUpRight size={14}/></a></div>
         {d.byClient.length?<div className="sales-v8-table-wrap"><table className="sales-v8-table"><thead><tr><th>#</th><th>Cliente</th><th className="sales-v8-right">Importe neto</th><th className="sales-v8-right">Participación</th></tr></thead><tbody>{d.byClient.slice(0,5).map((c,i)=><tr key={c.id}><td>{i+1}</td><td>{c.name}</td><td className="sales-v8-right">{money(c.net)}</td><td className="sales-v8-right">{d.net>0?(100*c.net/d.net).toFixed(1)+' %':'—'}</td></tr>)}</tbody></table></div>:<p className="sales-decision-empty">Sin comprobantes de clientes en el período.</p>}
       </section>
     </div>
     <div className="sales-v8-insight"><strong>Lectura comercial</strong><span>{topClient&&topShare!==null?`El principal cliente representa el ${topShare.toFixed(1)} % de las ventas netas. `:''}{number(d.cancellations.length)} de {number(d.orders.length)} pedidos fueron cancelados ({cancelRate.toFixed(1)} %). {channelLeader?`${channelLeader.name} es el canal con más pedidos (${number(channelLeader.orders)}).`:''} Los importes corresponden a comprobantes internos, no a cobros.</span><a href={`/ventas/reportes/detalle/operations?${query}`}>Profundizar <ArrowUpRight size={14}/></a></div>
   <p className="sr-disclaimer">Fuente: pedidos y comprobantes internos de TEKA. No representa facturación fiscal ni cobros de Caja. Pedidos por fecha de registro; importes por fecha de emisión de comprobantes.</p>
   </div>
   </>}
 </main></AppShell>;
}
