import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DateRangeFilter } from '../../components/data/DateRangeFilter';
import { InventoryExportActions } from '../../components/data/InventoryExportActions';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { exportCommercialList, type ExportColumn, type ExportFormat } from '../../services/commercialListExport';
import { productionOrdersApi, type ProductionLookup, type ProductionOrder } from '../../services/productionOrdersApi';
import { productionOrderNumber, productionStatusTone, quantity } from './productionOrderUtils';
import './productionOrders.css';

type ReportMode = 'orders' | 'models' | 'materials' | 'cuts-used' | 'cuts-recovered';
type MaterialReport = { fechaConsumo: string; ordenProduccionId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; unidad: string; cantidadConsumida: number; depositoNombre: string };
type ModelReport = { fechaResultado: string; ordenProduccionId: number; productoId: number; productoCodigo: string; productoNombre: string; cantidadPlanificada: number; cantidadIngresada: number; diferencia: number; depositoNombre: string };
type CutReport = { fecha: string; ordenProduccionId: number; recorteId: number; insumoId: number; insumoCodigo: string; insumoNombre: string; dimension: number | null; unidad: string; cantidad: number; depositoNombre: string };
const params = new URLSearchParams(window.location.search);
const today = new Date(); const initialTo = today.toISOString().slice(0, 10); const initialFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10); const pageSize = 15;

export function ProductionReportsPage() {
  const [mode, setMode] = useState<ReportMode>((['orders','models','materials','cuts-used','cuts-recovered'].includes(params.get('mode')||'') ? params.get('mode') : 'orders') as ReportMode); const [from, setFrom] = useState(params.get('from') || initialFrom); const [to, setTo] = useState(params.get('to') || initialTo); const [status, setStatus] = useState('all'); const [type, setType] = useState(params.get('type') || 'all'); const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<ProductionOrder[]>([]); const [statuses, setStatuses] = useState<ProductionLookup[]>([]); const [types, setTypes] = useState<ProductionLookup[]>([]); const [advanced, setAdvanced] = useState<Array<MaterialReport | ModelReport | CutReport>>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [exporting, setExporting] = useState(false); const canExport = hasPermission('Producción', 'Exportar');

  useEffect(() => { let live = true; Promise.all([productionOrdersApi.list(), productionOrdersApi.statuses(), productionOrdersApi.types()]).then(([o, s, t]) => { if (live) { setOrders(o); setStatuses(s); setTypes(t); } }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudieron consultar los reportes.')); }).finally(() => { if (live) setLoading(false); }); return () => { live = false; }; }, []);
  useEffect(() => {
    if (mode === 'orders' || !from || !to || from > to) { setAdvanced([]); return; } let live = true; setLoading(true); setError('');
    const kind = mode === 'models' ? 'modelos' : mode === 'materials' ? 'consumos' : mode === 'cuts-used' ? 'recortes-consumidos' : 'recortes-recuperados';
    productionOrdersApi.report<MaterialReport | ModelReport | CutReport>(kind, from, to).then(rows => { if (live) setAdvanced(rows); }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudo generar el reporte seleccionado.')); }).finally(() => { if (live) setLoading(false); }); return () => { live = false; };
  }, [mode, from, to]);

  const typeById = useMemo(() => new Map(types.map(item => [item.id, item.descripcion])), [types]); const dateError = from > to ? 'La fecha Desde no puede ser posterior a Hasta.' : '';
  const orderRows = useMemo(() => dateError ? [] : orders.filter(order => { const date = order.fechaCreacion.slice(0, 10); return date >= from && date <= to && (status === 'all' || order.estadoOrdenProduccionId === Number(status)) && (type === 'all' || order.tipoProduccionId === Number(type)); }), [orders, from, to, status, type, dateError]);
  const rows = mode === 'orders' ? orderRows : advanced; const actualPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))); const visible = rows.slice((actualPage - 1) * pageSize, actualPage * pageSize);

  const orderColumns: DataTableColumn<ProductionOrder>[] = [
    { key: 'order', header: 'Orden', render: row => <a className="production-order-link" href={`/production/orders/${row.ordenProduccionId}`}>{productionOrderNumber(row.ordenProduccionId)}</a> }, { key: 'date', header: 'Creación', render: row => new Date(row.fechaCreacion).toLocaleDateString('es-AR') }, { key: 'type', header: 'Tipo', render: row => typeById.get(row.tipoProduccionId) || `Tipo ${row.tipoProduccionId}` }, { key: 'models', header: 'Modelos', render: row => row.cantidadModelos }, { key: 'units', header: 'Unidades planificadas', render: row => quantity.format(row.cantidadTotalPlanificada) }, { key: 'state', header: 'Estado', render: row => <StatusBadge tone={productionStatusTone(row.estadoOrdenProduccionNombre)}>{row.estadoOrdenProduccionNombre}</StatusBadge> },
  ];
  const modelColumns: DataTableColumn<ModelReport>[] = [
    { key: 'date', header: 'Finalización', render: row => new Date(row.fechaResultado).toLocaleDateString('es-AR') }, { key: 'order', header: 'Orden', render: row => <a className="production-order-link" href={`/production/orders/${row.ordenProduccionId}`}>{productionOrderNumber(row.ordenProduccionId)}</a> }, { key: 'model', header: 'Modelo', render: row => <div className="production-order-cell"><strong>{row.productoNombre}</strong><small>{row.productoCodigo}</small></div> }, { key: 'planned', header: 'Planificado', render: row => quantity.format(row.cantidadPlanificada) }, { key: 'actual', header: 'Real', render: row => quantity.format(row.cantidadIngresada) }, { key: 'difference', header: 'Diferencia', render: row => quantity.format(row.diferencia) },
  ];
  const materialColumns: DataTableColumn<MaterialReport>[] = [
    { key: 'date', header: 'Consumo', render: row => new Date(row.fechaConsumo).toLocaleDateString('es-AR') }, { key: 'order', header: 'Orden', render: row => productionOrderNumber(row.ordenProduccionId) }, { key: 'material', header: 'Material', render: row => <div className="production-order-cell"><strong>{row.insumoNombre}</strong><small>{row.insumoCodigo}</small></div> }, { key: 'quantity', header: 'Cantidad', render: row => `${quantity.format(row.cantidadConsumida)} ${row.unidad}` }, { key: 'deposit', header: 'Depósito', render: row => row.depositoNombre },
  ];
  const cutColumns: DataTableColumn<CutReport>[] = [
    { key: 'date', header: 'Fecha', render: row => new Date(row.fecha).toLocaleDateString('es-AR') }, { key: 'order', header: 'Orden', render: row => productionOrderNumber(row.ordenProduccionId) }, { key: 'cut', header: 'Recorte', render: row => `#${row.recorteId}` }, { key: 'material', header: 'Material', render: row => <div className="production-order-cell"><strong>{row.insumoNombre}</strong><small>{row.insumoCodigo}</small></div> }, { key: 'dimension', header: 'Dimensión', render: row => row.dimension == null ? '—' : `${quantity.format(row.dimension)} ${row.unidad}` }, { key: 'quantity', header: 'Cantidad', render: row => `${quantity.format(row.cantidad)} ${row.unidad}` }, { key: 'deposit', header: 'Depósito', render: row => row.depositoNombre },
  ];
  const columns = mode === 'orders' ? orderColumns : mode === 'models' ? modelColumns : mode === 'materials' ? materialColumns : cutColumns;

  async function exportReport(format: ExportFormat) {
    setExporting(true); try {
      let exportColumns: ExportColumn<any>[];
      if (mode === 'orders') exportColumns = [{ header: 'Orden', value: (row: ProductionOrder) => productionOrderNumber(row.ordenProduccionId) }, { header: 'Fecha', value: row => row.fechaCreacion }, { header: 'Modelos', value: row => row.cantidadModelos }, { header: 'Unidades planificadas', value: row => row.cantidadTotalPlanificada }, { header: 'Estado', value: row => row.estadoOrdenProduccionNombre }];
      else if (mode === 'models') exportColumns = [{ header: 'Fecha', value: (row: ModelReport) => row.fechaResultado }, { header: 'Orden', value: row => row.ordenProduccionId }, { header: 'Modelo', value: row => row.productoNombre }, { header: 'Planificado', value: row => row.cantidadPlanificada }, { header: 'Real', value: row => row.cantidadIngresada }, { header: 'Diferencia', value: row => row.diferencia }];
      else if (mode === 'materials') exportColumns = [{ header: 'Fecha', value: (row: MaterialReport) => row.fechaConsumo }, { header: 'Orden', value: row => row.ordenProduccionId }, { header: 'Material', value: row => row.insumoNombre }, { header: 'Cantidad', value: row => row.cantidadConsumida }, { header: 'Unidad', value: row => row.unidad }, { header: 'Depósito', value: row => row.depositoNombre }];
      else exportColumns = [{ header: 'Fecha', value: (row: CutReport) => row.fecha }, { header: 'Orden', value: row => row.ordenProduccionId }, { header: 'Recorte', value: row => row.recorteId }, { header: 'Material', value: row => row.insumoNombre }, { header: 'Dimensión', value: row => row.dimension }, { header: 'Cantidad', value: row => row.cantidad }, { header: 'Unidad', value: row => row.unidad }];
      await exportCommercialList(format, reportTitle(mode), `produccion-${mode}`, rows as any[], exportColumns, `${from} a ${to}`);
    } finally { setExporting(false); }
  }

  return <AppShell title="Reportes de producción" breadcrumb="Producción / Reportes"><main className="production-orders-page production-reports-page"><PageHeader kicker="PRODUCCIÓN" title="Detalle del reporte" action={<InventoryExportActions allowed={canExport} disabled={loading || Boolean(error) || rows.length === 0} exporting={exporting} onExcel={() => void exportReport('excel')} onPdf={() => void exportReport('pdf')}/>}/>
    <a className="production-order-link" href="/production/reports">← Volver al tablero</a>
    <div className="production-report-switch">{([['orders', 'Órdenes'], ['models', 'Producción por modelo'], ['materials', 'Consumo de materiales'], ['cuts-used', 'Recortes utilizados'], ['cuts-recovered', 'Recortes recuperados']] as const).map(([key, label]) => <button key={key} className={mode === key ? 'active' : ''} onClick={() => { setMode(key); setPage(1); }}>{label}</button>)}</div>
    <section className="production-report-filters"><DateRangeFilter from={from} to={to} fromLabel="Desde" toLabel="Hasta" onFromChange={value => { setFrom(value); setPage(1); }} onToChange={value => { setTo(value); setPage(1); }}/>{mode === 'orders' && <><label><span>Estado</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos</option>{statuses.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><label><span>Tipo</span><select value={type} onChange={event => setType(event.target.value)}><option value="all">Todos</option>{types.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label></>}</section>
    {dateError && <div className="production-message error"><AlertCircle size={18}/><span>{dateError}</span></div>}{error && <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div>}
    <h2 className="production-report-detail-heading">Detalle del reporte</h2>
    <section className="production-report-totals"><div><span>Reporte</span><strong>{reportTitle(mode)}</strong></div><div><span>Registros</span><strong>{rows.length}</strong></div><div><span>Período</span><strong>{new Date(`${from}T12:00:00`).toLocaleDateString('es-AR')} – {new Date(`${to}T12:00:00`).toLocaleDateString('es-AR')}</strong></div></section>
    <DataTable rows={visible as any[]} columns={columns as DataTableColumn<any>[]} rowKey={(row: any) => `${row.ordenProduccionId}-${row.productoId ?? row.insumoId ?? row.recorteId ?? row.fechaCreacion}`} loading={loading} page={actualPage} pageSize={pageSize} totalRecords={rows.length} onPageChange={setPage} emptyState={<div className="state-box"><strong>No hay resultados para el período.</strong><span>No se completan faltantes con valores simulados.</span></div>}/>
  </main></AppShell>;
}

function reportTitle(mode: ReportMode) { return ({ orders: 'Órdenes creadas', models: 'Producción por modelo y diferencias', materials: 'Consumo real de materiales', 'cuts-used': 'Utilización de recortes existentes', 'cuts-recovered': 'Recortes nuevos recuperados' } as const)[mode]; }
