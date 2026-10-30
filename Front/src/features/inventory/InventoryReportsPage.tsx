import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, Ban, LineChart, PackageCheck, RotateCcw, Search, X } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { InventoryExportActions } from '../../components/data/InventoryExportActions';
import { PageHeader } from '../../components/data/PageHeader';
import { hasPermission } from '../../services/authorization';
import { inventoryAnalyticsExcel, inventoryAnalyticsPdf, type ManagementReport, type ReportColumn, type ReportRecord, type ReportSummary } from '../../services/inventoryAnalyticsReports';
import { inventoryHistoryApi, type HistoryGrouping, type InventoryActivity, type InventoryEvolution } from '../../services/inventoryHistoryApi';
import { inventoryStockApi, type DepositLookup, type StockProduct, type StockSupply } from '../../services/inventoryStockApi';
import { formatProductName } from '../../services/productDisplay';
import { productsApi, type Product } from '../../services/productsApi';
import { productsExcel, productsPdf } from '../../services/productReports';
import { formatSupplyName } from '../../services/supplyDisplay';
import { suppliesApi, type Supply } from '../../services/suppliesApi';
import { suppliesExcel, suppliesPdf } from '../../services/supplyReports';
import { getSession } from '../../services/session';
import { stockMovementsApi, type AnalyticMovement, type MovementClass, type MovementSeriesPoint, type MovementSummary } from '../../services/stockMovementsApi';
import { InventoryActivityChart, InventoryEvolutionChart } from './InventoryCharts';
import {
  ClassStateChart,
  DeficitRankingChart,
  DepositStateChart,
  EvolutionVariationChart,
  OperationsCompositionChart,
  PeriodComparisonChart,
  StockCompositionChart,
  type ReportStockVisualRow,
} from './InventoryReportCharts';
import './inventoryAnalytics.css';

type ReportKey = 'availability' | 'critical' | 'activity' | 'evolution';
type StockState = ReportStockVisualRow['state'];
type PeriodMode = '7' | '30' | '90' | 'custom';
type ActivityFiltersValue = { desde: string; hasta: string; clase: MovementClass | ''; depositoId: string };
type StockRow = ReportStockVisualRow & { itemId: number; depositId: number };

const PAGE_SIZE = 10;
const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const emptySummary: MovementSummary = { totalMovimientos: 0, cantidadEntradas: 0, cantidadSalidas: 0, cantidadManuales: 0, cantidadAutomaticos: 0, cantidadReversas: 0, cantidadAnulados: 0 };

function localIso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocal(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function rangeFor(days: number) {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  from.setDate(from.getDate() - days + 1);
  return { desde: localIso(from), hasta: localIso(to) };
}

function previousRange(from: string, to: string) {
  const start = parseLocal(from), end = parseLocal(to);
  const duration = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousTo = new Date(start); previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo); previousFrom.setDate(previousFrom.getDate() - duration + 1);
  return { desde: localIso(previousFrom), hasta: localIso(previousTo) };
}

function dateRangeLabel(from: string, to: string) {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${parseLocal(from).toLocaleDateString('es-AR', options)} al ${parseLocal(to).toLocaleDateString('es-AR', options)}`;
}

function dateError(from: string, to: string) {
  if (!from || !to) return 'Indicá ambas fechas.';
  if (from > to) return 'La fecha desde no puede ser posterior a la fecha hasta.';
  if (to > localIso(new Date())) return 'No se permiten fechas futuras.';
  return '';
}

const errorText = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

function aggregateSeries(points: MovementSeriesPoint[]) {
  const dates = new Map<string, number>();
  points.forEach((point) => { const date = point.fecha.slice(0, 10); dates.set(date, (dates.get(date) || 0) + point.cantidadMovimientos); });
  return [...dates.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([date, value]) => ({ label: parseLocal(date).toLocaleDateString('es-AR'), value }));
}

function stockInterpretation(rows: StockRow[], scopeRows: StockRow[], critical: boolean) {
  const out = rows.filter((row) => row.state === 'Sin existencias').length, low = rows.filter((row) => row.state === 'Bajo mínimo').length;
  const deposits = [...new Set(scopeRows.map((row) => row.deposit))].map((name) => { const all = scopeRows.filter((row) => row.deposit === name), affected = rows.filter((row) => row.deposit === name && (row.state === 'Sin existencias' || row.state === 'Bajo mínimo')).length; return { name, affected, total: all.length, rate: all.length ? affected / all.length : 0 }; }).sort((a, b) => b.rate - a.rate);
  if (critical) return [`Hay ${out} posiciones sin existencias y ${low} con stock positivo bajo el mínimo.`, deposits[0] ? `${deposits[0].name} presenta la mayor proporción afectada: ${percentage.format(deposits[0].rate * 100)}% (${deposits[0].affected}/${deposits[0].total}).` : 'No hay depósitos afectados dentro del alcance.'];
  return [`${percentage.format(rows.length ? out / rows.length * 100 : 0)}% de las posiciones filtradas no tiene existencias.`, deposits[0] ? `${deposits[0].name} concentra la mayor proporción de posiciones afectadas dentro de su propio alcance.` : 'No hay posiciones afectadas dentro del alcance.'];
}

export function InventoryReportsPage() {
  const queryReport = new URLSearchParams(location.search).get('report') as ReportKey;
  const [report, setReport] = useState<ReportKey>(['availability', 'critical', 'activity', 'evolution'].includes(queryReport) ? queryReport : 'availability');
  const canExport = hasPermission('Inventario', 'Exportar');
  const session = getSession();
  const reportResponsible = session?.usuario ? `${session.usuario.nombre} ${session.usuario.apellido || ''}`.trim() || session.usuario.username : undefined;
  const initialActivity = useMemo(() => ({ ...rangeFor(30), clase: '' as MovementClass | '', depositoId: '' }), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [deposits, setDeposits] = useState<DepositLookup[]>([]);
  const [productStock, setProductStock] = useState<StockProduct[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stockClass, setStockClass] = useState<MovementClass | ''>('');
  const [stockDeposit, setStockDeposit] = useState('');
  const [stockState, setStockState] = useState<StockState | ''>('');
  const [stockSearch, setStockSearch] = useState('');
  const [stockPage, setStockPage] = useState(1);

  const [periodMode, setPeriodMode] = useState<PeriodMode>('30');
  const [activityDraft, setActivityDraft] = useState<ActivityFiltersValue>(initialActivity);
  const [activityApplied, setActivityApplied] = useState<ActivityFiltersValue>(initialActivity);
  const [activityPage, setActivityPage] = useState(1);
  const [activityRows, setActivityRows] = useState<AnalyticMovement[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activitySummary, setActivitySummary] = useState(emptySummary);
  const [previousSummary, setPreviousSummary] = useState(emptySummary);
  const [activitySeries, setActivitySeries] = useState<MovementSeriesPoint[]>([]);
  const [previousSeries, setPreviousSeries] = useState<MovementSeriesPoint[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  const [evoClass, setEvoClass] = useState<MovementClass>('PRODUCTO');
  const [evoArticle, setEvoArticle] = useState<number>();
  const [evoQuery, setEvoQuery] = useState('');
  const [evoOpen, setEvoOpen] = useState(false);
  const [evoDeposit, setEvoDeposit] = useState('');
  const [evoFrom, setEvoFrom] = useState(rangeFor(365).desde);
  const [evoTo, setEvoTo] = useState(localIso(new Date()));
  const [grouping, setGrouping] = useState<HistoryGrouping>('MES');
  const [evoPoints, setEvoPoints] = useState<InventoryEvolution[]>([]);
  const [evoActivity, setEvoActivity] = useState<InventoryActivity | null>(null);
  const [evoRows, setEvoRows] = useState<AnalyticMovement[]>([]);
  const [evoTotal, setEvoTotal] = useState(0);
  const [evoPage, setEvoPage] = useState(1);
  const [evoLoading, setEvoLoading] = useState(false);
  const [evoError, setEvoError] = useState('');
  const [evoQueried, setEvoQueried] = useState(false);

  const initialized = useRef(false);
  const activityRequest = useRef(0);
  const evolutionRequest = useRef(0);

  const loadBase = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [productCatalog, supplyCatalog, depositCatalog, productsResult, suppliesResult] = await Promise.all([
        productsApi.list(), suppliesApi.list(), inventoryStockApi.deposits(), inventoryStockApi.products(), inventoryStockApi.supplies(),
      ]);
      setProducts(productCatalog); setSupplies(supplyCatalog); setDeposits(depositCatalog); setProductStock(productsResult); setSupplyStock(suppliesResult);
    } catch (caught) { setError(errorText(caught, 'No se pudieron cargar los datos de inventario.')); }
    finally { setLoading(false); }
  }, []);

  const loadActivity = useCallback(async (filters: ActivityFiltersValue, page: number) => {
    const requestId = ++activityRequest.current;
    const previous = previousRange(filters.desde, filters.hasta);
    const query = { desde: filters.desde, hasta: filters.hasta, clase: filters.clase || undefined, depositoId: filters.depositoId ? Number(filters.depositoId) : undefined };
    const previousQuery = { ...query, desde: previous.desde, hasta: previous.hasta };
    setActivityLoading(true); setActivityError('');
    try {
      const [list, summary, series, priorSummary, priorSeries] = await Promise.all([
        stockMovementsApi.list(query, page, PAGE_SIZE), stockMovementsApi.summary(query), stockMovementsApi.series(query), stockMovementsApi.summary(previousQuery), stockMovementsApi.series(previousQuery),
      ]);
      if (requestId !== activityRequest.current) return;
      setActivityRows(list.items); setActivityTotal(list.totalFilas); setActivitySummary(summary); setActivitySeries(series); setPreviousSummary(priorSummary); setPreviousSeries(priorSeries); setActivityPage(page);
    } catch (caught) {
      if (requestId !== activityRequest.current) return;
      setActivityError(errorText(caught, 'No se pudo cargar el reporte de actividad.')); setActivityRows([]); setActivityTotal(0); setActivitySummary(emptySummary); setPreviousSummary(emptySummary); setActivitySeries([]); setPreviousSeries([]);
    } finally { if (requestId === activityRequest.current) setActivityLoading(false); }
  }, []);

  async function loadActivityPage(page: number) {
    const requestId = ++activityRequest.current;
    const query = { desde: activityApplied.desde, hasta: activityApplied.hasta, clase: activityApplied.clase || undefined, depositoId: activityApplied.depositoId ? Number(activityApplied.depositoId) : undefined };
    setActivityLoading(true); setActivityError('');
    try {
      const result = await stockMovementsApi.list(query, page, PAGE_SIZE);
      if (requestId !== activityRequest.current) return;
      setActivityRows(result.items); setActivityTotal(result.totalFilas); setActivityPage(page);
    } catch (caught) {
      if (requestId !== activityRequest.current) return;
      setActivityError(errorText(caught, 'No se pudo cargar la página de movimientos.')); setActivityRows([]);
    } finally { if (requestId === activityRequest.current) setActivityLoading(false); }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void loadBase();
    void loadActivity(initialActivity, 1);
  }, [initialActivity, loadActivity, loadBase]);

  const stockRows = useMemo<StockRow[]>(() => {
    const productMap = new Map(products.map((item) => [item.productoId, item]));
    const supplyMap = new Map(supplies.map((item) => [item.insumoId, item]));
    const buildState = (quantity: number, minimum: number): StockState => quantity === 0 ? 'Sin existencias' : minimum <= 0 ? 'Sin mínimo' : quantity < minimum ? 'Bajo mínimo' : 'Cumple mínimo';
    return [
      ...productStock.map((stock): StockRow => { const product = productMap.get(stock.productoId), deficit = Math.max(stock.stockMinimo - stock.cantidadActual, 0); return { key: `P-${stock.stockProductoId}`, classCode: 'PRODUCTO', itemId: stock.productoId, code: stock.productoCodigo, name: stock.productoNombre, depositId: stock.depositoId, deposit: stock.depositoNombre, quantity: stock.cantidadActual, minimum: stock.stockMinimo, deficit, deficitRate: stock.stockMinimo > 0 ? deficit / stock.stockMinimo : 0, unit: product?.unidadMedidaAbreviatura || product?.unidadMedidaNombre || '', state: buildState(stock.cantidadActual, stock.stockMinimo) }; }),
      ...supplyStock.map((stock): StockRow => { const supply = supplyMap.get(stock.insumoId), deficit = Math.max(stock.stockMinimo - stock.cantidadActual, 0); return { key: `I-${stock.stockInsumoId}`, classCode: 'INSUMO', itemId: stock.insumoId, code: stock.insumoCodigo, name: stock.insumoNombre, depositId: stock.depositoId, deposit: stock.depositoNombre, quantity: stock.cantidadActual, minimum: stock.stockMinimo, deficit, deficitRate: stock.stockMinimo > 0 ? deficit / stock.stockMinimo : 0, unit: supply?.unidadMedidaAbreviatura || supply?.unidadMedidaNombre || '', state: buildState(stock.cantidadActual, stock.stockMinimo) }; }),
    ];
  }, [productStock, products, supplies, supplyStock]);

  const stockScopeRows = useMemo(() => {
    const query = stockSearch.trim().toLocaleLowerCase('es-AR');
    return stockRows.filter((row) => (!stockClass || row.classCode === stockClass) && (!stockDeposit || String(row.depositId) === stockDeposit) && (!query || `${row.code} ${row.name} ${row.deposit}`.toLocaleLowerCase('es-AR').includes(query)));
  }, [stockClass, stockDeposit, stockRows, stockSearch]);
  const reportRows = useMemo(() => stockScopeRows.filter((row) => {
    const relevant = report !== 'critical' || row.state === 'Sin existencias' || row.state === 'Bajo mínimo';
    return relevant && (!stockState || row.state === stockState);
  }).sort((a, b) => report === 'critical' ? Number(a.state !== 'Sin existencias') - Number(b.state !== 'Sin existencias') || b.deficitRate - a.deficitRate : a.code.localeCompare(b.code, 'es-AR', { numeric: true })), [report, stockScopeRows, stockState]);

  const evoArticles = useMemo(() => evoClass === 'PRODUCTO'
    ? products.filter((item) => item.activo).map((item) => ({ id: item.productoId, label: `${item.codigo} · ${formatProductName(item)}`, unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre }))
    : supplies.filter((item) => item.activo).map((item) => ({ id: item.insumoId, label: `${item.codigo} · ${formatSupplyName(item)}`, unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre })), [evoClass, products, supplies]);
  const evoSuggestions = evoArticles.filter((item) => !evoQuery || item.label.toLocaleLowerCase('es-AR').includes(evoQuery.toLocaleLowerCase('es-AR'))).slice(0, 8);
  const selectedEvo = evoArticles.find((item) => item.id === evoArticle);

  function changeReport(next: ReportKey) {
    setReport(next); setStockState(''); setStockPage(1);
    history.replaceState(null, '', `/inventory/reports?report=${next}`);
  }

  function selectPeriod(mode: Exclude<PeriodMode, 'custom'>) {
    const range = rangeFor(Number(mode));
    const next = { ...activityDraft, ...range };
    setPeriodMode(mode); setActivityDraft(next); setActivityApplied(next); setActivityPage(1);
    void loadActivity(next, 1);
  }

  function applyActivity() {
    const validation = dateError(activityDraft.desde, activityDraft.hasta);
    if (validation) { setActivityError(validation); return; }
    setActivityApplied(activityDraft); setActivityPage(1);
    void loadActivity(activityDraft, 1);
  }

  async function loadEvolution(page = 1) {
    if (!evoArticle) { setEvoError('Seleccioná un artículo de las sugerencias.'); return; }
    const validation = dateError(evoFrom, evoTo);
    if (validation) { setEvoError(validation); return; }
    const requestId = ++evolutionRequest.current;
    const depositoId = evoDeposit ? Number(evoDeposit) : undefined;
    setEvoLoading(true); setEvoError(''); setEvoQueried(true);
    try {
      const [activities, points, movements] = await Promise.all([
        inventoryHistoryApi.activity({ clase: evoClass, articuloId: evoArticle, depositoId, consolidarDepositos: !depositoId, desde: evoFrom, hasta: evoTo }),
        inventoryHistoryApi.evolution({ clase: evoClass, articuloId: evoArticle, depositoId, desde: evoFrom, hasta: evoTo, agrupacion: grouping }),
        stockMovementsApi.list({ clase: evoClass, articuloId: evoArticle, depositoId, desde: evoFrom, hasta: evoTo }, page, PAGE_SIZE),
      ]);
      if (requestId !== evolutionRequest.current) return;
      setEvoActivity(activities[0] || null); setEvoPoints(points); setEvoRows(movements.items); setEvoTotal(movements.totalFilas); setEvoPage(page);
    } catch (caught) {
      if (requestId !== evolutionRequest.current) return;
      setEvoError(errorText(caught, 'No se pudo cargar la evolución histórica.')); setEvoActivity(null); setEvoPoints([]); setEvoRows([]); setEvoTotal(0);
    } finally { if (requestId === evolutionRequest.current) setEvoLoading(false); }
  }

  async function loadEvolutionPage(page: number) {
    if (!evoArticle) return;
    const requestId = ++evolutionRequest.current;
    setEvoLoading(true); setEvoError('');
    try {
      const result = await stockMovementsApi.list({ clase: evoClass, articuloId: evoArticle, depositoId: evoDeposit ? Number(evoDeposit) : undefined, desde: evoFrom, hasta: evoTo }, page, PAGE_SIZE);
      if (requestId !== evolutionRequest.current) return;
      setEvoRows(result.items); setEvoTotal(result.totalFilas); setEvoPage(page);
    } catch (caught) {
      if (requestId !== evolutionRequest.current) return;
      setEvoError(errorText(caught, 'No se pudo cargar la página de movimientos relacionados.')); setEvoRows([]);
    } finally { if (requestId === evolutionRequest.current) setEvoLoading(false); }
  }

  const stockColumns: DataTableColumn<StockRow>[] = [
    { key: 'article', header: 'Artículo', render: (row) => <><strong>{row.name}</strong><small>{row.code} · {row.classCode === 'PRODUCTO' ? 'Producto terminado' : 'Insumo'}</small></> },
    { key: 'deposit', header: 'Depósito', render: (row) => row.deposit },
    { key: 'quantity', header: 'Existencia', className: 'inventory-number', headerClassName: 'inventory-number', render: (row) => `${number.format(row.quantity)} ${row.unit}` },
    { key: 'minimum', header: 'Mínimo', className: 'inventory-number', headerClassName: 'inventory-number', render: (row) => row.minimum > 0 ? `${number.format(row.minimum)} ${row.unit}` : 'Sin configurar' },
    ...(report === 'critical' ? [{ key: 'deficit', header: 'Déficit', className: 'inventory-number', headerClassName: 'inventory-number', render: (row: StockRow) => row.minimum > 0 ? `${number.format(row.deficit)} ${row.unit}` : '—' }] : []),
    { key: 'state', header: 'Estado', render: (row) => <StockStateBadge state={row.state} /> },
  ];
  const movementColumns: DataTableColumn<AnalyticMovement>[] = [
    { key: 'date', header: 'Fecha', render: (row) => <><strong>{new Date(row.fechaMovimiento).toLocaleDateString('es-AR')}</strong><small>{new Date(row.fechaMovimiento).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</small></> },
    { key: 'article', header: 'Artículo', render: (row) => <><strong>{row.articulo}</strong><small>{row.codigo} · {row.deposito}</small></> },
    { key: 'type', header: 'Tipo', render: (row) => <><strong>{row.tipoMovimiento}</strong><small>{row.modalidad}</small></> },
    { key: 'amount', header: 'Cantidad', className: 'inventory-number', headerClassName: 'inventory-number', render: (row) => <strong className={row.signo < 0 ? 'movement-out' : 'movement-in'}>{row.signo < 0 ? '−' : '+'}{number.format(row.cantidad)}</strong> },
    { key: 'origin', header: 'Origen', render: (row) => <>{row.entidadOrigen || 'Sin origen'}{row.origenId != null && <small>#{row.origenId}</small>}</> },
    { key: 'state', header: 'Estado', render: (row) => row.estado },
  ];

  async function allMovements(filters: Parameters<typeof stockMovementsApi.list>[0]) {
    const first = await stockMovementsApi.list(filters, 1, 100), rows = [...first.items];
    for (let page = 2; page <= Math.ceil(first.totalFilas / 100); page += 1) rows.push(...(await stockMovementsApi.list(filters, page, 100)).items);
    return rows;
  }

  function exportStock(format: 'excel' | 'pdf') {
    const critical = report === 'critical';
    const title = critical ? 'Stock crítico y faltantes' : 'Disponibilidad y distribución';
    const filters = `Corte: stock actual · Clase: ${stockClass || 'Todas'} · Depósito: ${deposits.find((item) => String(item.id) === stockDeposit)?.descripcion || 'Todos'} · Estado: ${stockState || 'Todos'} · Búsqueda: ${stockSearch || 'Sin búsqueda'}`;
    const columns: ReportColumn[] = [{ header: 'Clase', key: 'class' }, { header: 'Código', key: 'code' }, { header: 'Artículo', key: 'name', width: 32 }, { header: 'Depósito', key: 'deposit', width: 25 }, { header: 'Existencia', key: 'quantity' }, { header: 'Unidad', key: 'unit' }, { header: 'Mínimo', key: 'minimum' }, { header: 'Déficit', key: 'deficit' }, { header: 'Estado', key: 'state' }];
    const rows: ReportRecord[] = reportRows.map((row) => ({ class: row.classCode === 'PRODUCTO' ? 'Producto terminado' : 'Insumo', ...row }));
    const evaluated = reportRows.filter((row) => row.minimum > 0), compliant = evaluated.filter((row) => row.quantity >= row.minimum);
    const summary: ReportSummary[] = critical ? [{ label: 'Sin existencias', value: reportRows.filter((row) => row.state === 'Sin existencias').length, denominator: `${reportRows.length} posiciones filtradas`, description: 'Saldo actual igual a cero.' }, { label: 'Bajo mínimo', value: reportRows.filter((row) => row.state === 'Bajo mínimo').length, denominator: `${reportRows.length} posiciones filtradas`, description: 'Stock positivo inferior al mínimo.' }] : [{ label: 'Posiciones', value: reportRows.length, description: 'Combinaciones artículo–depósito.' }, { label: 'Disponibles', value: reportRows.filter((row) => row.quantity > 0).length, denominator: `${reportRows.length} posiciones`, description: 'Existencia física mayor que cero.' }, { label: 'Cumplimiento', value: evaluated.length ? `${percentage.format(compliant.length / evaluated.length * 100)}%` : 'No calculable', denominator: `${compliant.length} de ${evaluated.length} con mínimo positivo`, description: 'No incluye posiciones sin mínimo.' }];
    const interpretations = stockInterpretation(reportRows, stockScopeRows, critical);
    const management: ManagementReport = { objective: critical ? 'Identificar dónde se concentran las posiciones sin existencias o bajo el mínimo configurado.' : 'Comprender la disponibilidad y distribución actual del inventario por artículo y depósito.', responsible: reportResponsible, period: 'Fecha de corte: stock actual', executiveSummary: interpretations.join(' '), interpretations, limitations: ['El reporte representa únicamente posiciones devueltas por las tablas actuales de stock.', 'No se infieren posiciones inexistentes como saldo cero.', 'El contrato histórico no aporta el universo completo ni mínimos históricos certificados.'], charts: critical ? [{ title: 'Déficits relativos principales', kind: 'bar', unit: '%', items: reportRows.filter((row) => row.minimum > 0 && row.deficit > 0).sort((a, b) => b.deficitRate - a.deficitRate).slice(0, 10).map((row) => ({ label: `${row.code} · ${row.deposit}`, value: row.deficitRate * 100 })) }] : [{ title: 'Composición de posiciones', kind: 'bar', unit: 'posiciones', items: (['Sin existencias', 'Bajo mínimo', 'Cumple mínimo', 'Sin mínimo'] as StockState[]).map((state) => ({ label: state, value: reportRows.filter((row) => row.state === state).length })) }, { title: 'Posiciones afectadas por depósito', kind: 'bar', unit: 'posiciones', items: [...new Set(reportRows.map((row) => row.deposit))].map((deposit) => ({ label: deposit, value: reportRows.filter((row) => row.deposit === deposit && ['Sin existencias', 'Bajo mínimo'].includes(row.state)).length })) }] };
    if (format === 'excel') inventoryAnalyticsExcel(title, filters, columns, rows, undefined, summary, management); else inventoryAnalyticsPdf(title, filters, columns, rows, undefined, summary, management);
  }

  async function exportMovementReport(format: 'excel' | 'pdf', evolution = false) {
    try {
      const filters = evolution ? { clase: evoClass, articuloId: evoArticle, depositoId: evoDeposit ? Number(evoDeposit) : undefined, desde: evoFrom, hasta: evoTo } : { clase: activityApplied.clase || undefined, depositoId: activityApplied.depositoId ? Number(activityApplied.depositoId) : undefined, desde: activityApplied.desde, hasta: activityApplied.hasta };
      const rows = await allMovements(filters);
      const title = evolution ? 'Evolución histórica' : 'Actividad y movimientos';
      const label = `Período: ${filters.desde} al ${filters.hasta} · Artículo: ${evolution ? selectedEvo?.label || '—' : 'Todos'} · Depósito: ${deposits.find((item) => item.id === filters.depositoId)?.descripcion || 'Todos'}`;
      const columns: ReportColumn[] = [{ header: 'Fecha', key: 'date' }, { header: 'Código', key: 'code' }, { header: 'Artículo', key: 'article', width: 30 }, { header: 'Depósito', key: 'deposit', width: 24 }, { header: 'Tipo', key: 'type' }, { header: 'Cantidad', key: 'amount' }, { header: 'Modalidad', key: 'mode' }, { header: 'Origen', key: 'origin' }, { header: 'Estado', key: 'state' }];
      const records = rows.map((row) => ({ date: new Date(row.fechaMovimiento).toLocaleString('es-AR'), code: row.codigo, article: row.articulo, deposit: row.deposito, type: row.tipoMovimiento, amount: row.signo < 0 ? -row.cantidad : row.cantidad, mode: row.modalidad, origin: `${row.entidadOrigen || 'Sin origen'}${row.origenId != null ? ` #${row.origenId}` : ''}`, state: row.estado }));
      const warning = evolution && (evoActivity?.historialConciliado === false || evoPoints.some((point) => !point.historialConciliado)) ? 'Historial pendiente de conciliación. Los saldos pueden diferir del stock actual.' : undefined;
      const summary: ReportSummary[] = evolution ? evolutionSummary(evoActivity, selectedEvo?.unit || '') : movementSummary(activitySummary, previousSummary);
      const interpretations = evolution ? evolutionInterpretation(evoActivity, evoPoints) : activityInterpretation(activitySummary, previousSummary);
      const management: ManagementReport = evolution ? { objective: 'Analizar cómo cambió el saldo de un artículo específico durante el período seleccionado.', responsible: reportResponsible, period: dateRangeLabel(evoFrom, evoTo), executiveSummary: interpretations.join(' '), interpretations, limitations: warning ? [warning] : [], charts: [{ title: 'Evolución del saldo', subtitle: selectedEvo?.label, kind: 'line', unit: selectedEvo?.unit, items: evoPoints.map((point) => ({ label: new Date(`${point.periodo.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR'), value: point.saldoFinal })) }, { title: 'Variaciones por período', kind: 'bar', unit: selectedEvo?.unit, items: evoPoints.map((point) => ({ label: new Date(`${point.periodo.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR'), value: point.variacion })) }] } : { objective: 'Comparar la actividad del inventario y reconocer las modalidades predominantes.', responsible: reportResponsible, period: dateRangeLabel(activityApplied.desde, activityApplied.hasta), executiveSummary: interpretations.join(' '), interpretations, limitations: ['Los indicadores expresan cantidad de operaciones, no cantidades físicas de artículos.'], charts: [{ title: 'Período actual frente al anterior', kind: 'bar', unit: 'operaciones', items: [{ label: 'Actual', value: activitySummary.totalMovimientos }, { label: 'Anterior', value: previousSummary.totalMovimientos }] }, { title: 'Composición operativa', kind: 'bar', unit: 'operaciones', items: [{ label: 'Manuales', value: activitySummary.cantidadManuales }, { label: 'Automáticas', value: activitySummary.cantidadAutomaticos }] }, { title: 'Tendencia diaria', kind: 'line', unit: 'operaciones', items: aggregateSeries(activitySeries) }] };
      if (format === 'excel') inventoryAnalyticsExcel(title, label, columns, records, warning, summary, management); else inventoryAnalyticsPdf(title, label, columns, records, warning, summary, management);
    } catch (caught) { if (evolution) setEvoError(errorText(caught, 'No se pudo exportar el reporte.')); else setActivityError(errorText(caught, 'No se pudo exportar el reporte.')); }
  }

  const exportButtons = (handler: (format: 'excel' | 'pdf') => void) => <InventoryExportActions allowed={canExport} onExcel={() => handler('excel')} onPdf={() => handler('pdf')} />;
  const exportProductCatalog = (format: 'excel' | 'pdf') => {
    const filters = 'Catálogo completo de productos terminados';
    if (format === 'excel') productsExcel(products, filters);
    else productsPdf(products, filters);
  };
  const exportSupplyCatalog = (format: 'excel' | 'pdf') => {
    const filters = 'Catálogo completo de insumos';
    if (format === 'excel') suppliesExcel(supplies, filters);
    else suppliesPdf(supplies, filters);
  };
  const catalogExportButtons = <InventoryExportActions allowed={canExport} disabled={loading || Boolean(error) || products.length === 0} onExcel={() => exportProductCatalog('excel')} onPdf={() => exportProductCatalog('pdf')} />;
  const supplyCatalogExportButtons = <InventoryExportActions allowed={canExport} disabled={loading || Boolean(error) || supplies.length === 0} onExcel={() => exportSupplyCatalog('excel')} onPdf={() => exportSupplyCatalog('pdf')} />;
  const activityDays = Math.round((parseLocal(activityApplied.hasta).getTime() - parseLocal(activityApplied.desde).getTime()) / 86_400_000) + 1;
  const groupingForActivity = activityDays > 180 ? 'month' : activityDays > 45 ? 'week' : 'day';

  return <AppShell title="Reportes de inventario" breadcrumb="Inventario / Reportes"><main className="inventory-analytics-page inventory-reports-page">
    <section className="inventory-catalog-export"><div className="inventory-catalog-export-item"><div><strong>Productos terminados</strong><span>Catálogo maestro</span></div>{catalogExportButtons}</div><div className="inventory-catalog-export-item"><div><strong>Insumos</strong><span>Catálogo maestro</span></div>{supplyCatalogExportButtons}</div></section>
    <PageHeader kicker="INVENTARIO" title="Reportes de inventario" description="Analizá disponibilidad, faltantes, actividad y evolución mediante indicadores comparables y datos verificables." />
    {error && <ReportError text={error} retry={() => void loadBase()} />}
    <nav className="inventory-report-tabs">{([['availability', 'Disponibilidad'], ['critical', 'Stock crítico'], ['activity', 'Actividad'], ['evolution', 'Evolución histórica']] as [ReportKey, string][]).map(([key, label]) => <button key={key} className={report === key ? 'active' : ''} onClick={() => changeReport(key)}>{label}</button>)}</nav>

    {(report === 'availability' || report === 'critical') && <StockReport critical={report === 'critical'} rows={reportRows} scopeRows={stockScopeRows} loading={loading} columns={stockColumns} page={stockPage} setPage={setStockPage} classValue={stockClass} deposit={stockDeposit} state={stockState} search={stockSearch} deposits={deposits} setClass={(value) => { setStockClass(value); setStockPage(1); }} setDeposit={(value) => { setStockDeposit(value); setStockPage(1); }} setState={(value) => { setStockState(value); setStockPage(1); }} setSearch={(value) => { setStockSearch(value); setStockPage(1); }} clear={() => { setStockClass(''); setStockDeposit(''); setStockState(''); setStockSearch(''); setStockPage(1); }} exportButtons={exportButtons(exportStock)} />}

    {report === 'activity' && <>
      <ReportHeading icon={<Activity />} title="Actividad y movimientos" question="¿Cómo cambió la actividad y qué operaciones predominaron?" description="Compara conteos de operaciones entre períodos equivalentes sin mezclar cantidades físicas." actions={exportButtons((format) => void exportMovementReport(format))} />
      <ActivityFilters mode={periodMode} value={activityDraft} deposits={deposits} loading={activityLoading} setMode={setPeriodMode} selectPreset={selectPeriod} set={setActivityDraft} apply={applyActivity} />
      {activityError && <ReportError text={activityError} retry={() => void loadActivity(activityApplied, activityPage)} />}
      <div className="inventory-report-context"><span>Período aplicado</span><strong>{dateRangeLabel(activityApplied.desde, activityApplied.hasta)}</strong><p>Comparado con el período anterior de igual duración.</p></div>
      <ActivityMetrics current={activitySummary} previous={previousSummary} loading={activityLoading} />
      <section className="inventory-report-visual-grid activity"><PeriodComparisonChart current={activitySummary} previous={previousSummary} /><OperationsCompositionChart summary={activitySummary} /></section>
      <InventoryActivityChart points={activitySeries} comparisonPoints={previousSeries} grouping={groupingForActivity} loading={activityLoading} title="Tendencia de actividad" />
      <Interpretation lines={activityInterpretation(activitySummary, previousSummary)} caution="La lectura describe cantidad de operaciones; no permite inferir por sí sola consumo, producción ni cantidades físicas." />
      <DetailSection title="Movimientos del período" description="Detalle secundario con paginación real del servidor."><DataTable rows={activityRows} columns={movementColumns} rowKey={(row) => row.movimientoStockId} loading={activityLoading} page={activityPage} pageSize={PAGE_SIZE} totalRecords={activityTotal} onPageChange={(page) => void loadActivityPage(page)} tableClassName="inventory-report-table movements" summary={<><strong>{activityTotal}</strong> movimientos</>} /></DetailSection>
    </>}

    {report === 'evolution' && <>
      <ReportHeading icon={<LineChart />} title="Evolución histórica" question="¿Cómo cambió el saldo de un artículo a lo largo del tiempo?" description="Analiza un único artículo y una unidad compatible, por depósito o de forma consolidada." actions={evoQueried ? exportButtons((format) => void exportMovementReport(format, true)) : undefined} />
      <EvolutionFilters classValue={evoClass} article={evoArticle} query={evoQuery} open={evoOpen} suggestions={evoSuggestions} deposit={evoDeposit} from={evoFrom} to={evoTo} grouping={grouping} deposits={deposits} loading={evoLoading} setClass={(value) => { setEvoClass(value); setEvoArticle(undefined); setEvoQuery(''); setEvoQueried(false); }} setArticle={(value) => { setEvoArticle(value); setEvoQueried(false); }} setQuery={(value) => { setEvoQuery(value); setEvoQueried(false); }} setOpen={setEvoOpen} setDeposit={(value) => { setEvoDeposit(value); setEvoQueried(false); }} setFrom={(value) => { setEvoFrom(value); setEvoQueried(false); }} setTo={(value) => { setEvoTo(value); setEvoQueried(false); }} setGrouping={(value) => { setGrouping(value); setEvoQueried(false); }} apply={() => void loadEvolution(1)} />
      {evoError && <ReportError text={evoError} retry={evoQueried ? () => void loadEvolution(evoPage) : undefined} />}
      {evoQueried && !evoError && <>{(evoActivity?.historialConciliado === false || evoPoints.some((point) => !point.historialConciliado)) && <div className="inventory-history-warning"><AlertTriangle size={17} /><div><strong>Historial pendiente de conciliación</strong><span>Los saldos históricos pueden diferir del stock actual y las conclusiones no deben considerarse definitivas.</span></div></div>}<div className="inventory-report-context"><span>Consulta histórica</span><strong>{selectedEvo?.label} · {dateRangeLabel(evoFrom, evoTo)}</strong><p>{evoDeposit ? deposits.find((item) => String(item.id) === evoDeposit)?.descripcion : 'Todos los depósitos · consolidado'} · {selectedEvo?.unit}</p></div><EvolutionMetrics value={evoActivity} unit={selectedEvo?.unit || ''} loading={evoLoading} /><section className="inventory-report-visual-grid evolution"><InventoryEvolutionChart points={evoPoints} unit={selectedEvo?.unit || ''} /><EvolutionVariationChart points={evoPoints} unit={selectedEvo?.unit || ''} /></section><Interpretation lines={evolutionInterpretation(evoActivity, evoPoints)} caution={evoActivity?.historialConciliado === false ? 'Interpretación provisoria hasta completar la conciliación histórica.' : undefined} /><DetailSection title="Movimientos relacionados" description="Operaciones reales del artículo dentro del período consultado."><DataTable rows={evoRows} columns={movementColumns} rowKey={(row) => row.movimientoStockId} loading={evoLoading} page={evoPage} pageSize={PAGE_SIZE} totalRecords={evoTotal} onPageChange={(page) => void loadEvolutionPage(page)} tableClassName="inventory-report-table movements" summary={<><strong>{evoTotal}</strong> movimientos relacionados</>} /></DetailSection></>}
      {!evoQueried && <div className="inventory-report-awaiting"><LineChart size={26} /><strong>Seleccioná un artículo y un período</strong><span>La evolución se consulta únicamente cuando aplicás filtros válidos.</span></div>}
    </>}
  </main></AppShell>;
}

function StockReport({ critical, rows, scopeRows, loading, columns, page, setPage, classValue, deposit, state, search, deposits, setClass, setDeposit, setState, setSearch, clear, exportButtons }: { critical: boolean; rows: StockRow[]; scopeRows: StockRow[]; loading: boolean; columns: DataTableColumn<StockRow>[]; page: number; setPage: (page: number) => void; classValue: MovementClass | ''; deposit: string; state: StockState | ''; search: string; deposits: DepositLookup[]; setClass: (value: MovementClass | '') => void; setDeposit: (value: string) => void; setState: (value: StockState | '') => void; setSearch: (value: string) => void; clear: () => void; exportButtons: React.ReactNode }) {
  const visualRows = rows;
  const evaluated = rows.filter((row) => row.minimum > 0), compliant = evaluated.filter((row) => row.quantity >= row.minimum).length;
  const lines = stockInterpretation(rows, scopeRows, critical);
  return <><ReportHeading icon={critical ? <AlertTriangle /> : <PackageCheck />} title={critical ? 'Stock crítico y faltantes' : 'Disponibilidad y distribución'} question={critical ? '¿Dónde se concentran las situaciones que requieren revisión?' : '¿Cómo está distribuido el stock y qué proporción cumple su mínimo?'} description={critical ? 'Prioriza posiciones sin existencias y con déficit, manteniendo unidades separadas.' : 'Compara disponibilidad física, cumplimiento y distribución por depósito.'} actions={exportButtons} /><div className="inventory-stock-current-date"><span>Estado del inventario al</span><strong>{new Date().toLocaleDateString('es-AR')}</strong></div><StockFilters critical={critical} classValue={classValue} deposit={deposit} state={state} search={search} deposits={deposits} setClass={setClass} setDeposit={setDeposit} setState={setState} setSearch={setSearch} clear={clear} />{critical ? <CriticalMetrics rows={rows} loading={loading} /> : <AvailabilityMetrics rows={rows} loading={loading} evaluated={evaluated.length} compliant={compliant} />}<section className={`inventory-report-visual-grid ${critical ? 'critical' : 'availability'}`}>{critical ? <><DeficitRankingChart rows={visualRows} /><DepositStateChart rows={visualRows} scopeRows={scopeRows} criticalOnly /></> : <><StockCompositionChart rows={rows} /><DepositStateChart rows={rows} scopeRows={scopeRows} /><ClassStateChart rows={rows} /></>}</section><Interpretation lines={lines} caution={critical ? 'Una posición sin existencias requiere revisión; no implica automáticamente fabricar o comprar.' : undefined} /><DetailSection title={critical ? 'Detalle de posiciones críticas' : 'Detalle de posiciones'} description="Listado secundario de combinaciones artículo–depósito incluidas en el análisis."><DataTable rows={rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)} columns={columns} rowKey={(row) => row.key} loading={loading} page={page} pageSize={PAGE_SIZE} totalRecords={rows.length} onPageChange={setPage} tableClassName="inventory-report-table" summary={<><strong>{rows.length}</strong> posiciones</>} /></DetailSection></>;
}

function ReportHeading({ icon, title, question, description, actions }: { icon: React.ReactNode; title: string; question: string; description: string; actions?: React.ReactNode }) { return <section className="inventory-report-heading redesigned"><div className="inventory-report-icon">{icon}</div><div><span>{question}</span><h2>{title}</h2><p>{description}</p></div>{actions}</section>; }
function ReportError({ text, retry }: { text: string; retry?: () => void }) { return <div className="inventory-error" role="alert"><Ban size={18} /><span>{text}</span>{retry && <button className="button secondary compact" onClick={retry}>Reintentar</button>}</div>; }
function DetailSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="inventory-report-detail"><header><h3>{title}</h3><p>{description}</p></header>{children}</section>; }
function Interpretation({ lines, caution }: { lines: string[]; caution?: string }) { return <section className="inventory-report-reading"><div><span>Interpretación</span><h3>Lectura de resultados</h3></div><div><ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>{caution && <p>{caution}</p>}</div></section>; }

function StockFilters({ critical, classValue, deposit, state, search, deposits, setClass, setDeposit, setState, setSearch, clear }: { critical: boolean; classValue: MovementClass | ''; deposit: string; state: StockState | ''; search: string; deposits: DepositLookup[]; setClass: (value: MovementClass | '') => void; setDeposit: (value: string) => void; setState: (value: StockState | '') => void; setSearch: (value: string) => void; clear: () => void }) { return <section className="inventory-report-filters stock"><label><span>Clase</span><select value={classValue} onChange={(event) => setClass(event.target.value as MovementClass | '')}><option value="">Todas</option><option value="PRODUCTO">Productos terminados</option><option value="INSUMO">Insumos</option></select></label><label><span>Depósito</span><select value={deposit} onChange={(event) => setDeposit(event.target.value)}><option value="">Todos</option>{deposits.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><label><span>Estado</span><select value={state} onChange={(event) => setState(event.target.value as StockState | '')}><option value="">Todos</option><option value="Sin existencias">Sin existencias</option><option value="Bajo mínimo">Bajo mínimo</option>{!critical && <><option value="Cumple mínimo">Cumple mínimo</option><option value="Sin mínimo">Sin mínimo</option></>}</select></label><label className="wide"><span>Artículo</span><div className="inventory-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código o nombre" /></div></label><button className="button secondary" disabled={!classValue && !deposit && !state && !search} onClick={clear}><RotateCcw size={14} />Limpiar</button></section>; }

function ActivityFilters({ mode, value, deposits, loading, setMode, selectPreset, set, apply }: { mode: PeriodMode; value: ActivityFiltersValue; deposits: DepositLookup[]; loading: boolean; setMode: (mode: PeriodMode) => void; selectPreset: (mode: Exclude<PeriodMode, 'custom'>) => void; set: (value: ActivityFiltersValue) => void; apply: () => void }) { return <section className="inventory-activity-filters"><div className="inventory-period-presets">{(['7', '30', '90'] as const).map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => selectPreset(item)}>Últimos {item} días</button>)}<button className={mode === 'custom' ? 'active' : ''} onClick={() => setMode('custom')}>Personalizado</button></div><div className="inventory-activity-filter-fields">{mode === 'custom' && <><label><span>Desde</span><input type="date" max={localIso(new Date())} value={value.desde} onChange={(event) => set({ ...value, desde: event.target.value })} /></label><label><span>Hasta</span><input type="date" max={localIso(new Date())} value={value.hasta} onChange={(event) => set({ ...value, hasta: event.target.value })} /></label></>}<label><span>Clase</span><select value={value.clase} onChange={(event) => set({ ...value, clase: event.target.value as MovementClass | '' })}><option value="">Todas</option><option value="PRODUCTO">Productos</option><option value="INSUMO">Insumos</option></select></label><label><span>Depósito</span><select value={value.depositoId} onChange={(event) => set({ ...value, depositoId: event.target.value })}><option value="">Todos</option>{deposits.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><button className="button primary" disabled={loading} onClick={apply}>Aplicar filtros</button></div></section>; }

function EvolutionFilters({ classValue, article, query, open, suggestions, deposit, from, to, grouping, deposits, loading, setClass, setArticle, setQuery, setOpen, setDeposit, setFrom, setTo, setGrouping, apply }: { classValue: MovementClass; article?: number; query: string; open: boolean; suggestions: { id: number; label: string; unit: string }[]; deposit: string; from: string; to: string; grouping: HistoryGrouping; deposits: DepositLookup[]; loading: boolean; setClass: (value: MovementClass) => void; setArticle: (value?: number) => void; setQuery: (value: string) => void; setOpen: (value: boolean) => void; setDeposit: (value: string) => void; setFrom: (value: string) => void; setTo: (value: string) => void; setGrouping: (value: HistoryGrouping) => void; apply: () => void }) { return <section className="inventory-report-filters evolution"><label><span>Clase</span><select value={classValue} onChange={(event) => setClass(event.target.value as MovementClass)}><option value="PRODUCTO">Productos terminados</option><option value="INSUMO">Insumos</option></select></label><div className="inventory-article-filter"><span>Artículo</span><div><input role="combobox" aria-expanded={open} autoComplete="off" value={query} placeholder="Buscar por código o nombre" onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} onChange={(event) => { setQuery(event.target.value); setArticle(undefined); setOpen(true); }} />{article && <button onMouseDown={(event) => event.preventDefault()} onClick={() => { setArticle(undefined); setQuery(''); }} aria-label="Limpiar artículo"><X size={14} /></button>}{open && !article && <div className="inventory-article-options">{suggestions.length ? suggestions.map((item) => <button key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { setArticle(item.id); setQuery(item.label); setOpen(false); }}><strong>{item.label}</strong><small>{item.unit}</small></button>) : <span>Sin coincidencias</span>}</div>}</div></div><label><span>Depósito</span><select value={deposit} onChange={(event) => setDeposit(event.target.value)}><option value="">Consolidado</option>{deposits.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><label><span>Desde</span><input type="date" max={localIso(new Date())} value={from} onChange={(event) => setFrom(event.target.value)} /></label><label><span>Hasta</span><input type="date" max={localIso(new Date())} value={to} onChange={(event) => setTo(event.target.value)} /></label><label><span>Agrupación</span><select value={grouping} onChange={(event) => setGrouping(event.target.value as HistoryGrouping)}><option value="DIA">Día</option><option value="MES">Mes</option></select></label><button className="button primary" disabled={loading} onClick={apply}>Consultar</button></section>; }

function AvailabilityMetrics({ rows, loading, evaluated, compliant }: { rows: StockRow[]; loading: boolean; evaluated: number; compliant: number }) { const available = rows.filter((row) => row.quantity > 0).length, out = rows.filter((row) => row.state === 'Sin existencias').length, low = rows.filter((row) => row.state === 'Bajo mínimo').length; return <section className="inventory-report-kpis five"><Kpi tone="neutral" label="Posiciones evaluadas" value={loading ? '…' : rows.length} text="Combinaciones artículo–depósito filtradas." /><Kpi tone="success" label="Con disponibilidad" value={loading ? '…' : available} text="Existencia física mayor que cero." /><Kpi tone="danger" label="Sin existencias" value={loading ? '…' : out} text="Saldo actual igual a cero." /><Kpi tone="warning" label="Bajo mínimo" value={loading ? '…' : low} text="Stock positivo insuficiente." /><Kpi tone="success" label="Cumplimiento" value={loading ? '…' : evaluated ? `${percentage.format(compliant / evaluated * 100)}%` : '—'} text={`${compliant} de ${evaluated} posiciones con mínimo positivo.`} /></section>; }
function CriticalMetrics({ rows, loading }: { rows: StockRow[]; loading: boolean }) { const out = rows.filter((row) => row.state === 'Sin existencias').length, low = rows.filter((row) => row.state === 'Bajo mínimo').length, deficits = rows.filter((row) => row.minimum > 0 && row.deficit > 0), maximum = Math.max(0, ...deficits.map((row) => row.deficitRate * 100)); return <section className="inventory-report-kpis four"><Kpi tone="danger" label="Sin existencias" value={loading ? '…' : out} text="Posiciones con saldo actual cero." /><Kpi tone="warning" label="Bajo mínimo" value={loading ? '…' : low} text="Stock positivo inferior al mínimo." /><Kpi tone="warning" label="Con déficit medible" value={loading ? '…' : deficits.length} text="Posiciones con mínimo positivo y faltante." /><Kpi tone="danger" label="Mayor déficit relativo" value={loading ? '…' : deficits.length ? `${percentage.format(maximum)}%` : '—'} text="Máximo faltante respecto del mínimo." /></section>; }
function ActivityMetrics({ current, previous, loading }: { current: MovementSummary; previous: MovementSummary; loading: boolean }) { const comparison = previous.totalMovimientos ? (current.totalMovimientos - previous.totalMovimientos) / previous.totalMovimientos * 100 : null; return <section className="inventory-report-kpis activity"><Kpi tone="neutral" label="Movimientos" value={loading ? '…' : current.totalMovimientos} text="Operaciones del período aplicado." /><Kpi tone="success" label="Entradas" value={loading ? '…' : current.cantidadEntradas} text="Operaciones con signo positivo." /><Kpi tone="danger" label="Salidas" value={loading ? '…' : current.cantidadSalidas} text="Operaciones con signo negativo." /><Kpi tone="warning" label="Manuales" value={loading ? '…' : current.cantidadManuales} text="Registradas explícitamente." /><Kpi tone="neutral" label="Automáticas" value={loading ? '…' : current.cantidadAutomaticos} text="Originadas por otros circuitos." /><Kpi tone="neutral" label="Variación de actividad" value={loading ? '…' : comparison == null ? 'No calculable' : `${comparison >= 0 ? '+' : ''}${percentage.format(comparison)}%`} text={previous.totalMovimientos ? `${previous.totalMovimientos} operaciones en el período anterior.` : 'El período anterior no registró operaciones.'} /></section>; }
function EvolutionMetrics({ value, unit, loading }: { value: InventoryActivity | null; unit: string; loading: boolean }) { const variationRate = value && value.saldoInicial !== 0 ? value.variacionNeta / Math.abs(value.saldoInicial) * 100 : null; return <section className="inventory-report-kpis evolution"><Kpi tone="neutral" label="Saldo inicial" value={loading ? '…' : value ? number.format(value.saldoInicial) : '—'} text={unit} /><Kpi tone="neutral" label="Saldo final" value={loading ? '…' : value ? number.format(value.saldoFinal) : '—'} text={unit} /><Kpi tone={value && value.variacionNeta < 0 ? 'danger' : 'success'} label="Variación neta" value={loading ? '…' : value ? `${value.variacionNeta >= 0 ? '+' : ''}${number.format(value.variacionNeta)}` : '—'} text={unit} /><Kpi tone="neutral" label="Variación porcentual" value={loading ? '…' : variationRate == null ? 'No calculable' : `${variationRate >= 0 ? '+' : ''}${percentage.format(variationRate)}%`} text="Calculada sobre el saldo inicial." /><Kpi tone="success" label="Entradas" value={loading ? '…' : value ? number.format(value.entradas) : '—'} text={unit} /><Kpi tone="danger" label="Salidas" value={loading ? '…' : value ? number.format(value.salidas) : '—'} text={unit} /><Kpi tone="neutral" label="Movimientos" value={loading ? '…' : value?.cantidadMovimientos ?? '—'} text="Cantidad de operaciones." /></section>; }
function Kpi({ tone, label, value, text }: { tone: 'danger' | 'warning' | 'success' | 'neutral'; label: string; value: string | number; text: string }) { return <article className={tone}><span>{label}</span><strong>{value}</strong><p>{text}</p></article>; }
function StockStateBadge({ state }: { state: StockState }) { return <span className={`inventory-priority ${state === 'Sin existencias' ? 'out' : state === 'Bajo mínimo' ? 'low' : state === 'Cumple mínimo' ? 'ok' : 'unset'}`}>{state}</span>; }

function activityInterpretation(current: MovementSummary, previous: MovementSummary) { const lines: string[] = []; if (!current.totalMovimientos) lines.push('No se registraron movimientos en el período aplicado.'); else if (!previous.totalMovimientos) lines.push('La variación no puede calcularse porque el período anterior no tuvo operaciones.'); else { const change = (current.totalMovimientos - previous.totalMovimientos) / previous.totalMovimientos * 100; lines.push(`La actividad ${change > 0 ? 'aumentó' : change < 0 ? 'disminuyó' : 'se mantuvo'}${change ? ` ${percentage.format(Math.abs(change))}%` : ''} frente al período anterior.`); } if (current.cantidadEntradas > current.cantidadSalidas) lines.push('Predominaron las operaciones de entrada.'); else if (current.cantidadSalidas > current.cantidadEntradas) lines.push('Predominaron las operaciones de salida.'); if (current.cantidadManuales + current.cantidadAutomaticos) lines.push(`${percentage.format(current.cantidadManuales / (current.cantidadManuales + current.cantidadAutomaticos) * 100)}% de las operaciones clasificadas fueron manuales.`); return lines; }
function evolutionInterpretation(value: InventoryActivity | null, points: InventoryEvolution[]) { if (!value) return ['La consulta no devolvió un resumen de actividad para el artículo y período.']; const lines = [`El saldo final ${value.saldoFinal > value.saldoInicial ? 'supera' : value.saldoFinal < value.saldoInicial ? 'es inferior a' : 'coincide con'} el saldo inicial.`]; if (value.entradas > value.salidas) lines.push('Las entradas acumuladas superaron a las salidas.'); else if (value.salidas > value.entradas) lines.push('Las salidas acumuladas superaron a las entradas.'); if (!points.length) lines.push('No hay puntos temporales para representar la evolución del saldo.'); return lines; }
function movementSummary(current: MovementSummary, previous: MovementSummary): ReportSummary[] { const variation = previous.totalMovimientos ? (current.totalMovimientos - previous.totalMovimientos) / previous.totalMovimientos * 100 : null; return [{ label: 'Movimientos', value: current.totalMovimientos }, { label: 'Entradas', value: current.cantidadEntradas }, { label: 'Salidas', value: current.cantidadSalidas }, { label: 'Manuales', value: current.cantidadManuales }, { label: 'Automáticos', value: current.cantidadAutomaticos }, { label: 'Variación', value: variation == null ? 'No calculable' : `${percentage.format(variation)}%` }]; }
function evolutionSummary(value: InventoryActivity | null, unit: string): ReportSummary[] { return value ? [{ label: 'Saldo inicial', value: `${number.format(value.saldoInicial)} ${unit}` }, { label: 'Saldo final', value: `${number.format(value.saldoFinal)} ${unit}` }, { label: 'Variación', value: `${number.format(value.variacionNeta)} ${unit}` }, { label: 'Entradas', value: `${number.format(value.entradas)} ${unit}` }, { label: 'Salidas', value: `${number.format(value.salidas)} ${unit}` }, { label: 'Movimientos', value: value.cantidadMovimientos }] : []; }
