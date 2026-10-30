import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  RefreshCw,
  Target,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { AppShell } from "../../components/layout/AppShell";
import { PageHeader } from "../../components/data/PageHeader";
import { hasPermission } from "../../services/authorization";
import {
  obtenerIntereses,
  obtenerOportunidades,
  type Interes,
  type Oportunidad,
} from "../../services/commercialApi";
import {
  exportCommercialExcel,
  exportCommercialPdf,
} from "../../services/commercialReports";
import {
  obtenerPedidosParaIndicadores,
  type PedidoComercial,
} from "../../services/commercialMetricsApi";
import "./commercialDashboard.css";
import "../inventory/styles/reports.css";
import type { EChartsOption } from "echarts";

type Period =
  | "today"
  | "7"
  | "30"
  | "90"
  | "month"
  | "previous"
  | "year"
  | "custom";
type Filters = { period: Period; from: string; to: string };
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const day = (s?: string | null) => s?.slice(0, 10) || "";
const num = (n: number) => new Intl.NumberFormat("es-AR").format(n);
const person = (x: Oportunidad) =>
  [x.clienteNombre, x.clienteApellido].filter(Boolean).join(" ") ||
  "Sin identificar";
const closed = (x: Oportunidad) =>
  /convertid|perdid|cancelad|ganad/i.test(x.estadoOportunidadNombre || "") ||
  x.pedidoIdConvertido != null;
const converted = (x: Oportunidad) =>
  x.pedidoIdConvertido != null ||
  /convertid|ganad/i.test(x.estadoOportunidadNombre || "");
const lost = (x: Oportunidad) =>
  /perdid|cancelad/i.test(x.estadoOportunidadNombre || "") && !converted(x);
const periodDates = (p: Period, from: string, to: string): Filters => {
  const now = new Date(),
    d = new Date(now);
  if (p === "custom") return { period: p, from, to };
  if (p === "today") return { period: p, from: iso(now), to: iso(now) };
  if (p === "month")
    return {
      period: p,
      from: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: iso(now),
    };
  if (p === "previous")
    return {
      period: p,
      from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: iso(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  if (p === "year")
    return {
      period: p,
      from: iso(new Date(now.getFullYear(), 0, 1)),
      to: iso(now),
    };
  d.setDate(d.getDate() - Number(p) + 1);
  return { period: p, from: iso(d), to: iso(now) };
};
function CommercialChart({option,height=210}:{option:EChartsOption;height?:number}) {
  const node=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let cancelled=false;
    let chart: {dispose:()=>void;resize:()=>void}|undefined;
    let observer:ResizeObserver|undefined;
    void import("echarts").then(echarts=>{
      if(cancelled||!node.current)return;
      const instance=echarts.init(node.current,undefined,{renderer:"canvas"});
      instance.setOption(option);
      chart=instance;
      observer=new ResizeObserver(()=>instance.resize());
      observer.observe(node.current!);
    });
    return ()=>{cancelled=true;observer?.disconnect();chart?.dispose();};
  },[option]);
  return <div ref={node} style={{height,width:"100%"}} role="img" aria-label="Gráfico comercial interactivo"/>;
}
function Distribution({rows}:{rows:{label:string;value:number;detail?:string}[]}) {
  if(!rows.some(x=>x.value>0))return <p className="cd-empty">No hay registros para el período seleccionado.</p>;
  const ranked=[...rows].sort((a,b)=>b.value-a.value).slice(0,7).reverse();
  const option:EChartsOption={color:["#34ad78"],grid:{top:12,bottom:22,left:130,right:55},
    tooltip:{trigger:"item"},xAxis:{type:"value",minInterval:1,axisLabel:{color:"#65748b"},splitLine:{lineStyle:{color:"#edf1f3"}}},
    yAxis:{type:"category",data:ranked.map(x=>x.label),axisLabel:{color:"#65748b",width:120,overflow:"truncate"},axisTick:{show:false},axisLine:{show:false}},
    series:[{type:"bar",barMaxWidth:18,data:ranked.map(x=>x.value),label:{show:true,position:"right",color:"#253652"},itemStyle:{borderRadius:[0,4,4,0]}}]};
  return <CommercialChart option={option} height={Math.max(175,ranked.length*37)}/>;
}
type TrendRow={label:string;created:number;won:number;lost:number};
function Trend({rows}:{rows:TrendRow[]}) {
  if(!rows.some(r=>r.created||r.won||r.lost))return <p className="cd-empty">No se registraron movimientos comerciales en el período seleccionado.</p>;
  const option:EChartsOption={color:["#4c9deb","#34ad78","#ec6b70"],tooltip:{trigger:"axis"},legend:{top:0,textStyle:{color:"#65748b"}},
    grid:{top:45,bottom:35,left:38,right:15},xAxis:{type:"category",data:rows.map(r=>r.label.slice(5)+"/"+r.label.slice(2,4)),axisLabel:{color:"#65748b"}},
    yAxis:{type:"value",minInterval:1,axisLabel:{color:"#65748b"},splitLine:{lineStyle:{color:"#edf1f3"}}},
    series:[{name:"Iniciadas",type:"bar",barMaxWidth:15,data:rows.map(r=>r.created)},{name:"Concretadas",type:"bar",barMaxWidth:15,data:rows.map(r=>r.won)},{name:"Perdidas",type:"bar",barMaxWidth:15,data:rows.map(r=>r.lost)}]};
  return <CommercialChart option={option} height={240}/>;
}
export function CommercialDashboard() {
  const generateMode = location.pathname.endsWith("/generar");
  const [intereses, setIntereses] = useState<Interes[]>([]),
    [oportunidades, setOportunidades] = useState<Oportunidad[]>([]),
    [pedidos, setPedidos] = useState<PedidoComercial[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [applied, setApplied] = useState<Filters>(() => periodDates("month", "", ""));
  const today = iso(new Date());
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [i, o, p] = await Promise.all([
        obtenerIntereses(),
        obtenerOportunidades(),
        obtenerPedidosParaIndicadores(),
      ]);
      if (!Array.isArray(i) || !Array.isArray(o) || !Array.isArray(p))
        throw Error("La API no devolvió listados válidos.");
      setIntereses(i);
      setOportunidades(o);
      setPedidos(p);
    } catch (e) {
      setIntereses([]);
      setOportunidades([]);
      setPedidos([]);
      setError(
        e instanceof Error ? e.message : "No fue posible consultar Comercial.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const statuses = useMemo(()=>[...new Set(oportunidades.map(x=>x.estadoOportunidadNombre).filter((x):x is string=>Boolean(x)))].sort(),[oportunidades]);
  const owners = useMemo(()=>[...new Set(oportunidades.map(x=>x.responsableNombre).filter((x):x is string=>Boolean(x)))].sort(),[oportunidades]);
  const filteredOpportunities = useMemo(()=>oportunidades.filter(x=>(!statusFilter || x.estadoOportunidadNombre===statusFilter)&&(!ownerFilter || x.responsableNombre===ownerFilter)),[oportunidades,statusFilter,ownerFilter]);
  const data = useMemo(() => {
    const periodO = filteredOpportunities.filter(
      (x) => day(x.fechaAlta) >= applied.from && day(x.fechaAlta) <= applied.to,
    );
    const periodI = intereses.filter(
      (x) => day(x.fechaAlta) >= applied.from && day(x.fechaAlta) <= applied.to,
    );
    const active = filteredOpportunities.filter((x) => !closed(x));
    const overdue = active.filter(
      (x) => day(x.fechaProximaAccion) && day(x.fechaProximaAccion) < today,
    );
    const dueToday = active.filter((x) => day(x.fechaProximaAccion) === today);
    const upcoming = active
      .filter((x) => day(x.fechaProximaAccion) >= today)
      .sort((a, b) =>
        day(a.fechaProximaAccion).localeCompare(day(b.fechaProximaAccion)),
      );
    const conversions = periodO.filter(converted);
    const openCreated = periodO.filter((x) => !closed(x));
    const periodConverted = filteredOpportunities.filter(
      (x) =>
        x.pedidoIdConvertido != null &&
        day(x.fechaConversion) >= applied.from &&
        day(x.fechaConversion) <= applied.to,
    );
    const periodLost = filteredOpportunities.filter(
      (x) =>
        lost(x) &&
        day(x.fechaPerdida) >= applied.from &&
        day(x.fechaPerdida) <= applied.to,
    );
    const lossReasons = [
      ...periodLost.reduce((acc, x) => {
        const label = x.motivoPerdidaNombre?.trim() || "Sin motivo registrado";
        acc.set(label, (acc.get(label) || 0) + 1);
        return acc;
      }, new Map<string, number>()),
    ]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const confirmedIds = new Set(
      pedidos
        .filter((x) => x.estadoPedidoId >= 2 && x.estadoPedidoId <= 5)
        .map((x) => x.pedidoId),
    );
    const confirmedConversions = periodConverted.filter((x) =>
      confirmedIds.has(x.pedidoIdConvertido!),
    );
    const pedidosById = new Map(pedidos.map((x) => [x.pedidoId, x]));
    const confirmedAmount = confirmedConversions.reduce(
      (total, x) =>
        total + (Number(pedidosById.get(x.pedidoIdConvertido!)?.total) || 0),
      0,
    );
    const periodPotential = openCreated.reduce(
      (s, x) => s + (Number(x.montoEstimado) || 0),
      0,
    );
    const byChannel = new Map<string, { total: number; converted: number }>();
    periodO.forEach((x) => {
      const k = x.canalVentaNombre || "Sin canal";
      const v = byChannel.get(k) || { total: 0, converted: 0 };
      v.total++;
      if (converted(x)) v.converted++;
      byChannel.set(k, v);
    });
    const channels = [...byChannel]
      .map(([label, v]) => ({
        label,
        value: v.total,
        converted: v.converted,
        rate: v.total ? (v.converted / v.total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
    // Cada serie utiliza la fecha de su propio evento, no la fecha de creación de la gestión.
    const monthly = new Map<string, TrendRow>();
    const addMonth = (date: string, key: "created" | "won" | "lost") => {
      const k = day(date).slice(0, 7);
      if (k.length !== 7 || day(date) < applied.from || day(date) > applied.to)
        return;
      const row = monthly.get(k) || { label: k, created: 0, won: 0, lost: 0 };
      row[key]++;
      monthly.set(k, row);
    };
    filteredOpportunities.forEach((x) => addMonth(x.fechaAlta || "", "created"));
    confirmedConversions.forEach((x) =>
      addMonth(x.fechaConversion || "", "won"),
    );
    periodLost.forEach((x) => addMonth(x.fechaPerdida || "", "lost"));
    const months = [...monthly.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
    const age = { short: 0, medium: 0, long: 0 };
    active.forEach((x) => {
      if (!day(x.fechaAlta)) return;
      const n = Math.max(
        0,
        Math.floor(
          (new Date(`${today}T00:00:00`).getTime() -
            new Date(`${day(x.fechaAlta)}T00:00:00`).getTime()) /
            86400000,
        ),
      );
      if (n <= 30) age.short++;
      else if (n <= 90) age.medium++;
      else age.long++;
    });
    const potential = active.reduce(
      (s, x) => s + (Number(x.montoEstimado) || 0),
      0,
    );
    const rate = periodO.length
      ? (conversions.length / periodO.length) * 100
      : null;
    return {
      periodO,
      periodI,
      active,
      overdue,
      dueToday,
      upcoming,
      conversions,
      channels,
      months,
      age,
      potential,
      rate,
      openCreated,
      periodPotential,
      confirmedConversions,
      periodLost,
      confirmedAmount,
      lossReasons,
    };
  }, [intereses, filteredOpportunities, pedidos, applied, today]);
  const report = {
    ...data,
    from: applied.from,
    to: applied.to,
    generatedAt: new Date().toLocaleString("es-AR"),
  };
  async function runExport(format: "excel" | "pdf") {
    if (exporting) return;
    setExporting(true); setExportError("");
    try {
      if (format === "excel") await exportCommercialExcel(report);
      else await exportCommercialPdf(report);
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : "No se pudo generar la exportación comercial.");
    } finally { setExporting(false); }
  }
  const canExport = hasPermission("Comercial", "Exportar");
  const stateRows = Object.entries(data.periodO.reduce<Record<string,number>>((acc,x)=>{const name=x.estadoOportunidadNombre || "Sin estado";acc[name]=(acc[name]||0)+1;return acc;},{})).map(([label,value])=>({label,value}));
  const metrics = [
    { label: "Oportunidades iniciadas", value: num(data.periodO.length), note: "Creadas en el período" },
    { label: "Convertidas", value: num(data.conversions.length), note: "De las iniciadas en el período" },
    { label: "Conversión", value: data.rate == null ? "—" : `${data.rate.toFixed(1)}%`, note: "Sobre oportunidades iniciadas" },
    { label: "Seguimientos vencidos", value: num(data.overdue.length), note: "Abiertos al día de hoy" },
  ];
  const defaults = periodDates("month", "", "");
  const filtersValid = Boolean(applied.from && applied.to && applied.from <= applied.to);
  const changeFilter = (next: Filters) => setApplied(next);
  const filterBar = <section className="inventory-reports-filters" aria-label="Filtros generales de reportes">
    <div className="inventory-report-period">
      <label><span>Desde</span><input type="date" value={applied.from} max={applied.to || today} onChange={e=>changeFilter({...applied,from:e.target.value,period:"custom"})}/></label>
      <label><span>Hasta</span><input type="date" value={applied.to} min={applied.from} max={today} onChange={e=>changeFilter({...applied,to:e.target.value,period:"custom"})}/></label>
    </div>
    <label><span>Estado</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">Todos</option>{statuses.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <label><span>Responsable</span><select value={ownerFilter} onChange={e=>setOwnerFilter(e.target.value)}><option value="">Todos</option>{owners.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <button type="button" className="button secondary" onClick={()=>{setApplied(defaults);setStatusFilter("");setOwnerFilter("");}}><RefreshCw size={16}/> Limpiar filtros</button>
  </section>;
  return <AppShell title={generateMode ? "Generar informe" : "Reportes comerciales"} breadcrumb={generateMode ? "Comercial / Reportes / Generar informe" : "Comercial / Reportes"} backHref={generateMode ? "/comercial/reportes" : undefined}>
    <main className={`inventory-reports-page ${generateMode ? "inventory-report-generator" : ""}`}>
      <PageHeader title={generateMode ? "Generar informe" : "Reportes comerciales"} action={!generateMode && canExport ? <a className="button primary" href="/comercial/reportes/generar"><FileText size={17}/> Generar informe</a> : undefined}/>
      {generateMode ? <section className="inventory-report-form-card inventory-report-filter-card cd-card"><h2>1. Filtros</h2>{filterBar}</section> : filterBar}
      {!filtersValid && <div className="inventory-report-error">Seleccioná un rango de fechas válido.</div>}
      {error && <div className="inventory-report-error" role="alert">{error}<button className="button secondary" onClick={()=>void refresh()}>Reintentar</button></div>}
      {exportError && <div className="inventory-report-error" role="alert">{exportError}</div>}
      {generateMode ? <>
        <div className="inventory-report-generator-grid">
          <section className="inventory-report-form-card cd-card"><h2>2. Tipo de informe</h2>
            <label className="selected"><input type="radio" checked readOnly name="reportType"/><span><strong>Resumen ejecutivo comercial</strong><small>Indicadores, oportunidades, conversiones y seguimientos del período.</small></span></label>
          </section>
          <section className="inventory-report-form-card cd-card"><h2>3. Formato de exportación</h2>
            <label className={exportFormat === "pdf" ? "selected" : ""}><input type="radio" name="format" checked={exportFormat === "pdf"} onChange={()=>setExportFormat("pdf")}/><FileText size={20}/><span><strong>PDF</strong><small>Informe para presentar o compartir.</small></span></label>
            <label className={exportFormat === "excel" ? "selected" : ""}><input type="radio" name="format" checked={exportFormat === "excel"} onChange={()=>setExportFormat("excel")}/><FileSpreadsheet size={20}/><span><strong>Excel</strong><small>Datos para analizar y trabajar.</small></span></label>
          </section>
        </div>
        <div className="inventory-report-generate-action"><button className="button primary" disabled={!canExport || loading || exporting || !!error || !filtersValid} onClick={()=>void runExport(exportFormat)}><FileText size={16}/>{exporting ? "Generando…" : `Generar informe ${exportFormat.toUpperCase()}`}</button></div>
      </> : loading ? <p className="cd-loading">Consultando información comercial…</p> : !error && <>
        <section className="cd-compact-section cd-green">
          <header><Target size={18}/><div><strong>Oportunidades comerciales</strong><small>Captación y conversión · período seleccionado</small></div></header>
          <div className="inventory-report-kpi-grid">{metrics.map((item,i)=><a href={i===3?"/comercial/agenda":"/comercial/oportunidades"} className="inventory-report-kpi" key={item.label}><span className={`inventory-report-kpi-icon ${i===3?"warning":""}`}><Target size={21}/></span><div className="inventory-report-kpi-content"><strong>{item.value}</strong><b>{item.label}</b><small>{item.note}</small></div><ArrowRight className="inventory-report-kpi-arrow" size={15}/></a>)}</div>
        </section>
        <section className="cd-compact-section cd-green">
          <header><Target size={18}/><div><strong>Análisis comercial</strong><small>Evolución y canales de captación · período seleccionado</small></div></header>
          <div className="inventory-report-chart-grid">
            <article className="inventory-report-chart-card"><header><div><h2>Evolución comercial</h2><p>Oportunidades iniciadas, concretadas y perdidas por mes</p></div><ArrowRight size={15}/></header><Trend rows={data.months}/></article>
            <article className="inventory-report-chart-card"><header><div><h2>Origen de oportunidades</h2><p>Canales que generan más oportunidades</p></div><ArrowRight size={15}/></header><Distribution rows={data.channels}/></article>
          </div>
        </section>
        <section className="cd-compact-section cd-amber">
          <header><CalendarClock size={18}/><div><strong>Prioridades comerciales</strong><small>Seguimientos pendientes que requieren atención</small></div></header>
          <div className="inventory-report-chart-grid">
            <article className="inventory-report-chart-card"><header><div><h2>Oportunidades por estado</h2><p>Distribución de oportunidades del período</p></div></header><Distribution rows={stateRows}/></article>
            <article className="inventory-report-chart-card"><header><div><h2>Próximas acciones</h2><p>Seguimientos abiertos ordenados por fecha</p></div></header>
              <div style={{overflowY:"auto",flex:1}}>{data.active.filter(x=>day(x.fechaProximaAccion)).sort((a,b)=>day(a.fechaProximaAccion).localeCompare(day(b.fechaProximaAccion))).slice(0,4).map(x=><a className="cd-priority-row" key={x.oportunidadComercialId} href="/comercial/agenda"><strong>{person(x)}</strong><span>{day(x.fechaProximaAccion)} · {x.proximaAccion || "Seguimiento"}</span><ArrowRight size={14}/></a>)}{!data.active.some(x=>day(x.fechaProximaAccion)) && <p className="cd-empty">No hay seguimientos programados.</p>}</div>
              <a className="cd-card-link" href="/comercial/agenda">Ver agenda comercial <ArrowRight size={15}/></a>
            </article>
          </div>
        </section>
      </>}
    </main>
  </AppShell>;
}
