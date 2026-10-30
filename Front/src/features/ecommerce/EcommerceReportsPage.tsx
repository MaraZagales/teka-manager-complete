import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, PackageCheck, ShoppingBag } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { InventoryExportActions } from '../../components/data/InventoryExportActions';
import { PageHeader } from '../../components/data/PageHeader';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { exportEcommerceExcel, exportEcommercePdf, type EcommerceReportData } from '../../services/ecommerceAnalyticsReports';
import { onlineCustomersApi, type CustomerEvolution, type ProductPreference, type SummaryResponse } from '../../services/onlineCustomersApi';
import { consultarPedidosOnline, type Pedido } from '../../services/onlineOrdersApi';
import { promotionsBenefitsApi, type CutBenefitAssignment } from '../../services/promotionsBenefitsApi';
import { ProductRanking, SalesEvolutionChart, StateDistribution } from './EcommerceAnalyticsCharts';
import { classifyOrderState, formatRange, inRange, localIso, presetRange, type DateRange, type PeriodMode } from './ecommerceAnalytics';
import '../inventory/inventoryAnalytics.css';
import './ecommerceAnalytics.css';

const STORAGE_KEY = 'teka.ecommerce.reports.period';
const integer = new Intl.NumberFormat('es-AR');
const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
type Resource<T> = { data: T; loading: boolean; ready: boolean; error: string };
const initial = <T,>(data: T): Resource<T> => ({ data, loading: true, ready: false, error: '' });

function savedRange(): DateRange {
  try { const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null') as DateRange | null; if (value?.from && value?.to && value.from <= value.to) return value; } catch { /* use default */ }
  return presetRange(30);
}

export function EcommerceReportsPage() {
  const initialRange = useMemo(savedRange, []);
  const [range, setRange] = useState<DateRange>(initialRange);
  const [draft, setDraft] = useState<DateRange>(initialRange);
  const [periodMode, setPeriodMode] = useState<PeriodMode>('30');
  const [periodError, setPeriodError] = useState('');
  const [orders, setOrders] = useState(initial<Pedido[]>([]));
  const [summary, setSummary] = useState(initial<SummaryResponse | null>(null));
  const [evolution, setEvolution] = useState(initial<CustomerEvolution[]>([]));
  const [products, setProducts] = useState(initial<ProductPreference[]>([]));
  const [benefits, setBenefits] = useState(initial<CutBenefitAssignment[]>([]));
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const loadOrders = useCallback(async () => {
    setOrders(current => ({ ...current, loading: true, error: '' }));
    try { setOrders({ data: (await consultarPedidosOnline()).pedidos, loading: false, ready: true, error: '' }); }
    catch (error) { setOrders(current => ({ ...current, loading: false, ready: false, error: apiErrorMessage(error, 'No se pudieron consultar los pedidos online.') })); }
  }, []);
  const loadSummary = useCallback(async (next: DateRange) => {
    setSummary(current => ({ ...current, loading: true, error: '' }));
    try { setSummary({ data: await onlineCustomersApi.summary({ desde: next.from, hasta: next.to }), loading: false, ready: true, error: '' }); }
    catch (error) { setSummary(current => ({ ...current, loading: false, ready: false, error: apiErrorMessage(error, 'No se pudo consultar el resumen de ventas.') })); }
  }, []);
  const loadEvolution = useCallback(async (next: DateRange) => {
    setEvolution(current => ({ ...current, loading: true, error: '' }));
    try { setEvolution({ data: await onlineCustomersApi.evolution({ desde: next.from, hasta: next.to }), loading: false, ready: true, error: '' }); }
    catch (error) { setEvolution(current => ({ ...current, loading: false, ready: false, error: apiErrorMessage(error, 'No se pudo consultar la evolución comercial.') })); }
  }, []);
  const loadProducts = useCallback(async (next: DateRange) => {
    setProducts(current => ({ ...current, loading: true, error: '' }));
    try { setProducts({ data: await onlineCustomersApi.products({ desde: next.from, hasta: next.to, top: 50 }), loading: false, ready: true, error: '' }); }
    catch (error) { setProducts(current => ({ ...current, loading: false, ready: false, error: apiErrorMessage(error, 'No se pudieron consultar los productos destacados.') })); }
  }, []);
  const loadBenefits = useCallback(async (next: DateRange) => {
    setBenefits(current => ({ ...current, loading: true, error: '' }));
    try { setBenefits({ data: await promotionsBenefitsApi.report(next.from, next.to), loading: false, ready: true, error: '' }); }
    catch (error) { setBenefits(current => ({ ...current, loading: false, ready: false, error: apiErrorMessage(error, 'No se pudieron consultar los beneficios asignados.') })); }
  }, []);
  const loadHistorical = useCallback((next: DateRange) => { void loadSummary(next); void loadEvolution(next); void loadProducts(next); void loadBenefits(next); }, [loadBenefits, loadEvolution, loadProducts, loadSummary]);
  useEffect(() => { void loadOrders(); loadHistorical(initialRange); }, [initialRange, loadHistorical, loadOrders]);

  function apply(next: DateRange, mode?: PeriodMode) {
    if (!next.from || !next.to) return setPeriodError('Ingresá las fechas desde y hasta.');
    if (next.from > next.to) return setPeriodError('La fecha desde no puede ser posterior a la fecha hasta.');
    if (next.to > localIso(new Date())) return setPeriodError('El período no puede incluir fechas futuras.');
    setPeriodError(''); setRange(next); setDraft(next); if (mode) setPeriodMode(mode); sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); loadHistorical(next);
  }
  function selectPreset(mode: Exclude<PeriodMode, 'custom'>) { apply(presetRange(Number(mode)), mode); }

  const periodOrders = useMemo(() => orders.data.filter(order => inRange(order.fechaPedido, range)), [orders.data, range]);
  const states = useMemo(() => {
    const grouped = new Map<string, number>(); periodOrders.forEach(order => grouped.set(order.estadoPedidoNombre, (grouped.get(order.estadoPedidoNombre) || 0) + 1));
    return [...grouped.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count, percentage: periodOrders.length ? count / periodOrders.length * 100 : 0 }));
  }, [periodOrders]);
  const units = products.data.reduce((sum, row) => sum + row.unidadesEntregadas, 0);
  const productsComplete = products.ready && products.data.length < 50;
  const delivered = summary.data?.periodo;
  const ticket = delivered && delivered.comprasEntregadasPeriodo ? delivered.importePedidosEntregadosPeriodo / delivered.comprasEntregadasPeriodo : null;
  const fulfillment = useMemo(() => periodOrders.reduce((result, order) => { result[classifyOrderState(order.estadoPedidoNombre)]++; return result; }, { delivered: 0, cancelled: 0, pending: 0 }), [periodOrders]);
  const metric = (resource: Resource<unknown>, value: string) => resource.loading ? '…' : resource.ready ? value : '—';

  const reportData = (): EcommerceReportData => {
    const exportStates = [...periodOrders.reduce((grouped, order) => grouped.set(order.estadoPedidoNombre, (grouped.get(order.estadoPedidoNombre) || 0) + 1), new Map<string, number>()).entries()]
      .map(([name, count]) => ({ name, count, percentage: periodOrders.length ? count / periodOrders.length * 100 : 0 }));
    return { from: range.from, to: range.to, generatedAt: new Date(), orders: periodOrders, summary: summary.ready ? summary.data : null, evolution: evolution.ready ? evolution.data : [], products: products.ready ? products.data : [], productsAvailable: productsComplete, benefits: benefits.ready ? benefits.data : [], states: exportStates };
  };
  async function exportReport(format: 'excel' | 'pdf') {
    setExporting(true); setExportMessage('');
    try { if (format === 'excel') await exportEcommerceExcel(reportData()); else await exportEcommercePdf(reportData()); setExportMessage(format === 'excel' ? 'Excel generado correctamente.' : 'Reporte PDF generado correctamente.'); }
    catch (error) { setExportMessage(apiErrorMessage(error, 'No se pudo generar la exportación.')); }
    finally { setExporting(false); }
  }

  return <AppShell title="Reportes de E-commerce" breadcrumb="E-commerce / Reportes">
    <main className="inventory-analytics-page ecommerce-analytics-page ecommerce-reports-page">
      <PageHeader kicker="E-COMMERCE" title="Reportes de E-commerce" description="Resultados comerciales, evolución del canal y comportamiento de los pedidos." action={<InventoryExportActions allowed={hasPermission('E-commerce', 'Exportar')} disabled={!orders.ready} exporting={exporting} onExcel={() => void exportReport('excel')} onPdf={() => void exportReport('pdf')}/>}/>
      <section className="inventory-period-control">
        <div className="inventory-period-intro"><CalendarDays size={19}/><div><h2>Período del informe</h2><p>Las ventas usan entregas con fecha verificable; los pedidos usan su fecha de ingreso.</p></div></div>
        <div className="inventory-period-presets">{(['7','30','90'] as const).map(mode => <button key={mode} type="button" className={periodMode === mode ? 'active' : ''} onClick={() => selectPreset(mode)}>Últimos {mode} días</button>)}<button type="button" className={periodMode === 'custom' ? 'active' : ''} onClick={() => setPeriodMode('custom')}>Personalizado</button></div>
        {periodMode === 'custom' && <div className="inventory-period-custom"><label><span>Desde</span><input type="date" value={draft.from} max={draft.to} onChange={event => setDraft(current => ({ ...current, from: event.target.value }))}/></label><label><span>Hasta</span><input type="date" value={draft.to} min={draft.from} max={localIso(new Date())} onChange={event => setDraft(current => ({ ...current, to: event.target.value }))}/></label><button className="button primary" type="button" onClick={() => apply(draft)}>Aplicar</button></div>}
        <div className="inventory-period-applied"><span>Rango aplicado</span><strong>{formatRange(range)}</strong></div>{periodError && <p className="inventory-period-error" role="alert">{periodError}</p>}
      </section>
      {exportMessage && <div className="ecom-export-message" role="status">{exportMessage}</div>}

      <section className="ecom-kpis reports" aria-label="Indicadores del informe">
        <article><span className="ecom-kpi-icon"><ShoppingBag size={21}/></span><div><span>Ventas entregadas</span><strong>{metric(summary, delivered ? money.format(delivered.importePedidosEntregadosPeriodo) : '')}</strong><p>{summary.ready && delivered ? `${integer.format(delivered.comprasEntregadasPeriodo)} operaciones entregadas con fecha verificable.` : 'Importe de operaciones entregadas del período.'}</p></div></article>
        <article><span className="ecom-kpi-icon"><ClipboardList size={21}/></span><div><span>Pedidos online</span><strong>{metric(orders, integer.format(periodOrders.length))}</strong><p>Pedidos ingresados en el período, sin interpretar su estado como venta.</p></div></article>
        <article><span className="ecom-kpi-icon"><CheckCircle2 size={21}/></span><div><span>Ticket promedio</span><strong>{metric(summary, ticket === null ? '—' : money.format(ticket))}</strong><p>Importe entregado dividido por operaciones entregadas del período.</p></div></article>
        <article><span className="ecom-kpi-icon"><PackageCheck size={21}/></span><div><span>Unidades vendidas</span><strong>{products.loading ? '…' : productsComplete ? decimal.format(units) : '—'}</strong><p>{products.ready && !productsComplete ? 'El conjunto disponible no permite obtener un total completo.' : 'Unidades asociadas a ventas entregadas del período.'}</p></div></article>
      </section>
      {summary.ready && delivered && <section className="ecom-card"><header><div><h2>Compradores del canal</h2><p>Analítica agregada de operaciones online entregadas; la gestión individual permanece en Ventas.</p></div></header><div className="ecom-fulfillment"><div><strong>{integer.format(delivered.compradoresPeriodo)}</strong><span>Compradores del período</span></div><div><strong>{integer.format(delivered.compradoresRecurrentes)}</strong><span>Compradores recurrentes</span></div><div><strong>{integer.format(delivered.nuevosCompradoresVerificables)}</strong><span>Nuevos identificables</span></div></div></section>}
      {[orders.error, summary.error, evolution.error, products.error, benefits.error].filter(Boolean).map(error => <div key={error} className="inventory-error" role="alert"><AlertTriangle size={17}/><span>{error}</span></div>)}

      <section className="ecom-report-grid primary"><article className="ecom-card"><header><div><h2>Evolución de ventas</h2><p>Importe de ventas entregadas con fecha verificable.</p></div></header>{evolution.loading ? <div className="ecom-chart-empty">Consultando evolución…</div> : evolution.ready ? <SalesEvolutionChart points={evolution.data}/> : <div className="ecom-chart-empty">La evolución no está disponible.</div>}</article><article className="ecom-card"><header><div><h2>Pedidos por estado</h2><p>{integer.format(periodOrders.length)} pedidos ingresados en el período.</p></div></header>{orders.loading ? <div className="ecom-chart-empty">Consultando estados…</div> : orders.ready ? <StateDistribution rows={states}/> : <div className="ecom-chart-empty">La distribución no está disponible.</div>}</article></section>

      <section className="ecom-card"><header><div><h2>Productos destacados</h2><p>Desempeño sobre ventas entregadas; el importe corresponde a sus líneas.</p></div></header>{products.loading ? <div className="ecom-chart-empty">Consultando productos…</div> : products.ready ? <ProductRanking rows={products.data.slice(0, 12)}/> : <div className="ecom-chart-empty">El ranking no está disponible.</div>}</section>

      <section className="ecom-report-grid compact"><article className="ecom-card"><header><div><h2>Cumplimiento de pedidos</h2><p>Situación actual de los pedidos ingresados en el período.</p></div></header>{orders.ready ? <div className="ecom-fulfillment"><div><strong>{integer.format(fulfillment.delivered)}</strong><span>Entregados</span></div><div><strong>{integer.format(fulfillment.cancelled)}</strong><span>Cancelados</span></div><div><strong>{integer.format(fulfillment.pending)}</strong><span>Pendientes</span></div></div> : <div className="ecom-chart-empty">La información no está disponible.</div>}</article><article className="ecom-card"><header><div><h2>Beneficios por recortes</h2><p>Solo beneficios efectivamente asignados durante el período.</p></div></header>{benefits.loading ? <div className="ecom-chart-empty">Consultando beneficios…</div> : benefits.ready ? <div className="ecom-fulfillment benefits"><div><strong>{integer.format(benefits.data.length)}</strong><span>Asignados</span></div><div><strong>{integer.format(benefits.data.filter(item => item.esGratuito).length)}</strong><span>Gratuitos</span></div><div><strong>{integer.format(benefits.data.filter(item => !item.esGratuito).length)}</strong><span>Precio simbólico</span></div></div> : <div className="ecom-chart-empty">La información no está disponible.</div>}</article></section>

      <section className="ecom-channel-overview" aria-label="Panorama del canal">
        <div className="ecom-overview-heading"><span>VISIÓN INTEGRAL</span><h2>Así se comporta tu canal online</h2><p>Un resumen de los procesos principales de E-commerce. Cada bloque reúne datos reales y permite profundizar en su gestión.</p></div>
        <div className="ecom-overview-grid">
          <a href="/ecommerce/actividad" className="ecom-overview-tile"><span className="ecom-overview-icon">01</span><span className="ecom-overview-name">Pedidos online</span><strong>{orders.ready ? integer.format(periodOrders.length) : '—'}</strong><p>Pedidos ingresados durante el período. La gestión administrativa continúa en Ventas.</p><span className="ecom-overview-link">Ver actividad →</span></a>
          <div className="ecom-overview-tile"><span className="ecom-overview-icon">02</span><span className="ecom-overview-name">Compradores</span><strong>{summary.ready && delivered ? integer.format(delivered.compradoresPeriodo) : '—'}</strong><p>Compradores con operaciones entregadas y fecha verificable durante el período.</p></div>
          <a href="/ecommerce/catalogo" className="ecom-overview-tile"><span className="ecom-overview-icon">03</span><span className="ecom-overview-name">Productos del catálogo</span><strong>{products.ready ? integer.format(products.data.length) : '—'}</strong><p>Productos con actividad en el ranking consultado. Publicación y presentación se administran en Catálogo.</p><span className="ecom-overview-link">Ver catálogo →</span></a>
          <a href="/ecommerce/promociones" className="ecom-overview-tile"><span className="ecom-overview-icon">04</span><span className="ecom-overview-name">Beneficios por recortes</span><strong>{benefits.ready ? integer.format(benefits.data.length) : '—'}</strong><p>Beneficios asignados en el período. Consultá promociones y el aprovechamiento de recortes en su módulo.</p><span className="ecom-overview-link">Ver beneficios →</span></a>
        </div>
      </section>
      <section className="ecom-report-conclusion"><div><span>LECTURA DEL PERÍODO</span><h2>Lo que muestran los resultados</h2><p>{orders.ready && summary.ready && delivered ? `Se registraron ${integer.format(periodOrders.length)} pedidos online y ${integer.format(delivered.comprasEntregadasPeriodo)} operaciones entregadas con fecha verificable. El importe de estas entregas alcanzó ${money.format(delivered.importePedidosEntregadosPeriodo)}.` : 'Los resultados se presentan por separado para evitar confundir pedidos ingresados con ventas efectivamente entregadas.'}</p></div><a href="/ecommerce/actividad">Consultar actividad online →</a></section>
    </main>
  </AppShell>;
}
