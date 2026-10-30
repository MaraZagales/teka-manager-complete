import { apiRequest } from "./apiClient";
import type { Oportunidad } from "./commercialApi";
export type Presupuesto = { presupuestoComercialId:number; numero?:string|null; oportunidadComercialId?:number|null; interesComercialId?:number|null; clienteId:number; estado:string; fechaEmision?:string; fechaVencimiento?:string; clienteNombre?:string; clienteApellido?:string; cantidadRenglones?:number; total?:number; importeTotal?:number; observaciones?:string|null };
export type ProductoPresupuesto = { presupuestoComercialDetalleId:number; productoId:number; cantidad:number; precioUnitario:number; descuentoPorcentaje:number; observaciones?:string|null; productoNombre?:string|null; nombre?:string|null; nombreCatalogo?:string|null; colorNombre?:string|null; varianteNombre?:string|null; unidadMedidaNombre?:string|null };
export type HistorialPresupuesto = { presupuestoComercialHistorialId:number; estadoAnterior?:string|null; estadoNuevo?:string|null; fecha:string; observaciones?:string|null };
export type PresupuestoDetalle = { presupuesto:Presupuesto; productos:ProductoPresupuesto[]; historial:HistorialPresupuesto[] };
export type Actividad = { interesComercialId?:number|null; actividadComercialId:number; clienteId:number; oportunidadComercialId?:number|null; presupuestoComercialId?:number|null; usuarioResponsableId?:number|null; tipo:string; titulo:string; descripcion?:string|null; fechaProgramada:string; fechaRealizacion?:string|null; fechaAlta?:string|null; fechaActualizacion?:string|null; estado:string; resultado?:string|null; clienteNombre?:string|null; clienteApellido?:string|null };
export const listarPresupuestos=(oportunidadComercialId?:number,interesComercialId?:number)=>{const query=new URLSearchParams({...oportunidadComercialId?{oportunidadComercialId:String(oportunidadComercialId)}:{},...interesComercialId?{interesComercialId:String(interesComercialId)}:{}}).toString();return apiRequest<Presupuesto[]>(`/api/presupuestos-comerciales${query?`?${query}`:""}`)};
export const detallePresupuesto=(id:number)=>apiRequest<PresupuestoDetalle>(`/api/presupuestos-comerciales/${id}`);
export const crearPresupuesto=(body:{oportunidadComercialId:number;fechaVencimiento:string;usuarioResponsableId?:number|null;observaciones?:string})=>apiRequest<{presupuestoComercialId:number}>("/api/presupuestos-comerciales",{method:"POST",body:JSON.stringify(body)});
export const guardarProductoPresupuesto=(id:number,body:{productoId:number;cantidad:number;precioUnitario:number;descuentoPorcentaje:number;observaciones?:string})=>apiRequest<void>(`/api/presupuestos-comerciales/${id}/productos`,{method:"PUT",body:JSON.stringify(body)});
export const cambiarEstadoPresupuesto=(id:number,estadoNuevo:string,observaciones?:string)=>apiRequest<void>(`/api/presupuestos-comerciales/${id}/estado`,{method:"POST",body:JSON.stringify({estadoNuevo,observaciones})});
export const listarActividades=(desde?:string,hasta?:string,interesComercialId?:number)=>{const query=new URLSearchParams({...desde?{desde}:{},...hasta?{hasta}:{},...interesComercialId?{interesComercialId:String(interesComercialId)}:{}}).toString();return apiRequest<Actividad[]>(`/api/agenda-comercial${query?`?${query}`:""}`)};
export const crearActividad=(body:{interesComercialId?:number|null;clienteId:number;tipo:string;titulo:string;fechaProgramada:string;oportunidadComercialId?:number|null;presupuestoComercialId?:number|null;usuarioResponsableId?:number|null;descripcion?:string})=>apiRequest<{actividadComercialId:number}>("/api/agenda-comercial",{method:"POST",body:JSON.stringify(body)});
export const reprogramarActividad=(id:number,fechaProgramada:string,descripcion?:string)=>apiRequest<void>(`/api/agenda-comercial/${id}/reprogramar`,{method:"POST",body:JSON.stringify({fechaProgramada,descripcion})});
export const finalizarActividad=(id:number,resultado:string)=>apiRequest<void>(`/api/agenda-comercial/${id}/finalizar`,{method:"POST",body:JSON.stringify({resultado})});
export const cancelarActividad=(id:number)=>apiRequest<void>(`/api/agenda-comercial/${id}/cancelar`,{method:"POST"});

export type NuevoPresupuestoDirecto = {interesComercialId?:number|null;oportunidadComercialId?:number|null;clienteId:number;fechaVencimiento:string;observaciones?:string;productos:Array<{productoId:number;cantidad:number;precioUnitario:number;descuentoPorcentaje:number}>};
export const crearPresupuestoDirecto=(body:NuevoPresupuestoDirecto)=>apiRequest<{presupuestoComercialId:number}>("/api/presupuestos-comerciales/directo",{method:"POST",body:JSON.stringify(body)});

export type OpportunityProduct = { oportunidadProductoId:number; productoId:number; productoNombre:string; cantidad:number; precioReferencia?:number|null };
export type OpportunityHistoryEntry = { historialEstadoOportunidadId:number; estadoOportunidadNombre:string; fechaCambio:string; observaciones?:string|null };
export type OpportunityLegacyVisit = { visitaOportunidadId:number; fechaVisita:string; tipoVisita:string; resultadoEsperado?:string|null; observaciones?:string|null; activo?:boolean };
export type OpportunityDetail = Oportunidad & { tipoCliente:string; canalVentaId:number; estadoOportunidadComercialId:number; probabilidad:number; productos:OpportunityProduct[]; visitas:OpportunityLegacyVisit[]; historialEstados:OpportunityHistoryEntry[] };
export type OpportunityLookup = { id?:number; nombre?:string; descripcion?:string; canalVentaId?:number; estadoOportunidadComercialId?:number; motivoPerdidaOportunidadId?:number };
export type OpportunityCustomer = { clienteId:number; nombre:string; apellido?:string|null; activo:boolean };
export type OpportunityCatalogProduct = { productoId:number; codigo?:string|null; nombre:string; nombreCatalogo?:string|null; colorNombre?:string|null; varianteNombre?:string|null; medida?:string|null; activo?:boolean };
export type OpportunityUser = { id:number; nombre?:string|null; apellido?:string|null; descripcion?:string|null; email?:string|null };
export type OpportunityPayload = { clienteId:number; clienteNombre:string; clienteApellido?:string|null; tipoCliente:string; canalVentaId:number; interes:string; estadoOportunidadComercialId?:number|null; montoEstimado:number; probabilidad:number; proximaAccion?:string|null; fechaProximaAccion?:string|null; observaciones?:string|null };

export const listarOportunidades=()=>apiRequest<Oportunidad[]>("/api/oportunidades");
export const detalleOportunidad=(id:number)=>apiRequest<OpportunityDetail>(`/api/oportunidades/${id}`);
export const crearOportunidad=(body:OpportunityPayload)=>apiRequest<{oportunidadComercialId:number}>("/api/oportunidades",{method:"POST",body:JSON.stringify(body)});
export const crearOportunidadDesdeConsulta=(id:number,body:{usuarioResponsableId?:number|null;interes?:string|null;proximaAccion?:string|null;fechaProximaAccion?:string|null;observaciones?:string|null})=>apiRequest<{oportunidadComercialId:number}>(`/api/intereses-comerciales/${id}/calificar`,{method:"POST",body:JSON.stringify(body)});
export const actualizarOportunidad=(id:number,body:OpportunityPayload&{estadoOportunidadComercialId:number})=>apiRequest<void>(`/api/oportunidades/${id}`,{method:"PUT",body:JSON.stringify(body)});
export const guardarProductoOportunidad=(id:number,productoId:number,cantidad:number)=>apiRequest<void>(`/api/oportunidades/${id}/productos`,{method:"PUT",body:JSON.stringify({productoId,cantidad})});
export const eliminarProductoOportunidad=(id:number,productoId:number)=>apiRequest<void>(`/api/oportunidades/${id}/productos/${productoId}`,{method:"DELETE"});
export const asignarResponsableOportunidad=(id:number,usuarioResponsableId:number)=>apiRequest<void>(`/api/oportunidades/${id}/asignar-responsable`,{method:"POST",body:JSON.stringify({usuarioResponsableId})});
export const perderOportunidad=(id:number,motivoPerdidaOportunidadId:number,observacionPerdida?:string)=>apiRequest<void>(`/api/oportunidades/${id}/perder`,{method:"POST",body:JSON.stringify({motivoPerdidaOportunidadId,observacionPerdida})});
export const cancelarOportunidad=(id:number,observaciones?:string)=>apiRequest<void>(`/api/oportunidades/${id}/cancelar`,{method:"POST",body:JSON.stringify({observaciones})});
export const estadosOportunidad=()=>apiRequest<OpportunityLookup[]>("/api/oportunidades/lookups/estados");
export const motivosPerdidaOportunidad=()=>apiRequest<OpportunityLookup[]>("/api/oportunidades/lookups/motivos-perdida");
export const canalesVenta=()=>apiRequest<OpportunityLookup[]>("/api/auxiliares/canales-venta");
export const clientesOportunidad=()=>apiRequest<OpportunityCustomer[]>("/api/clientes");
export const productosOportunidad=()=>apiRequest<OpportunityCatalogProduct[]>("/api/productos");
export const usuariosOportunidad=()=>apiRequest<OpportunityUser[]>("/api/usuarios/lookup");

export const enviarPresupuestoEmail=(id:number,destinatario:string,pdfBase64:string)=>apiRequest<{mensaje:string}>(`/api/presupuestos-comerciales/${id}/enviar-email`,{method:"POST",body:JSON.stringify({destinatario,pdfBase64})});

export const eliminarProductoPresupuesto=(id:number,productoId:number)=>apiRequest<void>(`/api/presupuestos-comerciales/${id}/productos/${productoId}`,{method:"DELETE"});
