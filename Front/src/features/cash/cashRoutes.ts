export type CashRoute =
  | { screen: 'daily' | 'movements' | 'banks' | 'reports' | 'reportGenerate' | 'concepts'; permissions: readonly ['Ver'] }
  | { screen: 'create'; permissions: readonly ['Ver', 'Crear'] }
  | { screen: 'close'; permissions: readonly ['Ver', 'Editar'] }
  | { screen: 'movementDetail'; source: 'Caja' | 'Financiero'; id: number; permissions: readonly ['Ver'] }
  | { screen: 'sessionDetail'; id: number; permissions: readonly ['Ver'] };

export function resolveCashRoute(path: string): CashRoute | null {
  const normalized = path.replace(/\/$/, '');
  const pages = {
    '/caja/diaria': 'daily', '/caja/movimientos': 'movements',
    '/caja/conciliaciones-bancarias': 'banks', '/caja/reportes': 'reports',
    '/caja/movimientos/conceptos': 'concepts',
  } as const;
  if (normalized in pages) return { screen: pages[normalized as keyof typeof pages], permissions: ['Ver'] };
  if (normalized === '/caja/reportes/generar') return { screen: 'reportGenerate', permissions: ['Ver'] };
  if (normalized === '/caja/diaria/cerrar') return { screen: 'close', permissions: ['Ver', 'Editar'] };
  if (normalized === '/caja/movimientos/nuevo') return { screen: 'create', permissions: ['Ver', 'Crear'] };
  const movement = /^\/caja\/movimientos\/(Caja|Financiero)\/([1-9]\d*)$/.exec(normalized);
  if (movement && Number.isSafeInteger(Number(movement[2]))) return { screen: 'movementDetail', source: movement[1] as 'Caja' | 'Financiero', id: Number(movement[2]), permissions: ['Ver'] };
  const session = /^\/caja\/cierres\/([1-9]\d*)$/.exec(normalized);
  if (session && Number.isSafeInteger(Number(session[1]))) return { screen: 'sessionDetail', id: Number(session[1]), permissions: ['Ver'] };
  return null;
}

export function canOpenCashRoute(route: CashRoute, hasPermission: (menu: string, permission: 'Ver' | 'Crear' | 'Editar') => boolean) {
  return route.permissions.every(permission => hasPermission('Caja', permission));
}

export const cashMovementUrl = (source: 'Caja' | 'Financiero', id: number) => `/caja/movimientos/${source}/${id}`;
export const cashSessionUrl = (id: number) => `/caja/cierres/${id}`;
export const cashMovementsReturnUrl = (closed = false) => closed ? '/caja/movimientos?vista=cierres' : '/caja/movimientos';
