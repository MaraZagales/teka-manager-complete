/** Exportaciones operativas de Comercial. Los registros se reciben ya filtrados. */
export type ExportColumn<T> = { header: string; value: (row: T) => string | number | null | undefined };
export type ExportFormat = 'excel' | 'pdf';
const safe = (v: unknown) => String(v ?? '—');
export async function exportCommercialList<T>(format: ExportFormat, title: string, filename: string, rows: T[], columns: ExportColumn<T>[], filters: string) {
  const table = rows.map(row => columns.map(col => safe(col.value(row))));
  const generated = new Date().toLocaleString('es-AR');
  if (format === 'excel') {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const headerRow = 6;
    const ws = XLSX.utils.aoa_to_sheet([
      ['TEKA MANAGER'],
      [title],
      [`Generado: ${generated}`],
      [`Filtros aplicados: ${filters}`],
      [`Cantidad de registros: ${rows.length}`],
      [],
      columns.map(c => c.header),
      ...table,
    ]);
    ws['!cols'] = columns.map((column, index) => ({
      wch: Math.min(55, Math.max(14, column.header.length + 2, ...table.map(row => row[index]?.length ?? 0))),
    }));
    if (columns.length) {
      ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: headerRow + rows.length, c: columns.length - 1 } }) };
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Listado');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } else {
    const [{jsPDF}, {default:autoTable}] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF({orientation: columns.length > 5 ? 'landscape' : 'portrait'});
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(63,81,64); doc.rect(0,0,pageWidth,31,'F'); doc.setTextColor(255,255,255);
    doc.setFontSize(17); doc.text('TEKA MANAGER',14,14);
    doc.setFontSize(10); doc.text(title,14,24);
    doc.setTextColor(70,70,70); doc.setFontSize(9);
    doc.text(`Generado: ${generated} · ${rows.length} registros filtrados`,14,40);
    const lines=doc.splitTextToSize(`Filtros aplicados: ${filters}`,pageWidth-28);
    doc.text(lines,14,47);
    autoTable(doc,{startY:51+lines.length*4,head:[columns.map(c=>c.header)],body:table,theme:'grid',styles:{fontSize:8,cellPadding:2,overflow:'linebreak'},headStyles:{fillColor:[111,135,107]},margin:{left:12,right:12,bottom:14}});
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page); doc.setTextColor(105,100,94); doc.setFontSize(8);
      doc.text(`TEKA Manager · Página ${page} de ${totalPages}`,14,doc.internal.pageSize.getHeight()-7);
    }
    doc.save(`${filename}.pdf`);
  }
}
