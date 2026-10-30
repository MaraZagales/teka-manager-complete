import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type CatalogReportRow = {
  codigo: string; producto: string; tipo: string; color: string;
  publicacion: string; precio: number | null; stock: number; cupoOnline?: number | null;
  depositos: string; diagnostico: string; portada: string;
};
export type CatalogReportFilters = { busqueda: string; estado: string; publicacion: string; deposito: string };

const currency = (n: number | null) => n === null ? 'Sin precio' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const generated = () => new Date().toLocaleString('es-AR');
const description = (f: CatalogReportFilters) => `Búsqueda: ${f.busqueda || 'Todas'} | Diagnóstico: ${f.estado} | Publicación: ${f.publicacion} | Depósito: ${f.deposito}`;
function counts(rows: CatalogReportRow[]) {
  return {
    total: rows.length,
    publicados: rows.filter(r => r.publicacion === 'Publicado').length,
    ocultos: rows.filter(r => r.publicacion === 'Oculto').length,
    sinConfigurar: rows.filter(r => r.publicacion === 'Sin configurar').length,
    sinPrecio: rows.filter(r => r.precio === null).length,
    sinStock: rows.filter(r => r.stock <= 0).length,
    sinPortada: rows.filter(r => !r.portada).length,
  };
}
function reasons(r: CatalogReportRow) {
  const items: string[] = [];
  if (r.publicacion === 'Sin configurar') items.push('Sin configurar');
  if (r.precio === null) items.push('Sin precio vigente');
  if (r.stock <= 0) items.push('Sin existencias');
  if (!r.portada) items.push('Sin portada');
  return items.join('; ') || 'Sin incidencias básicas detectadas';
}
export function exportCatalogExcel(rows: CatalogReportRow[], filters: CatalogReportFilters) {
  const c = counts(rows);
  const wb = XLSX.utils.book_new();
  const overview = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER | Catálogo online'], ['Generado', generated()], ['Filtros', description(filters)], [],
    ['Indicador', 'Cantidad'], ['Productos filtrados', c.total], ['Publicados', c.publicados],
    ['Ocultos', c.ocultos], ['Sin configurar', c.sinConfigurar], ['Sin precio vigente', c.sinPrecio],
    ['Sin existencias', c.sinStock], ['Sin portada', c.sinPortada],
    [], ['Nota', 'Los controles de portada, precio y stock no sustituyen las validaciones completas del backend.'],
  ]);
  overview['!cols'] = [{ wch: 27 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(wb, overview, 'Resumen');
  const detail = XLSX.utils.json_to_sheet(rows.map(r => ({
    Código: r.codigo, Producto: r.producto, Tipo: r.tipo, Color: r.color,
    Publicación: r.publicacion, 'Precio vigente (ARS)': r.precio ?? '',
    'Stock físico consultado': r.stock, 'Cupo online': r.cupoOnline === undefined ? 'No disponible' : r.cupoOnline ?? '', Depósitos: r.depositos, Diagnóstico: r.diagnostico,
    Portada: r.portada ? 'Registrada' : 'Sin portada', Observaciones: reasons(r),
  })));
  detail['!cols'] = [16, 35, 22, 20, 18, 23, 19, 18, 32, 25, 19, 54].map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(wb, detail, 'Detalle');
  XLSX.writeFile(wb, 'TEKA_Catalogo_Online.xlsx');
}
export function exportCatalogPdf(rows: CatalogReportRow[], filters: CatalogReportFilters) {
  const c = counts(rows);
  const pdf = new jsPDF({ orientation: 'landscape' });
  const width = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(63, 81, 64); pdf.rect(0, 0, width, 34, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(17);
  pdf.text('TEKA MANAGER', 14, 14); pdf.setFontSize(12); pdf.text('Preparación del catálogo online', 14, 24);
  pdf.setTextColor(50, 48, 45); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
  pdf.text(`Generado: ${generated()}`, 14, 43);
  const lines = pdf.splitTextToSize(description(filters), width - 28);
  pdf.text(lines, 14, 50);
  const metricsY = 57 + lines.length * 4;
  const metrics = [ ['Productos', c.total], ['Publicados', c.publicados], ['Ocultos', c.ocultos], ['Sin configurar', c.sinConfigurar], ['Sin precio', c.sinPrecio], ['Sin stock', c.sinStock], ['Sin portada', c.sinPortada] ] as const;
  const boxW = (width - 28 - 6 * 3) / 7;
  metrics.forEach(([label, value], i) => {
    const x = 14 + i * (boxW + 3);
    pdf.setFillColor(248, 246, 241); pdf.setDrawColor(224, 218, 208); pdf.roundedRect(x, metricsY, boxW, 21, 2, 2, 'FD');
    pdf.setFontSize(7); pdf.setTextColor(110, 105, 97); pdf.text(label, x + 3, metricsY + 7);
    pdf.setFontSize(13); pdf.setTextColor(42, 52, 43); pdf.setFont('helvetica', 'bold'); pdf.text(String(value), x + 3, metricsY + 16); pdf.setFont('helvetica', 'normal');
  });
  pdf.setFontSize(8); pdf.setTextColor(80, 76, 70);
  pdf.text('Incidencias básicas detectadas sobre los productos filtrados. La elegibilidad final para publicar se valida en la API.', 14, metricsY + 29);
  autoTable(pdf, {
    startY: metricsY + 34,
    head: [['Código', 'Producto', 'Publicación', 'Precio', 'Stock físico', 'Cupo online', 'Diagnóstico', 'Observaciones']],
    body: rows.map(r => [r.codigo, r.producto, r.publicacion, currency(r.precio), String(r.stock), r.cupoOnline === undefined ? 'No disponible' : r.cupoOnline === null ? 'Sin configurar' : String(r.cupoOnline), r.diagnostico, reasons(r)]),
    styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [63, 81, 64] },
    columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 43 }, 2: { cellWidth: 26 }, 3: { cellWidth: 32 }, 4: { cellWidth: 18 }, 5: { cellWidth: 20 }, 6: { cellWidth: 35 } },
    margin: { left: 14, right: 14, bottom: 17 },
  });
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p); pdf.setFontSize(8); pdf.setTextColor(120, 113, 108);
    pdf.text(`TEKA | Catálogo online · Página ${p} de ${totalPages}`, 14, pdf.internal.pageSize.getHeight() - 8);
  }
  pdf.save('TEKA_Reporte_Preparacion_Catalogo.pdf');
}
