import { getSession } from './session';

export type PermissionName = 'Ver' | 'Crear' | 'Editar' | 'Inactivar' | 'Exportar' | 'Administrar';

function normalize(value?: string) {
  return (value || '').trim().toLocaleLowerCase('es-AR');
}

export function hasPermission(menuName: string, permission: PermissionName = 'Ver') {
  const session = getSession();
  if (!session?.exitoso) return false;
  return (session.permisos || []).some(
    (item) => normalize(item.menuNombre) === normalize(menuName) && normalize(item.permisoNombre) === normalize(permission),
  );
}

export function canAccessAny(menuNames: string[], permission: PermissionName = 'Ver') {
  return menuNames.some((menu) => hasPermission(menu, permission));
}

export function firstAllowedPath() {
  if (hasPermission('Inicio', 'Ver')) return '/inicio';
  const session = getSession();
  const visible = (session?.permisos || [])
    .filter((item) => normalize(item.permisoNombre) === 'ver' && item.ruta)
    .sort((a, b) => (a.menuId ?? 0) - (b.menuId ?? 0));
  return visible[0]?.ruta || '/sin-acceso';
}
