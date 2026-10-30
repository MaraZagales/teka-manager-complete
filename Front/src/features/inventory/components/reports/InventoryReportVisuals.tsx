import { useEffect, useRef } from "react";
import { ArrowUpRight, Package, Layers3 } from "lucide-react";
import type { EChartsOption } from "echarts";
import type { InventoryConsumptionRow, InventoryReportKey, InventoryReportStockRow } from "../../types/reports";
import type { AnalyticMovement } from "../../../../services/stockMovementsApi";
import { isNegativeAdjustment } from "../../utils/reportPresentation";

const number = new Intl.NumberFormat("es-AR");
const GREEN = "#34ad78";
const BLUE = "#4c9deb";
const RED = "#ec6b70";
const INK = "#253652";
const AXIS = { color: "#65748b", fontSize: 11 };
const detailHref = (key: InventoryReportKey, query: string) => `/inventory/reports/detail/${key}?${query}`;

/** A single responsive ECharts renderer for the dashboard and detail pages. */
function ReportChart({ option, height = 180 }: { option: EChartsOption; height?: number }) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let instance: { dispose: () => void; resize: () => void } | undefined;
    let observer: ResizeObserver | undefined;
    void import("echarts").then((echarts) => {
      if (disposed || !node.current) return;
      const chart = echarts.init(node.current, undefined, { renderer: "canvas" });
      chart.setOption(option);
      instance = chart;
      observer = new ResizeObserver(() => chart.resize());
      observer.observe(node.current);
    });
    return () => { disposed = true; observer?.disconnect(); instance?.dispose(); };
  }, [option]);
  return <div ref={node} className="inventory-report-echart" style={{ height }} role="img" aria-label="Gráfico interactivo con detalle al pasar el cursor" />;
}

function shortName(name: string) { return name.length > 23 ? `${name.slice(0, 21)}…` : name; }
function articleTooltip(r: InventoryReportStockRow) {
  return `<b>${r.code} · ${r.name}</b><br/>Depósito: ${r.deposit}<br/>Stock actual: ${number.format(r.quantity)} ${r.unit}<br/>Mínimo: ${r.minimum == null ? "Sin configurar" : `${number.format(r.minimum)} ${r.unit}`}`;
}

/** Finished products with physical stock, never presented as free-to-sell stock. */
export function StatusChart({ rows, height = 180 }: { rows: InventoryReportStockRow[]; height?: number }) {
  const ranked = rows.filter(r => r.active && r.classCode === "PRODUCTO" && r.quantity > 0).sort((a,b) => b.quantity - a.quantity).slice(0,5).reverse();
  const option: EChartsOption = {
    color: [GREEN], grid: { top: 9, bottom: 22, left: 128, right: 65 },
    tooltip: { trigger: "item", formatter: (params: any) => articleTooltip(ranked[params.dataIndex]) },
    xAxis: { type: "value", minInterval: 1, axisLabel: AXIS, splitLine: { lineStyle: { color: "#edf1f3" } } },
    yAxis: { type: "category", data: ranked.map(r => shortName(r.name)), axisLabel: { ...AXIS, width: 120, overflow: "truncate" }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: "bar", barMaxWidth: 17, data: ranked.map(r => r.quantity), label: { show: true, position: "right", formatter: (p: any) => `${number.format(Number(p.value))} ${ranked[p.dataIndex]?.unit ?? ""}`, color: INK, fontSize: 10 }, itemStyle: { borderRadius: [0,4,4,0] } }],
  };
  return ranked.length ? <ReportChart option={option} height={height} /> : <div className="inventory-report-empty">No hay productos terminados con existencias.</div>;
}

/** Only explicit negative adjustments, never all exits interpreted as losses. */
export function MovementChart({ movements, height = 180 }: { movements: AnalyticMovement[]; height?: number }) {
  const filtered = movements.filter(isNegativeAdjustment);
  const grouped = new Map<string, number>();
  filtered.forEach(m => { const day = m.fechaMovimiento.slice(0,10); grouped.set(day, (grouped.get(day) ?? 0) + 1); });
  const days = [...grouped.keys()].sort();
  const option: EChartsOption = {
    color: [RED], grid: { top: 15, bottom: 35, left: 35, right: 16 },
    tooltip: { trigger: "axis", formatter: (params: any) => `${days[params[0]?.dataIndex] ?? ""}<br/><b>${params[0]?.value ?? 0} ajustes negativos</b>` },
    xAxis: { type: "category", data: days.map(d => `${d.slice(8,10)}/${d.slice(5,7)}`), axisLabel: { ...AXIS, hideOverlap: true }, axisLine: { lineStyle: { color: "#dce4e8" } } },
    yAxis: { type: "value", minInterval: 1, axisLabel: AXIS, splitLine: { lineStyle: { color: "#edf1f3" } } },
    series: [{ type: "line", smooth: true, symbolSize: 7, areaStyle: { opacity: .08 }, data: days.map(d => grouped.get(d) ?? 0), label: { show: days.length <= 12, position: "top", color: INK, fontSize: 10 } }],
  };
  return days.length ? <ReportChart option={option} height={height} /> : <div className="inventory-report-empty">No se registraron ajustes negativos identificables en el período.</div>;
}

export function RiskChart({ rows, height = 180 }: { rows: InventoryReportStockRow[]; height?: number }) {
  const ranked = rows.filter(r => r.active && r.classCode === "INSUMO" && r.minimum != null && r.minimum > 0 && r.quantity < r.minimum)
    .map(r => ({ ...r, rate: Math.max(0, (r.minimum! - r.quantity) / r.minimum! * 100) }))
    .sort((a,b) => b.rate - a.rate).slice(0,5).reverse();
  const option: EChartsOption = {
    color: ["#e6a44c"], tooltip: { trigger: "item", formatter: (params: any) => `${articleTooltip(ranked[params.dataIndex])}<br/>Faltante: <b>${number.format(Math.max(0, ranked[params.dataIndex].minimum! - ranked[params.dataIndex].quantity))} ${ranked[params.dataIndex].unit}</b><br/>Déficit: ${number.format(ranked[params.dataIndex].rate)}%` },
    grid: { top: 8, bottom: 23, left: 128, right: 48 },
    xAxis: { type: "value", axisLabel: { ...AXIS, formatter: "{value}%" }, splitLine: { lineStyle: { color: "#edf1f3" } } },
    yAxis: { type: "category", data: ranked.map(r => shortName(r.name)), axisLabel: { ...AXIS, width: 120, overflow: "truncate" }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{ type: "bar", barMaxWidth: 17, data: ranked.map(r => Number(r.rate.toFixed(1))), label: { show: true, position: "right", formatter: "{c}%", color: INK, fontSize: 10 }, itemStyle: { borderRadius: [0,4,4,0] } }],
  };
  return ranked.length ? <ReportChart option={option} height={height} /> : <div className="inventory-report-empty">No hay insumos por debajo de su mínimo configurado.</div>;
}

export function ConsumptionChart({ rows, height = 180 }: { rows: InventoryConsumptionRow[]; height?: number }) {
  // Frequency is comparable across all units; physical quantity remains explicit in tooltip and detail.
  const ranked = [...rows].sort((a,b) => b.movements - a.movements).slice(0,5).reverse();
  const option: EChartsOption = {
    color: [BLUE], tooltip: { trigger: "item", formatter: (params: any) => { const r = ranked[params.dataIndex]; return `<b>${r.code} · ${r.name}</b><br/>Salidas: ${number.format(r.quantity)} ${r.unit}<br/>Operaciones: ${number.format(r.movements)}<br/>Origen: ${r.origins.join(", ") || "No informado"}`; } },
    grid: { top: 8, bottom: 23, left: 128, right: 48 },
    xAxis: { type: "value", minInterval: 1, axisLabel: AXIS, splitLine: { lineStyle: { color: "#edf1f3" } } },
    yAxis: { type: "category", data: ranked.map(r => shortName(r.name)), axisLabel: { ...AXIS, width: 120, overflow: "truncate" }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{ type: "bar", barMaxWidth: 17, data: ranked.map(r => r.movements), label: { show: true, position: "right", formatter: "{c} op.", color: INK, fontSize: 10 }, itemStyle: { borderRadius: [0,4,4,0] } }],
  };
  return ranked.length ? <ReportChart option={option} height={height} /> : <div className="inventory-report-empty">No hay salidas de insumos en el período.</div>;
}

/** Exclusive classification: no minimum is not the same as healthy stock. */
export function StockStateDonut({ rows, classCode, height = 190 }: { rows: InventoryReportStockRow[]; classCode: "PRODUCTO" | "INSUMO"; height?: number }) {
  const scoped = rows.filter(r => r.active && r.classCode === classCode);
  const segments = [
    { name: "Normal", value: scoped.filter(r => r.state === "available").length, itemStyle: { color: GREEN } },
    { name: "Crítico", value: scoped.filter(r => r.state === "critical").length, itemStyle: { color: "#e6a44c" } },
    { name: "Agotado", value: scoped.filter(r => r.state === "out").length, itemStyle: { color: RED } },
    { name: "Sin mínimo", value: scoped.filter(r => r.state === "unconfigured").length, itemStyle: { color: "#a3afc0" } },
  ].filter(s => s.value > 0);
  const rowsByState: Record<string, InventoryReportStockRow[]> = {
    Normal: scoped.filter(r => r.state === "available"),
    "Crítico": scoped.filter(r => r.state === "critical"),
    Agotado: scoped.filter(r => r.state === "out"),
    "Sin mínimo": scoped.filter(r => r.state === "unconfigured"),
  };
  const safeText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const stateTooltip = (name: string, value: number, percent: number) => {
    const matching = rowsByState[name] ?? [];
    const preview = matching.slice(0, 7).map(r => `<div style="display:flex;justify-content:space-between;gap:14px;padding:3px 0"><span>${safeText(r.name)} <span style="color:#8190a2">(${safeText(r.code)})</span></span><b>${number.format(r.quantity)} ${safeText(r.unit)}</b></div>`).join("");
    return `<div style="max-width:370px;min-width:240px;white-space:normal"><b>${safeText(classCode === "PRODUCTO" ? "Productos terminados" : "Insumos")} · ${safeText(name)}</b><div style="margin:4px 0 7px">${number.format(value)} ${classCode === "PRODUCTO" ? "productos" : "insumos"} (${percent}%)</div>${preview}${matching.length > 7 ? `<div style="color:#65748b;margin-top:5px">Y ${matching.length - 7} artículos más · abrir detalle para verlos</div>` : ""}</div>`;
  };
  if (!scoped.length) return <div className="inventory-report-empty">No hay {classCode === "PRODUCTO" ? "productos terminados" : "insumos"} para el depósito seleccionado.</div>;
  const option: EChartsOption = {
    tooltip: { trigger: "item", confine: true, appendToBody: true, formatter: (p: any) => stateTooltip(String(p.name), Number(p.value), Number(p.percent)) },
    legend: { orient: "vertical", right: 0, top: "middle", icon: "circle", itemWidth: 9, itemHeight: 9, textStyle: { color: INK, fontSize: 11 }, formatter: (name: string) => `${name}: ${number.format(segments.find(s => s.name === name)?.value ?? 0)}` },
    graphic: [{ type: "text", left: "27%", top: "41%", style: { text: String(scoped.length), align: "center", font: "bold 25px sans-serif", fill: INK } }, { type: "text", left: "27%", top: "57%", style: { text: classCode === "PRODUCTO" ? "productos" : "insumos", align: "center", font: "11px sans-serif", fill: "#65748b" } }],
    series: [{ type: "pie", center: ["29%", "50%"], radius: ["54%", "78%"], avoidLabelOverlap: true, label: { show: false }, data: segments, itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 5 } }],
  };
  return <ReportChart option={option} height={height} />;
}

export function SupplyRiskList({ rows, limit = 3 }: { rows: InventoryReportStockRow[]; limit?: number }) {
  const ranked = rows.filter(r => r.active && r.classCode === "INSUMO" && r.minimum != null && r.minimum > 0 && r.quantity < r.minimum)
    .sort((a,b) => ((b.minimum! - b.quantity) / b.minimum!) - ((a.minimum! - a.quantity) / a.minimum!)).slice(0,limit);
  if (!ranked.length) return <div className="inventory-report-empty">No hay insumos por debajo del mínimo configurado.</div>;
  return <div className="inventory-report-priorities">{ranked.map(r => {
    const fraction = Math.max(0, Math.min(1, r.quantity / r.minimum!));
    const missing = Math.max(0, r.minimum! - r.quantity);
    return <div className="inventory-report-priority" key={r.key} title={`${r.code} · ${r.name} · ${r.deposit}`}>
      <div className="inventory-report-priority-top"><strong>{r.name}</strong><b>Faltan {number.format(missing)} {r.unit}</b></div>
      <div className="inventory-report-priority-track"><span style={{ width: `${fraction * 100}%`, background: fraction < .5 ? RED : "#e6a44c" }}/></div>
      <small>Disponible: {number.format(r.quantity)} de {number.format(r.minimum!)} {r.unit} · {r.deposit}</small>
    </div>;
  })}</div>;
}

function ChartLink({ href, title, description, children, variant }: { href: string; title: string; description: string; children: React.ReactNode; variant?: string }) {
  return <a className={`inventory-report-chart-card ${variant ?? ""}`} href={href}><header><div><h2>{title}</h2><p>{description}</p></div><ArrowUpRight size={16} /></header>{children}</a>;
}
export function ReportDashboardCharts({ stock, query }: { stock: InventoryReportStockRow[]; movements: AnalyticMovement[]; consumption: InventoryConsumptionRow[]; query: string; loading: boolean }) {
  return <div className="inventory-report-business-dashboard">
    <section className="inventory-report-business-section products"><div className="inventory-report-business-heading"><Package size={18}/><div><h2>Productos terminados</h2><span>Disponibilidad física de muebles · stock actual</span></div></div>
      <div className="inventory-report-business-cards">
        <ChartLink href={detailHref("status", query)} title="Productos con mayor existencia" description="Los muebles con más unidades físicas registradas." variant="inventory-report-wide"><StatusChart rows={stock} height={210}/></ChartLink>
        <ChartLink href={detailHref("product-state", query)} title="Estado de productos terminados" description="Cantidad de productos por situación de stock."><StockStateDonut rows={stock} classCode="PRODUCTO" height={210}/></ChartLink>
      </div>
    </section>
    <section className="inventory-report-business-section supplies"><div className="inventory-report-business-heading"><Layers3 size={18}/><div><h2>Insumos y materiales</h2><span>Abastecimiento · stock actual</span></div></div>
      <div className="inventory-report-business-cards">
        <ChartLink href={detailHref("supply-state", query)} title="Estado de abastecimiento" description="Cantidad de insumos normales, críticos y agotados."><StockStateDonut rows={stock} classCode="INSUMO" height={210}/></ChartLink>
        <ChartLink href={detailHref("risk", query)} title="Prioridades de reposición" description="Tres insumos con mayor faltante respecto del mínimo." variant="inventory-report-wide"><SupplyRiskList rows={stock}/></ChartLink>
      </div>
    </section>
  </div>;
}
