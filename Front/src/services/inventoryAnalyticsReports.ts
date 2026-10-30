import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ReportColumn = { header: string; key: string; width?: number };
export type ReportRecord = Record<string, string | number | null | undefined>;
export type ReportSummary = { label: string; value: string | number; unit?: string; denominator?: string; description?: string };
export type ReportChart = { title: string; subtitle?: string; kind: 'bar' | 'line'; unit?: string; items: { label: string; value: number }[] };
export type ManagementReport = {
  objective: string;
  responsible?: string;
  period: string;
  executiveSummary: string;
  interpretations: string[];
  limitations?: string[];
  charts?: ReportChart[];
  moduleLabel?: string;
  sourceLabel?: string;
};

const generatedAt = () => new Date().toLocaleString('es-AR');
const filename = (title: string) => `TEKA_${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '_')}_${new Date().toISOString().slice(0, 10)}`;
const GREEN = '3F5140';

function styleCell(sheet: XLSX.WorkSheet, reference: string, style: Record<string, unknown>) {
  if (sheet[reference]) sheet[reference].s = style;
}

function appendSheet(workbook: XLSX.WorkBook, name: string, rows: (string | number)[][], widths: number[], autoFilterRow?: number) {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = widths.map((wch) => ({ wch }));
  if (autoFilterRow && rows.length > autoFilterRow) sheet['!autofilter'] = { ref: `A${autoFilterRow}:${XLSX.utils.encode_col(rows[autoFilterRow - 1].length - 1)}${rows.length}` };
  styleCell(sheet, 'A1', { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16 }, fill: { fgColor: { rgb: GREEN } } });
  XLSX.utils.book_append_sheet(workbook, sheet, name);
  return sheet;
}

export function inventoryAnalyticsExcel(title: string, filters: string, columns: ReportColumn[], records: ReportRecord[], warning?: string, summary: ReportSummary[] = [], management?: ManagementReport) {
  const workbook = XLSX.utils.book_new();
  const stamp = generatedAt();
  const executiveRows: (string | number)[][] = [
    ['TEKA MANAGER'], [title], ['Objetivo', management?.objective || 'Consulta analítica del inventario.'], ['Generado', stamp],
    ...(management?.responsible ? [['Responsable', management.responsible]] : []), ['Período / corte', management?.period || 'Según filtros aplicados'], ['Filtros', filters],
    [], ['Resumen ejecutivo'], [management?.executiveSummary || 'Reporte generado con los datos filtrados disponibles.'],
    [], ['Interpretación'], ...(management?.interpretations?.length ? management.interpretations.map((item) => ['•', item]) : [['Sin interpretación adicional.']]),
    ...(warning ? [[], ['Advertencia', warning]] : []),
    ...(management?.limitations?.length ? [[], ['Limitaciones'], ...management.limitations.map((item) => ['•', item])] : []),
  ];
  const executive = appendSheet(workbook, 'Resumen ejecutivo', executiveRows, [20, 105]);
  styleCell(executive, 'A9', { font: { bold: true, color: { rgb: GREEN }, sz: 13 } });

  const indicatorRows: (string | number)[][] = [['TEKA MANAGER'], [title], [], ['Indicador', 'Valor', 'Unidad', 'Denominador / alcance', 'Descripción'], ...summary.map((item) => [item.label, item.value, item.unit || '', item.denominator || '', item.description || ''])];
  const indicators = appendSheet(workbook, 'Indicadores', indicatorRows, [27, 18, 16, 32, 54], 4);
  ['A4', 'B4', 'C4', 'D4', 'E4'].forEach((cell) => styleCell(indicators, cell, { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: GREEN } } }));
  summary.forEach((item, index) => { if (typeof item.value === 'number') indicators[`B${5 + index}`].z = Number.isInteger(item.value) ? '#,##0' : '#,##0.00'; });

  const dataRows: (string | number)[][] = [['TEKA MANAGER'], [title], ['Generado', stamp], ['Filtros', filters], [], columns.map((column) => column.header), ...records.map((record) => columns.map((column) => record[column.key] ?? '')) as (string | number)[][]];
  const data = appendSheet(workbook, 'Datos completos', dataRows, columns.map((column) => column.width || 16), 6);
  columns.forEach((_, index) => styleCell(data, `${XLSX.utils.encode_col(index)}6`, { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: GREEN } } }));
  records.forEach((record, rowIndex) => columns.forEach((column, columnIndex) => { const value = record[column.key]; if (typeof value === 'number') data[`${XLSX.utils.encode_col(columnIndex)}${7 + rowIndex}`].z = Number.isInteger(value) ? '#,##0' : '#,##0.00'; }));

  if (management?.charts?.length) {
    const analysisRows: (string | number)[][] = [['TEKA MANAGER'], [title], ['Datos utilizados por las visualizaciones del reporte. La versión instalada de SheetJS no genera gráficos nativos de Excel.'], []];
    management.charts.forEach((chart) => {
      analysisRows.push([chart.title], [chart.subtitle || '', chart.unit || ''], ['Categoría', `Valor${chart.unit ? ` (${chart.unit})` : ''}`], ...chart.items.map((item) => [item.label, item.value]), []);
    });
    appendSheet(workbook, 'Análisis', analysisRows, [42, 20]);
  }
  const methodologyRows: (string | number)[][] = [
    ['TEKA MANAGER'], [title], [], ['Metodología y criterios'],
    ['Fuente de datos', management?.sourceLabel || 'Servicios de existencias y movimientos de stock de TEKA Manager.'],
    ['Período', management?.period || 'Según filtros aplicados'],
    ['Filtros', filters],
    ['Criterio de unidades', 'Las cantidades físicas conservan su unidad y no se agregan entre unidades incompatibles.'],
    ...(management?.moduleLabel ? [] : [['Criterio de stock', 'Sin stock: cantidad igual a cero. Crítico: cantidad positiva menor o igual al mínimo. Disponible: cantidad superior al mínimo.']]),
    ['Fecha de generación', stamp],
  ];
  appendSheet(workbook, 'Metodología', methodologyRows, [28, 105]);
  data['!freeze'] = { xSplit: 0, ySplit: 6, topLeftCell: 'A7', activePane: 'bottomLeft', state: 'frozen' } as never;
  workbook.Props = { Title: title, Subject: management?.objective, Author: management?.responsible || 'TEKA Manager', CreatedDate: new Date() };
  XLSX.writeFile(workbook, `${filename(title)}.xlsx`);
}

function drawPageHeader(document: jsPDF, title: string) {
  document.setFillColor(63, 81, 64); document.rect(0, 0, 297, 27, 'F');
  document.setTextColor(255, 255, 255); document.setFont('helvetica', 'bold'); document.setFontSize(16); document.text('TEKA MANAGER', 14, 12);
  document.setFontSize(9); document.text(title, 14, 20);
}

function addWrapped(document: jsPDF, label: string, value: string, y: number, color: [number, number, number] = [41, 37, 36]) {
  document.setTextColor(...color); document.setFont('helvetica', 'bold'); document.setFontSize(8); document.text(label, 14, y);
  document.setFont('helvetica', 'normal'); const lines = document.splitTextToSize(value, 245); document.text(lines, 42, y); return y + Math.max(5, lines.length * 4);
}

function drawIndicators(document: jsPDF, summary: ReportSummary[], startY: number) {
  if (!summary.length) return startY;
  const width = 267 / Math.min(summary.length, 4), rows = Math.ceil(summary.length / 4);
  summary.forEach((item, index) => {
    const column = index % 4, row = Math.floor(index / 4), x = 14 + column * width, y = startY + row * 22;
    document.setFillColor(246, 244, 238); document.setDrawColor(222, 216, 204); document.roundedRect(x, y, width - 4, 18, 2, 2, 'FD');
    document.setTextColor(86, 82, 77); document.setFont('helvetica', 'normal'); document.setFontSize(6.8); document.text(item.label, x + 3, y + 5);
    document.setTextColor(45, 60, 46); document.setFont('helvetica', 'bold'); document.setFontSize(11); document.text(`${item.value}${item.unit ? ` ${item.unit}` : ''}`, x + 3, y + 12);
    if (item.denominator) { document.setTextColor(115, 108, 101); document.setFont('helvetica', 'normal'); document.setFontSize(5.8); document.text(item.denominator, x + 3, y + 16); }
  });
  return startY + rows * 22 + 3;
}

function drawChart(document: jsPDF, chart: ReportChart, startY: number) {
  const x = 14, y = startY, width = 267, height = 53;
  document.setDrawColor(222, 216, 204); document.setFillColor(255, 255, 255); document.roundedRect(x, y, width, height, 2, 2, 'FD');
  document.setTextColor(45, 60, 46); document.setFont('helvetica', 'bold'); document.setFontSize(8.5); document.text(chart.title, x + 4, y + 7);
  if (chart.subtitle) { document.setTextColor(115, 108, 101); document.setFont('helvetica', 'normal'); document.setFontSize(6.2); document.text(document.splitTextToSize(chart.subtitle, 190), x + 4, y + 12); }
  if (!chart.items.length) { document.text('Sin datos para representar.', x + 4, y + 29); return y + height + 5; }
  const plot = { x: x + 16, y: y + 19, w: width - 24, h: 25 };
  const values = chart.items.map((item) => item.value), min = Math.min(0, ...values), max = Math.max(1, ...values), range = max - min || 1;
  const zeroY = plot.y + max / range * plot.h;
  document.setDrawColor(225, 221, 214); document.line(plot.x, zeroY, plot.x + plot.w, zeroY);
  if (chart.kind === 'line') {
    document.setDrawColor(73, 109, 138); document.setLineWidth(.8);
    chart.items.forEach((item, index) => { if (!index) return; const previous = chart.items[index - 1]; const x1 = plot.x + (index - 1) * plot.w / Math.max(1, chart.items.length - 1), x2 = plot.x + index * plot.w / Math.max(1, chart.items.length - 1), y1 = plot.y + (1 - (previous.value - min) / range) * plot.h, y2 = plot.y + (1 - (item.value - min) / range) * plot.h; document.line(x1, y1, x2, y2); });
  } else {
    const slot = plot.w / chart.items.length, bar = Math.max(2, Math.min(15, slot * .65));
    chart.items.forEach((item, index) => { const barHeight = Math.max(.7, Math.abs(item.value) / range * plot.h); document.setFillColor(...(item.value < 0 ? [184, 83, 70] as [number, number, number] : [95, 138, 98] as [number, number, number])); document.rect(plot.x + index * slot + (slot - bar) / 2, item.value >= 0 ? zeroY - barHeight : zeroY, bar, barHeight, 'F'); });
  }
  const labelIndexes = chart.items.length <= 6 ? chart.items.map((_, index) => index) : [0, Math.floor((chart.items.length - 1) / 2), chart.items.length - 1];
  document.setTextColor(110, 104, 98); document.setFont('helvetica', 'normal'); document.setFontSize(5.8);
  labelIndexes.forEach((index) => { const px = plot.x + (chart.kind === 'bar' ? (index + .5) * plot.w / chart.items.length : index * plot.w / Math.max(1, chart.items.length - 1)); document.text(chart.items[index].label.slice(0, 20), px, plot.y + plot.h + 5, { align: 'center' }); });
  document.text(`${min < 0 ? `Rango: ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(min)} a ` : 'Máximo: '}${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(max)}${chart.unit ? ` ${chart.unit}` : ''}`, x + width - 4, y + 7, { align: 'right' });
  return y + height + 5;
}

export function inventoryAnalyticsPdf(title: string, filters: string, columns: ReportColumn[], records: ReportRecord[], warning?: string, summary: ReportSummary[] = [], management?: ManagementReport) {
  const document = new jsPDF({ orientation: 'landscape' });
  drawPageHeader(document, title);
  let y = 35;
  y = addWrapped(document, 'Objetivo', management?.objective || 'Consulta analítica del inventario.', y);
  y = addWrapped(document, 'Emitido', generatedAt(), y);
  if (management?.responsible) y = addWrapped(document, 'Responsable', management.responsible, y);
  y = addWrapped(document, 'Período', management?.period || 'Según filtros aplicados', y);
  y = addWrapped(document, 'Filtros', filters, y);
  document.setTextColor(45, 60, 46); document.setFont('helvetica', 'bold'); document.setFontSize(10); document.text('Resumen ejecutivo', 14, y + 2); y += 7;
  document.setTextColor(41, 37, 36); document.setFont('helvetica', 'normal'); document.setFontSize(8); const executive = document.splitTextToSize(management?.executiveSummary || 'Reporte generado con los datos filtrados disponibles.', 267); document.text(executive, 14, y); y += executive.length * 4 + 4;
  y = drawIndicators(document, summary, y);
  if (warning) { y = addWrapped(document, 'Advertencia', warning, y, [132, 97, 32]); }
  const interpretations = management?.interpretations || [];
  if (interpretations.length) { document.setTextColor(45, 60, 46); document.setFont('helvetica', 'bold'); document.setFontSize(9); document.text('Interpretación', 14, y); y += 5; document.setTextColor(41, 37, 36); document.setFont('helvetica', 'normal'); document.setFontSize(7.5); interpretations.forEach((item) => { const lines = document.splitTextToSize(`• ${item}`, 267); document.text(lines, 14, y); y += lines.length * 3.5 + 1; }); }
  for (const chart of management?.charts || []) { if (y > 140) { document.addPage(); drawPageHeader(document, title); y = 34; } y = drawChart(document, chart, y); }
  if (management?.limitations?.length) { if (y > 170) { document.addPage(); drawPageHeader(document, title); y = 35; } document.setTextColor(132, 97, 32); document.setFont('helvetica', 'bold'); document.setFontSize(8); document.text('Limitaciones', 14, y); y += 5; document.setFont('helvetica', 'normal'); management.limitations.forEach((item) => { const lines = document.splitTextToSize(`• ${item}`, 267); document.text(lines, 14, y); y += lines.length * 3.5 + 1; }); }

  document.addPage(); drawPageHeader(document, `${title} · Datos completos`);
  autoTable(document, { startY: 34, showHead: 'everyPage', head: [columns.map((column) => column.header)], body: records.map((record) => columns.map((column) => record[column.key] ?? '')), theme: 'striped', styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' }, headStyles: { fillColor: [63, 81, 64] }, margin: { left: 9, right: 9, top: 34, bottom: 12 }, didDrawPage: (data) => { if (data.pageNumber > 1) drawPageHeader(document, `${title} · Datos completos`); } });
  const pages = document.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) { document.setPage(page); document.setFontSize(7); document.setTextColor(120, 113, 108); document.text(`TEKA Manager · ${management?.moduleLabel || 'Inventario'} · Página ${page} de ${pages}`, 286, 202, { align: 'right' }); }
  document.setProperties({ title, subject: management?.objective || 'Reporte de inventario', author: management?.responsible || 'TEKA Manager', creator: 'TEKA Manager' });
  document.save(`${filename(title)}.pdf`);
}
