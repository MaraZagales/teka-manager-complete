import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Product } from './productsApi';
import { formatProductName } from './productDisplay';

const stamp = () => new Date().toLocaleString('es-AR');
const filenameDate = () => new Date().toISOString().slice(0, 10);
const dimension = (v?: number | null) => v == null ? 'Sin dato' : v;
const detail = (items: Product[]) => items.map(p => ({
  Código: p.codigo, Producto: formatProductName(p), Categoría: p.tipoProductoNombre,
  Color: p.colorNombre || 'Sin color', Descripción: p.descripcion || '',
  'Stock mínimo': p.stockMinimo, Estado: p.activo ? 'Activo' : 'Inactivo',
  'Ancho (cm)': dimension(p.anchoCm), 'Alto (cm)': dimension(p.altoCm),
  'Profundidad (cm)': dimension(p.profundidadCm), 'Fecha de alta': p.fechaAlta ? new Date(p.fechaAlta).toLocaleDateString('es-AR') : 'Sin dato',
}));
export function productsExcel(items: Product[], filters: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER'], ['Catálogo de productos'], ['Generado', stamp()], ['Filtros', filters],
    ['Total', items.length], ['Activos', items.filter(p => p.activo).length], ['Inactivos', items.filter(p => !p.activo).length], [],
  ]);
  XLSX.utils.sheet_add_json(ws, detail(items), { origin: 'A9' });
  ws['!cols'] = [16, 36, 20, 20, 45, 16, 14, 16, 16, 20, 20].map(wch => ({ wch }));
  if (items.length) ws['!autofilter'] = { ref: `A9:K${9 + items.length}` };
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  const groups = [...new Set(items.map(p => p.tipoProductoNombre))].sort().map(category => ({
    Categoría: category, Total: items.filter(p => p.tipoProductoNombre === category).length,
    Activos: items.filter(p => p.tipoProductoNombre === category && p.activo).length,
    Inactivos: items.filter(p => p.tipoProductoNombre === category && !p.activo).length,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groups), 'Resumen');
  XLSX.writeFile(wb, `TEKA_Productos_${filenameDate()}.xlsx`);
}
export function productsPdf(items: Product[], filters: string) {
  const doc = new jsPDF();
  doc.setFillColor(63, 81, 64); doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('TEKA MANAGER', 14, 15); doc.setFontSize(11); doc.text('Catálogo de productos', 14, 25);
  doc.setTextColor(41, 37, 36); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('Listado de productos y características registradas.', 14, 45);
  doc.text(`Generado: ${stamp()}`, 14, 51);
  doc.text(doc.splitTextToSize(`Filtros: ${filters}`, 180), 14, 57);
  const active = items.filter(p => p.activo).length;
  const categories = new Set(items.map(p => p.tipoProductoNombre)).size;
  const metrics = [['Productos', items.length], ['Activos', active], ['Inactivos', items.length - active], ['Categorías', categories]] as const;
  metrics.forEach(([label, value], i) => {
    const x = 14 + i * 47;
    doc.setFillColor(250, 248, 243); doc.setDrawColor(222, 216, 207); doc.roundedRect(x, 72, 43, 22, 3, 3, 'FD');
    doc.setFontSize(8); doc.setTextColor(120, 113, 108); doc.text(label, x + 4, 79);
    doc.setFontSize(14); doc.setTextColor(41, 37, 36); doc.text(String(value), x + 4, 89);
  });
  const counts = [...new Set(items.map(p => p.tipoProductoNombre))].sort().map(category => [category,
    String(items.filter(p => p.tipoProductoNombre === category).length),
    String(items.filter(p => p.tipoProductoNombre === category && p.activo).length)]);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(63, 81, 64); doc.text('Distribución por categoría', 14, 106);
  autoTable(doc, { startY: 111, head: [['Categoría', 'Total', 'Activos']], body: counts,
    theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [63,81,64] }, margin: { left: 14, right: 14 } });
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;
  const startY = finalY + 13;
  if (startY > 250) doc.addPage();
  const y = startY > 250 ? 22 : startY;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(63,81,64); doc.text('Detalle de productos', 14, y);
  autoTable(doc, { startY: y + 5, head: [['Código', 'Producto', 'Categoría', 'Color', 'Mín.', 'Estado']],
    body: items.map(p => [p.codigo, formatProductName(p), p.tipoProductoNombre, p.colorNombre || '—', String(p.stockMinimo), p.activo ? 'Activo' : 'Inactivo']),
    theme: 'striped', styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [63,81,64] }, margin: { left: 14, right: 14 } });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(120,113,108); doc.text(`TEKA Manager · Página ${i} de ${pages}`, 196, 289, { align: 'right' }); }
  doc.save(`TEKA_Productos_${filenameDate()}.pdf`);
}
