import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type HistoricalReportRow = {
  code: string; name: string; deposit: string; unit: string; dateLabel: string;
  initial?: number; entries?: number; exits?: number; net?: number; final: number;
  movements?: number; trend?: string;
};

const generatedAt = () => new Date().toLocaleString('es-AR');
const filenameDate = () => new Date().toISOString().slice(0, 10);
const formatNumber = (value: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);

function headings(mode: 'period' | 'cutoff') {
  return mode === 'period'
    ? ['Código', 'Artículo', 'Depósito', 'Unidad', 'Período', 'Saldo inicial', 'Entradas', 'Salidas', 'Variación', 'Saldo final', 'Movimientos', 'Tendencia']
    : ['Código', 'Artículo', 'Depósito', 'Unidad', 'Fecha de corte', 'Saldo histórico'];
}

function values(row: HistoricalReportRow, mode: 'period' | 'cutoff') {
  return mode === 'period'
    ? [row.code, row.name, row.deposit, row.unit, row.dateLabel, row.initial, row.entries, row.exits, row.net, row.final, row.movements, row.trend]
    : [row.code, row.name, row.deposit, row.unit, row.dateLabel, row.final];
}

export function inventoryHistoryExcel(rows: HistoricalReportRow[], mode: 'period' | 'cutoff', title: string, filters: string, unbalanced: boolean) {
  const workbook = XLSX.utils.book_new();
  const warning = unbalanced ? 'Datos históricos de prueba pendientes de conciliación. Los saldos pueden diferir del stock actual.' : 'Historial conciliado';
  const sheet = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER'], [title], ['Generado', generatedAt()], ['Filtros', filters], ['Estado del historial', warning], [], headings(mode),
    ...rows.map(row => values(row, mode)),
  ]);
  sheet['!cols'] = headings(mode).map((_, index) => ({ wch: index === 1 ? 34 : index === 2 ? 24 : 16 }));
  if (rows.length) sheet['!autofilter'] = { ref: `A7:${XLSX.utils.encode_col(headings(mode).length - 1)}${7 + rows.length}` };
  XLSX.utils.book_append_sheet(workbook, sheet, mode === 'period' ? 'Actividad' : 'Stock histórico');
  XLSX.writeFile(workbook, `TEKA_${mode === 'period' ? 'Actividad' : 'Stock_Historico'}_${filenameDate()}.xlsx`);
}

export function inventoryHistoryPdf(rows: HistoricalReportRow[], mode: 'period' | 'cutoff', title: string, filters: string, unbalanced: boolean) {
  const document = new jsPDF({ orientation: 'landscape' });
  document.setFillColor(63, 81, 64); document.rect(0, 0, 297, 32, 'F');
  document.setTextColor(255, 255, 255); document.setFont('helvetica', 'bold'); document.setFontSize(17); document.text('TEKA MANAGER', 14, 13);
  document.setFontSize(10); document.text(title, 14, 23);
  document.setTextColor(41, 37, 36); document.setFont('helvetica', 'normal'); document.setFontSize(8);
  document.text(`Emitido: ${generatedAt()}`, 14, 41); document.text(document.splitTextToSize(`Filtros: ${filters}`, 265), 14, 47);
  if (unbalanced) { document.setTextColor(132, 97, 32); document.text('Datos históricos de prueba pendientes de conciliación. Los saldos pueden diferir del stock actual.', 14, 57); }
  autoTable(document, {
    startY: unbalanced ? 64 : 57, head: [headings(mode)],
    body: rows.map(row => values(row, mode).map((value, index) => typeof value === 'number' && index > 3 ? formatNumber(value) : value ?? '')),
    theme: 'striped', styles: { fontSize: mode === 'period' ? 6.7 : 8, cellPadding: 2 }, headStyles: { fillColor: [63, 81, 64] }, margin: { left: 10, right: 10 },
  });
  const pages = document.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) { document.setPage(page); document.setFontSize(7); document.setTextColor(120, 113, 108); document.text(`TEKA Manager · Inventario · Página ${page} de ${pages}`, 285, 201, { align: 'right' }); }
  document.save(`TEKA_${mode === 'period' ? 'Actividad' : 'Stock_Historico'}_${filenameDate()}.pdf`);
}
