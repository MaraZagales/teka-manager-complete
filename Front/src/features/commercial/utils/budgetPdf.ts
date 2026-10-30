import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PresupuestoDetalle } from "../../../services/commercialOperationsApi";
import { productsApi, type Product } from "../../../services/productsApi";
import { obtenerFichaEcommerce, resolverUrlImagenEcommerce } from "../../../services/ecommerceApi";

const money = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
const date = (s?: string) => s ? new Date(`${s.slice(0, 10)}T12:00:00`).toLocaleDateString("es-AR") : "—";

async function imageData(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight));
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch { resolve(null); }
        finally { URL.revokeObjectURL(objectUrl); }
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
      img.src = objectUrl;
    });
  } catch { return null; }
}

/** Genera el documento usando el catálogo real y la foto principal del producto, si está disponible. */
export async function createBudgetPdf(detail: PresupuestoDetalle, catalog: Product[] = []) {
  const { presupuesto: b, productos } = detail;
  const doc = new jsPDF();
  const number = b.numero || String(b.presupuestoComercialId).padStart(6, "0");
  const enriched = await Promise.all(productos.map(async (p) => {
    let product = catalog.find((item) => item.productoId === p.productoId);
    if (!product) {
      try { product = await productsApi.getById(p.productoId); } catch { /* Producto histórico no disponible en el catálogo. */ }
    }
    const name = product?.nombreCatalogo || product?.nombre || p.nombreCatalogo || p.productoNombre || p.nombre || "Producto sin nombre disponible";
    const color = product?.colorNombre || p.colorNombre || "";
    let photo: string | null = null;
    try {
      const ficha = await obtenerFichaEcommerce(p.productoId);
      const main = [...ficha.imagenes].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal) || a.ordenVisual - b.ordenVisual)[0];
      const url = resolverUrlImagenEcommerce(main?.urlArchivo);
      if (url) photo = await imageData(url);
    } catch { /* Un producto sin ficha o fotografía no impide generar el presupuesto. */ }
    return { p, name, color, photo };
  }));
  doc.setFillColor(36, 111, 82); doc.rect(0, 0, 210, 29, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(19); doc.text("TEKA MUEBLES", 14, 18);
  doc.setTextColor(35, 45, 50); doc.setFontSize(15); doc.text(`Presupuesto N° ${number}`, 14, 42);
  doc.setFontSize(10);
  doc.text(`Cliente: ${[b.clienteNombre, b.clienteApellido].filter(Boolean).join(" ")}`, 14, 52);
  doc.text(`Emisión: ${date(b.fechaEmision)}     Vencimiento: ${date(b.fechaVencimiento)}`, 14, 59);
  doc.text(`Estado: ${b.estado}`, 14, 66);
  const rows = enriched.map(({ p, name, color }) => {
    const total = Number(p.cantidad) * Number(p.precioUnitario) * (1 - Number(p.descuentoPorcentaje || 0) / 100);
    return ["", `${name}${color ? `\nColor: ${color}` : ""}`, String(p.cantidad), money(Number(p.precioUnitario)), `${p.descuentoPorcentaje || 0}%`, money(total)];
  });
  autoTable(doc, {
    startY: 74,
    head: [["Foto", "Mueble / Color", "Cantidad", "Precio unit.", "Desc.", "Subtotal"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [36, 111, 82] },
    styles: { fontSize: 8, valign: "middle", minCellHeight: 23 },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 57 }, 2: { cellWidth: 20, halign: "right" }, 3: { cellWidth: 32, halign: "right" }, 4: { cellWidth: 17, halign: "right" }, 5: { cellWidth: 28, halign: "right" } },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 0) return;
      const photo = enriched[data.row.index]?.photo;
      if (photo) {
        try { doc.addImage(photo, "JPEG", data.cell.x + 2, data.cell.y + 2, 23, 19, undefined, "FAST"); } catch { /* Imagen inválida: continuar. */ }
      }
    },
  });
  const finalY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80;
  const total = productos.reduce((sum, p) => sum + Number(p.cantidad) * Number(p.precioUnitario) * (1 - Number(p.descuentoPorcentaje || 0) / 100), 0);
  let y = finalY + 12;
  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFontSize(13); doc.setTextColor(35, 45, 50); doc.text(`TOTAL: ${money(total)}`, 196, y, { align: "right" });
  if (b.observaciones) {
    const text = doc.splitTextToSize(`Observaciones: ${b.observaciones}`, 175);
    if (y + 10 + text.length * 5 > 278) { doc.addPage(); y = 12; }
    doc.setFontSize(9); doc.text(text, 14, y + 10);
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`TEKA Muebles · Página ${i} de ${pages}`, 14, 287);
  }
  return { doc, filename: `TEKA-Presupuesto-${number}.pdf` };
}
