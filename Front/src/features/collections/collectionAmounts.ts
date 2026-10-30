import type { SalesCollection, SalesOrderBalance } from '../../services/salesOrdersApi';

const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (amount: number) => amount / 100;
const isPending = (collection: SalesCollection) => /^pendiente$/i.test(collection.estadoCobroNombre.trim());
const isConfirmed = (collection: SalesCollection) => /^confirmado$/i.test(collection.estadoCobroNombre.trim());

export function collectionAvailability(balance: SalesOrderBalance, collections: SalesCollection[], editingId?: number) {
  const others = collections.filter(item => item.cobroId !== editingId);
  const pending = others.filter(isPending);
  const committedBase = pending.reduce((sum, item) => sum + toCents(item.importeBase), 0);
  const committedFinal = others.filter(item => isPending(item) || isConfirmed(item))
    .reduce((sum, item) => sum + toCents(item.importeFinal), 0);
  // Saldo excludes confirmed collections; the second cap also respects the API's
  // final-amount commitment check (cash discounts and card surcharges differ).
  const available = Math.max(0, Math.min(toCents(balance.saldo) - committedBase, toCents(balance.totalPedido) - committedFinal));
  return { available: fromCents(available), pendingBase: fromCents(committedBase), hasPrior: others.some(item => isPending(item) || isConfirmed(item)) };
}

export function collectionPreview(amount: number, methodName: string, cardRate: number, balance: SalesOrderBalance, collections: SalesCollection[], editingId?: number) {
  const available = collectionAvailability(balance, collections, editingId);
  const fullCash = /^efectivo$/i.test(methodName.trim()) && toCents(amount) === toCents(balance.totalPedido) && !available.hasPrior;
  const adjustment = /^tarjeta cr[eé]dito$/i.test(methodName.trim())
    ? fromCents(Math.round(toCents(amount) * cardRate / 100))
    : fullCash ? -fromCents(Math.round(toCents(amount) * 5 / 100)) : 0;
  return {
    adjustment,
    final: fromCents(toCents(amount) + toCents(adjustment)),
    remainingBalanceIfConfirmed: Math.max(0, fromCents(toCents(balance.saldo) - toCents(amount))),
    fullCash,
  };
}

