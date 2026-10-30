import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownAZ, ArrowUpAZ, Ban, Box, Boxes, ChevronRight, Download,
  FileText, History, LineChart, PackageOpen, Warehouse, X,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { hasPermission } from '../../services/authorization';
import { formatProductName } from '../../services/productDisplay';
import { productsApi, type Product } from '../../services/productsApi';
import { formatSupplyName } from '../../services/supplyDisplay';
import { suppliesApi, type Supply } from '../../services/suppliesApi';
import {
  inventoryStockApi, type DepositLookup, type StockMovement,
  type StockProduct, type StockSupply,
} from '../../services/inventoryStockApi';
import { inventoryExcel, inventoryPdf, type InventoryReportRow, type InventoryReportState } from '../../services/inventoryReports';
import { inventoryHistoryApi, type InventoryEvolution } from '../../services/inventoryHistoryApi';
import { StockHistoricalPlaceholder, type HistoricalArticleSelection } from './StockHistoricalPlaceholder';
import './stock.css';

type Kind = 'products' | 'supplies';
type ViewMode = 'stock' | 'activity';
type StockState = 'out' | 'critical' | 'normal';
type SortKey = 'code' | 'name' | 'category' | 'deposit' | 'quantity' | 'minimum' | 'state';
type FilterState = { search: string; deposit: string; category: string; state: StockState | ''; sort: SortKey; ascending: boolean; page: number };
type Distribution = { depositId: number; depositName: string; quantity: number; minimum: number; critical: boolean };
type InventoryRow = {
  key: string; kind: Kind; itemId: number; code: string; name: string; description: string;
  categoryId: number | null; category: string; unit: string; quantity: number; minimum: number;
  state: StockState; deposit: string; distributions: Distribution[];
};
type EvolutionContext = { from: string; to: string; depositId: number | null; activity: HistoricalArticleSelection['activity'] };

const PAGE_SIZE = 10;
const emptyFilter = (): FilterState => ({ search: '', deposit: '', category: '', state: '', sort: 'code', ascending: true, page: 1 });
const stateLabel: Record<StockState, InventoryReportState> = { out: 'Sin stock', critical: 'Crítico', normal: 'Normal' };
const stateTone: Record<StockState, 'danger' | 'warning' | 'success'> = { out: 'danger', critical: 'warning', normal: 'success' };
const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

function asError(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudieron cargar las existencias.';
}

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
}

function stateFor(quantity: number, minimum: number, backendCritical = false): StockState {
  if (quantity <= 0) return 'out';
  if (backendCritical || quantity <= minimum) return 'critical';
  return 'normal';
}

function movementAmount(movement: StockMovement) {
  return movement.cantidad * (movement.signo < 0 ? -1 : 1);
}

export function StockPage() {
  const [kind, setKind] = useState<Kind>('products');
  const [productStock, setProductStock] = useState<StockProduct[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [deposits, setDeposits] = useState<DepositLookup[]>([]);
  const [filters, setFilters] = useState<Record<Kind, FilterState>>({ products: emptyFilter(), supplies: emptyFilter() });
  const [views, setViews] = useState<Record<Kind, ViewMode>>({ products: 'stock', supplies: 'stock' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [detailStock, setDetailStock] = useState<Distribution[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsError, setMovementsError] = useState('');
  const [detailTab, setDetailTab] = useState<'summary' | 'movements' | 'evolution'>('summary');
  const [evolutionContext, setEvolutionContext] = useState<EvolutionContext | null>(null);
  const [evolution, setEvolution] = useState<InventoryEvolution[]>([]);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [evolutionError, setEvolutionError] = useState('');
  const initialized = useRef(false);
  const detailRequest = useRef(0);
  const canExport = hasPermission('Inventario', 'Exportar');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [productRows, supplyRows, productCatalog, supplyCatalog, depositCatalog] = await Promise.all([
        inventoryStockApi.products(), inventoryStockApi.supplies(), productsApi.list(), suppliesApi.list(), inventoryStockApi.deposits(),
      ]);
      setProductStock(productRows);
      setSupplyStock(supplyRows);
      setProducts(productCatalog);
      setSupplies(supplyCatalog);
      setDeposits(depositCatalog);
    } catch (loadError) {
      setError(asError(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void load();
  }, []);

  const productRows = useMemo(() => {
    const catalog = new Map(products.map(item => [item.productoId, item]));
    return buildRows('products', productStock, filters.products.deposit, catalog);
  }, [productStock, products, filters.products.deposit]);
  const supplyRows = useMemo(() => {
    const catalog = new Map(supplies.map(item => [item.insumoId, item]));
    return buildRows('supplies', supplyStock, filters.supplies.deposit, catalog);
  }, [supplyStock, supplies, filters.supplies.deposit]);
  const currentFilter = filters[kind];
  const currentView = views[kind];
  const sourceRows = kind === 'products' ? productRows : supplyRows;

  const scopeRows = useMemo(() => {
    const query = normalized(currentFilter.search.trim());
    return sourceRows.filter(row => {
      const matchesSearch = !query || normalized(`${row.code} ${row.name} ${row.category}`).includes(query);
      const matchesCategory = !currentFilter.category || String(row.categoryId) === currentFilter.category;
      return matchesSearch && matchesCategory;
    });
  }, [sourceRows, currentFilter.search, currentFilter.category]);

  const counts = useMemo(() => ({
    out: scopeRows.filter(row => row.state === 'out').length,
    critical: scopeRows.filter(row => row.state === 'critical').length,
    normal: scopeRows.filter(row => row.state === 'normal').length,
  }), [scopeRows]);

  const filtered = useMemo(() => {
    const rows = scopeRows.filter(row => !currentFilter.state || row.state === currentFilter.state);
    const factor = currentFilter.ascending ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = currentFilter.sort === 'state' ? stateLabel[a.state] : a[currentFilter.sort];
      const right = currentFilter.sort === 'state' ? stateLabel[b.state] : b[currentFilter.sort];
      return typeof left === 'number' && typeof right === 'number'
        ? (left - right) * factor
        : String(left).localeCompare(String(right), 'es-AR', { numeric: true }) * factor;
    });
  }, [scopeRows, currentFilter.state, currentFilter.sort, currentFilter.ascending]);

  const visible = filtered.slice((currentFilter.page - 1) * PAGE_SIZE, currentFilter.page * PAGE_SIZE);
  const selectedRow = selected;
  const categories = useMemo(() => [...new Map(sourceRows.filter(row => row.categoryId).map(row => [row.categoryId, row.category])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'es-AR')), [sourceRows]);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters(current => ({ ...current, [kind]: { ...current[kind], [key]: value, page: key === 'page' ? Number(value) : 1 } }));
  }

  function changeKind(next: Kind) {
    detailRequest.current += 1;
    setKind(next);
    setSelected(null);
    setSummaryError('');
    setMovementsError('');
  }

  function closeDetail() {
    detailRequest.current += 1;
    setSelected(null);
    setEvolutionContext(null);
  }

  async function loadSummary(row: InventoryRow, requestId = detailRequest.current) {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const stock = row.kind === 'products'
        ? await inventoryStockApi.productByItem(row.itemId)
        : await inventoryStockApi.supplyByItem(row.itemId);
      if (requestId !== detailRequest.current) return;
      setDetailStock(stock.map(item => ({
        depositId: item.depositoId, depositName: item.depositoNombre, quantity: item.cantidadActual,
        minimum: item.stockMinimo, critical: item.esStockCritico,
      })));
    } catch (detailLoadError) {
      if (requestId !== detailRequest.current) return;
      setSummaryError(asError(detailLoadError));
      setDetailStock([]);
    } finally {
      if (requestId === detailRequest.current) setSummaryLoading(false);
    }
  }

  async function loadMovements(row: InventoryRow, requestId = detailRequest.current) {
    setMovementsLoading(true);
    setMovementsError('');
    try {
      const history = row.kind === 'products'
        ? await inventoryStockApi.productMovements(row.itemId)
        : await inventoryStockApi.supplyMovements(row.itemId);
      if (requestId !== detailRequest.current) return;
      setMovements([...history].sort((a, b) => Date.parse(b.fechaMovimiento) - Date.parse(a.fechaMovimiento) || b.movimientoStockId - a.movimientoStockId));
    } catch (detailLoadError) {
      if (requestId !== detailRequest.current) return;
      setMovementsError(asError(detailLoadError));
      setMovements([]);
    } finally {
      if (requestId === detailRequest.current) setMovementsLoading(false);
    }
  }

  async function loadEvolution(row: InventoryRow, context: EvolutionContext, requestId = detailRequest.current) {
    setEvolutionLoading(true); setEvolutionError('');
    try {
      const result = await inventoryHistoryApi.evolution({ clase: row.kind === 'products' ? 'PRODUCTO' : 'INSUMO', articuloId: row.itemId,
        desde: context.from, hasta: context.to, depositoId: context.depositId ?? undefined, agrupacion: 'MES' });
      if (requestId === detailRequest.current) setEvolution(result);
    } catch (loadError) {
      if (requestId === detailRequest.current) { setEvolutionError(asError(loadError)); setEvolution([]); }
    } finally { if (requestId === detailRequest.current) setEvolutionLoading(false); }
  }

  function openDetail(row: InventoryRow, context: EvolutionContext | null = null) {
    const requestId = detailRequest.current + 1;
    detailRequest.current = requestId;
    setSelected(row); setEvolutionContext(context);
    setDetailTab(context ? 'evolution' : 'summary');
    setDetailStock([]);
    setMovements([]);
    setEvolution([]); setEvolutionError('');
    void loadSummary(row, requestId);
    void loadMovements(row, requestId);
    if (context) void loadEvolution(row, context, requestId);
  }

  function openHistoricalArticle(selection: HistoricalArticleSelection) {
    const catalog = kind === 'products' ? new Map(products.map(item => [item.productoId, item])) : new Map(supplies.map(item => [item.insumoId, item]));
    const availableRows = kind === 'products'
      ? buildRows('products', productStock, selection.depositId ? String(selection.depositId) : '', catalog as Map<number, Product>)
      : buildRows('supplies', supplyStock, selection.depositId ? String(selection.depositId) : '', catalog as Map<number, Supply>);
    const row = availableRows.find(item => item.itemId === selection.itemId);
    if (!row) return false;
    openDetail(row, { from: selection.from, to: selection.to, depositId: selection.depositId, activity: selection.activity });
    return true;
  }

  function sortHeader(label: string, key: SortKey) {
    const active = currentFilter.sort === key;
    return <button type="button" className="product-sort" onClick={() => {
      if (active) updateFilter('ascending', !currentFilter.ascending);
      else setFilters(current => ({ ...current, [kind]: { ...current[kind], sort: key, ascending: true, page: 1 } }));
    }}>{label}{active ? (currentFilter.ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>) : null}</button>;
  }

  const columns: DataTableColumn<InventoryRow>[] = [
    { key: 'code', header: sortHeader('Código', 'code'), render: row => <strong>{row.code}</strong> },
    { key: 'name', header: sortHeader(kind === 'products' ? 'Producto' : 'Insumo', 'name'), render: row => <><strong>{row.name}</strong><small>{row.description}</small></> },
    { key: 'category', header: sortHeader('Tipo', 'category'), render: row => row.category },
    { key: 'deposit', header: sortHeader('Depósito', 'deposit'), render: row => row.deposit },
    { key: 'quantity', header: sortHeader('Existencia', 'quantity'), className: 'stock-number', render: row => <strong>{numberFormat.format(row.quantity)}</strong> },
    { key: 'unit', header: 'Unidad', render: row => row.unit },
    { key: 'minimum', header: sortHeader('Mínimo', 'minimum'), className: 'stock-number', render: row => numberFormat.format(row.minimum) },
    { key: 'state', header: sortHeader('Estado', 'state'), render: row => <StatusBadge tone={stateTone[row.state]}>{stateLabel[row.state]}</StatusBadge> },
    { key: 'action', header: '', render: row => <button type="button" className="row-action compact product-row-arrow" aria-label={`Ver detalle de ${row.name}`} onClick={event => { event.stopPropagation(); void openDetail(row); }}><ChevronRight size={17}/></button> },
  ];

  const reportRows: InventoryReportRow[] = filtered.map(row => ({
    code: row.code, name: row.name, category: row.category, deposit: row.deposit,
    quantity: row.quantity, unit: row.unit, minimum: row.minimum, state: stateLabel[row.state],
  }));
  const depositLabel = currentFilter.deposit
    ? deposits.find(item => String(item.id) === currentFilter.deposit)?.descripcion || 'Depósito seleccionado'
    : 'Todos los depósitos · consolidado';
  const reportFilters = `${depositLabel}; tipo: ${currentFilter.category ? categories.find(([id]) => String(id) === currentFilter.category)?.[1] : 'todos'}; estado: ${currentFilter.state ? stateLabel[currentFilter.state] : 'todos'}; búsqueda: ${currentFilter.search || 'sin búsqueda'}`;
  const filtersModified = Boolean(currentFilter.search || currentFilter.deposit || currentFilter.category || currentFilter.state);

  return <AppShell title="Existencias" breadcrumb="Inventario / Existencias">
    <div className="stock-page">
    <PageHeader kicker="INVENTARIO" title="Existencias" description={currentView === 'stock' ? 'Consultá el stock actual, su distribución y los movimientos reales de cada artículo.' : 'Analizá movimientos, variaciones, saldos históricos y evolución temporal.'}
      action={<div className="report-actions">
        {canExport && currentView === 'stock' && <button type="button" className="button secondary" disabled={loading || Boolean(error) || filtered.length === 0} onClick={() => inventoryExcel(reportRows, kind === 'products' ? 'Productos terminados' : 'Insumos', reportFilters)}><Download size={16}/> Exportar Excel</button>}
        {canExport && currentView === 'stock' && <button type="button" className="button primary" disabled={loading || Boolean(error) || filtered.length === 0} onClick={() => inventoryPdf(reportRows, kind === 'products' ? 'Productos terminados' : 'Insumos', reportFilters)}><FileText size={16}/> Generar reporte</button>}
      </div>}/>

    {error && <div className="inline-alert error stock-load-error" role="alert"><Ban size={18}/><span><strong>No se pudieron cargar las existencias.</strong>{error}</span><button type="button" className="button secondary compact" disabled={loading} onClick={() => void load()}>Reintentar</button><button type="button" onClick={() => setError('')} aria-label="Cerrar"><X size={16}/></button></div>}

    <section className="stock-context" aria-label="Vistas de existencias">
      <div className="stock-kind-tabs" role="tablist" aria-label="Tipo de artículo">
        <button type="button" role="tab" aria-selected={kind === 'products'} className={kind === 'products' ? 'active' : ''} onClick={() => changeKind('products')}><Box size={17}/> Productos terminados</button>
        <button type="button" role="tab" aria-selected={kind === 'supplies'} className={kind === 'supplies' ? 'active' : ''} onClick={() => changeKind('supplies')}><Boxes size={17}/> Insumos</button>
      </div>
      <div className="stock-view-tabs" role="tablist" aria-label="Modo de visualización">
        <button type="button" role="tab" aria-selected={currentView === 'stock'} className={currentView === 'stock' ? 'active' : ''} onClick={() => { setViews(current => ({ ...current, [kind]: 'stock' })); closeDetail(); }}>Existencias</button>
        <button type="button" role="tab" aria-selected={currentView === 'activity'} className={currentView === 'activity' ? 'active' : ''} onClick={() => { setViews(current => ({ ...current, [kind]: 'activity' })); closeDetail(); }}><LineChart size={15}/> Actividad</button>
      </div>
    </section>

    {currentView === 'stock' ? <>
    <DataTableFilters search={currentFilter.search} onSearchChange={value => updateFilter('search', value)} searchPlaceholder="Buscar por código, nombre o tipo" onClear={() => setFilters(current => ({ ...current, [kind]: emptyFilter() }))} clearDisabled={!filtersModified} className="stock-filters">
      <label className="data-table-filter-field"><span>Depósito</span><select value={currentFilter.deposit} onChange={event => updateFilter('deposit', event.target.value)}><option value="">Todos · consolidado</option>{deposits.map(deposit => <option key={deposit.id} value={deposit.id}>{deposit.descripcion}</option>)}</select></label>
      <label className="data-table-filter-field"><span>Tipo</span><select value={currentFilter.category} onChange={event => updateFilter('category', event.target.value)}><option value="">Todos</option>{categories.map(([id, name]) => <option key={id} value={id!}>{name}</option>)}</select></label>
    </DataTableFilters>

    <StockStateBar counts={counts} selected={currentFilter.state} onSelect={value => updateFilter('state', currentFilter.state === value ? '' : value)}/>

    <div className={`stock-master-detail ${selectedRow ? 'with-detail' : ''}`}>
      <DataTable rows={visible} columns={columns} rowKey={row => row.key} loading={loading} loadingText="Cargando existencias…" page={currentFilter.page} pageSize={PAGE_SIZE} totalRecords={filtered.length} onPageChange={page => updateFilter('page', page)} onRowClick={row => void openDetail(row)} selectedRowKey={selectedRow?.key} tableClassName="stock-table"
        summary={<><strong>{filtered.length}</strong> artículos encontrados · <strong>{counts.out}</strong> sin stock · <strong>{counts.critical}</strong> críticos</>}
        emptyState={<div className="state-box"><PackageOpen size={29}/><strong>No hay existencias para mostrar</strong><span>{error ? 'Revisá la conexión con la API.' : 'Probá cambiando o limpiando los filtros.'}</span></div>}/>

      {selectedRow && <StockDetail row={selectedRow} summaryLoading={summaryLoading} summaryError={summaryError} movementsLoading={movementsLoading} movementsError={movementsError} distributions={detailStock} movements={movements} evolutionContext={evolutionContext} evolution={evolution} evolutionLoading={evolutionLoading} evolutionError={evolutionError} tab={detailTab} onTab={setDetailTab} onRetrySummary={() => void loadSummary(selectedRow)} onRetryMovements={() => void loadMovements(selectedRow)} onRetryEvolution={() => evolutionContext && void loadEvolution(selectedRow, evolutionContext)} onClose={closeDetail}/>} 
    </div>
    </> : <div className={`stock-master-detail stock-history-master-detail ${selectedRow ? 'with-detail' : ''}`}>
      <StockHistoricalPlaceholder kind={kind} products={products} supplies={supplies} deposits={deposits} canExport={canExport} onOpenArticle={openHistoricalArticle} onQueryChange={closeDetail}/>
      {selectedRow && <StockDetail row={selectedRow} summaryLoading={summaryLoading} summaryError={summaryError} movementsLoading={movementsLoading} movementsError={movementsError} distributions={detailStock} movements={movements} evolutionContext={evolutionContext} evolution={evolution} evolutionLoading={evolutionLoading} evolutionError={evolutionError} tab={detailTab} onTab={setDetailTab} onRetrySummary={() => void loadSummary(selectedRow)} onRetryMovements={() => void loadMovements(selectedRow)} onRetryEvolution={() => evolutionContext && void loadEvolution(selectedRow, evolutionContext)} onClose={closeDetail}/>} 
    </div>}
    </div>
  </AppShell>;
}

function StockStateBar({ counts, selected, onSelect }: { counts: Record<StockState, number>; selected: StockState | ''; onSelect: (state: StockState) => void }) {
  const total = counts.out + counts.critical + counts.normal;
  const states: StockState[] = ['out', 'critical', 'normal'];
  return <section className="stock-state-card" aria-label="Distribución por estado de stock">
    <div className="stock-state-heading"><div><strong>Estado del stock</strong><span>{total} artículos en el alcance y filtros actuales</span></div><small>Seleccioná un segmento para filtrar</small></div>
    <div className="stock-state-track" role="group" aria-label="Filtrar por estado">
      {states.map(state => {
        const percentage = total ? counts[state] / total * 100 : 0;
        return <button key={state} type="button" className={`${state} ${selected === state ? 'selected' : ''}`} style={{ width: `${percentage}%` }} disabled={!counts[state]} aria-pressed={selected === state} onClick={() => onSelect(state)} aria-label={`${stateLabel[state]}: ${counts[state]} artículos, ${numberFormat.format(percentage)} por ciento`}/>;
      })}
    </div>
    <div className="stock-state-legend">{states.map(state => {
      const percentage = total ? counts[state] / total * 100 : 0;
      return <button key={state} type="button" className={selected === state ? 'selected' : ''} onClick={() => onSelect(state)} disabled={!counts[state]}><i className={state}/><span>{stateLabel[state]}</span><strong>{counts[state]}</strong><small>{numberFormat.format(percentage)}%</small></button>;
    })}</div>
  </section>;
}

function StockDetail({ row, summaryLoading, summaryError, movementsLoading, movementsError, distributions, movements, evolutionContext, evolution, evolutionLoading, evolutionError, tab, onTab, onRetrySummary, onRetryMovements, onRetryEvolution, onClose }: {
  row: InventoryRow; summaryLoading: boolean; summaryError: string; movementsLoading: boolean; movementsError: string;
  distributions: Distribution[]; movements: StockMovement[];
  evolutionContext: EvolutionContext | null; evolution: InventoryEvolution[]; evolutionLoading: boolean; evolutionError: string;
  tab: 'summary' | 'movements' | 'evolution'; onTab: (tab: 'summary' | 'movements' | 'evolution') => void;
  onRetrySummary: () => void; onRetryMovements: () => void; onRetryEvolution: () => void; onClose: () => void;
}) {
  return <aside className="user-detail-panel stock-detail-panel">
    <header className="detail-panel-header stock-detail-header"><div className="product-detail-identity"><span className="detail-avatar">{row.kind === 'products' ? <Box size={21}/> : <Boxes size={21}/>}</span><div className="product-detail-heading"><span className="product-detail-eyebrow">{row.code}</span><h2>{row.name}</h2><p>{row.category}</p></div></div><button type="button" className="detail-close" onClick={onClose} aria-label="Cerrar detalle"><X size={18}/></button></header>
    <div className="detail-tabs stock-detail-tabs" role="tablist">
      <button type="button" role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'active' : ''} onClick={() => onTab('summary')}>Resumen</button>
      <button type="button" role="tab" aria-selected={tab === 'movements'} className={tab === 'movements' ? 'active' : ''} onClick={() => onTab('movements')}>Movimientos {!movementsLoading && !movementsError && <span>{movements.length}</span>}</button>
      <button type="button" role="tab" aria-selected={tab === 'evolution'} className={tab === 'evolution' ? 'active' : ''} onClick={() => onTab('evolution')}>Evolución</button>
    </div>
    <div className="detail-panel-body">
      {tab === 'summary' && <>
        <div className="stock-detail-state"><span>Estado actual</span><StatusBadge tone={stateTone[row.state]}>{stateLabel[row.state]}</StatusBadge></div>
        <div className="stock-detail-numbers"><div><span>Existencia</span><strong>{numberFormat.format(row.quantity)}</strong><small>{row.unit}</small></div><div><span>Stock mínimo</span><strong>{numberFormat.format(row.minimum)}</strong><small>valor actual</small></div></div>
        <h3 className="stock-section-title"><Warehouse size={15}/> Distribución por depósito</h3>
        {summaryLoading ? <div className="stock-inline-state">Cargando distribución…</div> : summaryError ? <DetailError title="No se pudo cargar la distribución" message={summaryError} onRetry={onRetrySummary}/> :
          <div className="stock-distribution">{distributions.length ? distributions.map(item => <div key={item.depositId}><span><strong>{item.depositName}</strong><small>Mínimo actual: {numberFormat.format(item.minimum)}</small></span><b>{numberFormat.format(item.quantity)} {row.unit}</b><StatusBadge tone={stateTone[stateFor(item.quantity, item.minimum, item.critical)]}>{stateLabel[stateFor(item.quantity, item.minimum, item.critical)]}</StatusBadge></div>) : <p className="muted-copy">La API no informó existencias por depósito para este artículo.</p>}</div>}
        {row.description !== 'Sin descripción' && <><h3 className="stock-section-title">Descripción</h3><p className="stock-description">{row.description}</p></>}
      </>}
      {tab === 'movements' && <>
        <div className="stock-history-note"><History size={16}/><span>Movimientos registrados por la API. No se usan para reconstruir ni certificar saldos históricos.</span></div>
        {movementsLoading ? <div className="stock-inline-state">Cargando movimientos…</div> : movementsError ? <DetailError title="No se pudieron cargar los movimientos" message={movementsError} onRetry={onRetryMovements}/> :
          <div className="stock-movements">{movements.length ? movements.map(movement => {
            const amount = movementAmount(movement);
            return <article key={movement.movimientoStockId} className={!movement.activo ? 'cancelled' : ''}><div className="stock-movement-top"><span className={amount >= 0 ? 'in' : 'out'}>{amount >= 0 ? '+' : '−'}{numberFormat.format(Math.abs(amount))} {row.unit}</span><time>{new Date(movement.fechaMovimiento).toLocaleString('es-AR')}</time></div><strong>{movement.tipoMovimientoNombre}</strong><p>{movement.depositoNombre}{movement.entidadOrigen ? ` · ${movement.entidadOrigen}${movement.origenId ? ` #${movement.origenId}` : ''}` : ''}</p>{movement.motivo && <small>{movement.motivo}</small>}<div className="stock-movement-tags">{!movement.activo && <StatusBadge tone="danger">Anulado</StatusBadge>}{movement.movimientoStockIdReversaDe && <StatusBadge tone="neutral">Reversa de #{movement.movimientoStockIdReversaDe}</StatusBadge>}</div></article>;
          }) : <div className="state-box compact"><History size={24}/><strong>Sin movimientos informados</strong><span>La consulta finalizó y no devolvió registros para este artículo.</span></div>}</div>}
      </>}
      {tab === 'evolution' && (!evolutionContext ? <div className="stock-evolution-pending"><LineChart size={26}/><strong>Seleccioná un período en Actividad</strong><span>La evolución se consulta desde una fila del análisis por período para respetar el artículo y depósito seleccionados.</span></div> : evolutionLoading ? <div className="stock-inline-state">Cargando evolución mensual…</div> : evolutionError ? <DetailError title="No se pudo cargar la evolución" message={evolutionError} onRetry={onRetryEvolution}/> : <EvolutionView row={row} context={evolutionContext} points={evolution}/>) }
    </div>
  </aside>;
}

function DetailError({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return <div className="stock-detail-error" role="alert"><Ban size={21}/><span><strong>{title}</strong><small>{message}</small></span><button type="button" className="button secondary compact" onClick={onRetry}>Reintentar</button></div>;
}

function EvolutionView({ row, context, points }: { row: InventoryRow; context: EvolutionContext; points: InventoryEvolution[] }) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const values = points.map(point => point.saldoFinal);
  const min = values.length ? Math.min(...values) : 0; const max = values.length ? Math.max(...values) : 0;
  const flatPadding = Math.max(1, Math.abs(max) * .1);
  const domainMin = min === max ? Math.max(0, min - flatPadding) : min;
  const domainMax = min === max ? max + flatPadding : max;
  const range = domainMax - domainMin; const width = 360; const height = 205;
  const padding = { top: 14, right: 10, bottom: 34, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? padding.left + plotWidth / 2 : padding.left + index * (plotWidth / (points.length - 1)),
    y: padding.top + (1 - (point.saldoFinal - domainMin) / range) * plotHeight, point,
  }));
  const line = coordinates.map(point => `${point.x},${point.y}`).join(' ');
  const formatDay = (value: string) => { const [year, month, day] = value.slice(0, 10).split('-'); return `${day}/${month}/${year}`; };
  const periodDate = (value: string) => { const [year, month, day = 1] = value.slice(0, 10).split('-').map(Number); return new Date(year, month - 1, day); };
  const formatMonth = (value: string) => periodDate(value).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).replace('.', '');
  const formatMonthLong = (value: string) => periodDate(value).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const yTicks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return { value: domainMax - ratio * (domainMax - domainMin), y: padding.top + ratio * plotHeight };
  });
  const xLabelIndexes = points.length <= 4
    ? points.map((_, index) => index)
    : [...new Set([0, Math.round((points.length - 1) / 3), Math.round((points.length - 1) * 2 / 3), points.length - 1])];
  const selectedPoint = activePoint === null ? null : coordinates[activePoint];
  return <div className="stock-evolution-view">
    <div className="stock-evolution-period"><span><small>Período consultado</small>{formatDay(context.from)} al {formatDay(context.to)}</span><strong><small>Alcance</small>{context.depositId === null ? 'Consolidado entre depósitos' : row.deposit}</strong></div>
    <div className="stock-evolution-metrics"><div><span>Inicial</span><strong>{numberFormat.format(context.activity.saldoInicial)}</strong></div><div><span>Entradas</span><strong className="positive">+{numberFormat.format(context.activity.entradas)}</strong></div><div><span>Salidas</span><strong className="negative">−{numberFormat.format(context.activity.salidas)}</strong></div><div><span>Variación</span><strong>{context.activity.variacionNeta > 0 ? '+' : ''}{numberFormat.format(context.activity.variacionNeta)}</strong></div><div><span>Final</span><strong>{numberFormat.format(context.activity.saldoFinal)}</strong></div></div>
    {points.length ? <div className="stock-evolution-chart" aria-label={`Evolución mensual de ${row.name}`}>
      <div className="stock-evolution-chart-head"><span className="stock-evolution-legend"><i/>Saldo de stock</span><span>Eje Y · {row.unit}</span></div>
      <div className="stock-evolution-plot">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Saldo de stock de ${row.name}, expresado en ${row.unit}`}>
          {yTicks.map(tick => <g key={tick.y} className="stock-evolution-grid"><line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y}/><text x={padding.left - 7} y={tick.y + 3}>{numberFormat.format(tick.value)}</text></g>)}
          <line className="stock-evolution-axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom}/>
          <line className="stock-evolution-axis" x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom}/>
          {xLabelIndexes.map(index => <text key={points[index].periodo} className="stock-evolution-x-label" x={coordinates[index].x} y={height - 12}>{formatMonth(points[index].periodo)}</text>)}
          <polyline className="stock-evolution-line" points={line} fill="none"/>
          {coordinates.map(({ x, y, point }, index) => <g key={point.periodo} className="stock-evolution-point" tabIndex={0} role="button" aria-label={`${formatMonthLong(point.periodo)}: ${numberFormat.format(point.saldoFinal)} ${row.unit}`} onMouseEnter={() => setActivePoint(index)} onMouseLeave={() => setActivePoint(null)} onFocus={() => setActivePoint(index)} onBlur={() => setActivePoint(null)}><circle cx={x} cy={y} r="4"/><circle className="stock-evolution-hit" cx={x} cy={y} r="10"/><title>{formatMonthLong(point.periodo)} · {numberFormat.format(point.saldoFinal)} {row.unit}</title></g>)}
        </svg>
        {selectedPoint && <div className={`stock-evolution-tooltip ${activePoint === 0 ? 'at-start' : activePoint === points.length - 1 ? 'at-end' : ''} ${selectedPoint.y < 50 ? 'below' : ''}`} style={{ left: `${selectedPoint.x / width * 100}%`, top: `${selectedPoint.y / height * 100}%` }} role="status"><strong>{formatMonthLong(selectedPoint.point.periodo)}</strong><span>{numberFormat.format(selectedPoint.point.saldoFinal)} {row.unit}</span></div>}
      </div>
    </div> : <div className="state-box compact"><LineChart size={24}/><strong>Sin puntos en el período</strong><span>La API no devolvió meses con movimientos para este artículo.</span></div>}
  </div>;
}

function buildRows(kind: 'products', stock: StockProduct[], deposit: string, catalog: Map<number, Product>): InventoryRow[];
function buildRows(kind: 'supplies', stock: StockSupply[], deposit: string, catalog: Map<number, Supply>): InventoryRow[];
function buildRows(kind: Kind, stock: Array<StockProduct | StockSupply>, deposit: string, catalog: Map<number, Product | Supply>): InventoryRow[] {
  const scoped = deposit ? stock.filter(item => String(item.depositoId) === deposit) : stock;
  const groups = new Map<number, Array<StockProduct | StockSupply>>();
  scoped.forEach(item => {
    const id = kind === 'products' ? (item as StockProduct).productoId : (item as StockSupply).insumoId;
    groups.set(id, [...(groups.get(id) || []), item]);
  });
  return [...groups.entries()].map(([itemId, items]) => {
    const metadata = catalog.get(itemId);
    const first = items[0];
    const quantity = items.reduce((sum, item) => sum + item.cantidadActual, 0);
    const minimum = metadata?.stockMinimo ?? first.stockMinimo;
    const rawName = kind === 'products' ? (first as StockProduct).productoNombre : (first as StockSupply).insumoNombre;
    const code = metadata?.codigo || (kind === 'products' ? (first as StockProduct).productoCodigo : (first as StockSupply).insumoCodigo);
    const name = metadata ? (kind === 'products' ? formatProductName(metadata as Product) : formatSupplyName(metadata as Supply)) : rawName;
    const categoryId = metadata ? (kind === 'products' ? (metadata as Product).tipoProductoId : (metadata as Supply).tipoInsumoId) : null;
    const category = metadata ? (kind === 'products' ? (metadata as Product).tipoProductoNombre : (metadata as Supply).tipoInsumoNombre) : 'Sin información';
    const unit = metadata?.unidadMedidaAbreviatura || metadata?.unidadMedidaNombre || '—';
    const distributions = items.map(item => ({ depositId: item.depositoId, depositName: item.depositoNombre, quantity: item.cantidadActual, minimum: item.stockMinimo, critical: item.esStockCritico }));
    return {
      key: `${kind}-${itemId}`, kind, itemId, code, name: name || rawName, description: metadata?.descripcion || 'Sin descripción',
      categoryId, category, unit, quantity, minimum, state: stateFor(quantity, minimum, Boolean(deposit) && items.some(item => item.esStockCritico)),
      deposit: deposit ? first.depositoNombre : items.length === 1 ? first.depositoNombre : `Consolidado · ${items.length} depósitos`, distributions,
    };
  });
}
