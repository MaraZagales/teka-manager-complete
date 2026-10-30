import { exportCommercialList, type ExportColumn } from './commercialListExport';

// Exportaciones operativas reutilizables: exportan todos los registros filtrados, no sólo la página visible.
type Cell = string | number;
const exportColumns = (columns: string[]): ExportColumn<Cell[]>[] => columns.map((header, index) => ({ header, value: row => row[index] }));
const filename = (title: string) => `TEKA_${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g,'_')}`;
export async function exportOperationalExcel(title:string, columns:string[], rows:Cell[][], filters = 'Sin filtros adicionales') {
  return exportCommercialList('excel', title, filename(title), rows, exportColumns(columns), filters);
}
export async function exportOperationalPdf(title:string, columns:string[], rows:Cell[][], filters = 'Sin filtros adicionales') {
  return exportCommercialList('pdf', title, filename(title), rows, exportColumns(columns), filters);
}
