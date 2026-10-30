import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { InventoryEvolution } from '../../services/inventoryHistoryApi';
import type { MovementSummary } from '../../services/stockMovementsApi';

export type ReportStockVisualRow = {
  key: string;
  code: string;
  name: string;
  classCode: 'PRODUCTO' | 'INSUMO';
  deposit: string;
  quantity: number;
  minimum: number;
  deficit: number;
  deficitRate: number;
  unit: string;
  state: 'Sin existencias' | 'Bajo mínimo' | 'Cumple mínimo' | 'Sin mínimo';
};

const integer = new Intl.NumberFormat('es-AR');
const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const stateOrder: ReportStockVisualRow['state'][] = ['Sin existencias', 'Bajo mínimo', 'Cumple mínimo', 'Sin mínimo'];
const stateClass: Record<ReportStockVisualRow['state'], string> = {
  'Sin existencias': 'out',
  'Bajo mínimo': 'low',
  'Cumple mínimo': 'ok',
  'Sin mínimo': 'unset',
};

export function StockCompositionChart({ rows }: { rows: ReportStockVisualRow[] }) {
  const values = stateOrder.map((state) => ({ state, value: rows.filter((row) => row.state === state).length }));
  return <section className="inventory-insight-card inventory-stock-composition"><header><div><h3>Composición del inventario</h3><p>Estados excluyentes sobre las posiciones filtradas.</p></div><span>{rows.length} posiciones</span></header>{rows.length ? <><div className="inventory-stacked-bar">{values.filter((item) => item.value).map((item) => <span key={item.state} className={stateClass[item.state]} style={{ width: `${item.value / rows.length * 100}%` }} title={`${item.state}: ${item.value} (${percent.format(item.value / rows.length * 100)}%)`} />)}</div><div className="inventory-visual-legend">{values.map((item) => <div key={item.state}><i className={stateClass[item.state]} /><span>{item.state}</span><strong>{item.value}</strong><small>{percent.format(item.value / rows.length * 100)}%</small></div>)}</div></> : <ChartEmpty />}</section>;
}

export function DepositStateChart({ rows, scopeRows = rows, criticalOnly = false }: { rows: ReportStockVisualRow[]; scopeRows?: ReportStockVisualRow[]; criticalOnly?: boolean }) {
  const deposits = [...new Set(scopeRows.map((row) => row.deposit))].map((deposit) => {
    const base = scopeRows.filter((row) => row.deposit === deposit);
    const selected = rows.filter((row) => row.deposit === deposit);
    const affected = selected.filter((row) => row.state === 'Sin existencias' || row.state === 'Bajo mínimo');
    return { deposit, total: base.length, selected: selected.length, affected: affected.length, values: stateOrder.map((state) => ({ state, value: selected.filter((row) => row.state === state).length })) };
  }).sort((a, b) => criticalOnly ? b.affected - a.affected : b.total - a.total);
  return <section className="inventory-insight-card inventory-deposit-stacks"><header><div><h3>{criticalOnly ? 'Concentración por depósito' : 'Comparación por depósito'}</h3><p>{criticalOnly ? 'Cantidad y proporción de posiciones afectadas dentro del alcance filtrado.' : 'Distribución de estados por depósito, sin sumar cantidades físicas.'}</p></div></header>{deposits.length ? <div className="inventory-deposit-stack-list">{deposits.map((group) => <div key={group.deposit}><strong>{group.deposit}</strong><div className="inventory-stacked-bar">{group.values.filter((item) => item.value).map((item) => <span key={item.state} className={stateClass[item.state]} style={{ width: `${item.value / group.total * 100}%` }} title={`${item.state}: ${item.value}`} />)}</div><span>{criticalOnly ? `${group.affected} de ${group.total} afectadas (${percent.format(group.affected / group.total * 100)}%)` : group.selected === group.total ? `${group.total} posiciones` : `${group.selected} de ${group.total} visibles`}</span></div>)}</div> : <ChartEmpty />}</section>;
}

export function ClassStateChart({ rows }: { rows: ReportStockVisualRow[] }) {
  const groups = ([['PRODUCTO', 'Productos terminados'], ['INSUMO', 'Insumos']] as const).map(([code, label]) => {
    const filtered = rows.filter((row) => row.classCode === code);
    const affected = filtered.filter((row) => row.state === 'Sin existencias' || row.state === 'Bajo mínimo').length;
    return { code, label, total: filtered.length, affected };
  });
  return <section className="inventory-insight-card inventory-class-comparison"><header><div><h3>Productos frente a insumos</h3><p>Proporción de posiciones afectadas por clase.</p></div></header><div>{groups.map((group) => <article key={group.code}><span>{group.label}</span><strong>{group.total ? `${percent.format(group.affected / group.total * 100)}%` : '—'}</strong><p>{group.affected} de {group.total} posiciones</p><i><em style={{ width: `${group.total ? group.affected / group.total * 100 : 0}%` }} /></i></article>)}</div></section>;
}

export function DeficitRankingChart({ rows }: { rows: ReportStockVisualRow[] }) {
  const ranking = rows.filter((row) => row.minimum > 0 && row.deficit > 0).sort((a, b) => b.deficitRate - a.deficitRate).slice(0, 7);
  return <section className="inventory-insight-card inventory-deficit-ranking"><header><div><h3>Ranking de déficits relativos</h3><p>Porcentaje faltante respecto del mínimo configurado.</p></div></header>{ranking.length ? <div>{ranking.map((row) => <article key={row.key}><div><strong>{row.name}</strong><span>{row.code} · {row.deposit}</span></div><i><em style={{ width: `${Math.min(row.deficitRate * 100, 100)}%` }} /></i><b>{percent.format(row.deficitRate * 100)}%</b><small>Faltan {decimal.format(row.deficit)} {row.unit}</small></article>)}</div> : <ChartEmpty text="No hay posiciones con mínimo positivo y déficit." />}</section>;
}

export function PeriodComparisonChart({ current, previous }: { current: MovementSummary; previous: MovementSummary }) {
  const rows = [
    { label: 'Entradas', current: current.cantidadEntradas, previous: previous.cantidadEntradas },
    { label: 'Salidas', current: current.cantidadSalidas, previous: previous.cantidadSalidas },
    { label: 'Actividad total', current: current.totalMovimientos, previous: previous.totalMovimientos },
  ];
  const max = Math.max(1, ...rows.flatMap((row) => [row.current, row.previous]));
  return <section className="inventory-insight-card inventory-period-comparison"><header><div><h3>Comparación entre períodos</h3><p>Conteo de operaciones del rango actual y del anterior equivalente.</p></div><div className="inventory-mini-legend"><span className="current">Actual</span><span className="previous">Anterior</span></div></header><div>{rows.map((row) => <article key={row.label}><span>{row.label}</span><div><i className="current" style={{ height: `${row.current / max * 100}%` }} title={`Actual: ${row.current}`} /><i className="previous" style={{ height: `${row.previous / max * 100}%` }} title={`Anterior: ${row.previous}`} /></div><small>{integer.format(row.current)} / {integer.format(row.previous)}</small></article>)}</div></section>;
}

export function OperationsCompositionChart({ summary }: { summary: MovementSummary }) {
  const classified = summary.cantidadManuales + summary.cantidadAutomaticos;
  const manual = classified ? summary.cantidadManuales / classified * 100 : 0;
  const automatic = classified ? summary.cantidadAutomaticos / classified * 100 : 0;
  return <section className="inventory-insight-card inventory-operations-composition"><header><div><h3>Composición operativa</h3><p>Movimientos clasificados como manuales o automáticos.</p></div></header>{classified ? <><div className="inventory-stacked-bar"><span className="manual" style={{ width: `${manual}%` }} /><span className="automatic" style={{ width: `${automatic}%` }} /></div><div className="inventory-visual-legend"><div><i className="manual" /><span>Manuales</span><strong>{summary.cantidadManuales}</strong><small>{percent.format(manual)}%</small></div><div><i className="automatic" /><span>Automáticos</span><strong>{summary.cantidadAutomaticos}</strong><small>{percent.format(automatic)}%</small></div></div></> : <ChartEmpty text="No hay operaciones clasificadas en el período." />}</section>;
}

export function EvolutionVariationChart({ points, unit }: { points: InventoryEvolution[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) return <section className="inventory-insight-card"><header><div><h3>Variaciones por período</h3><p>Cambios positivos y negativos del saldo.</p></div></header><ChartEmpty /></section>;
  const width = 620, height = 210, padding = { l: 52, r: 12, t: 16, b: 37 };
  const max = Math.max(1, ...points.map((point) => Math.abs(point.variacion)));
  const zero = padding.t + (height - padding.t - padding.b) / 2;
  const available = width - padding.l - padding.r;
  const slot = available / points.length;
  const barWidth = Math.max(4, Math.min(26, slot * .58));
  const labels = points.length <= 6 ? points.map((_, index) => index) : [0, Math.round((points.length - 1) / 2), points.length - 1];
  return <section className="inventory-insight-card inventory-variation-chart"><header><div><h3>Variaciones por período</h3><p>Cambio neto de cada intervalo; no representa el saldo acumulado.</p></div><span>{unit}</span></header><div className="inventory-chart-plot"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Variaciones del stock en ${unit}`}><line className="zero" x1={padding.l} y1={zero} x2={width - padding.r} y2={zero} /><text x={padding.l - 7} y={padding.t + 4}>{decimal.format(max)}</text><text x={padding.l - 7} y={zero + 4}>0</text><text x={padding.l - 7} y={height - padding.b}>{decimal.format(-max)}</text>{points.map((point, index) => { const magnitude = Math.abs(point.variacion) / max * ((height - padding.t - padding.b) / 2); const x = padding.l + index * slot + (slot - barWidth) / 2; const y = point.variacion >= 0 ? zero - magnitude : zero; return <rect key={`${point.periodo}-${index}`} className={point.variacion >= 0 ? 'positive' : 'negative'} x={x} y={y} width={barWidth} height={magnitude || 1} rx="2" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} />; })}{labels.map((index) => <text className="x" key={index} x={padding.l + index * slot + slot / 2} y={height - 12}>{new Date(`${points[index].periodo.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { month: 'short', day: '2-digit' })}</text>)}</svg>{hover != null && <div className="inventory-chart-tooltip"><strong>{new Date(`${points[hover].periodo.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR')}</strong><span>{points[hover].variacion >= 0 ? '+' : ''}{decimal.format(points[hover].variacion)} {unit}</span></div>}</div><small>Eje Y · variación ({unit})</small></section>;
}

function ChartEmpty({ text = 'Sin datos para representar con los filtros aplicados.' }: { text?: string }) {
  return <div className="inventory-chart-empty"><BarChart3 size={22} /><span>{text}</span></div>;
}
