import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/data/StatusBadge';
import { apiErrorMessage } from '../../../services/apiClient';
import { recortesApi, type MovimientoRecorte } from '../../../services/recortesApi';
import { recorteCodigo, recorteDate, recorteMovementTone, recorteNumber } from '../utils/recortePresentation';
import '../styles/recortes.css';

const pageSize = 10;
export function RecortesMovementsPage() {
  const [rows, setRows] = useState<MovimientoRecorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [kind, setKind] = useState('');
  const [page, setPage] = useState(1);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRows(await recortesApi.movements()); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron consultar los movimientos.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => setPage(1), [search, from, to, kind]);
  const kinds = useMemo(() => [...new Set(rows.map(row => row.tipoMovimiento))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter(row =>
    `${row.recorteId} ${row.insumoCodigo ?? ''} ${row.insumoNombre ?? ''}`.toLocaleLowerCase('es-AR').includes(search.toLocaleLowerCase('es-AR')) &&
    (!kind || row.tipoMovimiento === kind) &&
    (!from || row.fechaMovimiento.slice(0, 10) >= from) &&
    (!to || row.fechaMovimiento.slice(0, 10) <= to)), [rows, search, kind, from, to]);
  const columns: DataTableColumn<MovimientoRecorte>[] = [
    { key: 'date', header: 'Fecha', render: row => recorteDate(row.fechaMovimiento) },
    { key: 'cut', header: 'Recorte', render: row => recorteCodigo(row.recorteId) },
    { key: 'supply', header: 'Material', render: row => row.insumoNombre || `Insumo #${row.insumoId ?? '—'}` },
    { key: 'kind', header: 'Movimiento', render: row => <StatusBadge tone={recorteMovementTone(row.tipoMovimiento)}>{row.tipoMovimiento}</StatusBadge> },
    { key: 'quantity', header: 'Cantidad', render: row => `${recorteNumber.format(row.cantidad)} ${row.unidadMedidaAbreviatura ?? ''}` },
    { key: 'deposit', header: 'Depósito', render: row => row.depositoNombre },
    { key: 'notes', header: 'Observaciones', render: row => row.observaciones || '—' },
  ];
  return <AppShell title="Movimientos de recortes" breadcrumb="Recortes / GIR / Movimientos de recortes">
    <main className="gir-page"><PageHeader title="Movimientos de recortes"/>
      {error ? <div className="gir-error" role="alert">{error}<button className="button secondary" onClick={() => void load()}><RotateCcw size={16}/>Reintentar</button></div> : <>
        <section className="gir-movements-filters" aria-label="Filtros de movimientos de recortes">
          <label className="gir-movement-search"><span>Buscar recorte o material</span><div><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Código o nombre del material"/></div></label>
          <label><span>Desde</span><input type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)}/></label>
          <label><span>Hasta</span><input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)}/></label>
          <label><span>Tipo de movimiento</span><select value={kind} onChange={event => setKind(event.target.value)}><option value="">Todos</option>{kinds.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="button" className="button secondary gir-movement-clear" disabled={!search && !from && !to && !kind} onClick={() => { setSearch(''); setFrom(''); setTo(''); setKind(''); }}><RotateCcw size={15}/>Limpiar filtros</button>
        </section>
        <DataTable rows={filtered.slice((page - 1) * pageSize, page * pageSize)} columns={columns} rowKey={row => row.movimientoRecorteId} page={page} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} loading={loading} emptyState={<div className="state-box">No hay movimientos para estos filtros.</div>}/>
      </>}
    </main>
  </AppShell>;
}
