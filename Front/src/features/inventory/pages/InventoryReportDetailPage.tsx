import { useMemo } from "react";
import { Download } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { hasPermission } from "../../../services/authorization";
import { inventoryAnalyticsExcel, inventoryAnalyticsPdf, type ReportColumn, type ReportRecord, type ReportSummary } from "../../../services/inventoryAnalyticsReports";
import { useInventoryReportData } from "../hooks/useInventoryReportData";
import type { InventoryReportKey, InventoryReportStockRow } from "../types/reports";
import { filtersFromLocation, stockStateLabel, isNegativeAdjustment } from "../utils/reportPresentation";
import { ConsumptionChart, StatusChart, MovementChart, RiskChart, StockStateDonut, SupplyRiskList } from "../components/reports/InventoryReportVisuals";
import "../styles/reports.css";

const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const definitions: Record<InventoryReportKey, { title: string; meaning: string; formula: string }> = {
  "product-state": { title: "Estado de productos terminados", meaning: "Distribución de referencias de muebles según el estado actual de existencias.", formula: "Se cuenta cada referencia activa por estado; sin mínimo configurado se identifica por separado." },
  "supply-state": { title: "Estado de abastecimiento de insumos", meaning: "Situación de existencias de los materiales, sin mezclar productos terminados.", formula: "Se cuentan referencias activas de insumos por estado actual; no se suman unidades físicas." },
  adjustments: { title: "Ajustes negativos", meaning: "Operaciones de ajuste identificadas que disminuyeron las existencias durante el período.", formula: "Movimientos vigentes de signo negativo cuyo tipo contiene «ajuste»; no incluye salidas ordinarias ni reversas. No equivale a pérdidas comprobadas." },
  active: { title: "Artículos activos", meaning: "Maestros habilitados dentro de la clase y depósito seleccionados.", formula: "Cantidad de productos e insumos con estado administrativo activo. Si se filtra un depósito, se consideran los artículos con una posición de stock en ese depósito." },
  critical: { title: "Insumos críticos", meaning: "Insumos activos con stock positivo que alcanzó o quedó por debajo del mínimo configurado.", formula: "Stock actual > 0 y stock actual ≤ stock mínimo. Los artículos sin stock se excluyen para evitar duplicaciones." },
  out: { title: "Sin stock", meaning: "Artículos activos sin existencia física dentro del alcance seleccionado.", formula: "Stock actual consolidado = 0." },
  available: { title: "Productos terminados con stock", meaning: "Referencias de productos terminados con existencia física positiva, no necesariamente libre para venta.", formula: "Producto activo con stock actual > 0." },
  status: { title: "Productos terminados con más stock", meaning: "Muebles con mayor existencia física actual.", formula: "Cinco referencias activas con mayor cantidad física en stock, sin sumar unidades entre artículos." },
  movements: { title: "Evolución de movimientos", meaning: "Actividad registrada durante el período seleccionado.", formula: "Conteo de movimientos vigentes agrupados por fecha y signo. No suma cantidades de unidades incompatibles." },
  risk: { title: "Insumos con riesgo de faltante", meaning: "Prioriza los insumos con mayor faltante relativo respecto de su mínimo.", formula: "Déficit relativo = máximo(stock mínimo − stock actual, 0) / stock mínimo." },
  consumption: { title: "Salidas de insumos", meaning: "Salidas de insumos registradas durante el período, con sus orígenes informados.", formula: "Suma de cantidades de movimientos de insumos con signo negativo, agrupada por artículo. Las unidades se conservan y no se mezclan." },
};

function stockRowsFor(key: InventoryReportKey, rows: InventoryReportStockRow[]) {
  if (key === "product-state") return rows.filter(row => row.active && row.classCode === "PRODUCTO");
  if (key === "supply-state") return rows.filter(row => row.active && row.classCode === "INSUMO");
  if (key === "active") return rows.filter((row) => row.active);
  if (key === "critical") return rows.filter((row) => row.active && row.classCode === "INSUMO" && row.state === "critical");
  if (key === "out") return rows.filter((row) => row.active && row.state === "out");
  if (key === "available" || key === "status") return rows.filter((row) => row.active && row.classCode === "PRODUCTO" && row.quantity > 0).sort((a,b) => b.quantity - a.quantity);
  if (key === "risk") return rows.filter((row) => row.active && row.classCode === "INSUMO" && row.minimum != null && row.minimum > 0 && row.quantity < row.minimum).sort((a, b) => ((b.minimum ?? 0) ? ((b.minimum ?? 0) - b.quantity) / (b.minimum ?? 1) : 0) - ((a.minimum ?? 0) ? ((a.minimum ?? 0) - a.quantity) / (a.minimum ?? 1) : 0));
  return rows;
}

export function InventoryReportDetailPage({ reportKey }: { reportKey: InventoryReportKey }) {
  const filters = useMemo(filtersFromLocation, []);
  const data = useInventoryReportData(filters);
  const definition = definitions[reportKey];
  const stockRows = stockRowsFor(reportKey, data.stock);
  const isMovement = reportKey === "movements" || reportKey === "adjustments";
  const displayedMovements = reportKey === "adjustments" ? data.movements.filter(isNegativeAdjustment) : data.movements;
  const isConsumption = reportKey === "consumption";
  const total = isMovement ? displayedMovements.length : isConsumption ? data.consumption.length : stockRows.length;
  const productCount = stockRows.filter((row) => row.classCode === "PRODUCTO").length;
  const supplyCount = stockRows.filter((row) => row.classCode === "INSUMO").length;
  const canExport = hasPermission("Inventario", "Exportar");

  const interpretation = data.loading ? "Calculando resultados…" : total === 0 ? "No hay registros que cumplan los criterios dentro del alcance seleccionado." : reportKey === "critical" || reportKey === "risk" ? `${total} insumos están por debajo del mínimo configurado.` : reportKey === "out" ? `${total} artículos no registran existencia física en el alcance seleccionado.` : reportKey === "adjustments" ? `${total} ajustes negativos identificados en el período; no se consideran pérdidas comprobadas.` : reportKey === "movements" ? `Se registraron ${data.movementSummary.cantidadEntradas} operaciones de entrada y ${data.movementSummary.cantidadSalidas} de salida.` : reportKey === "consumption" ? `${total} insumos tuvieron movimientos de salida; las cantidades se presentan en su unidad original.` : `${total} artículos respaldan el resultado del análisis.`;

  function exportReport(format: "pdf" | "excel") {
    const columns: ReportColumn[] = isMovement ? [{ key: "fecha", header: "Fecha" }, { key: "articulo", header: "Artículo", width: 32 }, { key: "movimiento", header: "Movimiento" }, { key: "cantidad", header: "Cantidad" }, { key: "motivo", header: "Motivo", width: 35 }] : isConsumption ? [{ key: "codigo", header: "Código" }, { key: "articulo", header: "Insumo", width: 32 }, { key: "cantidad", header: "Cantidad" }, { key: "unidad", header: "Unidad" }, { key: "movimientos", header: "Movimientos" }, { key: "origen", header: "Origen", width: 28 }] : [{ key: "codigo", header: "Código" }, { key: "articulo", header: "Artículo", width: 32 }, { key: "clase", header: "Clase" }, { key: "stock", header: "Stock actual" }, { key: "minimo", header: "Stock mínimo" }, { key: "unidad", header: "Unidad" }, { key: "estado", header: "Estado" }];
    const records: ReportRecord[] = isMovement ? displayedMovements.map((row) => ({ fecha: new Date(row.fechaMovimiento).toLocaleString("es-AR"), articulo: `${row.codigo} · ${row.articulo}`, movimiento: row.tipoMovimiento, cantidad: row.cantidad, motivo: row.motivo || "" })) : isConsumption ? data.consumption.map((row) => ({ codigo: row.code, articulo: row.name, cantidad: row.quantity, unidad: row.unit, movimientos: row.movements, origen: row.origins.join(", ") })) : stockRows.map((row) => ({ codigo: row.code, articulo: row.name, clase: row.classCode === "PRODUCTO" ? "Producto terminado" : "Insumo", stock: row.quantity, minimo: row.minimum ?? "Sin configurar", unidad: row.unit, estado: stockStateLabel[row.state] }));
    const summary: ReportSummary[] = [{ label: "Total", value: total, unit: "registros" }, ...(isMovement && reportKey === "movements" ? [{ label: "Entradas", value: data.movementSummary.cantidadEntradas }, { label: "Salidas", value: data.movementSummary.cantidadSalidas }] : isMovement ? [] : [{ label: "Productos", value: productCount }, { label: "Insumos", value: supplyCount }])];
    const method = format === "pdf" ? inventoryAnalyticsPdf : inventoryAnalyticsExcel;
    method(definition.title, isMovement || isConsumption ? `${filters.from} a ${filters.to}` : "Stock actual", columns, records, undefined, summary, { objective: definition.meaning, period: isMovement || isConsumption ? `${filters.from} a ${filters.to}` : "Stock actual", executiveSummary: `${total} registros respaldan el análisis seleccionado.`, interpretations: [definition.formula], limitations: isMovement ? ["Las series de actividad cuentan operaciones y no suman unidades físicas incompatibles."] : undefined });
  }

  const topStock = (reportKey === "product-state" || reportKey === "supply-state" ? [...stockRows].sort((a,b) => ({out:0,critical:1,unconfigured:2,available:3}[a.state] - {out:0,critical:1,unconfigured:2,available:3}[b.state])) : stockRows).slice(0, 8);
  const topConsumption = [...data.consumption].sort((a, b) => b.movements - a.movements).slice(0, 8);
  const movementGroups = Object.values(displayedMovements.reduce<Record<string, { code: string; name: string; count: number; quantity: number }>>((acc, row) => {
    const key = `${row.codigo}:${row.articulo}`;
    const entry = acc[key] ?? { code: row.codigo, name: row.articulo, count: 0, quantity: 0 };
    entry.count += 1;
    entry.quantity += Math.abs(row.cantidad);
    acc[key] = entry;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 8);
  const rankedItems = isMovement
    ? movementGroups.map((item) => ({ key: item.code, name: item.name, code: item.code, value: `${number.format(item.count)} operaciones`, detail: `Cantidad acumulada: ${number.format(item.quantity)} (sin unidad homogénea verificada)` }))
    : isConsumption
      ? topConsumption.map((item) => ({ key: item.key, name: item.name, code: item.code, value: `${number.format(item.quantity)} ${item.unit}`, detail: `${item.movements} operaciones · ${item.origins.join(", ") || "Origen no informado"}` }))
      : topStock.map((item) => ({ key: item.key, name: item.name, code: item.code, value: `${number.format(item.quantity)} ${item.unit}`, detail: `${stockStateLabel[item.state]} · ${item.deposit} · ${item.minimum == null ? "Mínimo sin configurar" : `Mínimo: ${number.format(item.minimum)} ${item.unit}`}` }));
  const hasChart = ["status", "risk", "movements", "adjustments", "consumption", "available", "critical", "out", "product-state", "supply-state"].includes(reportKey);

  return <AppShell title={definition.title} breadcrumb={`Inventario / Reportes de inventario / ${definition.title}`} backHref="/inventory/reports">
    <main className="inventory-reports-page inventory-report-detail-page inventory-report-compact-detail">
      <PageHeader title={definition.title} action={canExport && <div className="inventory-report-export-actions"><button className="button secondary" onClick={() => exportReport("pdf")}><Download size={16} /> PDF</button><button className="button primary" onClick={() => exportReport("excel")}><Download size={16} /> Excel</button></div>} />
      {data.error && <div className="inventory-report-error" role="alert">{data.error}</div>}
      <section className="inventory-report-detail-kpis"><article><span>{reportKey === "adjustments" ? "Ajustes negativos" : "Artículos / registros"}</span><strong>{data.loading ? "…" : number.format(total)}</strong><small>{isMovement ? "operaciones" : "referencias"}</small></article>{!isMovement && !isConsumption && <><article><span>Productos terminados</span><strong>{productCount}</strong><small>referencias</small></article><article><span>Insumos</span><strong>{supplyCount}</strong><small>referencias</small></article></>}{isMovement && reportKey === "movements" && <><article><span>Entradas</span><strong>{data.movementSummary.cantidadEntradas}</strong><small>operaciones</small></article><article><span>Salidas</span><strong>{data.movementSummary.cantidadSalidas}</strong><small>operaciones</small></article></>}</section>
      <div className="inventory-report-detail-layout">
        {hasChart && <section className="inventory-report-expanded-chart"><header><h2>{definition.title}</h2></header>{reportKey === "product-state" || reportKey === "supply-state" ? <StockStateDonut rows={stockRows} classCode={reportKey === "product-state" ? "PRODUCTO" : "INSUMO"} height={340} /> : reportKey === "status" || reportKey === "available" ? <StatusChart rows={stockRows} height={340} /> : reportKey === "risk" ? <SupplyRiskList rows={stockRows} limit={8} /> : reportKey === "critical" || reportKey === "out" ? <RiskChart rows={stockRows} height={340} /> : reportKey === "movements" || reportKey === "adjustments" ? <MovementChart movements={displayedMovements} height={340} /> : <ConsumptionChart rows={data.consumption} height={340} />}</section>}
        <section className="inventory-report-insights"><header><h2>{hasChart ? "Artículos destacados" : "Detalle del indicador"}</h2><span>{isMovement || isConsumption ? `${filters.from} a ${filters.to}` : "Stock actual"}</span></header><p className="inventory-report-insights-summary">{interpretation}</p><div className="inventory-report-insight-list">{rankedItems.length ? rankedItems.map((item) => <article key={item.key}><div><strong title={item.name}>{item.name}</strong><small>{item.code} · {item.detail}</small></div><b>{item.value}</b></article>) : <p className="inventory-report-empty">No hay datos para el alcance seleccionado.</p>}</div></section>
      </div>
    </main>
  </AppShell>;
}
