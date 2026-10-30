import { BudgetsPage } from "./pages/BudgetsPage";
import { AgendaPage } from "./pages/AgendaPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { CommercialDashboard } from "./CommercialDashboard";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../components/data/Modal";
import { AppShell } from "../../components/layout/AppShell";
import { PageHeader } from "../../components/data/PageHeader";
import "./commercialDashboard.css";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/data/DataTable";
import { hasPermission } from "../../services/authorization";
import {
  crearOportunidad,
  obtenerIntereses,
  obtenerOportunidades,
  type Interes,
  type Oportunidad,
} from "../../services/commercialApi";
import {
  CalendarDays,
  CircleAlert,
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Inbox,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

type Section =
  | "panel"
  | "pendientes"
  | "oportunidades"
  | "agenda"
  | "analisis"
  | "cotizaciones";
type Period = "7" | "30" | "90" | "365" | "custom";
const names: Record<Section, string> = {
  panel: "Panel comercial",
  pendientes: "Pendientes",
  oportunidades: "Oportunidades",
  agenda: "Agenda comercial",
  analisis: "Análisis y reportes",
  cotizaciones: "Cotizaciones",
};
const money = (v: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(v);
const date = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("es-AR") : "Sin fecha";
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const day = (v?: string | null) => v?.slice(0, 10) || "";
const open = (v?: string | null) =>
  !/convertida|perdida|cancelada|ganada/i.test(v || "");
const fullName = (a?: string | null, b?: string | null) =>
  [a, b].filter(Boolean).join(" ") || "Sin identificar";
const shortMonth = (d: Date) =>
  d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
const dateIn = (d: string, from: string, to: string) =>
  !!d && d >= from && d <= to;
function Card({
  label,
  value,
  sub,
  icon: Icon,
  kind = "green",
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Inbox;
  kind?: string;
}) {
  return (
    <article className="cm-kpi">
      <div className={`cm-kpi-icon ${kind}`}>
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}
function TrendChart({ items }: { items: Oportunidad[] }) {
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: shortMonth(d),
      n: items.filter((x) => day(x.fechaAlta).startsWith(key)).length,
    };
  });
  const max = Math.max(1, ...data.map((x) => x.n));
  return (
    <div className="cm-chart">
      <div className="cm-chart-grid">
        {[3, 2, 1, 0].map((n) => (
          <div key={n} className="cm-chart-line">
            <span>{Math.round((max * n) / 3)}</span>
          </div>
        ))}
      </div>
      <div className="cm-bars">
        {data.map((d, i) => (
          <div className="cm-bar-col" key={i}>
            <div className="cm-bar-value">{d.n || ""}</div>
            <div
              className="cm-bar"
              style={{ height: `${Math.max(d.n ? 5 : 1, (d.n / max) * 100)}%` }}
              title={`${d.label}: ${d.n} oportunidades`}
            />
            <small>{d.label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
function Channels({ items }: { items: Oportunidad[] }) {
  const counts = new Map<string, number>();
  items.forEach((x) => {
    const k = x.canalVentaNombre || "Sin canal";
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const sorted = [...counts].sort((a, b) => b[1] - a[1]);
  const total = items.length;
  const colors = [
    "#6f876b",
    "#d9b36c",
    "#9b9aa8",
    "#ca8c7a",
    "#8eaa9d",
    "#c2b5a0",
  ];
  let acc = 0;
  const gradient = sorted.length
    ? `conic-gradient(${sorted
        .map(([_, n], i) => {
          const start = acc;
          acc += (n / total) * 100;
          return `${colors[i % colors.length]} ${start}% ${acc}%`;
        })
        .join(",")})`
    : "conic-gradient(#e8e1d7 0% 100%)";
  return (
    <div className="cm-channel">
      <div className="cm-donut" style={{ background: gradient }}>
        <div>
          <strong>{total}</strong>
          <small>Oportunidades</small>
        </div>
      </div>
      <div className="cm-channel-legend">
        {sorted.length ? (
          sorted.slice(0, 7).map(([k, n], i) => (
            <div key={k}>
              <i style={{ background: colors[i % colors.length] }} />
              <span>{k}</span>
              <strong>{Math.round((n / total) * 100)}%</strong>
            </div>
          ))
        ) : (
          <p className="cm-muted">Sin oportunidades para el período.</p>
        )}
      </div>
    </div>
  );
}
function Pipeline({ items }: { items: Oportunidad[] }) {
  const counts = new Map<string, number>();
  items.forEach((x) => {
    const k = x.estadoOportunidadNombre || "Sin estado";
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const rows = [...counts].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map((x) => x[1]));
  return (
    <div className="cm-pipeline">
      {rows.length ? (
        rows.slice(0, 6).map(([k, n], i) => (
          <div className="cm-pipeline-row" key={k}>
            <div className="cm-pipeline-label">
              <span>{k}</span>
              <strong>{n}</strong>
            </div>
            <div className="cm-pipeline-track">
              <div
                style={{
                  width: `${(n / max) * 100}%`,
                  background: [
                    "#6f876b",
                    "#8da487",
                    "#b2bea8",
                    "#d9b36c",
                    "#c9a6a0",
                    "#b4a6a0",
                  ][i],
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="cm-muted">Sin estados para analizar.</p>
      )}
    </div>
  );
}
function Calendar({
  items,
  month,
  setMonth,
}: {
  items: Oportunidad[];
  month: Date;
  setMonth: (d: Date) => void;
}) {
  const year = month.getFullYear(),
    m = month.getMonth(),
    first = new Date(year, m, 1).getDay(),
    days = new Date(year, m + 1, 0).getDate(),
    offset = (first + 6) % 7;
  const slots = Array.from(
    { length: Math.ceil((offset + days) / 7) * 7 },
    (_, i) => i - offset + 1,
  );
  const byDate = new Map<string, Oportunidad[]>();
  items.forEach((x) => {
    const k = day(x.fechaProximaAccion);
    if (k) {
      const a = byDate.get(k) || [];
      a.push(x);
      byDate.set(k, a);
    }
  });
  return (
    <div className="cm-calendar">
      <div className="cm-calendar-head">
        <strong>
          {month.toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </strong>
        <div>
          <button
            aria-label="Mes anterior"
            onClick={() => setMonth(new Date(year, m - 1, 1))}
          >
            <ChevronLeft size={17} />
          </button>
          <button onClick={() => setMonth(new Date())}>Hoy</button>
          <button
            aria-label="Mes siguiente"
            onClick={() => setMonth(new Date(year, m + 1, 1))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="cm-calendar-grid">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div className="cm-weekday" key={d}>
            {d}
          </div>
        ))}
        {slots.map((n, i) => {
          const k = iso(new Date(year, m, n));
          const activities = byDate.get(k) || [];
          return (
            <div
              key={i}
              className={`cm-calendar-day ${n < 1 || n > days ? "outside" : ""} ${k === iso(new Date()) ? "today" : ""}`}
            >
              <span>{n < 1 || n > days ? "" : n}</span>
              {activities.slice(0, 2).map((a) => (
                <a
                  key={a.oportunidadComercialId}
                  title={`${fullName(a.clienteNombre, a.clienteApellido)} · ${a.proximaAccion || "Próxima acción"}`}
                  href="/comercial/oportunidades"
                >
                  {fullName(a.clienteNombre, a.clienteApellido)}
                </a>
              ))}
              {activities.length > 2 && (
                <small>+{activities.length - 2} más</small>
              )}
            </div>
          );
        })}
      </div>
      <p className="cm-note">
        Agenda basada en la fecha de próxima acción de oportunidades. La
        programación y reprogramación de visitas requiere completar la API de
        agenda.
      </p>
    </div>
  );
}
function LegacyCommercialPage({ section = "panel" }: { section?: Section }) {
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newOpportunity, setNewOpportunity] = useState({
    clienteNombre: "",
    clienteApellido: "",
    tipoCliente: "particular",
    canalVentaId: "",
    interes: "",
    montoEstimado: "0",
    probabilidad: "0",
    proximaAccion: "",
    fechaProximaAccion: "",
    observaciones: "",
  });
  async function submitOpportunity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    if (
      !newOpportunity.clienteNombre.trim() ||
      newOpportunity.clienteNombre.trim().length > 100
    ) {
      setCreateError("Ingresá un nombre válido (máximo 100 caracteres).");
      return;
    }
    if (
      !newOpportunity.interes.trim() ||
      newOpportunity.interes.trim().length > 150
    ) {
      setCreateError("Describí el interés (máximo 150 caracteres).");
      return;
    }
    if (
      !Number.isInteger(Number(newOpportunity.canalVentaId)) ||
      Number(newOpportunity.canalVentaId) <= 0
    ) {
      setCreateError(
        "Ingresá un ID de canal válido de tu catálogo de canales.",
      );
      return;
    }
    if (
      Number(newOpportunity.montoEstimado) < 0 ||
      Number(newOpportunity.probabilidad) < 0 ||
      Number(newOpportunity.probabilidad) > 100
    ) {
      setCreateError("Revisá el monto y la probabilidad (0 a 100).");
      return;
    }
    setSaving(true);
    try {
      await crearOportunidad({
        clienteNombre: newOpportunity.clienteNombre.trim(),
        clienteApellido: newOpportunity.clienteApellido.trim(),
        tipoCliente: newOpportunity.tipoCliente,
        canalVentaId: Number(newOpportunity.canalVentaId),
        interes: newOpportunity.interes.trim(),
        montoEstimado: Number(newOpportunity.montoEstimado),
        probabilidad: Number(newOpportunity.probabilidad),
        proximaAccion: newOpportunity.proximaAccion || undefined,
        fechaProximaAccion: newOpportunity.fechaProximaAccion || undefined,
        observaciones: newOpportunity.observaciones || undefined,
      });
      setShowCreate(false);
      await refresh();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "No se pudo crear la oportunidad",
      );
    } finally {
      setSaving(false);
    }
  }
  const [intereses, setIntereses] = useState<Interes[]>([]),
    [oportunidades, setOportunidades] = useState<Oportunidad[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("30"),
    [customFrom, setCustomFrom] = useState(""),
    [customTo, setCustomTo] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [month, setMonth] = useState(new Date());
  const today = iso(new Date());
  const start = new Date();
  start.setDate(
    start.getDate() - Number(period === "custom" ? 30 : period) + 1,
  );
  const from = period === "custom" ? customFrom : iso(start);
  const to = period === "custom" ? customTo : today;
  const valid = !!from && !!to && from <= to;
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [a, b] = await Promise.all([
        obtenerIntereses(),
        obtenerOportunidades(),
      ]);
      if (!Array.isArray(a) || !Array.isArray(b))
        throw new Error("La API devolvió un formato de listado inesperado.");
      setIntereses(a);
      setOportunidades(b);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al consultar datos comerciales",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [section, period, customFrom, customTo, query]);
  const periodI = useMemo(
    () =>
      valid ? intereses.filter((x) => dateIn(day(x.fechaAlta), from, to)) : [],
    [intereses, from, to, valid],
  );
  const periodO = useMemo(
    () =>
      valid
        ? oportunidades.filter((x) => dateIn(day(x.fechaAlta), from, to))
        : [],
    [oportunidades, from, to, valid],
  );
  const search = (s: string) =>
    s
      .toLocaleLowerCase("es-AR")
      .includes(query.trim().toLocaleLowerCase("es-AR"));
  const filteredI = periodI.filter((x) =>
    search(
      `${fullName(x.clienteNombre, x.clienteApellido)} ${x.descripcion || ""} ${x.canalVentaNombre || ""}`,
    ),
  );
  const filteredO = periodO.filter((x) =>
    search(
      `${fullName(x.clienteNombre, x.clienteApellido)} ${x.interes || ""} ${x.canalVentaNombre || ""}`,
    ),
  );
  const pending = periodI.filter((x) =>
    /pendiente|nuevo|sin atender/i.test(x.estadoNombre || ""),
  );
  const active = periodO.filter((x) => open(x.estadoOportunidadNombre));
  const overdue = active.filter(
    (x) => day(x.fechaProximaAccion) && day(x.fechaProximaAccion) < today,
  );
  const pendingActions = active
    .filter((x) => day(x.fechaProximaAccion) >= today)
    .sort((a, b) =>
      day(a.fechaProximaAccion).localeCompare(day(b.fechaProximaAccion)),
    );
  const canExport = hasPermission("Comercial", "Exportar");
  async function exportExcel() {
    const XLSX = await import("xlsx");
    const book = XLSX.utils.book_new();
    const summary = [
      ["Reporte comercial TEKA"],
      ["Período", `${from} a ${to}`],
      ["Intereses ingresados", periodI.length],
      ["Intereses pendientes", pending.length],
      ["Oportunidades creadas", periodO.length],
      ["Oportunidades abiertas", active.length],
      ["Seguimientos vencidos (abiertas del período)", overdue.length],
      [
        "Potencial de oportunidades abiertas",
        active.reduce((s, x) => s + Number(x.montoEstimado || 0), 0),
      ],
    ];
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet(summary),
      "Resumen",
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        periodI.map((x) => ({
          ID: x.interesComercialId,
          Alta: x.fechaAlta,
          Contacto: fullName(x.clienteNombre, x.clienteApellido),
          Canal: x.canalVentaNombre,
          Estado: x.estadoNombre,
          Descripcion: x.descripcion,
          Potencial: x.montoPotencial,
          Responsable: x.responsableNombre,
        })),
      ),
      "Intereses",
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        periodO.map((x) => ({
          ID: x.oportunidadComercialId,
          Alta: x.fechaAlta,
          Cliente: fullName(x.clienteNombre, x.clienteApellido),
          Canal: x.canalVentaNombre,
          Estado: x.estadoOportunidadNombre,
          Interes: x.interes,
          Potencial: x.montoEstimado,
          ProximaAccion: x.proximaAccion,
          FechaProximaAccion: x.fechaProximaAccion,
          Responsable: x.responsableNombre,
        })),
      ),
      "Oportunidades",
    );
    XLSX.writeFile(book, `TEKA_Comercial_${from}_${to}.xlsx`);
  }
  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(19);
    doc.text("TEKA | Informe comercial", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Altas del ${from} al ${to} · Generado ${new Date().toLocaleString("es-AR")}`,
      14,
      28,
    );
    autoTable(doc, {
      startY: 36,
      head: [["Indicador", "Valor"]],
      body: [
        ["Intereses ingresados", String(periodI.length)],
        ["Pendientes", String(pending.length)],
        ["Oportunidades creadas", String(periodO.length)],
        ["Abiertas", String(active.length)],
        ["Seguimientos vencidos", String(overdue.length)],
        [
          "Potencial abierto",
          money(active.reduce((s, x) => s + Number(x.montoEstimado || 0), 0)),
        ],
      ],
    });
    let y =
      (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || 85;
    autoTable(doc, {
      startY: y + 12,
      head: [["Canal", "Oportunidades", "Participación"]],
      body: [
        ...new Set(periodO.map((x) => x.canalVentaNombre || "Sin canal")),
      ].map((k) => [
        k,
        String(
          periodO.filter((x) => (x.canalVentaNombre || "Sin canal") === k)
            .length,
        ),
        `${periodO.length ? Math.round((periodO.filter((x) => (x.canalVentaNombre || "Sin canal") === k).length / periodO.length) * 100) : 0}%`,
      ]),
    });
    y =
      (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || 120;
    autoTable(doc, {
      startY: y + 12,
      head: [["Cliente", "Estado", "Monto estimado"]],
      body: periodO.map((x) => [
        fullName(x.clienteNombre, x.clienteApellido),
        x.estadoOportunidadNombre || "",
        money(Number(x.montoEstimado || 0)),
      ]),
    });
    doc.save(`TEKA_Comercial_${from}_${to}.pdf`);
  }
  const colsI: DataTableColumn<Interes>[] = [
    {
      key: "cliente",
      header: "Contacto",
      render: (x) => (
        <strong>{fullName(x.clienteNombre, x.clienteApellido)}</strong>
      ),
    },
    { key: "desc", header: "Interés", render: (x) => x.descripcion || "—" },
    { key: "canal", header: "Canal", render: (x) => x.canalVentaNombre || "—" },
    {
      key: "estado",
      header: "Estado",
      render: (x) => (
        <span className="cm-pill">{x.estadoNombre || "Sin estado"}</span>
      ),
    },
    { key: "fecha", header: "Alta", render: (x) => date(x.fechaAlta) },
    {
      key: "monto",
      header: "Potencial",
      render: (x) => money(Number(x.montoPotencial || 0)),
    },
  ];
  const colsO: DataTableColumn<Oportunidad>[] = [
    {
      key: "cliente",
      header: "Cliente",
      render: (x) => (
        <strong>{fullName(x.clienteNombre, x.clienteApellido)}</strong>
      ),
    },
    { key: "interes", header: "Interés", render: (x) => x.interes || "—" },
    { key: "canal", header: "Canal", render: (x) => x.canalVentaNombre || "—" },
    {
      key: "estado",
      header: "Estado",
      render: (x) => (
        <span className="cm-pill">
          {x.estadoOportunidadNombre || "Sin estado"}
        </span>
      ),
    },
    {
      key: "responsable",
      header: "Responsable",
      render: (x) => x.responsableNombre || "Sin asignar",
    },
    {
      key: "accion",
      header: "Próxima acción",
      render: (x) => (
        <span>
          {date(x.fechaProximaAccion)}
          <small className="cm-cell-sub">{x.proximaAccion || ""}</small>
        </span>
      ),
    },
    {
      key: "monto",
      header: "Estimado",
      render: (x) => money(Number(x.montoEstimado || 0)),
    },
  ];
  return (
    <AppShell
      title={names[section]}
      breadcrumb={`Comercial / ${names[section]}`}
    >
      <div className="cm-page">
        <div className="cm-head">
          <div>
            <span className="cm-eyebrow">TEKA / GESTIÓN COMERCIAL</span>
            <h1>{names[section]}</h1>
            <p>
              {section === "panel"
                ? "Visión general del desempeño y las actividades comerciales."
                : "Información comercial real, organizada para tomar decisiones."}
            </p>
          </div>
          <button
            className="cm-outline"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
        <div className="cm-toolbar">
          <div className="cm-period">
            <CalendarDays size={17} />
            <label htmlFor="cm-period">Período de alta</label>
            <select
              id="cm-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Últimos 365 días</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          {period === "custom" && (
            <>
              <label className="cm-date">
                Desde{" "}
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </label>
              <label className="cm-date">
                Hasta{" "}
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </label>
            </>
          )}
          <span className="cm-period-caption">
            {valid
              ? `${date(from)} — ${date(to)}`
              : "Seleccioná un rango válido"}
          </span>
          {canExport && (
            <div className="cm-export">
              <button
                onClick={() => void exportPdf()}
                disabled={!valid || loading}
              >
                <Download size={15} /> PDF
              </button>
              <button
                onClick={() => void exportExcel()}
                disabled={!valid || loading}
              >
                <Download size={15} /> Excel
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="cm-error" role="alert">
            <CircleAlert size={18} />
            {error}
            <button onClick={() => void refresh()}>Reintentar</button>
          </div>
        )}
        {loading ? (
          <div className="cm-loading">Consultando datos comerciales…</div>
        ) : (
          <>
            {(section === "panel" || section === "analisis") && (
              <>
                <div className="cm-kpis">
                  <Card
                    icon={Inbox}
                    label="Intereses ingresados"
                    value={String(periodI.length)}
                    sub="Altas del período"
                  />
                  <Card
                    icon={Target}
                    label="Oportunidades abiertas"
                    value={String(active.length)}
                    sub="Creadas en el período"
                  />
                  <Card
                    icon={TrendingUp}
                    kind="gold"
                    label="Potencial abierto"
                    value={money(
                      active.reduce(
                        (s, x) => s + Number(x.montoEstimado || 0),
                        0,
                      ),
                    )}
                    sub="Monto estimado · no facturado"
                  />
                  <Card
                    icon={Clock3}
                    kind="red"
                    label="Seguimientos vencidos"
                    value={String(overdue.length)}
                    sub="Abiertas del período · al día de hoy"
                  />
                </div>
                <div className="cm-analytics">
                  <section className="cm-panel cm-trend">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Evolución de oportunidades</h2>
                        <p>Altas por mes · últimos seis meses</p>
                      </div>
                    </div>
                    <TrendChart items={oportunidades} />
                  </section>
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Oportunidades por canal</h2>
                        <p>Participación en el período</p>
                      </div>
                    </div>
                    <Channels items={periodO} />
                  </section>
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Estado de oportunidades</h2>
                        <p>Distribución en el período</p>
                      </div>
                    </div>
                    <Pipeline items={periodO} />
                  </section>
                </div>
              </>
            )}
            {section === "panel" && (
              <>
                <div className="cm-dual">
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Últimos intereses comerciales</h2>
                        <p>Ingresados en el período</p>
                      </div>
                      <a href="/comercial/pendientes">
                        Ver todos <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <div className="cm-mini-list">
                      {periodI
                        .slice()
                        .sort((a, b) =>
                          day(b.fechaAlta).localeCompare(day(a.fechaAlta)),
                        )
                        .slice(0, 5)
                        .map((x) => (
                          <div key={x.interesComercialId}>
                            <span>
                              <strong>
                                {fullName(x.clienteNombre, x.clienteApellido)}
                              </strong>
                              <small>
                                {x.canalVentaNombre || "Sin canal"} ·{" "}
                                {date(x.fechaAlta)}
                              </small>
                            </span>
                            <span className="cm-pill">
                              {x.estadoNombre || "Sin estado"}
                            </span>
                          </div>
                        ))}
                      {periodI.length === 0 && (
                        <p className="cm-muted">
                          No se registraron intereses en este período.
                        </p>
                      )}
                    </div>
                  </section>
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Próximas acciones</h2>
                        <p>Oportunidades abiertas del período</p>
                      </div>
                      <a href="/comercial/agenda">
                        Ver agenda <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <div className="cm-mini-list">
                      {pendingActions.slice(0, 5).map((x) => (
                        <div key={x.oportunidadComercialId}>
                          <span>
                            <strong>
                              {fullName(x.clienteNombre, x.clienteApellido)}
                            </strong>
                            <small>
                              {x.proximaAccion || "Seguimiento"} ·{" "}
                              {date(x.fechaProximaAccion)}
                            </small>
                          </span>
                          <span className="cm-pill">
                            {x.responsableNombre || "Sin asignar"}
                          </span>
                        </div>
                      ))}
                      {pendingActions.length === 0 && (
                        <p className="cm-muted">
                          Sin próximas acciones registradas.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
                <div className="cm-dual cm-bottom">
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Calendario comercial</h2>
                        <p>Próximas acciones registradas</p>
                      </div>
                      <a href="/comercial/agenda">
                        Abrir agenda <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <Calendar
                      items={oportunidades}
                      month={month}
                      setMonth={setMonth}
                    />
                  </section>
                  <section className="cm-panel">
                    <div className="cm-panel-title">
                      <div>
                        <h2>Oportunidades recientes</h2>
                        <p>Altas del período</p>
                      </div>
                      <a href="/comercial/oportunidades">
                        Ver todas <ArrowUpRight size={15} />
                      </a>
                    </div>
                    <div className="cm-mini-list">
                      {periodO
                        .slice()
                        .sort((a, b) =>
                          day(b.fechaAlta).localeCompare(day(a.fechaAlta)),
                        )
                        .slice(0, 7)
                        .map((x) => (
                          <div key={x.oportunidadComercialId}>
                            <span>
                              <strong>
                                {fullName(x.clienteNombre, x.clienteApellido)}
                              </strong>
                              <small>
                                {x.interes || "Sin descripción"} ·{" "}
                                {x.estadoOportunidadNombre || "Sin estado"}
                              </small>
                            </span>
                            <strong>
                              {money(Number(x.montoEstimado || 0))}
                            </strong>
                          </div>
                        ))}
                      {periodO.length === 0 && (
                        <p className="cm-muted">
                          Sin oportunidades para el período.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </>
            )}
            {(section === "pendientes" || section === "oportunidades") && (
              <section className="cm-panel cm-list">
                <div className="cm-panel-title">
                  <div>
                    <h2>
                      {section === "pendientes"
                        ? "Intereses comerciales"
                        : "Oportunidades comerciales"}
                    </h2>
                    <p>
                      Registros creados entre {date(from)} y {date(to)}
                    </p>
                  </div>
                  {section === "oportunidades" &&
                    hasPermission("Comercial", "Crear") && (
                      <button
                        className="cm-primary-button"
                        onClick={() => setShowCreate(true)}
                      >
                        + Nueva oportunidad
                      </button>
                    )}
                </div>
                <label className="cm-search">
                  Buscar por cliente, canal o interés
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar registros…"
                  />
                </label>
                {section === "pendientes" ? (
                  <DataTable
                    rows={filteredI.slice((page - 1) * 10, page * 10)}
                    columns={colsI}
                    rowKey={(x) => x.interesComercialId}
                    page={page}
                    totalRecords={filteredI.length}
                    onPageChange={setPage}
                  />
                ) : (
                  <DataTable
                    rows={filteredO.slice((page - 1) * 10, page * 10)}
                    columns={colsO}
                    rowKey={(x) => x.oportunidadComercialId}
                    page={page}
                    totalRecords={filteredO.length}
                    onPageChange={setPage}
                  />
                )}
              </section>
            )}
            {section === "agenda" && (
              <div className="cm-dual cm-bottom">
                <section className="cm-panel">
                  <div className="cm-panel-title">
                    <div>
                      <h2>Calendario de próximas acciones</h2>
                      <p>Oportunidades con fecha de seguimiento</p>
                    </div>
                  </div>
                  <Calendar
                    items={oportunidades}
                    month={month}
                    setMonth={setMonth}
                  />
                </section>
                <section className="cm-panel">
                  <div className="cm-panel-title">
                    <div>
                      <h2>Actividades próximas</h2>
                      <p>Oportunidades abiertas creadas en el período</p>
                    </div>
                  </div>
                  <div className="cm-mini-list">
                    {pendingActions.map((x) => (
                      <div key={x.oportunidadComercialId}>
                        <span>
                          <strong>
                            {fullName(x.clienteNombre, x.clienteApellido)}
                          </strong>
                          <small>
                            {x.proximaAccion || "Próxima acción"} ·{" "}
                            {date(x.fechaProximaAccion)}
                          </small>
                        </span>
                        <span className="cm-pill">
                          {x.responsableNombre || "Sin asignar"}
                        </span>
                      </div>
                    ))}
                    {pendingActions.length === 0 && (
                      <p className="cm-muted">No hay próximas acciones.</p>
                    )}
                  </div>
                </section>
              </div>
            )}
            {section === "analisis" && (
              <section className="cm-panel cm-list">
                <div className="cm-panel-title">
                  <div>
                    <h2>Detalle analítico</h2>
                    <p>
                      Oportunidades creadas en el período. Exportá PDF o Excel
                      para analizar los datos procesados.
                    </p>
                  </div>
                </div>
                <DataTable
                  rows={periodO.slice((page - 1) * 10, page * 10)}
                  columns={colsO}
                  rowKey={(x) => x.oportunidadComercialId}
                  page={page}
                  totalRecords={periodO.length}
                  onPageChange={setPage}
                />
              </section>
            )}
          </>
        )}
        {showCreate && (
          <Modal
            title="Nueva oportunidad"
            subtitle="Alta manual · Comercial"
            onClose={() => !saving && setShowCreate(false)}
            wide
          >
            <form
              className="cm-create-form"
              onSubmit={(e) => void submitOpportunity(e)}
            >
              <label>
                Nombre del cliente *
                <input
                  required
                  maxLength={100}
                  value={newOpportunity.clienteNombre}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      clienteNombre: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Apellido
                <input
                  maxLength={100}
                  value={newOpportunity.clienteApellido}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      clienteApellido: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Tipo de cliente
                <select
                  value={newOpportunity.tipoCliente}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      tipoCliente: e.target.value,
                    }))
                  }
                >
                  <option value="particular">Particular</option>
                  <option value="empresa">Empresa</option>
                </select>
              </label>
              <label>
                ID de canal *
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={newOpportunity.canalVentaId}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      canalVentaId: e.target.value,
                    }))
                  }
                />
                <small>
                  Usar el identificador real del catálogo de canales.
                </small>
              </label>
              <label className="cm-full">
                Interés *
                <input
                  required
                  maxLength={150}
                  value={newOpportunity.interes}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      interes: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Monto estimado
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOpportunity.montoEstimado}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      montoEstimado: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Probabilidad (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newOpportunity.probabilidad}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      probabilidad: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Próxima acción
                <input
                  maxLength={250}
                  value={newOpportunity.proximaAccion}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      proximaAccion: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Fecha próxima acción
                <input
                  type="datetime-local"
                  value={newOpportunity.fechaProximaAccion}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      fechaProximaAccion: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="cm-full">
                Observaciones
                <textarea
                  maxLength={500}
                  value={newOpportunity.observaciones}
                  onChange={(e) =>
                    setNewOpportunity((v) => ({
                      ...v,
                      observaciones: e.target.value,
                    }))
                  }
                />
              </label>
              {createError && (
                <p className="cm-create-error" role="alert">
                  {createError}
                </p>
              )}
              <div className="cm-create-actions">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Crear oportunidad"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

export function CommercialPage({ section = "consultas" }: { section?: "consultas" | "oportunidades" | "presupuestos" | "agenda" | "reportes" }) {
  return section === "oportunidades" ? (
    <OpportunitiesPage />
  ) : section === "consultas" ? (
    <ConsultationsPage />
  ) : section === "presupuestos" ? (
    <BudgetsPage />
  ) : section === "agenda" ? (
    <AgendaPage />
  ) : (
    <CommercialDashboard />
  );
}
