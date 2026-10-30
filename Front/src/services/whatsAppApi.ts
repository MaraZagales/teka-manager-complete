import { apiRequest } from './apiClient';

export type WhatsAppConversation = {
  conversacionId:number; contactoId:number; clienteId?:number|null; whatsAppId:string; telefono:string; nombrePerfil?:string|null;
  estado:'Abierta'|'Pendiente'|'Cerrada'; usuarioResponsableId?:number|null; responsableNombre?:string|null;
  interesComercialId?:number|null; noLeidos:number; fechaUltimaActividad:string; ultimoMensajeEntrante?:string|null; ultimoMensaje?:string|null;
};
export type WhatsAppMessage = {
  mensajeId:number; mensajeMetaId?:string|null; solicitudClienteId?:string|null; direccion:'Entrante'|'Saliente';
  tipo:string; texto?:string|null; estado:'Recibido'|'Pendiente'|'Enviado'|'Entregado'|'Leido'|'Fallido';
  errorCodigo?:string|null; errorDescripcion?:string|null; fechaMensaje:string; fechaCreacion:string;
};
export type WhatsAppConversationDetail = { conversation:WhatsAppConversation; messages:WhatsAppMessage[] };
export type WhatsAppAssignee = { id:number; nombre?:string|null; apellido?:string|null; email?:string|null };

export const whatsAppApi = {
  list:()=>apiRequest<WhatsAppConversation[]>('/api/comercial/whatsapp/conversations'),
  detail:(id:number)=>apiRequest<WhatsAppConversationDetail>(`/api/comercial/whatsapp/conversations/${id}`),
  assignees:()=>apiRequest<WhatsAppAssignee[]>('/api/comercial/whatsapp/assignees'),
  send:(id:number,texto:string,solicitudClienteId:string)=>apiRequest<{mensajeId:number;mensajeMetaId?:string;estado:string;duplicado:boolean}>(`/api/comercial/whatsapp/conversations/${id}/messages`,{method:'POST',body:JSON.stringify({texto,solicitudClienteId})}),
  assign:(id:number,usuarioResponsableId:number|null)=>apiRequest<void>(`/api/comercial/whatsapp/conversations/${id}/assignee`,{method:'PUT',body:JSON.stringify({usuarioResponsableId})}),
  linkCustomer:(id:number,clienteId:number)=>apiRequest<void>(`/api/comercial/whatsapp/conversations/${id}/customer`,{method:'PUT',body:JSON.stringify({clienteId})}),
  link:(id:number,interesComercialId:number)=>apiRequest<void>(`/api/comercial/whatsapp/conversations/${id}/consultation`,{method:'PUT',body:JSON.stringify({interesComercialId})}),
  createConsultation:(id:number,payload:{descripcion:string;motivoConsultaId?:number|null;productoConsultadoId?:number|null;montoPotencial:number})=>apiRequest<{interesComercialId:number}>(`/api/comercial/whatsapp/conversations/${id}/consultation`,{method:'POST',body:JSON.stringify(payload)}),
};
