import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { StatusBadge } from '../../components/data/StatusBadge';
import { Modal } from '../../components/data/Modal';
import { Toast } from '../../components/ui/Toast';
import { hasPermission } from '../../services/authorization';
import { apiErrorMessage } from '../../services/apiClient';
import { salesCustomersApi, type AddressType } from '../../services/salesCustomersApi';
import '../sales/salesCustomers.css';

export function AddressTypesPage() {
  const [items, setItems] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AddressType | null | undefined>();
  const [changing, setChanging] = useState<AddressType | null>(null);
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const canCreate = hasPermission('Ventas', 'Crear');
  const canEdit = hasPermission('Ventas', 'Editar');
  const canInactivate = hasPermission('Ventas', 'Inactivar');

  useEffect(() => {
    let active = true; setLoading(true);
    void salesCustomersApi.addressTypes().then(rows => { if (active) { setItems(rows); setError(''); } })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar los tipos de domicilio.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const rows = items.filter(item => (!status || item.activo === (status === 'activo')) && item.nombre.toLocaleLowerCase('es-AR').includes(search.trim().toLocaleLowerCase('es-AR')));
  const safePage = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)));
  const open = (item: AddressType | null) => { setEditing(item); setName(item?.nombre || ''); setFieldError(''); setActionError(''); };

  async function submit(event: FormEvent) {
    event.preventDefault(); if (guard.current) return;
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean || clean.length > 30) { setFieldError('Ingresá un nombre de hasta 30 caracteres.'); return; }
    guard.current = true; setBusy(true); setActionError('');
    try {
      if (editing) await salesCustomersApi.updateAddressType(editing.tipoDomicilioId, clean);
      else await salesCustomersApi.createAddressType(clean);
      setEditing(undefined); setNotice(editing ? 'Tipo de domicilio actualizado.' : 'Tipo de domicilio registrado.'); setRetry(value => value + 1);
    } catch (cause) { setActionError(apiErrorMessage(cause, 'No se pudo guardar el tipo de domicilio.')); }
    finally { guard.current = false; setBusy(false); }
  }
  async function changeState() {
    if (!changing || guard.current) return;
    guard.current = true; setBusy(true); setActionError('');
    try {
      if (changing.activo) await salesCustomersApi.inactivateAddressType(changing.tipoDomicilioId);
      else await salesCustomersApi.activateAddressType(changing.tipoDomicilioId);
      setNotice(changing.activo ? 'Tipo de domicilio inactivado.' : 'Tipo de domicilio reactivado.');
      setChanging(null); setRetry(value => value + 1);
    } catch (cause) { setActionError(apiErrorMessage(cause, 'No se pudo cambiar el estado del tipo de domicilio.')); }
    finally { guard.current = false; setBusy(false); }
  }
  const columns: DataTableColumn<AddressType>[] = [
    { key: 'nombre', header: 'Tipo de domicilio', width: '55%', render: item => <strong>{item.nombre}</strong> },
    { key: 'estado', header: 'Estado', width: '15%', render: item => <StatusBadge tone={item.activo ? 'success' : 'neutral'}>{item.activo ? 'Activo' : 'Inactivo'}</StatusBadge> },
    { key: 'acciones', header: 'Acciones', width: '30%', render: item => <div className="customer-type-actions">{canEdit && <button type="button" className="button secondary" onClick={() => open(item)}>Editar</button>}{(item.activo ? canInactivate : canEdit) && <button type="button" className="button secondary" onClick={() => { setChanging(item); setActionError(''); }}>{item.activo ? 'Inactivar' : 'Reactivar'}</button>}</div> },
  ];
  return <AppShell title="Tipos de domicilio" breadcrumb="Administración / Configuración / Ventas / Tipos de domicilio"><div className="customer-list-page">
    <Toast message={notice} onClose={() => setNotice('')}/>
    <PageHeader title="Tipos de domicilio" action={<div className="customer-type-actions"><a href="/configuracion/ventas" className="button secondary">Volver a Ventas</a>{canCreate && <button type="button" className="button primary" onClick={() => open(null)}><Plus size={16}/> Registrar tipo</button>}</div>}/>
    {error && <div className="product-form-alert" role="alert">{error} <button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div>}
    <DataTableFilters search={search} searchPlaceholder="Buscar tipo de domicilio" onSearchChange={value => { setSearch(value); setPage(1); }} onClear={() => { setSearch(''); setStatus(''); setPage(1); }}><label className="data-table-filter-field"><span>Estado</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label></DataTableFilters>
    <DataTable rows={rows.slice((safePage - 1) * 10, safePage * 10)} columns={columns} rowKey={item => item.tipoDomicilioId} loading={loading} page={safePage} pageSize={10} totalRecords={rows.length} onPageChange={setPage} emptyState={<div className="state-box">{search || status ? 'No hay tipos para estos filtros.' : 'Todavía no hay tipos de domicilio configurados.'}</div>}/>
    {editing !== undefined && <Modal title={editing ? 'Editar tipo de domicilio' : 'Registrar tipo de domicilio'} onClose={() => !busy && setEditing(undefined)}><form className="sales-address-form" onSubmit={event => void submit(event)}>{actionError && <div className="sales-customers-error" role="alert">{actionError}</div>}<div className="sales-customers-form-grid"><label>Nombre *<input maxLength={30} value={name} aria-invalid={Boolean(fieldError)} onChange={event => { setName(event.target.value); setFieldError(''); }}/>{fieldError && <small className="field-error">{fieldError}</small>}</label></div><div className="sales-customers-actions"><button type="button" className="button secondary" disabled={busy} onClick={() => setEditing(undefined)}>Cancelar</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></div></form></Modal>}
    {changing && <Modal title={changing.activo ? 'Inactivar tipo de domicilio' : 'Reactivar tipo de domicilio'} onClose={() => !busy && setChanging(null)}><div className="customer-state-dialog"><p>{changing.activo ? 'El tipo dejará de estar disponible para nuevas direcciones. Los domicilios existentes conservarán su tipo.' : 'El tipo volverá a estar disponible para nuevas direcciones.'}</p><strong>{changing.nombre}</strong>{actionError && <div className="sales-customers-error" role="alert">{actionError}</div>}<div className="sales-customers-actions"><button type="button" className="button secondary" disabled={busy} onClick={() => setChanging(null)}>Cancelar</button><button type="button" className="button primary" disabled={busy} onClick={() => void changeState()}>{busy ? 'Guardando…' : changing.activo ? 'Inactivar' : 'Reactivar'}</button></div></div></Modal>}
  </div></AppShell>;
}
