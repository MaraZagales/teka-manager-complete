import { CheckCircle2, Circle } from 'lucide-react';
import type { HistorialPedido } from '../../services/onlineOrdersApi';
const fecha = (s:string) => new Date(s).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});
/** Línea de tiempo compartida para E-commerce y Ventas. Solo presenta eventos persistidos. */
export function OrderTimeline({ eventos }: { eventos:HistorialPedido[] }) {
 const ordenados=[...eventos].sort((a,b)=>new Date(a.fechaCambio).getTime()-new Date(b.fechaCambio).getTime());
 return <section className="online-timeline"><h3>Historial del pedido</h3>{ordenados.length===0?<p className="online-muted">La API no registra eventos de estado para este pedido.</p>:<ol>{ordenados.map((e,i)=><li key={e.historialEstadoPedidoId}><span className="online-timeline-icon">{i===ordenados.length-1?<CheckCircle2 size={19}/>:<Circle size={17}/>}</span><div><strong>{e.estadoPedidoNombre}</strong><small>{fecha(e.fechaCambio)}</small>{e.observaciones&&<p>{e.observaciones}</p>}</div></li>)}</ol>}</section>;
}
