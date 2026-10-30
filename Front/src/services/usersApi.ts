import { apiRequest } from './apiClient';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export type UserRole = { rolId: number; rolNombre: string; descripcion?: string };
export type User = {
  usuarioId: number;
  username: string;
  nombre: string;
  apellido?: string;
  email: string;
  activo: boolean;
  bloqueado: boolean;
  intentosFallidos: number;
  fechaAlta: string;
  ultimoLogin?: string;
  motivoInactivacionUsuarioId?: number;
  motivoInactivacionUsuarioNombre?: string;
  observacionInactivacion?: string;
  fechaInactivacion?: string;
  roles: UserRole[];
};
export type Role = { rolId: number; nombre: string; descripcion?: string; activo: boolean };
export type Lookup = { id: number; nombre: string };
export type UserPayload = { username: string; nombre: string; apellido?: string; email: string; rolIds: number[] };

async function request<T>(url:string, init?:RequestInit):Promise<T>{ return apiRequest<T>(url, init); }

export const usersApi = {
  list: () => request<User[]>('/api/usuarios'),
  roles: () => request<Role[]>('/api/roles'),
  inactivationReasons: () => request<Lookup[]>('/api/auxiliares/motivos-inactivacion-usuario'),
  create: (payload: UserPayload) => request<{ usuarioId: number; mailEnviado: boolean; mensaje?: string }>('/api/usuarios', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: UserPayload) => request<void>(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (id: number, motivoInactivacionUsuarioId: number, observacionInactivacion?: string) => request<void>(`/api/usuarios/${id}`, { method: 'DELETE', body: JSON.stringify({ motivoInactivacionUsuarioId, observacionInactivacion }) }),
  activate: (id: number) => request<void>(`/api/usuarios/${id}/activar`, { method: 'POST' }),
  block: (id: number) => request<void>(`/api/usuarios/${id}/bloquear`, { method: 'POST' }),
  unblock: (id: number) => request<void>(`/api/usuarios/${id}/desbloquear`, { method: 'POST' }),
  sendPasswordRecovery: (id: number) => request<{ mensaje: string }>(`/api/usuarios/${id}/enviar-restablecimiento-password`, { method: 'POST' }),
};
