import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ, Pencil, Plus, Power, RotateCcw, UsersRound } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { salesCustomersApi } from '../../services/salesCustomersApi';
import type { SalesCustomer } from '../../services/salesOrdersApi';
import { CustomerStateDialog } from './CustomerStateDialog';
import '../inventory/styles/products.css';
import './salesCustomers.css';

type SortKey = 'name' | 'document' | 'phone' | 'email' | 'state';
const PAGE_SIZE = 8;
export const customerName = (customer: SalesCustomer) => `${customer.nombre} ${customer.apellido ?? ''}`.trim();

export function SalesCustomersPage() {
  const fromOrder = new URLSearchParams(location.search).get('volver') === 'pedido';
  const [customers, setCustomers] = useState<SalesCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortKey>('name');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [stateCustomer, setStateCustomer] = useState<SalesCustomer | null>(null);
  const canCreate = hasPermission('Ventas', 'Crear');
  const canEdit = hasPermission('Ventas', 'Editar');
  const canInactivate = hasPermission('Ventas', 'Inactivar');
  async function load() {
    setLoading(true); setError('');
    try { setCustomers(await salesCustomersApi.list()); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron consultar los clientes.')); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); const saved = sessionStorage.getItem('customer-notice'); if (saved) { setNotice(saved); sessionStorage.removeItem('customer-notice'); } }, []);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-AR');
    const rows = customers.filter(customer => {
      const match = `${customerName(customer)} ${customer.documento ?? ''} ${customer.telefono ?? ''} ${customer.email ?? ''}`.toLocaleLowerCase('es-AR').includes(query);
      return match && (!status || customer.activo === (status === 'active'));
    });
    rows.sort((a, b) => {
      const va = sort === 'name' ? customerName(a) : sort === 'document' ? a.documento ?? '' : sort === 'phone' ? a.telefono ?? '' : sort === 'email' ? a.email ?? '' : Number(a.activo);
      const vb = sort === 'name' ? customerName(b) : sort === 'document' ? b.documento ?? '' : sort === 'phone' ? b.telefono ?? '' : sort === 'email' ? b.email ?? '' : Number(b.activo);
      const comparison = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es-AR', { numeric: true });
      return (ascending ? comparison : -comparison) || a.clienteId - b.clienteId;
    });
    return rows;
  }, [customers, search, status, sort, ascending]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  function changeSort(key: SortKey) { if (sort === key) setAscending(value => !value); else { setSort(key); setAscending(true); } setPage(1); }
  function header(label: string, key: SortKey) { return <button type="button" className="finished-products-sort" onClick={() => changeSort(key)}>{label}{sort === key && (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>)}</button>; }
  const columns: DataTableColumn<SalesCustomer>[] = [
    { key: 'name', header: header('Cliente', 'name'), render: row => <strong>{customerName(row)}</strong> },
    { key: 'document', header: header('Documento', 'document'), render: row => row.documento ? `${row.tipoDocumentoNombre} ${row.documento}` : '—' },
    { key: 'phone', header: header('Teléfono', 'phone'), render: row => row.telefono || '—' },
    { key: 'email', header: header('Correo', 'email'), render: row => row.email || '—' },
    { key: 'state', header: header('Estado', 'state'), render: row => <StatusBadge tone={row.activo ? 'success' : 'danger'}>{row.activo ? 'Activo' : 'Inactivo'}</StatusBadge> },
    { key: 'action', width: '7rem', header: 'Acciones', className: 'customer-list-action-cell', headerClassName: 'customer-list-action-cell', render: row => <div className="finished-products-inline-actions" onClick={event => event.stopPropagation()}>{canEdit && <a href={`/ventas/clientes/${row.clienteId}/editar`} title={`Editar ${customerName(row)}`} aria-label={`Editar ${customerName(row)}`}><Pencil size={16}/></a>}{((row.activo && canInactivate) || (!row.activo && canEdit)) && <button type="button" title={row.activo ? 'Inactivar cliente' : 'Reactivar cliente'} aria-label={`${row.activo ? 'Inactivar' : 'Reactivar'} ${customerName(row)}`} onClick={() => setStateCustomer(row)}>{row.activo ? <Power size={17}/> : <RotateCcw size={17}/>}</button>}</div> },
  ];
  const hasFilters = Boolean(search.trim() || status);
  return <AppShell title="Clientes" breadcrumb="Ventas / Clientes"><div className="customer-list-page">
    <Toast message={notice} onClose={() => setNotice('')}/>
    <PageHeader title="Clientes" action={<div className="products-header-actions">{fromOrder && <a className="button secondary" href="/ventas/pedidos/nuevo">Volver al pedido</a>}{canCreate && <a className="button primary" href={fromOrder ? '/ventas/clientes/nuevo?volver=pedido' : '/ventas/clientes/nuevo'}><Plus size={17}/> Registrar cliente</a>}</div>}/>
    {error ? <div className="product-page-state error" role="alert"><strong>No pudimos cargar los clientes</strong><span>{error}</span><button type="button" className="button secondary" onClick={() => void load()}>Reintentar</button></div> : <><DataTableFilters balanced search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Buscar por nombre, documento o contacto" onClear={() => { setSearch(''); setStatus(''); setPage(1); }} clearDisabled={!hasFilters} clearLabel="Limpiar filtros" className="customer-list-filters"><label className="data-table-filter-field"><span>Estado</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label></DataTableFilters>
      <DataTable rows={visible} columns={columns} rowKey={row => row.clienteId} loading={loading} loadingText="Cargando clientes…" page={safePage} pageSize={PAGE_SIZE} totalRecords={filtered.length} onPageChange={setPage} onRowClick={row => { location.href = `/ventas/clientes/${row.clienteId}${fromOrder ? '?volver=pedido' : ''}`; }} className="finished-products-table-card" tableClassName="customer-list-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{filtered.length}</strong> clientes</>} emptyState={<div className="state-box finished-products-empty-state"><UsersRound size={28}/><strong>{hasFilters ? 'No hay resultados para estos filtros' : 'Todavía no hay clientes'}</strong><span>{hasFilters ? 'Cambiá la búsqueda o limpiá los filtros.' : 'Registrá el primer cliente para comenzar.'}</span>{!hasFilters && canCreate && <a className="button primary" href="/ventas/clientes/nuevo">Registrar cliente</a>}</div>}/></>}
    {stateCustomer && <CustomerStateDialog customer={stateCustomer} onClose={() => setStateCustomer(null)} onChanged={message => { setStateCustomer(null); setNotice(message); void load(); }}/>} 
  </div></AppShell>;
}
