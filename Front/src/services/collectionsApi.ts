import { apiRequest } from './apiClient';
import type { SalesCollection } from './salesOrdersApi';

export type CollectionLookup = { id: number; descripcion: string };
export type CollectionMethod = CollectionLookup & { requiereReferencia: boolean };

export type RegisterCollectionRequest = {
  clienteId: number;
  pedidoId: number;
  cajaId: number | null;
  medioCobroId: number;
  importeBase: number;
  porcentajeRecargoTarjeta: number;
  referenciaExterna: string | null;
  observaciones: string | null;
};

export type ConfirmCollectionRequest = { depositoId: number | null; observaciones: string | null };
export type UpdatePendingCollectionRequest = Omit<RegisterCollectionRequest, 'clienteId' | 'pedidoId'>;
export type AnnulCollectionRequest = { observaciones: string | null };

export const collectionsApi = {
  methods: () => apiRequest<CollectionMethod[]>('/api/auxiliares/medios-cobro'),
  cashBoxes: () => apiRequest<CollectionLookup[]>('/api/auxiliares/cajas'),
  deposits: () => apiRequest<CollectionLookup[]>('/api/auxiliares/depositos'),
  get: (id: number) => apiRequest<SalesCollection>(`/api/cobros/${id}`),
  register: (payload: RegisterCollectionRequest) => apiRequest<{ cobroId: number }>('/api/cobros', { method: 'POST', body: JSON.stringify(payload) }),
  updatePending: (id: number, payload: UpdatePendingCollectionRequest) => apiRequest<void>(`/api/cobros/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  annulPending: (id: number, payload: AnnulCollectionRequest) => apiRequest<void>(`/api/cobros/${id}`, { method: 'DELETE', body: JSON.stringify(payload) }),
  confirm: (id: number, payload: ConfirmCollectionRequest) => apiRequest<void>(`/api/cobros/${id}/confirmar`, { method: 'POST', body: JSON.stringify(payload) }),
};
