import { apiRequest } from './apiClient';
import type { SalesCustomer } from './salesOrdersApi';

export type Lookup = { id: number; descripcion: string; codigoARCA?: number | null };
export type CustomerPayload = { nombre: string; apellido: string | null; tipoDocumentoId: number; documento: string | null; telefono: string | null; email: string | null; condicionIVAId: number; observaciones: string | null };
export type CustomerAddress = { domicilioClienteId:number; clienteId:number; tipoDomicilio:string; tipoDomicilioId:number|null; direccion:string; calle:string; altura:string; pisoDepto:string|null; barrio:string|null; codigoPostal:string|null; localidadId:number; localidadNombre:string; provinciaId:number; provinciaNombre:string; activo:boolean };
export type CustomerAddressPayload = { tipoDomicilioId:number; calle:string; altura:string; pisoDepto:string|null; barrio:string|null; codigoPostal:string|null; localidadId:number; provinciaId:number };
export type AddressType = { tipoDomicilioId:number; nombre:string; activo:boolean };
export type InactivateCustomerPayload = { motivoInactivacionId:number; observacionInactivacion:string|null };
export const salesCustomersApi = {
  list: () => apiRequest<SalesCustomer[]>('/api/clientes'),
  get: (id: number) => apiRequest<SalesCustomer & { observaciones?: string | null }>(`/api/clientes/${id}`),
  documentTypes: () => apiRequest<Lookup[]>('/api/auxiliares/tipos-documento'),
  ivaConditions: () => apiRequest<Lookup[]>('/api/auxiliares/condiciones-iva'),
  inactivationReasons: () => apiRequest<Lookup[]>('/api/auxiliares/motivos-inactivacion'),
  provinces: () => apiRequest<Lookup[]>('/api/auxiliares/provincias'),
  localities: (provinceId: number) => apiRequest<Lookup[]>(`/api/auxiliares/localidades?provinciaId=${provinceId}`),
  addressTypes: (onlyActive = false) => apiRequest<AddressType[]>(`/api/tipos-domicilio${onlyActive ? '?soloActivos=true' : ''}`),
  createAddressType: (nombre:string) => apiRequest<{tipoDomicilioId:number}>('/api/tipos-domicilio',{method:'POST',body:JSON.stringify({nombre})}),
  updateAddressType: (id:number,nombre:string) => apiRequest<void>(`/api/tipos-domicilio/${id}`,{method:'PUT',body:JSON.stringify({nombre})}),
  inactivateAddressType: (id:number) => apiRequest<void>(`/api/tipos-domicilio/${id}`,{method:'DELETE'}),
  activateAddressType: (id:number) => apiRequest<void>(`/api/tipos-domicilio/${id}/activar`,{method:'POST'}),
  create: (data: CustomerPayload) => apiRequest<{clienteId:number}>('/api/clientes',{method:'POST',body:JSON.stringify(data)}),
  update: (id: number, data: CustomerPayload) => apiRequest<void>(`/api/clientes/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  inactivate: (id:number, data:InactivateCustomerPayload) => apiRequest<void>(`/api/clientes/${id}`,{method:'DELETE',body:JSON.stringify(data)}),
  activate: (id: number) => apiRequest<void>(`/api/clientes/${id}/activar`,{method:'POST'}),
  addresses: (customerId:number) => apiRequest<CustomerAddress[]>(`/api/clientes/${customerId}/domicilios`),
  createAddress: (customerId:number,data:CustomerAddressPayload) => apiRequest<{domicilioClienteId:number}>(`/api/clientes/${customerId}/domicilios`,{method:'POST',body:JSON.stringify(data)}),
  updateAddress: (id:number,data:CustomerAddressPayload) => apiRequest<void>(`/api/domicilios-clientes/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  inactivateAddress: (id:number) => apiRequest<void>(`/api/domicilios-clientes/${id}`,{method:'DELETE'}),
  activateAddress: (id:number) => apiRequest<void>(`/api/domicilios-clientes/${id}/activar`,{method:'POST'}),
};
