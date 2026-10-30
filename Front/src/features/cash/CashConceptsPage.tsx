import { useEffect,useRef,useState,type FormEvent } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable,type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { StatusBadge } from '../../components/data/StatusBadge';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/data/Modal';
import { Toast } from '../../components/ui/Toast';
import { hasPermission } from '../../services/authorization';
import { apiErrorMessage } from '../../services/apiClient';
import { cashConceptsApi,type CashConcept,type CashConceptCatalog } from '../../services/cashConceptsApi';
import { movementTypeLabel } from './cashFormat';
import './cashRecords.css';
import './dailyCash.css';

export function CashConceptsPage({ configurationContext = false }: { configurationContext?: boolean } = {}){
  const [catalog,setCatalog]=useState<CashConceptCatalog|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[search,setSearch]=useState(''),[page,setPage]=useState(1);
  const [editing,setEditing]=useState<CashConcept|null|undefined>(undefined),[change,setChange]=useState<CashConcept|null>(null),[stateError,setStateError]=useState(''),[status,setStatus]=useState('');
  const guard=useRef(false);
  useEffect(()=>{let active=true;setLoading(true);void cashConceptsApi.list().then(data=>{if(active){setCatalog(data);setError('');}}).catch(caught=>{if(active)setError(apiErrorMessage(caught,'No se pudo consultar el catálogo.'));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[retry]);
  const rows=(catalog?.conceptos||[]).filter(row=>(!status||row.activo===(status==='activo'))&&`${row.codigo} ${row.nombre} ${movementTypeLabel(row.tipo)}`.toLocaleLowerCase('es-AR').includes(search.trim().toLocaleLowerCase('es-AR')));
  const safePage=Math.min(page,Math.max(1,Math.ceil(rows.length/10)));
  async function execute(action:()=>Promise<unknown>){if(guard.current)return;guard.current=true;setBusy(true);try{await action();setEditing(undefined);setChange(null);setNotice('Concepto actualizado.');setRetry(value=>value+1);}catch(caught){throw new Error(apiErrorMessage(caught,'No se pudo guardar el concepto.'));}finally{guard.current=false;setBusy(false);}}
  const columns:DataTableColumn<CashConcept>[]=[
    {key:'codigo',header:'Código',width:'15%',render:row=>row.codigo},
    {key:'nombre',header:'Concepto',width:'30%',render:row=><strong>{row.nombre}</strong>},
    {key:'tipo',header:'Tipo',width:'20%',render:row=>movementTypeLabel(row.tipo)},
    {key:'estado',header:'Estado',width:'15%',render:row=><StatusBadge tone={row.activo?'success':'neutral'}>{row.activo?'Activo':'Inactivo'}</StatusBadge>},
    {key:'acciones',header:'Acciones',width:'20%',render:row=><div className="cash-record-actions">{hasPermission('Caja','Editar')&&<button className="button secondary" disabled={busy||loading} onClick={()=>setEditing(row)}>Editar</button>}{hasPermission('Caja','Inactivar')&&<button className="button secondary" disabled={busy||loading} onClick={()=>{setStateError('');setChange(row);}}>{row.activo?'Desactivar':'Activar'}</button>}</div>},
  ];
  return <AppShell title="Conceptos de caja" breadcrumb={configurationContext ? "Administración / Configuración / Caja / Conceptos" : "Caja / Movimientos / Conceptos"}><div className="cash-record-page"><Toast message={notice} onClose={()=>setNotice('')}/>
    <PageHeader title="Conceptos de caja" action={<div className="cash-record-actions"><a className="button secondary" href={configurationContext ? "/configuracion/caja" : "/caja/movimientos"}>{configurationContext ? 'Volver a Caja' : 'Volver a Movimientos'}</a>{hasPermission('Caja','Crear')&&<button className="button primary" disabled={!catalog?.disponible||loading||busy} onClick={()=>setEditing(null)}>Nuevo concepto</button>}</div>}/>
    {error&&<div className="inline-alert error" role="alert">{error}<button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Reintentar</button></div>}
    {catalog&&!catalog.disponible?<div className="state-box" role="status">{catalog.mensaje}</div>:<><DataTableFilters className="cash-record-concepts-filters" search={search} searchPlaceholder="Buscar código o concepto" onSearchChange={value=>{setSearch(value);setPage(1);}} onClear={()=>{setSearch('');setStatus('');setPage(1);}}><label className="data-table-filter-field"><span>Estado</span><select value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label></DataTableFilters><DataTable className="cash-record-list" tableClassName="cash-record-table" rows={rows.slice((safePage-1)*10,safePage*10)} columns={columns} rowKey={row=>row.cajaConceptoId} loading={loading} page={safePage} pageSize={10} totalRecords={rows.length} onPageChange={setPage} emptyState={<div className="state-box">{search||status?'No hay conceptos para estos filtros.':'Todavía no hay conceptos de caja.'}</div>}/></>}
    {editing!==undefined&&catalog&&<ConceptForm key={editing?.cajaConceptoId||'new'} concept={editing} catalog={catalog} busy={busy} onClose={()=>setEditing(undefined)} onSave={payload=>execute(()=>cashConceptsApi.save(editing?.cajaConceptoId||null,payload))}/>}
    {change&&<Modal title={change.activo?'Desactivar concepto':'Activar concepto'} onClose={busy?()=>{}:()=>setChange(null)}><div className="cash-record-modal-body"><p>{change.nombre}</p>{stateError&&<div className="inline-alert error" role="alert">{stateError}</div>}<div className="modal-actions"><button className="button secondary" disabled={busy} onClick={()=>setChange(null)}>Cancelar</button><button className="button primary" disabled={busy} onClick={()=>void execute(()=>cashConceptsApi.state(change.cajaConceptoId,!change.activo)).catch(caught=>setStateError(caught.message))}>{busy?'Guardando…':change.activo?'Desactivar':'Activar'}</button></div></div></Modal>}
  </div></AppShell>;
}
function ConceptForm({concept,catalog,busy,onClose,onSave}:{concept:CashConcept|null;catalog:CashConceptCatalog;busy:boolean;onClose:()=>void;onSave:(payload:{codigo:string;nombre:string;tipo:string})=>Promise<void>}){
  const [codigo,setCodigo]=useState(concept?.codigo||''),[nombre,setNombre]=useState(concept?.nombre||''),[tipo,setTipo]=useState(concept?.tipo||''),[errors,setErrors]=useState<Record<string,string>>({}),[error,setError]=useState('');
  async function submit(event:FormEvent){event.preventDefault();if(busy)return;const next:Record<string,string>={};if(!codigo.trim()||codigo.length>30)next.codigo='Ingresá un código de hasta 30 caracteres.';if(!nombre.trim()||nombre.length>120)next.nombre='Ingresá un nombre de hasta 120 caracteres.';if(!catalog.tipos.some(row=>row.codigo===tipo))next.tipo='Seleccioná un tipo.';setErrors(next);if(Object.keys(next).length)return;try{await onSave({codigo:codigo.trim(),nombre:nombre.trim(),tipo});}catch(caught){setError(apiErrorMessage(caught,'No se pudo guardar.'));}}
  return <Modal title={concept?'Editar concepto':'Nuevo concepto'} onClose={busy?()=>{}:onClose}><form className="daily-cash-form" noValidate onSubmit={submit}>{error&&<div className="inline-alert error" role="alert">{error}</div>}<FormField label="Código *" value={codigo} maxLength={30} disabled={busy||concept?.utilizado} error={errors.codigo} onChange={event=>setCodigo(event.target.value)}/><FormField label="Nombre *" value={nombre} maxLength={120} disabled={busy} error={errors.nombre} onChange={event=>setNombre(event.target.value)}/><label className="plain-field"><span>Tipo *</span><select value={tipo} disabled={busy||concept?.utilizado} onChange={event=>setTipo(event.target.value)}><option value="">Seleccioná un tipo</option>{catalog.tipos.map(row=><option value={row.codigo} key={row.codigo}>{row.descripcion}</option>)}</select>{errors.tipo&&<small className="field-error">{errors.tipo}</small>}</label>{concept?.utilizado&&<p className="field-hint">El código y el tipo se conservan porque el concepto ya fue utilizado.</p>}<div className="modal-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy} type="submit">Guardar</button></div></form></Modal>;
}
