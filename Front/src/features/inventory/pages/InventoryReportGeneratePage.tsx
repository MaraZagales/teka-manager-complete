import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { inventoryAnalyticsExcel, inventoryAnalyticsPdf, type ManagementReport, type ReportChart, type ReportColumn, type ReportRecord, type ReportSummary } from "../../../services/inventoryAnalyticsReports";
import { getSession } from "../../../services/session";
import { InventoryReportFiltersBar } from "../components/reports/InventoryReportFilters";
import { useInventoryReportData } from "../hooks/useInventoryReportData";
import { filtersFromLocation, stockStateLabel } from "../utils/reportPresentation";
import "../styles/reports.css";

type ReportType = "summary" | "stock" | "movements" | "consumption" | "risk";
type Format = "pdf" | "excel";
const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function InventoryReportGeneratePage() {
  const [filters, setFilters] = useState(filtersFromLocation);
  const [type, setType] = useState<ReportType>("summary");
  const [format, setFormat] = useState<Format>("pdf");
  const [generating, setGenerating] = useState(false);
  const data = useInventoryReportData(filters);
  const session = getSession();
  const responsible = session?.usuario ? `${session.usuario.nombre} ${session.usuario.apellido || ""}`.trim() : undefined;
  const metrics = useMemo(() => ({ active: data.stock.filter((row) => row.active).length, critical: data.stock.filter((row) => row.active && row.state === "critical").length, out: data.stock.filter((row) => row.active && row.state === "out").length, available: data.stock.filter((row) => row.active && row.state === "available").length }), [data.stock]);

  function generate() {
    if (data.loading || data.error) return;
    setGenerating(true);
    try {
      let title = "Resumen ejecutivo de inventario";
      let columns: ReportColumn[] = [];
      let records: ReportRecord[] = [];
      let charts: ReportChart[] = [];
      const summary: ReportSummary[] = [{ label: "Artículos activos", value: metrics.active }, { label: "Stock crítico", value: metrics.critical }, { label: "Sin stock", value: metrics.out }, { label: "Stock disponible", value: metrics.available }];
      if (type === "movements") {
        title = "Movimientos de stock";
        columns = [{ key: "fecha", header: "Fecha" }, { key: "codigo", header: "Código" }, { key: "articulo", header: "Artículo", width: 32 }, { key: "movimiento", header: "Movimiento" }, { key: "cantidad", header: "Cantidad" }, { key: "motivo", header: "Motivo", width: 30 }];
        records = data.movements.map((row) => ({ fecha: new Date(row.fechaMovimiento).toLocaleString("es-AR"), codigo: row.codigo, articulo: row.articulo, movimiento: row.tipoMovimiento, cantidad: row.cantidad, motivo: row.motivo || "" }));
        charts = [{ title: "Operaciones por fecha", subtitle: "Conteo de operaciones; no suma unidades físicas.", kind: "line", unit: "operaciones", items: data.movementSeries.map((row) => ({ label: row.fecha.slice(0, 10), value: row.cantidadMovimientos })) }];
      } else if (type === "consumption") {
        title = "Consumo de insumos";
        columns = [{ key: "codigo", header: "Código" }, { key: "articulo", header: "Insumo", width: 34 }, { key: "cantidad", header: "Cantidad" }, { key: "unidad", header: "Unidad" }, { key: "movimientos", header: "Movimientos" }, { key: "origen", header: "Origen", width: 28 }];
        records = data.consumption.map((row) => ({ codigo: row.code, articulo: row.name, cantidad: row.quantity, unidad: row.unit, movimientos: row.movements, origen: row.origins.join(", ") }));
        charts = [{ title: "Frecuencia de consumo", subtitle: "Cantidad de movimientos de salida por insumo.", kind: "bar", unit: "movimientos", items: data.consumption.slice(0, 10).map((row) => ({ label: row.name, value: row.movements })) }];
      } else {
        const selected = type === "risk" ? data.stock.filter((row) => row.state === "critical" || row.state === "out") : data.stock;
        title = type === "risk" ? "Riesgo de faltantes" : type === "stock" ? "Estado de existencias" : title;
        columns = [{ key: "codigo", header: "Código" }, { key: "articulo", header: "Artículo", width: 34 }, { key: "clase", header: "Clase" }, { key: "stock", header: "Stock actual" }, { key: "minimo", header: "Stock mínimo" }, { key: "unidad", header: "Unidad" }, { key: "estado", header: "Estado" }];
        records = selected.map((row) => ({ codigo: row.code, articulo: row.name, clase: row.classCode === "PRODUCTO" ? "Producto terminado" : "Insumo", stock: row.quantity, minimo: row.minimum ?? "Sin configurar", unidad: row.unit, estado: stockStateLabel[row.state] }));
        charts = [{ title: "Artículos por estado", subtitle: "Clasificación excluyente del stock actual.", kind: "bar", unit: "artículos", items: [{ label: "Disponible", value: metrics.available }, { label: "Crítico", value: metrics.critical }, { label: "Sin stock", value: metrics.out }] }];
      }
      const management: ManagementReport = { objective: "Brindar información verificable para la gestión del inventario.", responsible, period: `${filters.from} a ${filters.to}`, executiveSummary: `${metrics.critical} artículos presentan stock crítico y ${metrics.out} no registran existencias dentro del alcance actual.`, interpretations: [metrics.critical + metrics.out ? "Existen artículos que requieren revisión operativa; el reporte no genera compras ni producción automáticamente." : "No se detectaron faltantes ni artículos críticos dentro del alcance seleccionado."], limitations: ["Las cantidades físicas conservan su unidad de medida y no se suman entre unidades incompatibles.", "Los indicadores de stock representan la situación actual; el período se aplica a movimientos y consumo."], charts };
      const method = format === "pdf" ? inventoryAnalyticsPdf : inventoryAnalyticsExcel;
      method(title, `Depósito: ${filters.depositId || "Todos"} · Clase: ${filters.classCode || "Todas"}`, columns, records, undefined, summary, management);
    } finally { setGenerating(false); }
  }

  return <AppShell title="Generar informe" breadcrumb="Inventario / Reportes de inventario / Generar informe" backHref="/inventory/reports">
    <main className="inventory-reports-page inventory-report-generator">
      <PageHeader title="Generar informe" />
      <section className="inventory-report-form-card inventory-report-filter-card"><h2>1. Filtros</h2><InventoryReportFiltersBar value={filters} deposits={data.deposits} onChange={setFilters} /></section>
      <div className="inventory-report-generator-grid"><section className="inventory-report-form-card"><h2>2. Tipo de informe</h2>{([ ["summary", "Resumen ejecutivo", "Indicadores, gráficos y lectura general."], ["stock", "Estado de existencias", "Stock actual, mínimo y clasificación."], ["movements", "Movimientos de stock", "Actividad completa del período."], ["consumption", "Consumo de insumos", "Salidas por material y unidad."], ["risk", "Riesgo de faltantes", "Artículos críticos y sin stock."] ] as [ReportType, string, string][]).map(([value, label, text]) => <label className={type === value ? "selected" : ""} key={value}><input type="radio" name="report" checked={type === value} onChange={() => setType(value)} /><span><strong>{label}</strong><small>{text}</small></span></label>)}</section><section className="inventory-report-form-card"><h2>3. Formato de exportación</h2><label className={format === "pdf" ? "selected" : ""}><input type="radio" name="format" checked={format === "pdf"} onChange={() => setFormat("pdf")} /><FileText /><span><strong>PDF</strong><small>Informe institucional con indicadores, interpretación, gráfico y detalle.</small></span></label><label className={format === "excel" ? "selected" : ""}><input type="radio" name="format" checked={format === "excel"} onChange={() => setFormat("excel")} /><FileSpreadsheet /><span><strong>Excel</strong><small>Resumen, indicadores, datos completos y análisis.</small></span></label></section></div>
      {data.error && <div className="inventory-report-error" role="alert">{data.error}</div>}
      <div className="inventory-report-generate-action"><button className="button primary" disabled={data.loading || generating || !!data.error} onClick={generate}>{format === "pdf" ? <FileText size={17} /> : <FileSpreadsheet size={17} />} {generating ? "Generando…" : `Generar informe ${format.toUpperCase()}`}</button></div>
    </main>
  </AppShell>;
}
