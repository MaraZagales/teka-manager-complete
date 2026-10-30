import { useEffect, useState } from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { StatusBadge } from '../../components/data/StatusBadge';
import type { CashFinancialRow, CashQueryFilters } from '../../services/cashQueriesApi';
import { useCashQueries } from './hooks/useCashQueries';
import { hasPermission } from '../../services/authorization';
import { cashMovementUrl } from './components/CashSessionTable';
import { formatDateTime, money, monthStartInput, todayInput, sourceLabel, paymentMethodLabel, movementTypeLabel } from './cashFormat';
import './cashRecords.css';

const defaults=():CashQueryFilters=>({desde:monthStartInput(),hasta:todayInput(),buscar:'',tipo:'',medio:'',estado:'',origen:'',concepto:'',cuenta:'',canal:''});
export const financialColumns:DataTableColumn<CashFinancialRow>[]=[
  {key:'fecha',header:'Fecha',width:'17%',render:row=>formatDateTime(row.fecha)},
  {key:'tipo',header:'Tipo',width:'12%',render:row=><><StatusBadge tone={row.tipo==='Ingreso'?'success':'neutral'}>{row.tipo}</StatusBadge>{row.tipoCaja&&<small>{movementTypeLabel(row.tipoCaja)}</small>}</>},
  {key:'concepto',header:'Concepto / descripción',width:'26%',render:row=><><strong>{row.conceptoClasificado||row.concepto}</strong>{row.conceptoClasificado&&<small>{row.concepto}</small>}</>},
  {key:'origen',header:'Origen',width:'12%',render:row=>sourceLabel(row.origenTipo)},
  {key:'medio',header:'Medio',width:'14%',render:row=>paymentMethodLabel(row.medio)},
  {key:'importe',header:'Importe',width:'12%',className:'cash-record-money',headerClassName:'cash-record-money',render:row=>money.format(row.importe)},
  {key:'estado',header:'Estado',width:'7%',render:row=><StatusBadge tone={row.estado==='Registrado'?'success':'neutral'}>{row.estado}</StatusBadge>},
];
export function FinancialMovementsPage() {
  const [draft,setDraft]=useState(defaults),[applied,setApplied]=useState(defaults);
  const [extra,setExtra]=useState(false),[page,setPage]=useState(1),[retry,setRetry]=useState(0);
  const {rows,total,loading,error,lookupError,options,channels,accounts}=useCashQueries('movimientos',applied,page,setPage,retry);
  const invalid=Boolean(draft.desde&&draft.hasta&&draft.desde>draft.hasta);
  // Aplicación automática: breve espera para evitar una solicitud por cada tecla.
  useEffect(()=>{
    if(invalid)return;
    const timeout=window.setTimeout(()=>{setApplied({...draft});setPage(1);},300);
    return ()=>window.clearTimeout(timeout);
  },[draft,invalid]);
  function update(key:keyof CashQueryFilters,value:string){setDraft(current=>({...current,[key]:value}));}
  function clear(){const f=defaults();setDraft(f);setApplied(f);setPage(1);}
  return <AppShell title="Movimientos" breadcrumb="Caja / Movimientos"><div className="cash-record-page cash-query-workspace">
    <PageHeader title="Movimientos" action={<div className="cash-record-actions">{hasPermission('Caja','Crear')&&<a className="button primary" href="/caja/movimientos/nuevo"><Plus size={16}/>Registrar movimiento de caja</a>}</div>}/>
    <div className="financial-filter-form">
      <DataTableFilters className="financial-movement-filters" search={draft.buscar} onSearchChange={value=>update('buscar',value)} searchPlaceholder="Buscar concepto, referencia o descripción" onClear={clear}>
        <label className="data-table-filter-field financial-date-from"><span>Fecha desde</span><input type="date" value={draft.desde} max={draft.hasta||undefined} onChange={e=>update('desde',e.target.value)}/></label>
        <label className="data-table-filter-field financial-date-to"><span>Fecha hasta</span><input type="date" value={draft.hasta} min={draft.desde||undefined} onChange={e=>update('hasta',e.target.value)}/></label>
        <Select label="Tipo" value={draft.tipo} onChange={value=>update('tipo',value)} values={options?.tipo||[]}/>
        <button type="button" className="button secondary financial-advanced-toggle" aria-expanded={extra} aria-controls="financial-advanced-filters" onClick={()=>setExtra(value=>!value)}><SlidersHorizontal size={16}/> Más filtros</button>
      </DataTableFilters>
      {extra&&<div id="financial-advanced-filters" className="financial-advanced-filters">
        <Select label="Medio" value={draft.medio} onChange={value=>update('medio',value)} values={options?.medio||[]} labelFor={paymentMethodLabel}/>
        <Select label="Origen" value={draft.origen} onChange={value=>update('origen',value)} values={options?.origen||[]} labelFor={sourceLabel}/>
        <Select label="Estado" value={draft.estado} onChange={value=>update('estado',value)} values={options?.estado||[]}/>
        <label className="data-table-filter-field"><span>Concepto / descripción</span><input value={draft.concepto} maxLength={250} onChange={e=>update('concepto',e.target.value)}/></label>
        <Select label="Canal" value={draft.canal} onChange={value=>update('canal',value)} values={channels.map(item=>String(item.id))} labelFor={value=>{const channel=channels.find(item=>String(item.id)===value);return channel?`${channel.descripcion}${channel.activo?'':' (inactivo)'}`:'Canal no disponible';}}/>
        <Select label="Cuenta bancaria" value={draft.cuenta} onChange={value=>update('cuenta',value)} values={accounts.map(item=>String(item.cuentaBancariaId))} labelFor={value=>{const a=accounts.find(item=>String(item.cuentaBancariaId)===value);return a?`${a.nombre} · ${a.banco}${a.activa?'':' (inactiva)'}`:'Cuenta no disponible';}}/>
      </div>}
      {invalid&&<div className="inline-alert error" role="alert">Desde no puede ser posterior a Hasta.</div>}
    </div>
    {lookupError&&<div className="inline-alert error" role="alert">{lookupError}<button className="button secondary" onClick={()=>setRetry(v=>v+1)}>Reintentar filtros</button></div>}
    {error?<div className="state-box" role="alert"><span>{error}</span><button className="button secondary" onClick={()=>setRetry(v=>v+1)}>Reintentar</button></div>:<DataTable tableClassName="cash-record-table" rows={rows} columns={financialColumns} rowKey={row=>`${row.fuente}-${row.movimientoId}`} loading={loading} page={page} pageSize={5} totalRecords={total} onPageChange={setPage} onRowClick={row=>{location.href=cashMovementUrl(row.fuente,row.movimientoId);}} summary={<>{total} movimientos</>} emptyState={<div className="state-box">No hay movimientos para los filtros seleccionados.</div>}/>}
  </div></AppShell>;
}
function Select({label,value,onChange,values,labelFor=(item:string)=>item}:{label:string;value:string;onChange:(value:string)=>void;values:string[];labelFor?:(value:string)=>string}) {return <label className="data-table-filter-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">Todos</option>{values.map(item=><option value={item} key={item}>{labelFor(item)}</option>)}</select></label>;}
