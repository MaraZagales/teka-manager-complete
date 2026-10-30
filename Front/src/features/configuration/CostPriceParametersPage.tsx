import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { PageHeader } from '../../components/data/PageHeader';
import { Modal } from '../../components/data/Modal';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { costPriceParametersApi, type CostPriceParameter, type SaveCostPriceParameter } from '../../services/costPriceParametersApi';
import { productsApi, type Lookup } from '../../services/productsApi';
import './configuration.css';

const fields = [
  ['porcentajeManoObra', 'Mano de obra'], ['porcentajeCostosFijos', 'Costos fijos'],
  ['porcentajeOtrosVariables', 'Otros variables'], ['porcentajeMargen', 'Margen objetivo'],
] as const;
type Field = typeof fields[number][0];
const empty: Record<Field, string> = { porcentajeManoObra: '', porcentajeCostosFijos: '', porcentajeOtrosVariables: '', porcentajeMargen: '' };
const pct = (value: number) => `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value)} %`;
const parse = (value: string, margin: boolean) => {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 && number < (margin ? 100 : 1000.01) ? number : null;
};

export function CostPriceParametersPage() {
  const [rows, setRows] = useState<CostPriceParameter[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CostPriceParameter | 'new' | null>(null);
  const [typeId, setTypeId] = useState('');
  const [form, setForm] = useState<Record<Field, string>>(empty);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field | 'type', string>>>({});
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<SaveCostPriceParameter | null>(null);
  const canAdmin = hasPermission('Costos y precios', 'Administrar');

  async function load() {
    setLoading(true); setError('');
    try { const [params, productTypes] = await Promise.all([costPriceParametersApi.list(), productsApi.productTypes()]); setRows(params); setTypes(productTypes); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron consultar los parámetros.')); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const typeName = (id: number | null) => id === null ? 'General' : types.find(type => type.id === id)?.descripcion ?? `Tipo ${id}`;
  const filtered = useMemo(() => rows.filter(row => typeName(row.tipoProductoId).toLocaleLowerCase('es-AR').includes(search.trim().toLocaleLowerCase('es-AR'))), [rows, types, search]);
  const visible = filtered.slice((page - 1) * 8, page * 8);
  function open(row: CostPriceParameter | 'new') {
    setEditing(row); setFieldErrors({}); setError('');
    setTypeId(row === 'new' ? '' : String(row.tipoProductoId ?? ''));
    setForm(row === 'new' ? empty : Object.fromEntries(fields.map(([field]) => [field, String(row[field])])) as Record<Field, string>);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (saving || !editing) return;
    const errors: Partial<Record<Field | 'type', string>> = {};
    const values = {} as Record<Field, number>;
    for (const [field, label] of fields) { const value = parse(form[field], field === 'porcentajeMargen'); if (value === null) errors[field] = `${label}: ingresá un porcentaje válido con hasta dos decimales.`; else values[field] = value; }
    const selected = typeId ? types.find(type => String(type.id) === typeId) : null;
    if (typeId && !selected) errors.type = 'Seleccioná un tipo de producto válido.';
    if (editing === 'new' && rows.some(row => row.tipoProductoId === (selected?.id ?? null))) errors.type = 'Ya existe una configuración para este tipo.';
    setFieldErrors(errors); if (Object.keys(errors).length) return;
    setPending({ tipoProductoId: selected?.id ?? null, ...values });
  }
  async function confirmSave() {
    if (!pending || saving) return;
    setSaving(true); setError('');
    try { await costPriceParametersApi.save(pending); await load(); setEditing(null); setPending(null); setNotice('Los parámetros se guardaron correctamente.'); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron guardar los parámetros.')); }
    finally { setSaving(false); }
  }
  const columns: DataTableColumn<CostPriceParameter>[] = [
    { key: 'type', header: 'Aplica a', render: row => <strong>{typeName(row.tipoProductoId)}</strong> },
    ...fields.map(([field, label]): DataTableColumn<CostPriceParameter> => ({ key: field, header: label, render: row => pct(row[field]) })),
    { key: 'action', header: 'Acciones', render: row => canAdmin ? <button type="button" className="configuration-text-action" onClick={() => open(row)}>Editar</button> : null },
  ];
  return <AppShell title="Parámetros de costos y precios" breadcrumb="Administración / Configuración / Ventas / Parámetros de costos y precios">
    <div className="configuration-page"><a className="configuration-back" href="/configuracion/ventas">← Ventas</a>
      <PageHeader title="Parámetros de costos y precios" description="Configuración general y específica por tipo de producto." action={canAdmin && editing === null ? <button className="button primary" type="button" onClick={() => open('new')}><Plus size={16}/> Agregar configuración</button> : undefined}/>
      {notice && <div className="sales-prices-success" role="status">{notice}</div>}
      {error && <div className="sales-prices-error" role="alert"><span>{error}</span>{!editing && <button type="button" className="button secondary" onClick={() => void load()}><RefreshCw size={15}/> Reintentar</button>}</div>}
      {editing ? <form className="configuration-form" onSubmit={event => void save(event)}>
        <h2>{editing === 'new' ? 'Agregar configuración' : `Editar ${typeName(editing.tipoProductoId)}`}</h2>
        <label><span>Tipo de producto</span><select value={typeId} disabled={editing !== 'new' || saving} onChange={event => setTypeId(event.target.value)}><option value="">General</option>{types.map(type => <option value={type.id} key={type.id}>{type.descripcion}</option>)}</select>{fieldErrors.type && <small className="field-error">{fieldErrors.type}</small>}</label>
        <div className="configuration-form-grid">{fields.map(([field, label]) => <label key={field}><span>{label} (%)</span><input inputMode="decimal" value={form[field]} onChange={event => setForm(current => ({ ...current, [field]: event.target.value }))} disabled={saving}/>{fieldErrors[field] && <small className="field-error">{fieldErrors[field]}</small>}</label>)}</div>
        <div className="configuration-actions"><button type="button" className="button secondary" onClick={() => { setEditing(null); setError(''); }} disabled={saving}>Cancelar</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar parámetros'}</button></div>
      </form> : <><DataTableFilters search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Buscar por tipo de producto" onClear={() => { setSearch(''); setPage(1); }} clearDisabled={!search}/>
        <DataTable rows={visible} columns={columns} rowKey={row => row.parametroCostoPrecioId} loading={loading} page={Math.min(page, Math.max(1, Math.ceil(filtered.length / 8)))} pageSize={8} totalRecords={filtered.length} onPageChange={setPage} emptyState={<div className="state-box">{search ? 'No hay configuraciones para esta búsqueda.' : 'Todavía no hay parámetros configurados.'}</div>}/></>}
      {pending && <Modal title="Confirmar parámetros" onClose={saving ? () => {} : () => setPending(null)}><div className="configuration-confirm"><p>La configuración de <strong>{typeName(pending.tipoProductoId)}</strong> se aplicará a los próximos cálculos de precios.</p><div className="configuration-actions"><button type="button" className="button secondary" disabled={saving} onClick={() => setPending(null)}>Volver</button><button type="button" className="button primary" disabled={saving} onClick={() => void confirmSave()}>{saving ? 'Guardando…' : 'Confirmar'}</button></div></div></Modal>}
    </div>
  </AppShell>;
}
