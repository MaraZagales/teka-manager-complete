export const MAX_CASH_AMOUNT = 999999999999.99;

/** Entrada decimal sin separadores de miles; acepta coma o punto y hasta dos decimales. */
export function cashAmountError(value: string, allowZero = true): string {
  const text = value.trim();
  if (!text) return 'Completá el importe contado.';
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) return 'Ingresá un importe sin separadores de miles y con hasta dos decimales.';
  const amount = Number(text.replace(',', '.'));
  if (!Number.isFinite(amount) || amount > MAX_CASH_AMOUNT) return 'El importe supera el máximo permitido.';
  if (!allowZero && amount === 0) return 'El importe debe ser mayor que cero.';
  return '';
}
export function cashAmount(value: string): number { return Number(value.trim().replace(',', '.')); }
export function cashDifference(counted: number, expected: number): number { return Math.round((counted - expected) * 100) / 100; }

export function validateCashMovement(input: {
  type: string; types: readonly { codigo: string; sentido: string }[]; amount: string;
  description: string; reference: string; notes: string; available: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const selected = input.types.find(item => item.codigo === input.type);
  if (!selected) errors.type = 'Seleccioná un tipo.';
  const amountError = cashAmountError(input.amount, false);
  if (amountError) errors.amount = amountError;
  if (!input.description.trim()) errors.description = 'Ingresá la descripción del movimiento.';
  if (input.description.length > 250) errors.description = 'Máximo 250 caracteres.';
  if (input.reference.length > 150) errors.reference = 'Máximo 150 caracteres.';
  if (input.notes.length > 500) errors.notes = 'Máximo 500 caracteres.';
  if (!amountError && selected?.sentido === 'Egreso' && cashAmount(input.amount) > input.available)
    errors.amount = 'El importe supera el efectivo disponible.';
  return errors;
}
