import type { Recorte } from '../../../services/recortesApi';

export const recorteNumber = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
export const recorteDate = (value: string) => new Date(value).toLocaleString('es-AR');
export function recorteMovementTone(kind: string): 'success' | 'danger' | 'warning' {
  if (kind === 'Alta' || kind === 'AjustePositivo') return 'success';
  if (kind === 'Baja' || kind === 'Uso' || kind === 'AjusteNegativo') return 'danger';
  return 'warning';
}
export function recorteMedidas(row: Pick<Recorte, 'largoMm' | 'anchoMm' | 'espesorMm'>) {
  if (row.largoMm == null || row.anchoMm == null || row.espesorMm == null) return 'Sin geometría completa';
  return `${recorteNumber.format(row.largoMm)} × ${recorteNumber.format(row.anchoMm)} × ${recorteNumber.format(row.espesorMm)} mm`;
}
export function recorteEstadoOperativo(name: string) {
  return !/reserv|compromet|utilizado/i.test(name);
}
export function decimalInput(value: string): number | null {
  const clean = value.trim().replace(',', '.');
  if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(clean)) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Código visual derivado del identificador real; no representa una secuencia comercial independiente. */
export const recorteCodigo = (recorteId: number): string => `GIR-${String(recorteId).padStart(3, "0")}`;
