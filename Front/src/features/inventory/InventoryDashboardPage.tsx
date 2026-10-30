import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Boxes,
  CalendarDays,
  CheckCircle2,
  PackageX,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { inventoryStockApi, type StockProduct, type StockSupply } from '../../services/inventoryStockApi';
import { productsApi, type Product } from '../../services/productsApi';
import { suppliesApi, type Supply } from '../../services/suppliesApi';
import { stockMovementsApi, type MovementSeriesPoint, type MovementSummary } from '../../services/stockMovementsApi';
import { InventoryActivityChart } from './InventoryCharts';
import './inventoryAnalytics.css';

type PeriodMode = '7' | '30' | '90' | 'custom';
type DateRange = { from: string; to: string };
type Priority = {
  key: string;
  code: string;
  name: string;
  className: 'Producto terminado' | 'Insumo';
  deposit: string;
  quantity: number;
  minimum: number;
  deficit: number;
  deficitRate: number;
  unit: string;
  state: 'Sin existencias' | 'Bajo mínimo';
};

const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const emptySummary: MovementSummary = {
  totalMovimientos: 0,
  cantidadEntradas: 0,
  cantidadSalidas: 0,
  cantidadManuales: 0,
  cantidadAutomaticos: 0,
  cantidadReversas: 0,
  cantidadAnulados: 0,
};

function localIso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocal(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function presetRange(days: number): DateRange {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  from.setDate(from.getDate() - days + 1);
  return { from: localIso(from), to: localIso(to) };
}

function previousRange(range: DateRange): DateRange {
  const from = parseLocal(range.from);
  const to = parseLocal(range.to);
  const duration = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  const previousTo = new Date(from);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - duration + 1);
  return { from: localIso(previousFrom), to: localIso(previousTo) };
}

function formatRange(range: DateRange) {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${parseLocal(range.from).toLocaleDateString('es-AR', options)} al ${parseLocal(range.to).toLocaleDateString('es-AR', options)}`;
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function InventoryDashboardPage() {
  const initialRange = useMemo(() => presetRange(30), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [productStock, setProductStock] = useState<StockProduct[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[]>([]);
  const [summary, setSummary] = useState<MovementSummary>(emptySummary);
  const [previous, setPrevious] = useState<MovementSummary>(emptySummary);
  const [series, setSeries] = useState<MovementSeriesPoint[]>([]);
  const [previousSeries, setPreviousSeries] = useState<MovementSeriesPoint[]>([]);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('30');
  const [range, setRange] = useState<DateRange>(initialRange);
  const [custom, setCustom] = useState<DateRange>(initialRange);
  const [periodError, setPeriodError] = useState('');
  const [stockLoading, setStockLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [stockError, setStockError] = useState('');
  const [activityError, setActivityError] = useState('');
  const activityRequest = useRef(0);

  const loadStock = useCallback(async () => {
    setStockLoading(true);
    setStockError('');
    try {
      const [productCatalog, supplyCatalog, productsResult, suppliesResult] = await Promise.all([
        productsApi.list(),
        suppliesApi.list(),
        inventoryStockApi.products(),
        inventoryStockApi.supplies(),
      ]);
      setProducts(productCatalog);
      setSupplies(supplyCatalog);
      setProductStock(productsResult);
      setSupplyStock(suppliesResult);
    } catch (error) {
      setStockError(errorText(error, 'No se pudo consultar el estado actual del inventario.'));
    } finally {
      setStockLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async (nextRange: DateRange) => {
    const requestId = ++activityRequest.current;
    const prior = previousRange(nextRange);
    setActivityLoading(true);
    setActivityError('');
    setSummary(emptySummary);
    setPrevious(emptySummary);
    setSeries([]);
    setPreviousSeries([]);
    try {
      const [currentSummary, priorSummary, currentSeries, priorSeries] = await Promise.all([
        stockMovementsApi.summary({ desde: nextRange.from, hasta: nextRange.to }),
        stockMovementsApi.summary({ desde: prior.from, hasta: prior.to }),
        stockMovementsApi.series({ desde: nextRange.from, hasta: nextRange.to }),
        stockMovementsApi.series({ desde: prior.from, hasta: prior.to }),
      ]);
      if (requestId !== activityRequest.current) return;
      setSummary(currentSummary);
      setPrevious(priorSummary);
      setSeries(currentSeries);
      setPreviousSeries(priorSeries);
    } catch (error) {
      if (requestId !== activityRequest.current) return;
      setActivityError(errorText(error, 'No se pudo consultar la actividad del período.'));
    } finally {
      if (requestId === activityRequest.current) setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStock();
    void loadActivity(initialRange);
  }, [initialRange, loadActivity, loadStock]);

  function selectPreset(mode: Exclude<PeriodMode, 'custom'>) {
    const next = presetRange(Number(mode));
    setPeriodMode(mode);
    setRange(next);
    setCustom(next);
    setPeriodError('');
    void loadActivity(next);
  }

  function applyCustom() {
    const today = localIso(new Date());
    if (!custom.from || !custom.to) {
      setPeriodError('Ingresá las fechas desde y hasta.');
      return;
    }
    if (custom.from > custom.to) {
      setPeriodError('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    if (custom.to > today) {
      setPeriodError('El período no puede incluir fechas futuras.');
      return;
    }
    setPeriodError('');
    setRange(custom);
    void loadActivity(custom);
  }

  const priorities = useMemo(() => {
    const productMap = new Map(products.map((item) => [item.productoId, item]));
    const supplyMap = new Map(supplies.map((item) => [item.insumoId, item]));
    const rows: Priority[] = [
      ...productStock.map((stock): Priority => {
        const item = productMap.get(stock.productoId);
        const deficit = Math.max(stock.stockMinimo - stock.cantidadActual, 0);
        return {
          key: `P-${stock.stockProductoId}`,
          code: stock.productoCodigo,
          name: stock.productoNombre,
          className: 'Producto terminado',
          deposit: stock.depositoNombre,
          quantity: stock.cantidadActual,
          minimum: stock.stockMinimo,
          deficit,
          deficitRate: stock.stockMinimo > 0 ? deficit / stock.stockMinimo : 0,
          unit: item?.unidadMedidaAbreviatura || item?.unidadMedidaNombre || '',
          state: stock.cantidadActual === 0 ? 'Sin existencias' : 'Bajo mínimo',
        };
      }),
      ...supplyStock.map((stock): Priority => {
        const item = supplyMap.get(stock.insumoId);
        const deficit = Math.max(stock.stockMinimo - stock.cantidadActual, 0);
        return {
          key: `I-${stock.stockInsumoId}`,
          code: stock.insumoCodigo,
          name: stock.insumoNombre,
          className: 'Insumo',
          deposit: stock.depositoNombre,
          quantity: stock.cantidadActual,
          minimum: stock.stockMinimo,
          deficit,
          deficitRate: stock.stockMinimo > 0 ? deficit / stock.stockMinimo : 0,
          unit: item?.unidadMedidaAbreviatura || item?.unidadMedidaNombre || '',
          state: stock.cantidadActual === 0 ? 'Sin existencias' : 'Bajo mínimo',
        };
      }),
    ];
    return rows
      .filter((row) => row.quantity === 0 || (row.quantity > 0 && row.minimum > 0 && row.quantity < row.minimum))
      .sort((a, b) => {
        const stateOrder = Number(a.quantity !== 0) - Number(b.quantity !== 0);
        return stateOrder || b.deficitRate - a.deficitRate || a.code.localeCompare(b.code, 'es-AR', { numeric: true });
      });
  }, [productStock, products, supplies, supplyStock]);

  const allStock = useMemo(() => [...productStock, ...supplyStock], [productStock, supplyStock]);
  const outProducts = productStock.filter((stock) => stock.cantidadActual === 0).length;
  const outSupplies = supplyStock.filter((stock) => stock.cantidadActual === 0).length;
  const out = outProducts + outSupplies;
  const low = allStock.filter((stock) => stock.cantidadActual > 0 && stock.stockMinimo > 0 && stock.cantidadActual < stock.stockMinimo).length;
  const evaluable = allStock.filter((stock) => stock.stockMinimo > 0);
  const compliant = evaluable.filter((stock) => stock.cantidadActual >= stock.stockMinimo).length;
  const complianceRate = evaluable.length ? (compliant / evaluable.length) * 100 : 0;
  const comparison = previous.totalMovimientos > 0
    ? ((summary.totalMovimientos - previous.totalMovimientos) / previous.totalMovimientos) * 100
    : null;
  const rangeDays = Math.round((parseLocal(range.to).getTime() - parseLocal(range.from).getTime()) / 86_400_000) + 1;
  const chartGrouping = rangeDays > 180 ? 'month' : rangeDays > 45 ? 'week' : 'day';
  const classifiedOperations = summary.cantidadManuales + summary.cantidadAutomaticos;
  const unclassifiedOperations = Math.max(summary.totalMovimientos - classifiedOperations, 0);
  const manualShare = classifiedOperations ? (summary.cantidadManuales / classifiedOperations) * 100 : 0;
  const automaticShare = classifiedOperations ? (summary.cantidadAutomaticos / classifiedOperations) * 100 : 0;

  const interpretation = useMemo(() => {
    const lines: string[] = [];
    if (summary.totalMovimientos === 0) {
      lines.push('No se registraron movimientos durante el período seleccionado.');
    } else if (comparison === null) {
      lines.push('No es posible calcular la variación porque el período anterior no registró operaciones.');
    } else if (comparison > 0) {
      lines.push(`La actividad aumentó ${percentage.format(Math.abs(comparison))}% respecto del período anterior equivalente.`);
    } else if (comparison < 0) {
      lines.push(`La actividad disminuyó ${percentage.format(Math.abs(comparison))}% respecto del período anterior equivalente.`);
    } else {
      lines.push('La cantidad de movimientos se mantuvo igual al período anterior equivalente.');
    }
    if (summary.cantidadEntradas > summary.cantidadSalidas) lines.push('Se registraron más operaciones de entrada que de salida.');
    else if (summary.cantidadSalidas > summary.cantidadEntradas) lines.push('Se registraron más operaciones de salida que de entrada.');
    else if (summary.totalMovimientos > 0) lines.push('Las operaciones de entrada y salida tuvieron la misma presencia.');
    if (out || low) lines.push(`El stock actual presenta ${out} posiciones sin existencias y ${low} bajo el mínimo configurado.`);
    else if (!stockLoading && !stockError) lines.push('No hay posiciones sin existencias ni bajo el mínimo configurado.');
    return lines;
  }, [comparison, low, out, stockError, stockLoading, summary]);

  return (
    <AppShell title="Panel de inventario" breadcrumb="Inventario / Panel">
      <main className="inventory-analytics-page inventory-dashboard-page">
        <PageHeader
          kicker="INVENTARIO"
          title="Panel de inventario"
          description="Una lectura rápida del estado actual, la actividad y las situaciones que requieren revisión."
        />

        <section className="inventory-period-control" aria-labelledby="inventory-period-title">
          <div className="inventory-period-intro">
            <CalendarDays size={19} />
            <div>
              <h2 id="inventory-period-title">Período de actividad</h2>
              <p>Aplicado a movimientos, comparaciones y gráficos. El stock actual no cambia con este selector.</p>
            </div>
          </div>
          <div className="inventory-period-presets" aria-label="Períodos rápidos">
            {(['7', '30', '90'] as const).map((mode) => (
              <button key={mode} type="button" className={periodMode === mode ? 'active' : ''} onClick={() => selectPreset(mode)}>
                Últimos {mode} días
              </button>
            ))}
            <button type="button" className={periodMode === 'custom' ? 'active' : ''} onClick={() => setPeriodMode('custom')}>
              Personalizado
            </button>
          </div>
          {periodMode === 'custom' && (
            <div className="inventory-period-custom">
              <label><span>Desde</span><input type="date" value={custom.from} max={custom.to || localIso(new Date())} onChange={(event) => setCustom((current) => ({ ...current, from: event.target.value }))} /></label>
              <label><span>Hasta</span><input type="date" value={custom.to} min={custom.from} max={localIso(new Date())} onChange={(event) => setCustom((current) => ({ ...current, to: event.target.value }))} /></label>
              <button type="button" className="button primary" onClick={applyCustom} disabled={activityLoading}>Aplicar</button>
            </div>
          )}
          <div className="inventory-period-applied"><span>Rango aplicado</span><strong>{formatRange(range)}</strong></div>
          {periodError && <p className="inventory-period-error" role="alert">{periodError}</p>}
        </section>

        {stockError && <div className="inventory-error" role="alert"><Ban size={18} /><span>{stockError}</span><button className="button secondary compact" onClick={() => void loadStock()}><RefreshCw size={14} />Reintentar stock</button></div>}
        {activityError && <div className="inventory-error" role="alert"><Ban size={18} /><span>{activityError}</span><button className="button secondary compact" onClick={() => void loadActivity(range)}><RefreshCw size={14} />Reintentar actividad</button></div>}

        <div className="inventory-dashboard-scope"><span>Situación actual</span><p>Posiciones artículo–depósito informadas por el stock vigente.</p></div>
        <section className="inventory-dashboard-metrics" aria-label="Indicadores principales de inventario">
          <a className="danger" href="/inventory/stock?state=out">
            <div className="inventory-metric-icon"><PackageX size={21} /></div>
            <div><span>Sin existencias</span><strong>{stockLoading ? '…' : out}</strong><p>{outProducts} productos terminados · {outSupplies} insumos.</p><small>Revisar existencias <ArrowRight size={13} /></small></div>
          </a>
          <a className="warning" href="#inventory-priorities">
            <div className="inventory-metric-icon"><AlertTriangle size={21} /></div>
            <div><span>Bajo el mínimo</span><strong>{stockLoading ? '…' : low}</strong><p>Posiciones con stock positivo inferior al mínimo configurado.</p><small>Ver prioridades <ArrowRight size={13} /></small></div>
          </a>
          <a className="success" href="/inventory/reports?report=availability">
            <div className="inventory-metric-icon"><CheckCircle2 size={21} /></div>
            <div><span>Cumplimiento de mínimos</span><strong>{stockLoading ? '…' : `${percentage.format(complianceRate)}%`}</strong><p>{compliant} de {evaluable.length} posiciones evaluables cumplen su mínimo.</p><small>Analizar disponibilidad <ArrowRight size={13} /></small></div>
          </a>
          <a className="neutral" href="/inventory/movements">
            <div className="inventory-metric-icon"><Boxes size={21} /></div>
            <div><span>Actividad del período</span><strong>{activityLoading ? '…' : number.format(summary.totalMovimientos)}</strong><p>{summary.cantidadEntradas} entradas · {summary.cantidadSalidas} salidas.</p><small>{comparison === null ? 'Comparación no calculable' : `${comparison >= 0 ? '+' : ''}${percentage.format(comparison)}% vs. período anterior`} <ArrowRight size={13} /></small></div>
          </a>
        </section>

        <section id="inventory-priorities" className="inventory-priority-section">
          <header className="inventory-section-heading">
            <div><h2>Prioridades operativas</h2><p>Las cinco posiciones más relevantes: primero sin existencias y luego por mayor porcentaje de déficit.</p></div>
            <a className="button secondary" href="/inventory/reports?report=critical">Ver listado completo</a>
          </header>
          {stockLoading ? (
            <div className="inventory-priority-empty">Evaluando el stock actual…</div>
          ) : priorities.length === 0 ? (
            <div className="inventory-priority-empty"><CheckCircle2 size={23} /><div><strong>Sin prioridades pendientes</strong><span>No hay posiciones sin existencias ni bajo el mínimo.</span></div></div>
          ) : (
            <div className="inventory-priority-list">
              {priorities.slice(0, 5).map((row) => (
                <article key={row.key}>
                  <div className={`inventory-priority-rank ${row.quantity === 0 ? 'out' : 'low'}`} aria-hidden="true" />
                  <div className="inventory-priority-article"><strong>{row.name}</strong><span>{row.code} · {row.className}</span></div>
                  <div className="inventory-priority-deposit"><span>Depósito</span><strong>{row.deposit}</strong></div>
                  <div className="inventory-priority-value"><span>Existencia</span><strong>{number.format(row.quantity)} {row.unit}</strong></div>
                  <div className="inventory-priority-value"><span>Mínimo</span><strong>{number.format(row.minimum)} {row.unit}</strong></div>
                  <div className="inventory-priority-value deficit"><span>Déficit</span><strong>{number.format(row.deficit)} {row.unit}</strong></div>
                  <span className={`inventory-priority ${row.quantity === 0 ? 'out' : 'low'}`}>{row.state}</span>
                </article>
              ))}
            </div>
          )}
          <p className="inventory-priority-note">Una posición sin existencias requiere revisión; no implica automáticamente una orden de reposición o fabricación.</p>
        </section>

        <div className="inventory-dashboard-scope historical"><span>Actividad histórica</span><p>{formatRange(range)} · conteo de operaciones, sin sumar cantidades de unidades incompatibles.</p></div>
        <section className="inventory-dashboard-visuals">
          <InventoryActivityChart
            points={series}
            comparisonPoints={previousSeries}
            grouping={chartGrouping}
            title="Evolución de la actividad"
            loading={activityLoading}
          />
          <article className="inventory-composition-card">
            <header><div><h2>Composición operativa</h2><p>Distribución de movimientos clasificados por modalidad.</p></div><strong>{activityLoading ? '…' : number.format(classifiedOperations)}</strong></header>
            {activityLoading ? <div className="inventory-composition-empty">Cargando composición…</div> : classifiedOperations === 0 ? <div className="inventory-composition-empty">Sin operaciones clasificadas para el período.</div> : (
              <>
                <div className="inventory-composition-bar" aria-label={`${percentage.format(manualShare)}% manuales y ${percentage.format(automaticShare)}% automáticos`}>
                  <span className="manual" style={{ width: `${manualShare}%` }} />
                  <span className="automatic" style={{ width: `${automaticShare}%` }} />
                </div>
                <div className="inventory-composition-legend">
                  <div><i className="manual" /><span>Manuales<small>Ajustes registrados por un usuario</small></span><strong>{summary.cantidadManuales}</strong></div>
                  <div><i className="automatic" /><span>Automáticos<small>Generados por otros circuitos</small></span><strong>{summary.cantidadAutomaticos}</strong></div>
                </div>
              </>
            )}
            {unclassifiedOperations > 0 && <p className="inventory-composition-note">{unclassifiedOperations} operaciones no están clasificadas como manuales o automáticas por el resumen recibido. Las anulaciones y reversiones no se interpretan aquí como categorías excluyentes.</p>}
            <a href="/inventory/movements">Explorar movimientos <ArrowRight size={13} /></a>
          </article>
        </section>

        <section className="inventory-period-reading">
          <div><span>Lectura del período</span><h2>Qué muestran los datos</h2></div>
          <ul>{interpretation.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      </main>
    </AppShell>
  );
}
