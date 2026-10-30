import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { DataTableFilters } from '../../../components/data/DataTableFilters';
import { StatusBadge } from '../../../components/data/StatusBadge';
import type { Recorte } from '../../../services/recortesApi';
import { useRecortesCatalog } from '../hooks/useRecortesCatalog';
import { recorteCodigo, recorteDate, recorteMedidas, recorteNumber } from '../utils/recortePresentation';
import '../styles/recortes.css';

const pageSize = 10;
const initial = new URLSearchParams(location.search);
export function RecortesInventoryPage() {
  const catalog = useRecortesCatalog();
  const [search, setSearch] = useState(initial.get('q') ?? '');
  const [state, setState] = useState(initial.get('estado') ?? '');
  const [deposit, setDeposit] = useState(initial.get('deposito') ?? '');
  const [sort, setSort] = useState<'alta' | 'id' | 'insumo'>(
    initial.get('orden') === 'id' || initial.get('orden') === 'insumo' ? initial.get('orden') as 'id' | 'insumo' : 'alta');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (state) query.set('estado', state);
    if (deposit) query.set('deposito', deposit);
    if (sort !== 'alta') query.set('orden', sort);
    history.replaceState(null, '', `${location.pathname}${query.size ? `?${query}` : ''}`);
    setPage(1);
  }, [search, state, deposit, sort]);
  const returnQuery = location.search;
  const stockByCut = useMemo(() => {
    const grouped = new Map<number, { quantity: number; deposits: string[] }>();
    catalog.stock.forEach(row => {
      const current = grouped.get(row.recorteId) ?? { quantity: 0, deposits: [] };
      current.quantity += row.cantidadActual;
      if (!current.deposits.includes(row.depositoNombre)) current.deposits.push(row.depositoNombre);
      grouped.set(row.recorteId, current);
    });
    return grouped;
  }, [catalog.stock]);
  const filtered = useMemo(() => catalog.recortes.filter(row => {
    const text = `${row.recorteId} ${row.insumoCodigo} ${row.insumoNombre} ${row.colorNombre ?? ''}`.toLocaleLowerCase('es-AR');
    return text.includes(search.trim().toLocaleLowerCase('es-AR')) &&
      (!state || row.estadoRecorteId === Number(state)) &&
      (!deposit || catalog.stock.some(item => item.recorteId === row.recorteId && item.depositoId === Number(deposit)));
  }).sort((a, b) => sort === 'insumo' ? a.insumoNombre.localeCompare(b.insumoNombre, 'es-AR') :
    sort === 'id' ? b.recorteId - a.recorteId : b.fechaAlta.localeCompare(a.fechaAlta)),
  [catalog.recortes, catalog.stock, search, state, deposit, sort]);
  const columns: DataTableColumn<Recorte>[] = [
    { key: 'id', header: 'Recorte', render: row => <strong>{recorteCodigo(row.recorteId)}</strong> },
    { key: 'supply', header: 'Material', render: row => <span>{row.insumoCodigo} · {row.insumoNombre}<small className="gir-secondary">{row.colorNombre ?? 'Color sin identificar'}</small></span> },
    { key: 'dimensions', header: 'Medidas', render: recorteMedidas },
    { key: 'stock', header: 'Disponible', render: row => `${recorteNumber.format(stockByCut.get(row.recorteId)?.quantity ?? 0)} ${row.unidadMedidaAbreviatura}` },
    { key: 'deposit', header: 'Depósito', render: row => stockByCut.get(row.recorteId)?.deposits.join(', ') || '—' },
    { key: 'state', header: 'Estado', render: row => <StatusBadge tone={row.estadoRecorteNombre === 'Disponible' ? 'success' : 'warning'}>{row.estadoRecorteNombre}</StatusBadge> },
    { key: 'date', header: 'Alta', render: row => recorteDate(row.fechaAlta) },
  ];
  return <AppShell title="Inventario de recortes" breadcrumb="Recortes / GIR / Inventario de recortes">
    <main className="gir-page">
      <PageHeader title="Inventario de recortes"/>
      {catalog.error ? <div className="gir-error" role="alert">{catalog.error}<button className="button secondary" onClick={() => void catalog.load()}><RotateCcw size={16}/>Reintentar</button></div> : <>
        <DataTableFilters balanced className="gir-inventory-filters" search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por código, material o recorte" onClear={() => { setSearch(''); setState(''); setDeposit(''); setSort('alta'); }} clearDisabled={!search && !state && !deposit && sort === 'alta'}>
          <label className="data-table-filter-field"><span>Estado</span><select value={state} onChange={event => setState(event.target.value)}><option value="">Todos</option>{catalog.states.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
          <label className="data-table-filter-field"><span>Depósito</span><select value={deposit} onChange={event => setDeposit(event.target.value)}><option value="">Todos</option>{catalog.deposits.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
          <label className="data-table-filter-field"><span>Orden</span><select value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="alta">Alta reciente</option><option value="id">Identificador</option><option value="insumo">Material</option></select></label>
        </DataTableFilters>
        <DataTable rows={filtered.slice((page - 1) * pageSize, page * pageSize)} columns={columns} rowKey={row => row.recorteId} onRowClick={row => { window.location.assign(`/recortes/inventario/${row.recorteId}${returnQuery}`); }} loading={catalog.loading} page={page} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} emptyState={<div className="state-box">{search || state || deposit ? 'No hay recortes para estos filtros.' : 'Todavía no hay recortes registrados.'}</div>}/>
      </>}
    </main>
  </AppShell>;
}
