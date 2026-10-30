import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ, Ban, CalendarRange, ChevronRight, Clock3, Download, FileText, Minus, PackageOpen, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import type { Product } from '../../services/productsApi';
import type { Supply } from '../../services/suppliesApi';
import type { DepositLookup } from '../../services/inventoryStockApi';
import { formatProductName } from '../../services/productDisplay';
import { formatSupplyName } from '../../services/supplyDisplay';
import { inventoryHistoryApi, type InventoryActivity, type InventoryClass, type InventoryStockAtDate } from '../../services/inventoryHistoryApi';
import { inventoryHistoryExcel, inventoryHistoryPdf, type HistoricalReportRow } from '../../services/inventoryHistoryReports';

type Kind = 'products' | 'supplies';
type HistoricalMode = 'period' | 'cutoff';
type SortKey = 'code' | 'name' | 'deposit' | 'initial' | 'entries' | 'exits' | 'net' | 'final' | 'movements' | 'trend';
type CatalogInfo = { code: string; name: string; unit: string };
type HistoricalRow = CatalogInfo & { key: string; itemId: number; depositId: number | null; deposit: string; reconciled: boolean; initial?: number; entries?: number; exits?: number; net?: number; final: number; movements?: number; trend?: string };

export type HistoricalArticleSelection = { itemId: number; depositId: number | null; from: string; to: string; activity: InventoryActivity };

const PAGE_SIZE = 10;
const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

function localDate(date = new Date()) {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'No se pudo completar la consulta histórica.'; }
function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR'); }
function formatDate(value: string) { if (!value) return ''; const [year, month, day] = value.slice(0, 10).split('-'); return `${day}/${month}/${year}`; }
function signed(value: number) { return value ? `${value > 0 ? '+' : '−'}${number.format(Math.abs(value))}` : number.format(0); }

export function StockHistoricalPlaceholder({ kind, products, supplies, deposits, canExport, onOpenArticle, onQueryChange }: {
  kind: Kind; products: Product[]; supplies: Supply[]; deposits: DepositLookup[]; canExport: boolean;
  onOpenArticle: (selection: HistoricalArticleSelection) => boolean; onQueryChange: () => void;
}) {
  const today = localDate();
  const [mode, setMode] = useState<HistoricalMode>('period');
  const [from, setFrom] = useState(`${today.slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today);
  const [cutoff, setCutoff] = useState(today);
  const [deposit, setDeposit] = useState('');
  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState<InventoryActivity[]>([]);
  const [stockAtDate, setStockAtDate] = useState<InventoryStockAtDate[]>([]);
  const [lastQuery, setLastQuery] = useState<{ mode: HistoricalMode; from?: string; to?: string; cutoff?: string; deposit: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [sort, setSort] = useState<SortKey>('code');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const requestId = useRef(0);
  const inventoryClass: InventoryClass = kind === 'products' ? 'PRODUCTO' : 'INSUMO';

  useEffect(() => { requestId.current += 1; setActivity([]); setStockAtDate([]); setLastQuery(null); setError(''); setValidation(''); setSelectionError(''); setSearch(''); setPage(1); }, [kind]);

  const catalog = useMemo(() => {
    const entries = kind === 'products'
      ? products.map(item => [item.productoId, { code: item.codigo, name: formatProductName(item), unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre }] as const)
      : supplies.map(item => [item.insumoId, { code: item.codigo, name: formatSupplyName(item), unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre }] as const);
    return new Map<number, CatalogInfo>(entries);
  }, [kind, products, supplies]);
  const depositMap = useMemo(() => new Map(deposits.map(item => [item.id, item.descripcion])), [deposits]);

  const rows = useMemo<HistoricalRow[]>(() => {
    const source = lastQuery?.mode === 'period' ? activity : stockAtDate;
    return source.map(item => {
      const metadata = catalog.get(item.articuloId); const depositId = item.depositoId;
      const base = { key: `${item.articuloId}-${depositId ?? 'all'}`, itemId: item.articuloId, depositId,
        code: metadata?.code || `ID ${item.articuloId}`, name: metadata?.name || `Sin asociación de catálogo (ID ${item.articuloId})`, unit: metadata?.unit || 'Sin unidad informada',
        deposit: depositId === null ? 'Consolidado' : depositMap.get(depositId) || `Depósito ID ${depositId}`, reconciled: item.historialConciliado };
      if ('saldoLibroFecha' in item) return { ...base, final: item.saldoLibroFecha };
      return { ...base, initial: item.saldoInicial, entries: item.entradas, exits: item.salidas, net: item.variacionNeta, final: item.saldoFinal, movements: item.cantidadMovimientos, trend: item.tendencia };
    });
  }, [lastQuery, activity, stockAtDate, catalog, depositMap]);

  const filtered = useMemo(() => {
    const query = normalize(search.trim()); const direction = ascending ? 1 : -1;
    return rows.filter(row => !query || normalize(`${row.code} ${row.name} ${row.deposit}`).includes(query)).sort((left, right) => {
      const a = left[sort] ?? ''; const b = right[sort] ?? '';
      return typeof a === 'number' && typeof b === 'number' ? (a - b) * direction : String(a).localeCompare(String(b), 'es-AR', { numeric: true }) * direction;
    });
  }, [rows, search, sort, ascending]);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unbalanced = rows.some(row => !row.reconciled);
  const indicators = useMemo(() => {
    const unique = (predicate: (row: HistoricalRow) => boolean) => new Set(rows.filter(predicate).map(row => row.itemId)).size;
    return { entries: unique(row => (row.entries || 0) > 0), exits: unique(row => (row.exits || 0) > 0), negative: unique(row => (row.net || 0) < 0) };
  }, [rows]);

  function invalidateResults() {
    requestId.current += 1; setLoading(false); setLastQuery(null); setActivity([]); setStockAtDate([]); setError(''); setSelectionError(''); setPage(1);
    onQueryChange();
  }

  function validate() {
    if (mode === 'period') {
      if (!from || !to) return 'Completá las fechas desde y hasta.';
      if (from > to) return 'La fecha desde no puede ser posterior a la fecha hasta.';
      if (to > today) return 'No se permiten fechas futuras.';
    } else {
      if (!cutoff) return 'Completá la fecha de corte.';
      if (cutoff > today) return 'No se permiten fechas futuras.';
    }
    return '';
  }

  async function consult() {
    const message = validate(); if (message) { setValidation(message); return; }
    const currentRequest = requestId.current + 1; requestId.current = currentRequest;
    setLoading(true); setError(''); setValidation(''); setSelectionError(''); setSort('code'); setAscending(true); setPage(1);
    try {
      const depositoId = deposit ? Number(deposit) : undefined;
      if (mode === 'period') {
        const result = await inventoryHistoryApi.activity({ clase: inventoryClass, desde: from, hasta: to, depositoId, consolidarDepositos: !deposit });
        if (requestId.current !== currentRequest) return;
        setActivity(result); setStockAtDate([]); setLastQuery({ mode, from, to, deposit });
      } else {
        const result = await inventoryHistoryApi.stockAtDate({ clase: inventoryClass, fecha: cutoff, depositoId, consolidarDepositos: !deposit });
        if (requestId.current !== currentRequest) return;
        setStockAtDate(result); setActivity([]); setLastQuery({ mode, cutoff, deposit });
      }
    } catch (queryError) { if (requestId.current === currentRequest) setError(errorMessage(queryError)); }
    finally { if (requestId.current === currentRequest) setLoading(false); }
  }

  function sortHeader(label: string, key: SortKey) {
    const active = sort === key;
    return <button type="button" className="product-sort" onClick={() => { if (active) setAscending(value => !value); else { setSort(key); setAscending(true); } setPage(1); }}>{label}{active ? (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>) : null}</button>;
  }

  function openRow(row: HistoricalRow) {
    if (!lastQuery?.from || !lastQuery.to) return;
    const source = activity.find(item => item.articuloId === row.itemId && item.depositoId === row.depositId);
    if (source && !onOpenArticle({ itemId: row.itemId, depositId: row.depositId, from: lastQuery.from, to: lastQuery.to, activity: source }))
      setSelectionError('El artículo histórico no tiene una fila de stock actual disponible para abrir el panel de detalle.');
  }

  const columns: DataTableColumn<HistoricalRow>[] = lastQuery?.mode === 'cutoff' ? [
    { key: 'code', header: sortHeader('Código', 'code'), render: row => <strong>{row.code}</strong> },
    { key: 'name', header: sortHeader('Artículo', 'name'), render: row => <strong>{row.name}</strong> },
    { key: 'deposit', header: sortHeader('Depósito', 'deposit'), render: row => row.deposit },
    { key: 'unit', header: 'Unidad', render: row => row.unit },
    { key: 'date', header: 'Fecha de corte', render: () => formatDate(lastQuery.cutoff!) },
    { key: 'final', header: sortHeader('Saldo histórico', 'final'), className: 'stock-number historical-final', headerClassName: 'stock-number', render: row => number.format(row.final) },
  ] : [
    { key: 'code', header: sortHeader('Código', 'code'), render: row => <strong>{row.code}</strong> },
    { key: 'name', header: sortHeader('Artículo', 'name'), render: row => <strong>{row.name}</strong> },
    { key: 'deposit', header: sortHeader('Depósito', 'deposit'), render: row => row.deposit },
    { key: 'unit', header: 'Unidad', render: row => row.unit },
    { key: 'initial', header: sortHeader('Inicial', 'initial'), className: 'stock-number', headerClassName: 'stock-number', render: row => number.format(row.initial || 0) },
    { key: 'entries', header: sortHeader('Entradas', 'entries'), className: 'stock-number positive', headerClassName: 'stock-number', render: row => number.format(row.entries || 0) },
    { key: 'exits', header: sortHeader('Salidas', 'exits'), className: 'stock-number negative', headerClassName: 'stock-number', render: row => number.format(row.exits || 0) },
    { key: 'net', header: sortHeader('Variación', 'net'), className: 'stock-number', headerClassName: 'stock-number', render: row => signed(row.net || 0) },
    { key: 'final', header: sortHeader('Final', 'final'), className: 'stock-number historical-final', headerClassName: 'stock-number', render: row => number.format(row.final) },
    { key: 'movements', header: sortHeader('Mov.', 'movements'), className: 'stock-number', headerClassName: 'stock-number', render: row => row.movements },
    { key: 'trend', header: sortHeader('Tendencia', 'trend'), render: row => <Trend value={row.trend || 'ESTABLE'}/> },
    { key: 'action', header: '', render: row => <button type="button" className="row-action compact product-row-arrow" aria-label={`Ver evolución de ${row.name}`} onClick={event => { event.stopPropagation(); openRow(row); }}><ChevronRight size={17}/></button> },
  ];

  const reportRows: HistoricalReportRow[] = filtered.map(row => ({ code: row.code, name: row.name, deposit: row.deposit, unit: row.unit,
    dateLabel: lastQuery?.mode === 'period' ? `${formatDate(lastQuery.from!)} al ${formatDate(lastQuery.to!)}` : formatDate(lastQuery?.cutoff || ''),
    initial: row.initial, entries: row.entries, exits: row.exits, net: row.net, final: row.final, movements: row.movements, trend: row.trend }));
  const filterDescription = lastQuery ? `${lastQuery.deposit ? deposits.find(item => String(item.id) === lastQuery.deposit)?.descripcion : 'Todos los depósitos · consolidado'}; ${lastQuery.mode === 'period' ? `${formatDate(lastQuery.from!)} al ${formatDate(lastQuery.to!)}` : `corte ${formatDate(lastQuery.cutoff!)}`}; búsqueda: ${search || 'sin búsqueda'}` : '';

  return <section className="stock-history-workspace" aria-labelledby="stock-history-title">
    <div className="stock-history-query-preview">
      <div className="stock-history-mode" role="tablist" aria-label="Modalidad histórica">
        <button type="button" role="tab" aria-selected={mode === 'period'} className={mode === 'period' ? 'active' : ''} onClick={() => { setMode('period'); setValidation(''); invalidateResults(); }}><CalendarRange size={15}/> Análisis por período</button>
        <button type="button" role="tab" aria-selected={mode === 'cutoff'} className={mode === 'cutoff' ? 'active' : ''} onClick={() => { setMode('cutoff'); setValidation(''); invalidateResults(); }}><Clock3 size={15}/> Stock a una fecha</button>
      </div>
      <div className="stock-history-fields">
        {mode === 'period' ? <><label><span>Fecha desde</span><input type="date" max={today} value={from} onChange={event => { setFrom(event.target.value); setValidation(''); invalidateResults(); }}/></label><label><span>Fecha hasta</span><input type="date" max={today} value={to} onChange={event => { setTo(event.target.value); setValidation(''); invalidateResults(); }}/></label></> : <label><span>Fecha de corte</span><input type="date" max={today} value={cutoff} onChange={event => { setCutoff(event.target.value); setValidation(''); invalidateResults(); }}/></label>}
        <label><span>Depósito</span><select value={deposit} onChange={event => { setDeposit(event.target.value); invalidateResults(); }}><option value="">Todos · consolidado</option>{deposits.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
        <button type="button" className="button primary" disabled={loading} onClick={() => void consult()}>{loading ? 'Consultando…' : 'Consultar'}</button>
      </div>
    </div>
    {validation && <div className="form-alert stock-history-validation" role="alert"><Ban size={16}/><span>{validation}</span></div>}
    {error && <div className="inline-alert error stock-history-error" role="alert"><Ban size={17}/><span>{error}</span><button type="button" className="button secondary compact" onClick={() => void consult()}>Reintentar</button><button type="button" onClick={() => setError('')} aria-label="Cerrar"><X size={15}/></button></div>}
    {selectionError && <div className="inline-alert error stock-history-error" role="alert"><Ban size={17}/><span>{selectionError}</span><button type="button" onClick={() => setSelectionError('')} aria-label="Cerrar"><X size={15}/></button></div>}
    {lastQuery && <>
      <div className="stock-history-toolbar"><label className="data-table-search"><Search size={16}/><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por código, artículo o depósito"/></label><div className="report-actions">{canExport && <button type="button" className="button secondary" disabled={!filtered.length} onClick={() => inventoryHistoryExcel(reportRows, lastQuery.mode, lastQuery.mode === 'period' ? 'Actividad histórica' : 'Stock histórico a una fecha', filterDescription, unbalanced)}><Download size={15}/> Excel</button>}{canExport && <button type="button" className="button primary" disabled={!filtered.length} onClick={() => inventoryHistoryPdf(reportRows, lastQuery.mode, lastQuery.mode === 'period' ? 'Actividad histórica' : 'Stock histórico a una fecha', filterDescription, unbalanced)}><FileText size={15}/> PDF</button>}</div></div>
      {lastQuery.mode === 'period' && <div className="stock-activity-indicators"><Indicator label="Con entradas" value={indicators.entries}/><Indicator label="Con salidas" value={indicators.exits}/><Indicator label="Variación negativa" value={indicators.negative}/></div>}
      <DataTable rows={visible} columns={columns} rowKey={row => row.key} loading={loading} loadingText="Consultando historial…" page={page} pageSize={PAGE_SIZE} totalRecords={filtered.length} onPageChange={setPage} onRowClick={lastQuery.mode === 'period' ? openRow : undefined} tableClassName={`stock-history-table ${lastQuery.mode}`}
        summary={<><strong>{filtered.length}</strong> artículos · {lastQuery.mode === 'period' ? `Período ${formatDate(lastQuery.from!)} al ${formatDate(lastQuery.to!)}` : `Saldo al ${formatDate(lastQuery.cutoff!)}`}</>}
        emptyState={<div className="state-box"><PackageOpen size={27}/><strong>Sin resultados históricos</strong><span>La API no devolvió registros para los filtros seleccionados.</span></div>}/>
    </>}
    {!lastQuery && !loading && <div className="stock-history-start"><CalendarRange size={24}/><strong>Elegí una modalidad y consultá el historial</strong><span>Los resultados se obtendrán directamente de las consultas históricas de la API.</span></div>}
  </section>;
}

function Trend({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRECIENTE') return <span className="stock-trend positive"><TrendingUp size={14}/> Creciente</span>;
  if (normalized === 'DECRECIENTE') return <span className="stock-trend negative"><TrendingDown size={14}/> Decreciente</span>;
  return <span className="stock-trend stable"><Minus size={14}/> Estable</span>;
}
function Indicator({ label, value }: { label: string; value: number }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
