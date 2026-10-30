import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { stockMovementsApi, type MovementSeriesPoint } from "../../../services/stockMovementsApi";
import { InventoryReportFiltersBar } from "../components/reports/InventoryReportFilters";
import { useInventoryReportData } from "../hooks/useInventoryReportData";
import { filtersFromLocation } from "../utils/reportPresentation";
import "../styles/reports.css";

type ClassSeries = { classCode: "PRODUCTO" | "INSUMO"; points: MovementSeriesPoint[] };

function aggregate(series: ClassSeries[]) {
  const rows = new Map<string, { date: string; classCode: string; entries: number; exits: number }>();
  series.forEach(({ classCode, points }) => points.forEach((point) => {
    const date = point.fecha.slice(0, 10);
    const key = `${classCode}-${date}`;
    const row = rows.get(key) ?? { date, classCode, entries: 0, exits: 0 };
    if (point.signo > 0) row.entries += point.cantidadMovimientos;
    if (point.signo < 0) row.exits += point.cantidadMovimientos;
    rows.set(key, row);
  }));
  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date) || a.classCode.localeCompare(b.classCode));
}

export function InventoryReport3DPage() {
  const [filters, setFilters] = useState(filtersFromLocation);
  const base = useInventoryReportData(filters);
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [series, setSeries] = useState<ClassSeries[]>([]);
  const [error, setError] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => aggregate(series), [series]);

  useEffect(() => {
    let active = true;
    const classes = filters.classCode ? [filters.classCode] : ["PRODUCTO", "INSUMO"] as const;
    Promise.all(classes.map(async (classCode) => ({ classCode, points: await stockMovementsApi.series({ desde: filters.from, hasta: filters.to, clase: classCode, depositoId: filters.depositId ? Number(filters.depositId) : undefined }) })))
      .then((value) => { if (active) { setSeries(value as ClassSeries[]); setError(""); } })
      .catch((caught) => { if (active) { setSeries([]); setError(caught instanceof Error ? caught.message : "No se pudo cargar la serie analítica."); } });
    return () => { active = false; };
  }, [filters]);

  useEffect(() => {
    const element = chartRef.current;
    if (!element || !rows.length) return;
    let disposed = false;
    let plotly: typeof import("plotly.js-dist-min").default | undefined;
    void import("plotly.js-dist-min").then(({ default: Plotly }) => {
      if (disposed || !chartRef.current) return;
      plotly = Plotly;
      const classes = ["PRODUCTO", "INSUMO"];
      const data = mode === "3d" ? [{
        type: "scatter3d", mode: "markers+lines", x: rows.map((row) => row.date), y: rows.map((row) => classes.indexOf(row.classCode)), z: rows.map((row) => row.entries + row.exits),
        text: rows.map((row) => `${row.classCode === "PRODUCTO" ? "Productos terminados" : "Insumos"}<br>${row.entries} entradas · ${row.exits} salidas`), hovertemplate: "%{text}<br>%{x}<extra></extra>", marker: { size: 5, color: rows.map((row) => row.entries - row.exits), colorscale: "RdYlGn" }, line: { color: "#2f8258", width: 3 },
      }] : classes.map((classCode, index) => ({ type: "scatter", mode: "lines+markers", name: index ? "Insumos" : "Productos terminados", x: rows.filter((row) => row.classCode === classCode).map((row) => row.date), y: rows.filter((row) => row.classCode === classCode).map((row) => row.entries + row.exits) }));
      const layout = mode === "3d" ? { margin: { l: 0, r: 0, b: 0, t: 8 }, scene: { xaxis: { title: "Período" }, yaxis: { title: "Clase", tickvals: [0, 1], ticktext: ["Productos", "Insumos"] }, zaxis: { title: "Operaciones" } }, paper_bgcolor: "transparent" } : { margin: { l: 55, r: 20, b: 50, t: 12 }, xaxis: { title: "Período" }, yaxis: { title: "Cantidad de operaciones", rangemode: "tozero" }, paper_bgcolor: "transparent", plot_bgcolor: "transparent", legend: { orientation: "h" } };
      void Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displaylogo: false, scrollZoom: true });
    });
    return () => { disposed = true; if (plotly && element) plotly.purge(element); };
  }, [mode, rows]);

  return <AppShell title="Análisis 3D del inventario" breadcrumb="Inventario / Reportes de inventario / Análisis 3D" backHref="/inventory/reports">
    <main className="inventory-reports-page inventory-report-3d-page">
      <PageHeader title="Análisis 3D del inventario" />

      <InventoryReportFiltersBar value={filters} deposits={base.deposits} onChange={setFilters} />
      <div className="inventory-report-view-toggle"><button className={mode === "3d" ? "active" : ""} onClick={() => setMode("3d")}>Vista 3D</button><button className={mode === "2d" ? "active" : ""} onClick={() => setMode("2d")}>Vista 2D</button></div>
      <section className="inventory-report-plot-card"><header><div><h2>Actividad del inventario por período y clase</h2><p>Rotá, acercá o consultá valores individuales. En 2D se muestran las mismas series.</p></div><Box size={22} /></header>{error ? <div className="inventory-report-empty">{error}</div> : rows.length ? <div ref={chartRef} className="inventory-plotly-chart" /> : <div className="inventory-report-empty">No hay movimientos para representar con los filtros aplicados.</div>}</section>
    </main>
  </AppShell>;
}
