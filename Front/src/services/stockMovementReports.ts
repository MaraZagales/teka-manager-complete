import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalyticMovement, MovementFilters } from './stockMovementsApi';

const dateTime = (value: string) => new Date(value).toLocaleString('es-AR');
const number = (value: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);

export function movementFiltersLabel(filters: MovementFilters, deposit?: string, article?: string) {
  return [
    `Período: ${filters.desde.split('-').reverse().join('/')} al ${filters.hasta.split('-').reverse().join('/')}`,
    `Clase: ${filters.clase === 'PRODUCTO' ? 'Productos terminados' : filters.clase === 'INSUMO' ? 'Insumos' : 'Todas'}`,
    `Depósito: ${deposit || 'Todos'}`, `Artículo: ${article || 'Todos'}`,
    `Origen: ${filters.origen || 'Todos'}`, `Estado: ${filters.estado || 'Todos'}`,
    `Modalidad: ${filters.modalidad || 'Todas'}`, filters.buscar ? `Búsqueda: ${filters.buscar}` : '',
  ].filter(Boolean).join(' · ');
}

export function stockMovementsExcel(rows: AnalyticMovement[], filters: string) {
  const headers = ['Fecha y hora', 'ID', 'Clase', 'Código', 'Artículo', 'Depósito', 'Tipo', 'Cantidad', 'Modalidad', 'Origen', 'Referencia', 'Estado', 'Motivo'];
  const sheet = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER'], ['Movimientos de stock'], ['Generado', new Date().toLocaleString('es-AR')], ['Filtros', filters], [], headers,
    ...rows.map(row => [dateTime(row.fechaMovimiento), row.movimientoStockId, row.clase === 'PRODUCTO' ? 'Producto terminado' : 'Insumo', row.codigo, row.articulo, row.deposito, row.tipoMovimiento, `${row.signo < 0 ? '−' : '+'}${number(row.cantidad)}`, row.modalidad, row.entidadOrigen || 'Sin origen', row.origenId ?? '', row.estado, row.motivo || '']),
  ]);
  sheet['!cols'] = headers.map((_, index) => ({ wch: index === 4 ? 34 : index === 5 ? 25 : index === 0 ? 20 : 16 }));
  if (rows.length) sheet['!autofilter'] = { ref: `A6:M${6 + rows.length}` };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Movimientos');
  XLSX.writeFile(workbook, `TEKA_Movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function stockMovementsPdf(rows: AnalyticMovement[], filters: string) {
  const document = new jsPDF({ orientation: 'landscape' });
  document.setFillColor(63, 81, 64); document.rect(0, 0, 297, 30, 'F');
  document.setTextColor(255, 255, 255); document.setFont('helvetica', 'bold'); document.setFontSize(17); document.text('TEKA MANAGER', 14, 13);
  document.setFontSize(10); document.text('Movimientos de stock', 14, 22);
  document.setTextColor(41, 37, 36); document.setFont('helvetica', 'normal'); document.setFontSize(8);
  document.text(`Emitido: ${new Date().toLocaleString('es-AR')}`, 14, 39);
  const filterLines = document.splitTextToSize(`Filtros: ${filters}`, 266); document.text(filterLines, 14, 45);
  const startY = 49 + filterLines.length * 4;
  autoTable(document, { startY, showHead: 'everyPage', head: [['Fecha', 'ID', 'Clase', 'Artículo', 'Depósito', 'Tipo / cantidad', 'Modalidad', 'Origen', 'Estado']], body: rows.map(row => [dateTime(row.fechaMovimiento), `#${row.movimientoStockId}`, row.clase === 'PRODUCTO' ? 'Producto' : 'Insumo', `${row.codigo} · ${row.articulo}`, row.deposito, `${row.tipoMovimiento} · ${row.signo < 0 ? '−' : '+'}${number(row.cantidad)}`, row.modalidad, `${row.entidadOrigen || 'Sin origen'}${row.origenId != null ? ` #${row.origenId}` : ''}`, row.estado]), theme: 'striped', styles: { fontSize: 6.8, cellPadding: 1.8, overflow: 'linebreak' }, headStyles: { fillColor: [63, 81, 64] }, columnStyles: { 3: { cellWidth: 42 }, 4: { cellWidth: 30 } }, margin: { left: 9, right: 9, bottom: 12 } });
  const pages = document.getNumberOfPages(); for (let page = 1; page <= pages; page += 1) { document.setPage(page); document.setFontSize(7); document.setTextColor(120, 113, 108); document.text(`TEKA Manager · Inventario · Página ${page} de ${pages}`, 286, 202, { align: 'right' }); }
  document.save(`TEKA_Movimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
