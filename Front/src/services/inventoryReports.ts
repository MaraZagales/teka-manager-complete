import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type InventoryReportState = 'Sin stock' | 'Crítico' | 'Normal';

export type InventoryReportRow = {
  code: string;
  name: string;
  category: string;
  deposit: string;
  quantity: number;
  unit: string;
  minimum: number;
  state: InventoryReportState;
};

const stamp = () => new Date().toLocaleString('es-AR');
const filenameDate = () => new Date().toISOString().slice(0, 10);
const number = (value: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);

export function inventoryExcel(rows: InventoryReportRow[], title: string, filters: string) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ['TEKA MANAGER'],
    [`Existencias · ${title}`],
    ['Generado', stamp()],
    ['Filtros', filters],
    ['Artículos', rows.length],
    ['Sin stock', rows.filter(row => row.state === 'Sin stock').length],
    ['Stock crítico', rows.filter(row => row.state === 'Crítico').length],
    ['Stock normal', rows.filter(row => row.state === 'Normal').length],
    [],
  ]);
  XLSX.utils.sheet_add_json(sheet, rows.map(row => ({
    Código: row.code,
    Artículo: row.name,
    'Categoría / tipo': row.category,
    Depósito: row.deposit,
    Existencia: row.quantity,
    Unidad: row.unit,
    'Stock mínimo actual': row.minimum,
    Estado: row.state,
  })), { origin: 'A10' });
  sheet['!cols'] = [16, 38, 24, 24, 16, 15, 20, 16].map(wch => ({ wch }));
  if (rows.length) sheet['!autofilter'] = { ref: `A10:H${10 + rows.length}` };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Existencias');
  XLSX.writeFile(workbook, `TEKA_Existencias_${title.replace(/\s+/g, '_')}_${filenameDate()}.xlsx`);
}

export function inventoryPdf(rows: InventoryReportRow[], title: string, filters: string) {
  const document = new jsPDF({ orientation: 'landscape' });
  document.setFillColor(63, 81, 64);
  document.rect(0, 0, 297, 34, 'F');
  document.setTextColor(255, 255, 255);
  document.setFont('helvetica', 'bold');
  document.setFontSize(18);
  document.text('TEKA MANAGER', 14, 14);
  document.setFontSize(11);
  document.text(`Existencias · ${title}`, 14, 24);

  document.setTextColor(41, 37, 36);
  document.setFont('helvetica', 'normal');
  document.setFontSize(8);
  document.text(`Emitido: ${stamp()}`, 14, 43);
  document.text(document.splitTextToSize(`Filtros aplicados: ${filters}`, 260), 14, 49);

  const totals = [
    ['Artículos', rows.length],
    ['Sin stock', rows.filter(row => row.state === 'Sin stock').length],
    ['Críticos', rows.filter(row => row.state === 'Crítico').length],
    ['Normales', rows.filter(row => row.state === 'Normal').length],
  ] as const;
  totals.forEach(([label, value], index) => {
    const x = 14 + index * 48;
    document.setFillColor(250, 248, 243);
    document.setDrawColor(222, 216, 207);
    document.roundedRect(x, 61, 43, 20, 3, 3, 'FD');
    document.setTextColor(120, 113, 108);
    document.setFontSize(8);
    document.text(label, x + 4, 68);
    document.setTextColor(41, 37, 36);
    document.setFontSize(13);
    document.text(String(value), x + 4, 77);
  });

  autoTable(document, {
    startY: 90,
    head: [['Código', 'Artículo', 'Categoría / tipo', 'Depósito', 'Existencia', 'Unidad', 'Mínimo', 'Estado']],
    body: rows.map(row => [row.code, row.name, row.category, row.deposit, number(row.quantity), row.unit, number(row.minimum), row.state]),
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    headStyles: { fillColor: [63, 81, 64] },
    columnStyles: { 4: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  const pages = document.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    document.setPage(page);
    document.setFontSize(7);
    document.setTextColor(120, 113, 108);
    document.text(`TEKA Manager · Inventario · Página ${page} de ${pages}`, 283, 201, { align: 'right' });
  }
  document.save(`TEKA_Existencias_${title.replace(/\s+/g, '_')}_${filenameDate()}.pdf`);
}
