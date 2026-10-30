import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Supply } from './suppliesApi';
import { formatSupplyName } from './supplyDisplay';

const stamp = () => new Date().toLocaleString('es-AR');
const filenameDate = () => new Date().toISOString().slice(0, 10);
const detail = (items: Supply[]) => items.map(item => ({
  Código: item.codigo,
  Insumo: formatSupplyName(item),
  Tipo: item.tipoInsumoNombre,
  Color: item.colorNombre || 'Sin color',
  Descripción: item.descripcion || '',
  Unidad: item.unidadMedidaNombre,
  Abreviatura: item.unidadMedidaAbreviatura,
  'Stock mínimo': item.stockMinimo,
  Estado: item.activo ? 'Activo' : 'Inactivo',
  'Fecha de alta': item.fechaAlta ? new Date(item.fechaAlta).toLocaleDateString('es-AR') : 'Sin dato',
}));

export function suppliesExcel(items: Supply[], filters: string) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER'], ['Catálogo de insumos'], ['Generado', stamp()], ['Filtros', filters],
    ['Total', items.length], ['Activos', items.filter(item => item.activo).length],
    ['Inactivos', items.filter(item => !item.activo).length], [],
  ]);
  XLSX.utils.sheet_add_json(sheet, detail(items), { origin: 'A9' });
  sheet['!cols'] = [16, 36, 20, 20, 45, 24, 14, 16, 14, 18].map(wch => ({ wch }));
  if (items.length) sheet['!autofilter'] = { ref: `A9:J${9 + items.length}` };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Insumos');
  const groups = [...new Set(items.map(item => item.tipoInsumoNombre))].sort().map(type => ({
    Tipo: type,
    Total: items.filter(item => item.tipoInsumoNombre === type).length,
    Activos: items.filter(item => item.tipoInsumoNombre === type && item.activo).length,
    Inactivos: items.filter(item => item.tipoInsumoNombre === type && !item.activo).length,
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(groups), 'Resumen');
  XLSX.writeFile(workbook, `TEKA_Insumos_${filenameDate()}.xlsx`);
}

export function suppliesPdf(items: Supply[], filters: string) {
  const doc = new jsPDF();
  doc.setFillColor(63, 81, 64); doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('TEKA MANAGER', 14, 15); doc.setFontSize(11); doc.text('Catálogo de insumos', 14, 25);
  doc.setTextColor(41, 37, 36); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('Listado de materiales y características registradas.', 14, 45);
  doc.text(`Generado: ${stamp()}`, 14, 51);
  doc.text(doc.splitTextToSize(`Filtros: ${filters}`, 180), 14, 57);
  const active = items.filter(item => item.activo).length;
  const types = new Set(items.map(item => item.tipoInsumoNombre)).size;
  const metrics = [['Insumos', items.length], ['Activos', active], ['Inactivos', items.length - active], ['Tipos', types]] as const;
  metrics.forEach(([label, value], index) => {
    const x = 14 + index * 47;
    doc.setFillColor(250, 248, 243); doc.setDrawColor(222, 216, 207); doc.roundedRect(x, 72, 43, 22, 3, 3, 'FD');
    doc.setFontSize(8); doc.setTextColor(120, 113, 108); doc.text(label, x + 4, 79);
    doc.setFontSize(14); doc.setTextColor(41, 37, 36); doc.text(String(value), x + 4, 89);
  });
  const counts = [...new Set(items.map(item => item.tipoInsumoNombre))].sort().map(type => [
    type,
    String(items.filter(item => item.tipoInsumoNombre === type).length),
    String(items.filter(item => item.tipoInsumoNombre === type && item.activo).length),
  ]);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(63, 81, 64); doc.text('Distribución por tipo de insumo', 14, 106);
  autoTable(doc, { startY: 111, head: [['Tipo', 'Total', 'Activos']], body: counts,
    theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [63, 81, 64] }, margin: { left: 14, right: 14 } });
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;
  const startY = finalY + 13;
  if (startY > 250) doc.addPage();
  const y = startY > 250 ? 22 : startY;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(63, 81, 64); doc.text('Detalle de insumos', 14, y);
  autoTable(doc, {
    startY: y + 5,
    head: [['Código', 'Insumo', 'Tipo', 'Color', 'Unidad', 'Mín.', 'Estado']],
    body: items.map(item => [item.codigo, formatSupplyName(item), item.tipoInsumoNombre, item.colorNombre || '—', item.unidadMedidaAbreviatura, String(item.stockMinimo), item.activo ? 'Activo' : 'Inactivo']),
    theme: 'striped', styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [63, 81, 64] }, margin: { left: 14, right: 14 },
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFontSize(7); doc.setTextColor(120, 113, 108);
    doc.text(`TEKA Manager · Página ${page} de ${pages}`, 196, 289, { align: 'right' });
  }
  doc.save(`TEKA_Insumos_${filenameDate()}.pdf`);
}
