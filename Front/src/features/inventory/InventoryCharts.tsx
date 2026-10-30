import { useState } from 'react';
import { Activity, LineChart } from 'lucide-react';
import type { InventoryEvolution } from '../../services/inventoryHistoryApi';
import type { MovementSeriesPoint } from '../../services/stockMovementsApi';

const integer = new Intl.NumberFormat('es-AR');
const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const day = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

type ActivityGrouping = 'day' | 'week' | 'month';
type ActivityChartProps = {
  points: MovementSeriesPoint[];
  title?: string;
  comparisonPoints?: MovementSeriesPoint[];
  grouping?: ActivityGrouping;
  loading?: boolean;
};

function activityBucket(value: string, grouping: ActivityGrouping) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (grouping === 'month') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  if (grouping === 'week') {
    const monday = new Date(date);
    const weekday = monday.getDay() || 7;
    monday.setDate(monday.getDate() - weekday + 1);
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
  }
  return value.slice(0, 10);
}

function aggregateActivity(points: MovementSeriesPoint[], grouping: ActivityGrouping) {
  const buckets = new Map<string, { date: string; entries: number; exits: number; total: number }>();
  points.forEach((point) => {
    const key = activityBucket(point.fecha, grouping);
    const row = buckets.get(key) ?? { date: key, entries: 0, exits: 0, total: 0 };
    if (point.signo > 0) row.entries += point.cantidadMovimientos;
    if (point.signo < 0) row.exits += point.cantidadMovimientos;
    row.total += point.cantidadMovimientos;
    buckets.set(key, row);
  });
  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function activityLabel(value: string, grouping: ActivityGrouping) {
  const date = new Date(`${value}T00:00:00`);
  if (grouping === 'month') return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
  if (grouping === 'week') return `Sem. ${date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}`;
  return day(value);
}

export function InventoryActivityChart({
  points,
  title = 'Actividad reciente',
  comparisonPoints = [],
  grouping = 'day',
  loading = false,
}: ActivityChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const rows = aggregateActivity(points, grouping);
  const comparisonRows = aggregateActivity(comparisonPoints, grouping);
  if (loading) return <section className="inventory-chart-card"><h2>{title}</h2><p>Conteo de operaciones de entrada y salida.</p><div className="inventory-chart-empty"><Activity size={23} /><span>Cargando actividad del período…</span></div></section>;
  if (!rows.length) return <section className="inventory-chart-card"><h2>{title}</h2><p>Conteo de operaciones de entrada y salida por fecha.</p><div className="inventory-chart-empty"><Activity size={23} /><span>Sin movimientos para el período seleccionado.</span></div></section>;
  const width = 620, height = 210, padding = { l: 42, r: 12, t: 14, b: 35 };
  const max = Math.max(1, ...rows.flatMap((row) => [row.entries, row.exits]), ...comparisonRows.map((row) => row.total));
  const coords = (key: 'entries' | 'exits') => rows.map((row, index) => ({
    x: rows.length === 1 ? padding.l + (width - padding.l - padding.r) / 2 : padding.l + index * ((width - padding.l - padding.r) / (rows.length - 1)),
    y: padding.t + (1 - row[key] / max) * (height - padding.t - padding.b),
  }));
  const entries = coords('entries');
  const exits = coords('exits');
  const previousCoords = comparisonRows.map((row, index) => ({
    x: comparisonRows.length === 1 ? padding.l + (width - padding.l - padding.r) / 2 : padding.l + index * ((width - padding.l - padding.r) / (comparisonRows.length - 1)),
    y: padding.t + (1 - row.total / max) * (height - padding.t - padding.b),
  }));
  const labels = rows.length <= 6 ? rows.map((_, index) => index) : [0, Math.round((rows.length - 1) / 2), rows.length - 1];
  const groupingText = grouping === 'month' ? 'mes' : grouping === 'week' ? 'semana' : 'fecha';
  return <section className="inventory-chart-card"><header><div><h2>{title}</h2><p>Conteo de operaciones agrupado por {groupingText}; no suma cantidades físicas.</p></div><div className="inventory-chart-legend"><span className="entry">Entradas</span><span className="exit">Salidas</span>{comparisonRows.length > 0 && <span className="previous">Total anterior</span>}</div></header><div className="inventory-chart-plot"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Operaciones de entrada y salida por período">{[0, .5, 1].map((ratio) => <g key={ratio}><line x1={padding.l} y1={padding.t + ratio * (height - padding.t - padding.b)} x2={width - padding.r} y2={padding.t + ratio * (height - padding.t - padding.b)} /><text x={padding.l - 7} y={padding.t + ratio * (height - padding.t - padding.b) + 3}>{integer.format(max * (1 - ratio))}</text></g>)}{previousCoords.length > 0 && <polyline className="previous" points={previousCoords.map((value) => `${value.x},${value.y}`).join(' ')} />}<polyline className="entry" points={entries.map((value) => `${value.x},${value.y}`).join(' ')} /><polyline className="exit" points={exits.map((value) => `${value.x},${value.y}`).join(' ')} />{labels.map((index) => <text className="x" key={index} x={entries[index].x} y={height - 11}>{activityLabel(rows[index].date, grouping)}</text>)}{rows.map((row, index) => <g key={row.date} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)}><circle className="entry" cx={entries[index].x} cy={entries[index].y} r="4" /><circle className="exit" cx={exits[index].x} cy={exits[index].y} r="4" /><circle className="hit" cx={entries[index].x} cy={(entries[index].y + exits[index].y) / 2} r="14" /></g>)}</svg>{hover != null && <div className="inventory-chart-tooltip"><strong>{activityLabel(rows[hover].date, grouping)}</strong><span>{rows[hover].entries} entradas · {rows[hover].exits} salidas</span>{comparisonRows[hover] && <span>{comparisonRows[hover].total} operaciones en intervalo anterior</span>}</div>}</div><small>Eje Y · cantidad de operaciones</small></section>;
}

export function InventoryEvolutionChart({ points, unit, title = 'Evolución del stock' }: { points: InventoryEvolution[]; unit: string; title?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) return <section className="inventory-chart-card"><h2>{title}</h2><p>Saldo informado por el historial.</p><div className="inventory-chart-empty"><LineChart size={23} /><span>Sin puntos históricos para el período.</span></div></section>;
  const values = points.map((point) => point.saldoFinal), rawMin = Math.min(...values), rawMax = Math.max(...values), extra = Math.max(1, Math.abs(rawMax) * .1), min = rawMin === rawMax ? Math.max(0, rawMin - extra) : rawMin, max = rawMin === rawMax ? rawMax + extra : rawMax;
  const width = 620, height = 210, padding = { l: 52, r: 12, t: 14, b: 35 }, coords = points.map((point, index) => ({ x: points.length === 1 ? padding.l + (width - padding.l - padding.r) / 2 : padding.l + index * ((width - padding.l - padding.r) / (points.length - 1)), y: padding.t + (1 - (point.saldoFinal - min) / (max - min)) * (height - padding.t - padding.b) }));
  const labels = points.length <= 6 ? points.map((_, index) => index) : [0, Math.round((points.length - 1) / 2), points.length - 1];
  return <section className="inventory-chart-card"><header><div><h2>{title}</h2><p>Saldo de un único artículo expresado en {unit}.</p></div><div className="inventory-chart-legend"><span className="stock">Saldo</span></div></header><div className="inventory-chart-plot"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Evolución del saldo en ${unit}`}>{[0, .5, 1].map((ratio) => <g key={ratio}><line x1={padding.l} y1={padding.t + ratio * (height - padding.t - padding.b)} x2={width - padding.r} y2={padding.t + ratio * (height - padding.t - padding.b)} /><text x={padding.l - 7} y={padding.t + ratio * (height - padding.t - padding.b) + 3}>{decimal.format(max - ratio * (max - min))}</text></g>)}<polyline className="stock" points={coords.map((value) => `${value.x},${value.y}`).join(' ')} />{labels.map((index) => <text className="x" key={index} x={coords[index].x} y={height - 11}>{day(points[index].periodo)}</text>)}{points.map((point, index) => <g key={point.periodo} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)}><circle className="stock" cx={coords[index].x} cy={coords[index].y} r="4" /><circle className="hit" cx={coords[index].x} cy={coords[index].y} r="13" /></g>)}</svg>{hover != null && <div className="inventory-chart-tooltip"><strong>{new Date(`${points[hover].periodo.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR')}</strong><span>{decimal.format(points[hover].saldoFinal)} {unit}</span></div>}</div><small>Eje Y · saldo ({unit})</small></section>;
}
