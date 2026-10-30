import type { WhatsAppConversation } from '../../../../services/whatsAppApi';

const time=(value:string)=>new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
export function WhatsAppConversationList({rows,selected,onSelect}:{rows:WhatsAppConversation[];selected?:number;onSelect:(id:number)=>void}){
 if(!rows.length)return <div className="wa-empty"><strong>No hay conversaciones</strong><span>Los mensajes reales recibidos aparecerán acá.</span></div>;
 return <div className="wa-conversation-list">{rows.map(row=><button type="button" key={row.conversacionId} className={selected===row.conversacionId?'active':''} onClick={()=>onSelect(row.conversacionId)}>
  <span className="wa-avatar">{(row.nombrePerfil||row.telefono).trim().slice(0,2).toUpperCase()}</span><span className="wa-conversation-copy"><span><strong>{row.nombrePerfil||row.telefono}</strong><time>{time(row.fechaUltimaActividad)}</time></span><small>{row.telefono}{row.responsableNombre?` · ${row.responsableNombre}`:''}</small><em>{row.ultimoMensaje||'Sin mensajes visibles'}</em></span>{row.noLeidos>0&&<b className="wa-unread">{row.noLeidos}</b>}
 </button>)}</div>;
}
