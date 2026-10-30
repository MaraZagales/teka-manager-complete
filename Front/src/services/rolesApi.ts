import { apiRequest } from './apiClient';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export type Role = { rolId: number; nombre: string; descripcion?: string; activo: boolean };
export type Menu = { menuId: number; nombre: string; ruta?: string; modulo: string; ordenVisual: number; activo: boolean };
export type Permission = { permisoId: number; nombre: string; descripcion?: string; activo: boolean };
export type RolePermission = { rolPermisoId: number; rolId: number; permisoId: number; permisoNombre: string; menuId: number; menuNombre: string; modulo: string; ruta?: string };
export type User = { usuarioId: number; username: string; nombre: string; apellido?: string; email: string; activo: boolean; roles: { rolId: number; rolNombre: string }[] };
export type RolePayload = { nombre: string; descripcion?: string; activo: boolean };

async function request<T>(url:string, init?:RequestInit):Promise<T>{ return apiRequest<T>(url, init); }

export const rolesApi = {
  list: () => request<Role[]>('/api/roles'),
  menus: () => request<Menu[]>('/api/menus'),
  permissions: () => request<Permission[]>('/api/permisos'),
  users: () => request<User[]>('/api/usuarios'),
  rolePermissions: (roleId: number) => request<RolePermission[]>(`/api/roles/${roleId}/permisos`),
  create: (payload: RolePayload) => request<{ rolId: number }>('/api/roles', { method: 'POST', body: JSON.stringify(payload) }),
  update: (roleId: number, payload: RolePayload) => request<void>(`/api/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivate: (roleId: number) => request<void>(`/api/roles/${roleId}`, { method: 'DELETE' }),
  addPermission: (roleId: number, menuId: number, permisoId: number) => request<{ rolPermisoId: number }>(`/api/roles/${roleId}/permisos`, { method: 'POST', body: JSON.stringify({ menuId, permisoId }) }),
  removePermission: (rolPermisoId: number) => request<void>(`/api/roles/permisos/${rolPermisoId}`, { method: 'DELETE' }),
};
