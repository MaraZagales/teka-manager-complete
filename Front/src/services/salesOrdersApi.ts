import { apiRequest, apiBlob } from './apiClient';
import type { Pedido, PedidoCompleto } from './onlineOrdersApi';

export type { Pedido as SalesOrder, PedidoCompleto as SalesOrderDetail };

export type SalesOrderBalance = {
  pedidoId: number;
  totalPedido: number;
  totalCobrado: number;
  saldo: number;
};

export type SalesCollection = {
  cobroId: number;
  clienteId: number;
  pedidoId: number | null;
  cajaId: number | null;
  cajaNombre: string | null;
  medioCobroId: number;
  medioCobroNombre: string;
  estadoCobroId: number;
  estadoCobroNombre: string;
  fechaCobro: string;
  importeBase: number;
  porcentajeAplicado: number;
  importeAjuste: number;
  importeFinal: number;
  referenciaExterna: string | null;
  observaciones: string | null;
};

export type CustomerAccountMovement = {
  movimientoCuentaCorrienteClienteId: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellido: string | null;
  tipoMovimientoCuentaCorrienteId: number;
  tipoMovimientoNombre: string;
  signo: number;
  fechaMovimiento: string;
  pedidoId: number | null;
  comprobanteId: number | null;
  cobroId: number | null;
  importe: number;
  observaciones: string | null;
};

export type SalesDocument = {
  comprobanteId: number;
  pedidoId: number | null;
  tipoComprobanteNombre: string;
  puntoVenta: number;
  numeroComprobante: number | null;
  fechaComprobante: string;
  importeTotal: number;
  estadoComprobante: string;
  observaciones: string | null;
};
export type SalesDocumentDetail = SalesDocument & {
  detalles: Array<{ detalleComprobanteId: number; descripcionItem: string; cantidad: number; precioUnitario: number; importeTotalItem: number }>;
};

export type DocumentEmailHistory = { envioComprobanteCorreoId: number; comprobanteId: number; usuarioId: number | null; destinatario: string; asunto: string; estado: string; fechaSolicitud: string; fechaResultado: string | null; mensajeError: string | null; identificadorExterno: string | null };

export type SalesDeliveryNote = {
  remitoId: number;
  pedidoId: number;
  fechaRemito: string;
  numeroRemito: string | null;
  domicilioEntrega: string | null;
  entregado: boolean;
  anulado: boolean;
  motivoAnulacion: string | null;
  fechaAnulacion: string | null;
  usuarioAnulacion: string | null;
  fechaEntrega: string | null;
  observaciones: string | null;
};
export type SalesDeliveryNoteDetail = SalesDeliveryNote & {
  detalles: Array<{ detalleRemitoId: number; productoCodigo: string; productoNombre: string; cantidad: number }>;
};

export type SalesOrderRelated = {
  balance: SalesOrderBalance | null;
  collections: SalesCollection[];
  documents: SalesDocument[];
  deliveryNotes: SalesDeliveryNote[];
  warnings: string[];
  unavailable: Array<'balance' | 'collections' | 'documents' | 'deliveryNotes'>;
};

export type SalesCustomer = {
  clienteId: number;
  nombre: string;
  apellido: string | null;
  tipoDocumentoId: number;
  tipoDocumentoNombre: string;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  condicionIVAId: number;
  condicionIVANombre: string;
  activo: boolean;
  observaciones?: string | null;
  motivoInactivacionId?: number | null;
  motivoInactivacionNombre?: string | null;
  observacionInactivacion?: string | null;
  fechaInactivacion?: string | null;
  fechaAlta: string;
};
export type DocumentLookup = { id: number; descripcion: string; codigoARCA?: number | null };
export type SalesChannel = { id: number; descripcion: string };
export type SalesOrderStatus = { id: number; descripcion: string };
export type SalesCustomerAddress = {
  domicilioClienteId: number;
  clienteId: number;
  tipoDomicilio: string;
  direccion: string;
  calle: string;
  altura: string;
  pisoDepto: string | null;
  barrio: string | null;
  codigoPostal: string | null;
  localidadId: number;
  localidadNombre: string;
  provinciaId: number;
  provinciaNombre: string;
  activo: boolean;
};
export type SalesPrice = { productoId: number; precio: number; activo: boolean; fechaVigenciaDesde: string; fechaVigenciaHasta: string | null };
export type CreateSalesOrder = { clienteId: number; canalVentaId: number; oportunidadComercialId?: number | null; observaciones: string | null; detalles: Array<{ productoId: number; cantidad: number }> };
export type AddSalesOrderLine = { productoId: number; cantidad: number };
export type UpdateSalesOrderLine = { cantidad: number };

export const salesOrdersApi = {
  list: () => apiRequest<Pedido[]>('/api/ventas'),
  get: (id: number) => apiRequest<PedidoCompleto>(`/api/ventas/${id}`),
  balance: (id: number) => apiRequest<SalesOrderBalance>(`/api/ventas/${id}/saldo`),
  collections: () => apiRequest<SalesCollection[]>('/api/cobros'),
  accountMovements: () => apiRequest<CustomerAccountMovement[]>('/api/cobros/cuenta-corriente'),
  documents: () => apiRequest<SalesDocument[]>('/api/comprobantes'),
  deliveryNotes: () => apiRequest<SalesDeliveryNote[]>('/api/remitos'),
  documentTypes: () => apiRequest<DocumentLookup[]>('/api/auxiliares/tipos-comprobante'),
  documentConcepts: () => apiRequest<DocumentLookup[]>('/api/auxiliares/conceptos-comprobante'),
  currencies: () => apiRequest<DocumentLookup[]>('/api/auxiliares/monedas'),
  createDocument: (payload: {pedidoId:number;tipoComprobanteId:number;conceptoComprobanteId:number;monedaId:number;puntoVenta:number;numeroComprobante:null;observaciones:string|null}) => apiRequest<{comprobanteId:number}>('/api/comprobantes/desde-pedido', {method:'POST',body:JSON.stringify(payload)}),
  document: (id: number) => apiRequest<SalesDocumentDetail>(`/api/comprobantes/${id}`),
  documentPdf: (id: number) => apiBlob(`/api/comprobantes/${id}/pdf`),
  documentEmailHistory: (id: number) => apiRequest<DocumentEmailHistory[]>(`/api/comprobantes/${id}/envios`),
  sendDocumentEmail: (id: number, destinatario: string) => apiRequest<{envioComprobanteCorreoId:number;estado:string}>(`/api/comprobantes/${id}/enviar-correo`, { method: 'POST', body: JSON.stringify({ destinatario }) }),
  deliveryNote: (id: number) => apiRequest<SalesDeliveryNoteDetail>(`/api/remitos/${id}`),
  createDeliveryNote: (payload: { pedidoId: number; numeroRemito: string | null; domicilioEntrega: string | null; observaciones: string | null }) =>
    apiRequest<{ remitoId: number }>('/api/remitos/desde-pedido', { method: 'POST', body: JSON.stringify(payload) }),
  editDeliveryNote: (id: number, payload: { domicilioEntrega: string; observaciones: string | null }) =>
    apiRequest<void>(`/api/remitos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  annulDeliveryNote: (id: number, motivo: string) =>
    apiRequest<void>(`/api/remitos/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  markDelivered: (id: number, payload: { observaciones: string | null }) =>
    apiRequest<void>(`/api/remitos/${id}/marcar-entregado`, { method: 'POST', body: JSON.stringify(payload) }),
  customers: () => apiRequest<SalesCustomer[]>('/api/clientes'),
  customerAddresses: (customerId: number) => apiRequest<SalesCustomerAddress[]>(`/api/clientes/${customerId}/domicilios`),
  channels: () => apiRequest<SalesChannel[]>('/api/auxiliares/canales-venta'),
  statuses: () => apiRequest<SalesOrderStatus[]>('/api/auxiliares/estados-pedido'),
  currentPrice: (productId: number) => apiRequest<SalesPrice>(`/api/precios-venta/producto/${productId}/vigente`),
  create: (payload: CreateSalesOrder) => apiRequest<{ pedidoId: number }>('/api/ventas', { method: 'POST', body: JSON.stringify(payload) }),
  annulIntegral: (id: number, payload: {
    usuarioId: number; motivo: string; medioReintegro: string; cajaId: number | null;
    referenciaReintegro: string | null; mercaderiaRecibidaApta: boolean; reintegroRealizado: boolean;
  }) => apiRequest<{ pedidoId: number; notaCreditoId: number; numeroNotaCredito: number;
    devolucionVentaIntegralId: number; importeReintegrado: number; importeComprobante: number }>(
      `/api/ventas/${id}/anulacion-integral`, { method: 'POST', body: JSON.stringify(payload) }),
  cancel: (id: number, observations: string) => apiRequest<void>(`/api/ventas/${id}`, { method: 'DELETE', body: JSON.stringify({ observaciones: observations }) }),
  addLine: (orderId: number, payload: AddSalesOrderLine) => apiRequest<void>(`/api/ventas/${orderId}/detalles`, { method: 'POST', body: JSON.stringify(payload) }),
  updateLine: (lineId: number, payload: UpdateSalesOrderLine) => apiRequest<void>(`/api/ventas/detalles/${lineId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  removeLine: (lineId: number) => apiRequest<void>(`/api/ventas/detalles/${lineId}`, { method: 'DELETE' }),
  async related(id: number): Promise<SalesOrderRelated> {
    const results = await Promise.allSettled([
      this.balance(id),
      this.collections(),
      this.documents(),
      this.deliveryNotes(),
    ] as const);
    const warningLabels = ['saldo', 'cobros', 'comprobantes', 'remitos'];
    const keys = ['balance', 'collections', 'documents', 'deliveryNotes'] as const;
    const warnings = results.flatMap((result, index) =>
      result.status === 'rejected' ? [`No se pudo consultar ${warningLabels[index]}.`] : [],
    );
    return {
      balance: results[0].status === 'fulfilled' ? results[0].value : null,
      collections: results[1].status === 'fulfilled' ? results[1].value.filter(item => item.pedidoId === id) : [],
      documents: results[2].status === 'fulfilled' ? results[2].value.filter(item => item.pedidoId === id) : [],
      deliveryNotes: results[3].status === 'fulfilled' ? results[3].value.filter(item => item.pedidoId === id) : [],
      warnings,
      unavailable: results.flatMap((result, index) => result.status === 'rejected' ? [keys[index]] : []),
    };
  },
};
