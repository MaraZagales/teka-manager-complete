import { apiRequest } from './apiClient';

export type StockProduct = {
  stockProductoId: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  depositoId: number;
  depositoNombre: string;
  cantidadActual: number;
  stockMinimo: number;
  esStockCritico: boolean;
};

export type StockSupply = {
  stockInsumoId: number;
  insumoId: number;
  insumoCodigo: string;
  insumoNombre: string;
  depositoId: number;
  depositoNombre: string;
  cantidadActual: number;
  stockMinimo: number;
  esStockCritico: boolean;
};

export type StockMovement = {
  movimientoStockId: number;
  fechaMovimiento: string;
  tipoMovimientoStockId: number;
  tipoMovimientoNombre: string;
  signo: number;
  depositoId: number;
  depositoNombre: string;
  productoId?: number | null;
  productoCodigo?: string | null;
  productoNombre?: string | null;
  insumoId?: number | null;
  insumoCodigo?: string | null;
  insumoNombre?: string | null;
  cantidad: number;
  motivo?: string | null;
  entidadOrigen?: string | null;
  origenId?: number | null;
  activo: boolean;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  observacionAnulacion?: string | null;
  movimientoStockIdReversaDe?: number | null;
};

export type DepositLookup = { id: number; descripcion: string };

async function movementRequest(url: string, itemLabel: string) {
  try {
    return await apiRequest<StockMovement[]>(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/sesi[oó]n|permisos/i.test(message)) throw error;
    throw new Error(`No pudimos consultar los movimientos de este ${itemLabel}. Intentá nuevamente más tarde.`);
  }
}

export const inventoryStockApi = {
  products: () => apiRequest<StockProduct[]>('/api/Stock/productos'),
  supplies: () => apiRequest<StockSupply[]>('/api/Stock/insumos'),
  productByItem: (productId: number) =>
    apiRequest<StockProduct[]>(`/api/Stock/productos/por-producto/${productId}`),
  productsByDeposit: (depositId: number) =>
    apiRequest<StockProduct[]>(`/api/Stock/productos/por-deposito/${depositId}`),
  supplyByItem: (supplyId: number) =>
    apiRequest<StockSupply[]>(`/api/Stock/insumos/por-insumo/${supplyId}`),
  suppliesByDeposit: (depositId: number) =>
    apiRequest<StockSupply[]>(`/api/Stock/insumos/por-deposito/${depositId}`),
  productMovements: (productId: number) =>
    movementRequest(`/api/MovimientosStock/por-producto/${productId}`, 'producto'),
  supplyMovements: (supplyId: number) =>
    movementRequest(`/api/MovimientosStock/por-insumo/${supplyId}`, 'insumo'),
  deposits: () => apiRequest<DepositLookup[]>('/api/Auxiliares/depositos'),
};
