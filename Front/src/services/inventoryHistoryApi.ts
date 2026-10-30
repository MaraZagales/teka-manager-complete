import { apiRequest } from './apiClient';

export type InventoryClass = 'PRODUCTO' | 'INSUMO';
export type HistoryGrouping = 'DIA' | 'MES';

export type InventoryActivity = {
  clase: InventoryClass;
  articuloId: number;
  depositoId: number | null;
  saldoInicial: number;
  entradas: number;
  salidas: number;
  variacionNeta: number;
  saldoFinal: number;
  cantidadMovimientos: number;
  tendencia: string;
  historialConciliado: boolean;
};

export type InventoryStockAtDate = {
  clase: InventoryClass;
  articuloId: number;
  depositoId: number | null;
  saldoLibroFecha: number;
  historialConciliado: boolean;
};

export type InventoryEvolution = {
  periodo: string;
  variacion: number;
  saldoFinal: number;
  historialConciliado: boolean;
};

type CommonQuery = { clase: InventoryClass; depositoId?: number; articuloId?: number; consolidarDepositos?: boolean };
type ActivityQuery = CommonQuery & { desde: string; hasta: string };
type StockDateQuery = CommonQuery & { fecha: string };
type EvolutionQuery = Omit<CommonQuery, 'consolidarDepositos' | 'articuloId'> & { articuloId: number; desde: string; hasta: string; agrupacion: HistoryGrouping };

function queryString(values: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return query.toString();
}

export const inventoryHistoryApi = {
  activity: (query: ActivityQuery) => apiRequest<InventoryActivity[]>(`/api/Existencias/actividad?${queryString(query)}`),
  stockAtDate: (query: StockDateQuery) => apiRequest<InventoryStockAtDate[]>(`/api/Existencias/stock-fecha?${queryString(query)}`),
  evolution: (query: EvolutionQuery) => apiRequest<InventoryEvolution[]>(`/api/Existencias/evolucion?${queryString(query)}`),
};
