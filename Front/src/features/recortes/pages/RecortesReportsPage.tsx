import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { DataTableFilters } from '../../../components/data/DataTableFilters';
import { Modal } from '../../../components/data/Modal';
import { apiErrorMessage } from '../../../services/apiClient';
import { inventoryAnalyticsExcel, inventoryAnalyticsPdf, type ManagementReport, type ReportColumn, type ReportRecord } from '../../../services/inventoryAnalyticsReports';
import { recortesApi } from '../../../services/recortesApi';
import { recortesReportsApi } from '../../../services/recortesReportsApi';
import { recortesInteligentesApi } from '../../../services/recortesInteligentesApi';
import { recorteMedidas, recorteNumber } from '../utils/recortePresentation';
import '../../inventory/styles/reports.css';
import '../styles/recortes.css';

type Kind = 'stock' | 'movements' | 'consumed' | 'recovered' | 'proposals';
type Row = { key: string; fecha: string; referencia: string; descripcion: string;
  cantidad: number | null; unidad: string; estado: string; deposito: string; medidas: string };
const labels: Record<Kind, string> = {
  stock: 'Existencias actuales', movements: 'Movimientos', consumed: 'Recortes consumidos',
  recovered: 'Recortes recuperados', proposals: 'Propuestas inteligentes',
};
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const firstDay = `${today.slice(0, 7)}-01`;
const pageSize = 10;
export function RecortesReportsPage() {
  const [kind, setKind] = useState<Kind>('stock');
  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const load = useCallback(async () => {
    if (kind !== 'stock' && from > to) { setError('La fecha Desde no puede ser posterior a Hasta.'); return; }
    setLoading(true); setError(''); setLimitReached(false);
    try {
      let data: Row[] = [];
      if (kind === 'stock') {
        const stock = await recortesApi.stock();
        data = stock.map(row => ({ key: String(row.stockRecorteId), fecha: '',
          referencia: `Recorte #${row.recorteId}`, descripcion: `${row.insumoCodigo} · ${row.insumoNombre}`,
          cantidad: row.cantidadActual, unidad: row.unidadMedidaAbreviatura,
          estado: row.estadoRecorteNombre, deposito: row.depositoNombre, medidas: recorteMedidas(row) }));
      } else if (kind === 'movements') {
        const movements = await recortesApi.movements();
        data = movements.filter(row => row.fechaMovimiento.slice(0, 10) >= from && row.fechaMovimiento.slice(0, 10) <= to)
          .map(row => ({ key: String(row.movimientoRecorteId), fecha: row.fechaMovimiento,
            referencia: `Recorte #${row.recorteId}`, descripcion: row.insumoNombre || `Insumo #${row.insumoId ?? '—'}`,
            cantidad: row.cantidad, unidad: row.unidadMedidaAbreviatura ?? '',
            estado: row.tipoMovimiento, deposito: row.depositoNombre, medidas: '' }));
      } else if (kind === 'proposals') {
        const proposals = await recortesInteligentesApi.todasPropuestas();
        setLimitReached(proposals.truncated);
        data = proposals.items.filter(row => row.FechaCreacion.slice(0, 10) >= from && row.FechaCreacion.slice(0, 10) <= to)
          .map(row => ({ key: String(row.RecorteDisenoId), fecha: row.FechaCreacion,
            referencia: `Diseño #${row.RecorteDisenoId}`, descripcion: row.Nombre,
            cantidad: null, unidad: '', estado: row.EstadoRevision, deposito: '', medidas: `v${row.VersionNumero}` }));
      } else {
        const production = kind === 'consumed' ? await recortesReportsApi.consumed(from, to) : await recortesReportsApi.recovered(from, to);
        data = production.map((row, index) => ({ key: `${row.ordenProduccionId}-${row.recorteId}-${index}`,
          fecha: row.fecha, referencia: `OP #${row.ordenProduccionId} · Recorte #${row.recorteId}`,
          descripcion: `${row.insumoCodigo} · ${row.insumoNombre}`, cantidad: row.cantidad,
          unidad: row.unidad, estado: kind === 'consumed' ? 'Consumido' : 'Recuperado',
          deposito: row.depositoNombre, medidas: row.dimension == null ? '' : recorteNumber.format(row.dimension) }));
      }
      setRows(data); setPage(1);
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo consultar el reporte.')); setRows([]); }
    finally { setLoading(false); }
  }, [kind, from, to]);
  useEffect(() => { void load(); }, [load]);
  const states = useMemo(() => [...new Set(rows.map(row => row.estado).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter(row =>
    (!stateFilter || row.estado === stateFilter) &&
    `${row.referencia} ${row.descripcion} ${row.estado} ${row.deposito}`.toLocaleLowerCase('es-AR').includes(search.toLocaleLowerCase('es-AR'))), [rows, search, stateFilter]);
  const stateCounts = useMemo(() => [...new Map(states.map(state =>
    [state, filtered.filter(row => row.estado === state).length] as const))].filter(([, count]) => count > 0), [states, filtered]);
  const materialCounts = useMemo(() => kind === 'stock' ? [...filtered.reduce((counts, row) =>
    counts.set(row.descripcion, (counts.get(row.descripcion) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]).slice(0, 5) : [], [kind, filtered]);
  useEffect(() => setPage(1), [search, stateFilter, kind]);
  const columns: DataTableColumn<Row>[] = [
    { key: 'reference', header: 'Referencia', render: row => <strong>{row.referencia}</strong> },
    { key: 'date', header: 'Fecha', render: row => row.fecha ? new Date(row.fecha).toLocaleString('es-AR') : 'Stock actual' },
    { key: 'description', header: 'Descripción', render: row => row.descripcion },
    { key: 'quantity', header: 'Cantidad', render: row => row.cantidad == null ? '—' : `${recorteNumber.format(row.cantidad)} ${row.unidad}` },
    { key: 'state', header: 'Estado / tipo', render: row => row.estado },
    { key: 'deposit', header: 'Depósito', render: row => row.deposito || '—' },
  ];
  function exportReport(format: 'pdf' | 'excel') {
    if (loading || error || !filtered.length || limitReached) return;
    const reportColumns: ReportColumn[] = [
      { key: 'referencia', header: 'Referencia' }, { key: 'fecha', header: 'Fecha' },
      { key: 'descripcion', header: 'Descripción', width: 35 }, { key: 'cantidad', header: 'Cantidad' },
      { key: 'unidad', header: 'Unidad' }, { key: 'estado', header: 'Estado / tipo' },
      { key: 'deposito', header: 'Depósito' }, { key: 'medidas', header: 'Medidas / versión' },
    ];
    const records: ReportRecord[] = filtered.map(row => ({ ...row,
      fecha: row.fecha ? new Date(row.fecha).toLocaleString('es-AR') : 'Stock actual' }));
    const period = kind === 'stock' ? 'Existencias al momento de consulta' : `${from} a ${to}`;
    const management: ManagementReport = {
      objective: `Consultar ${labels[kind].toLocaleLowerCase('es-AR')} con datos registrados en TEKA Manager.`,
      period, executiveSummary: `${filtered.length} registros para los filtros aplicados.`,
      interpretations: ['Las cantidades conservan su unidad original.'],
      limitations: kind === 'stock' ? ['El stock muestra la situación actual y no un saldo histórico.'] : [],
      moduleLabel: 'Recortes / GIR', sourceLabel: 'API de Recortes y reportes de Producción de TEKA Manager.',
    };
    const exporter = format === 'pdf' ? inventoryAnalyticsPdf : inventoryAnalyticsExcel;
    exporter(`Recortes - ${labels[kind]}`, `Período: ${period}; búsqueda: ${search || 'sin filtro'}; estado: ${stateFilter || 'todos'}`, reportColumns, records, undefined, [], management);
    setExportOpen(false);
  }
  return <AppShell title="Reportes de recortes" breadcrumb="Recortes / GIR / Reportes">
    <main className="gir-page inventory-reports-page"><PageHeader title="Reportes de recortes" action={<button className="button primary" disabled={loading || !!error || !filtered.length || limitReached} onClick={() => setExportOpen(true)}><FileText size={17}/> Generar informe</button>}/>
      <DataTableFilters className="gir-report-filters" search={search} onSearchChange={setSearch} searchPlaceholder="Filtrar resultados" onClear={() => { setSearch(''); setStateFilter(''); setFrom(firstDay); setTo(today); setKind('stock'); }} clearDisabled={!search && !stateFilter && from === firstDay && to === today && kind === 'stock'}>
        <label className="data-table-filter-field"><span>Reporte</span><select value={kind} onChange={event => { setStateFilter(''); setKind(event.target.value as Kind); }}>{(Object.keys(labels) as Kind[]).map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
        <label className="data-table-filter-field"><span>Desde</span><input type="date" disabled={kind === 'stock'} value={from} onChange={event => setFrom(event.target.value)}/></label>
        <label className="data-table-filter-field"><span>Hasta</span><input type="date" disabled={kind === 'stock'} min={from} value={to} onChange={event => setTo(event.target.value)}/></label>
        <label className="data-table-filter-field"><span>Estado / tipo</span><select value={stateFilter} onChange={event => setStateFilter(event.target.value)}><option value="">Todos</option>{states.map(value => <option key={value}>{value}</option>)}</select></label>
      </DataTableFilters>
      <p className="gir-secondary">{kind === 'stock' ? 'Existencias actuales, sin filtro histórico.' : `Período consultado: ${from} a ${to}.`}</p>
      {error && <div className="gir-error" role="alert">{error}<button className="button secondary" onClick={() => void load()}>Reintentar</button></div>}
      {limitReached && <div className="gir-notice">La consulta alcanzó el límite de carga. Para evitar un informe incompleto, la exportación está deshabilitada.</div>}
      {!loading && !error && !limitReached && <div className="gir-report-summary" aria-label="Resumen del reporte"><div><strong>{filtered.length}</strong><span>{kind === 'stock' ? 'Saldos por depósito' : 'Registros filtrados'}</span></div><div><strong>{stateCounts.length}</strong><span>Estados o tipos presentes</span></div></div>}
      {stateCounts.length > 0 && !limitReached && <div className="gir-report-charts"><section className="gir-report-chart" aria-label="Distribución por estado"><h2>{kind === 'proposals' ? 'Propuestas por estado' : 'Registros por estado o tipo'}</h2><small>Cantidad de registros · {kind === 'stock' ? 'stock actual' : `${from} a ${to}`}</small>{stateCounts.map(([state, count]) => <div className="gir-report-bar" key={state}><span>{state}</span><div><i style={{ width: `${count / filtered.length * 100}%` }}/></div><strong>{count}</strong></div>)}</section>{materialCounts.length > 0 && <section className="gir-report-chart" aria-label="Recortes por material"><h2>Registros de stock por material</h2><small>Cantidad de saldos por depósito, no superficie</small>{materialCounts.map(([material, count]) => <div className="gir-report-bar" key={material}><span title={material}>{material}</span><div><i style={{ width: `${count / filtered.length * 100}%` }}/></div><strong>{count}</strong></div>)}</section>}</div>}
      <DataTable rows={filtered.slice((page - 1) * pageSize, page * pageSize)} columns={columns} rowKey={row => row.key} page={page} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} loading={loading} emptyState={<div className="state-box">No hay datos para los filtros aplicados.</div>}/>
      {exportOpen && <Modal title="Generar informe de recortes" onClose={() => setExportOpen(false)}><div className="gir-dialog"><p>{labels[kind]} · {kind === 'stock' ? 'existencias actuales' : `${from} a ${to}`} · {filtered.length} registros filtrados.</p><div className="gir-actions"><button className="button secondary" onClick={() => exportReport('pdf')}><FileText size={16}/>PDF</button><button className="button secondary" onClick={() => exportReport('excel')}><FileSpreadsheet size={16}/>Excel</button></div></div></Modal>}
    </main>
  </AppShell>;
}
