import { apiRequest } from "./apiClient";
import type { Interes } from "./commercialApi";

export type ConsultationCustomer = { clienteId:number; nombre:string; apellido?:string|null; telefono?:string|null; email?:string|null; documento?:string|null; activo:boolean };
export type ConsultationChannel = { canalVentaId?:number; id?:number; nombre?:string; descripcion?:string; canalVentaNombre?:string };
export type ConsultationReason = { motivoConsultaId:number; nombre:string; activo:boolean };
export type ConsultationUser = { id:number; nombre?:string|null; apellido?:string|null; descripcion?:string|null; email?:string|null };
export type ConsultationPayload = { clienteId?:number|null; motivoConsultaId?:number|null; productoConsultadoId?:number|null; clienteNombre?:string|null; clienteApellido?:string|null; telefono?:string|null; email?:string|null; canalVentaId:number; tipoOrigen:string; referenciaOrigen?:string|null; descripcion:string; montoPotencial:number; usuarioResponsableId?:number|null };

export const consultationsApi = {
  list: () => apiRequest<Interes[]>("/api/intereses-comerciales"),
  get: (id:number) => apiRequest<Interes>(`/api/intereses-comerciales/${id}`),
  create: (payload:ConsultationPayload) => apiRequest<{interesComercialId:number}>("/api/intereses-comerciales",{method:"POST",body:JSON.stringify(payload)}),
  update: (id:number,payload:ConsultationPayload) => apiRequest<void>(`/api/intereses-comerciales/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
  take: (id:number,usuarioResponsableId:number) => apiRequest<void>(`/api/intereses-comerciales/${id}/tomar`,{method:"POST",body:JSON.stringify({usuarioResponsableId})}),
  discard: (id:number,motivo:string) => apiRequest<void>(`/api/intereses-comerciales/${id}/descartar`,{method:"POST",body:JSON.stringify({motivo})}),
  customers: () => apiRequest<ConsultationCustomer[]>("/api/clientes"),
  channels: () => apiRequest<ConsultationChannel[]>("/api/auxiliares/canales-venta"),
  reasons: () => apiRequest<ConsultationReason[]>("/api/auxiliares/motivos-consulta-comercial"),
  users: () => apiRequest<ConsultationUser[]>("/api/usuarios/lookup"),
};
