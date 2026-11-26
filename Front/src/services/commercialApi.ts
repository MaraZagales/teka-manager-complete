import { apiRequest } from './apiClient';

export type Interes = {
  interesComercialId: number;
  clienteId?: number | null;
  motivoConsultaId?: number | null;
  motivoConsultaNombre?: string | null;
  productoConsultadoId?: number | null;
  tipoPendiente?: string | null;
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  canalVentaId: number;
  canalVentaNombre: string;
  estadoInteresComercialId: number;
  estadoNombre: string;
  tipoOrigen: string;
  referenciaOrigen?: string | null;
  carritoId?: number | null;
  descripcion: string;
  montoPotencial: number;
  usuarioResponsableId?: number | null;
  responsableNombre?: string | null;
  oportunidadComercialId?: number | null;
  fechaAlta: string;
  fechaUltimaActividad: string;
  fechaAtencion?: string | null;
  fechaCierre?: string | null;
  motivoDescarte?: string | null;
  activo: boolean;
};

export type Oportunidad = {
  oportunidadComercialId: number;
  clienteId?: number | null;
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  tipoCliente?: string | null;
  canalVentaId?: number | null;
  interes?: string | null;
  canalVentaNombre?: string | null;
  estadoOportunidadComercialId?: number | null;
  estadoOportunidadNombre?: string | null;
  montoEstimado?: number | null;
  probabilidad?: number | null;
  responsableNombre?: string | null;
  usuarioResponsableId?: number | null;
  interesComercialId?: number | null;
  fechaAlta?: string | null;
  fechaProximaAccion?: string | null;
  proximaAccion?: string | null;
  observaciones?: string | null;
  pedidoIdConvertido?: number | null;
  fechaConversion?: string | null;
  fechaPerdida?: string | null;
  motivoPerdidaNombre?: string | null;
  motivoPerdidaOportunidadId?: number | null;
  observacionPerdida?: string | null;
  activo?: boolean;
};

export type OportunidadResumen = { totalOportunidades:number; oportunidadesAbiertas:number; oportunidadesConvertidas:number; oportunidadesNoConcretadas:number; montoEstimadoTotal:number; montoAbierto:number; montoConvertido:number; tasaConversion:number };
export type OportunidadFunnel = { estadoOportunidadComercialId:number; estado:string; orden:number; cantidad:number; montoEstimado:number };

export const obtenerIntereses = () => apiRequest<Interes[]>('/api/intereses-comerciales');
export const obtenerOportunidades = () => apiRequest<Oportunidad[]>('/api/oportunidades');
export const obtenerResumenOportunidades = () => apiRequest<OportunidadResumen>('/api/oportunidades/resumen');
export const obtenerFunnelOportunidades = () => apiRequest<OportunidadFunnel[]>('/api/oportunidades/funnel');
