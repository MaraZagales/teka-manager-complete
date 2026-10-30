import type { Supply } from './suppliesApi';

/** Denominación comercial para listados y reportes; no altera datos persistidos. */
export function formatSupplyName(supply: Pick<Supply, 'nombre' | 'nombreCatalogo' | 'colorNombre'>): string {
  const base = (supply.nombreCatalogo || supply.nombre || '').trim();
  const color = (supply.colorNombre || '').trim();
  if (!color) return base;
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
  return normalize(base).endsWith(normalize(color)) ? base : `${base} ${color}`;
}
