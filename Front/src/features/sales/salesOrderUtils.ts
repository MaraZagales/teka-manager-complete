export const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

export function dateOnly(value: string | null | undefined) {
  if (!value) return 'Sin registrar';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-AR');
}

export function dateTime(value: string | null | undefined) {
  if (!value) return 'Sin registrar';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function localDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function orderTone(value: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (/cancel|rechaz|anulad/i.test(value)) return 'danger';
  if (/entreg|finaliz|complet/i.test(value)) return 'success';
  if (/pendiente|nuevo|recibido/i.test(value)) return 'warning';
  return 'neutral';
}

export function collectionSituation(totalCollected: number, balance: number) {
  if (balance <= 0.01) return { label: 'Cobrado', tone: 'success' as const };
  if (totalCollected > 0.01) return { label: 'Adelanto confirmado', tone: 'warning' as const };
  return { label: 'Pendiente de cobro', tone: 'danger' as const };
}
