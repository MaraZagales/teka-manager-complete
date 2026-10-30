import { productionOrdersApi } from './productionOrdersApi';

export type RecorteProduccionReporte = {
  fecha: string; ordenProduccionId: number; recorteId: number; insumoId: number;
  insumoCodigo: string; insumoNombre: string; dimension: number | null;
  unidad: string; cantidad: number; depositoNombre: string;
};
export const recortesReportsApi = {
  consumed: (from: string, to: string) =>
    productionOrdersApi.report<RecorteProduccionReporte>('recortes-consumidos', from, to),
  recovered: (from: string, to: string) =>
    productionOrdersApi.report<RecorteProduccionReporte>('recortes-recuperados', from, to),
};
