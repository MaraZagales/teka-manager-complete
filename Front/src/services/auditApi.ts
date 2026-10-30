import { apiRequest } from './apiClient';
export type AuditSession={auditoriaSesionId:number;usuarioId:number;username:string;nombre:string;apellido?:string;fechaLogin:string;fechaLogout?:string;exitoso:boolean;ipOrigen?:string;observaciones?:string};
export type AuditEvent={auditoriaEventoId:number;usuarioId:number;username:string;nombre:string;apellido?:string;fechaEvento:string;modulo:string;entidad:string;accion:string;registroId?:number;descripcion?:string};
export const auditApi={sessions:()=>apiRequest<AuditSession[]>('/api/auditoria/sesiones'),events:()=>apiRequest<AuditEvent[]>('/api/auditoria/eventos')};
