import {useEffect,useRef,useState,type FormEvent} from 'react';
import {AppShell} from '../../components/layout/AppShell';
import {PageHeader} from '../../components/data/PageHeader';
import {DataTable,type DataTableColumn} from '../../components/data/DataTable';
import {DataTableFilters} from '../../components/data/DataTableFilters';
import {DateRangeFilter} from '../../components/data/DateRangeFilter';
import {StatusBadge} from '../../components/data/StatusBadge';
import {Modal} from '../../components/data/Modal';
import {Toast} from '../../components/ui/Toast';
import {hasPermission} from '../../services/authorization';
import {apiErrorMessage} from '../../services/apiClient';
import {cashBankApi,type BankFilters,type BankQueryRow,type BankCandidate} from '../../services/cashBankApi';
import {useBankReconciliation} from './hooks/useBankReconciliation';
import {BankImportDialog} from './components/BankImportDialog';
import {cashMovementUrl} from './cashRoutes';
import {formatDate,formatDateTime,monthStartInput,todayInput} from './cashFormat';
import './cash.css';import './dailyCash.css';import './cashRecords.css';

const BANK_PAGE_SIZE=5;
const initial=():BankFilters=>({cuenta:0,desde:monthStartInput(),hasta:todayInput(),estado:'',buscar:'',dias:3});
export function BankReconciliationsPage(){
  const [draft,setDraft]=useState(initial),[applied,setApplied]=useState(initial),[page,setPage]=useState(1),[retry,setRetry]=useState(0),[notice,setNotice]=useState('');
  const [importing,setImporting]=useState(false),[review,setReview]=useState<BankQueryRow|null>(null);
  const {accounts,accountError,accountsLoading,data,loading,error}=useBankReconciliation(applied,page,retry,BANK_PAGE_SIZE);
  const account=accounts.find(row=>row.cuentaBancariaId===applied.cuenta);
  const formatMoney=new Intl.NumberFormat('es-AR',{style:'currency',currency:account?.moneda||'ARS'});
  const invalid=Boolean(draft.desde&&draft.hasta&&draft.desde>draft.hasta);
  function refresh(message:string){setReview(null);setImporting(false);setNotice(message);setRetry(value=>value+1);setPage(1);}
  const columns:DataTableColumn<BankQueryRow>[]=[{key:'fecha',header:'Fecha',width:'13%',render:row=>formatDate(row.fechaMovimiento)},
    {key:'descripcion',header:'Descripción bancaria',width:'26%',render:row=><><strong>{row.descripcion}</strong><small>{row.nombreArchivo}</small></>},
    {key:'referencia',header:'Referencia',width:'15%',render:row=>row.referenciaBanco||'—'},
    {key:'tipo',header:'Tipo',width:'10%',render:row=>row.tipo},
    {key:'importe',header:'Importe',width:'18%',className:'cash-record-money',headerClassName:'cash-record-money',render:row=>formatMoney.format(row.importe)},
    {key:'estado',header:'Estado',width:'18%',render:row=><><StatusBadge tone={row.estado==='Conciliado'?'success':'warning'}>{row.estadoConsulta==='SinCoincidencia'?'Sin coincidencia':row.estadoConsulta}</StatusBadge>{row.estado==='Pendiente'&&row.coincidencias>0&&<small>{row.coincidencias} sugerencia{row.coincidencias===1?'':'s'} · revisar</small>}</>},
  ];
  return <AppShell title="Conciliaciones bancarias" breadcrumb="Caja / Conciliaciones bancarias"><div className="cash-record-page cash-query-workspace bank-reconciliation-page"><Toast message={notice} onClose={()=>setNotice('')}/>
    <PageHeader title="Conciliaciones bancarias" action={hasPermission('Caja','Crear')&&<button className="button primary" disabled={!account?.activa||loading} onClick={()=>setImporting(true)}>Importar extracto</button>}/>
    <form className="bank-reconciliation-filter-form" onSubmit={event=>{event.preventDefault();if(!invalid){setApplied({...draft});setPage(1);}}}><DataTableFilters search={draft.buscar} onSearchChange={buscar=>setDraft(current=>({...current,buscar}))} onClear={()=>{const next={...initial(),cuenta:draft.cuenta};setDraft(next);setApplied(next);setPage(1);}} balanced>
      <label className="data-table-filter-field"><span>Cuenta bancaria *</span><select value={draft.cuenta||''} onChange={event=>setDraft(current=>({...current,cuenta:Number(event.target.value)}))}><option value="">Seleccioná una cuenta</option>{accounts.map(row=><option value={row.cuentaBancariaId} key={row.cuentaBancariaId}>{row.nombre} · {row.banco} · {row.moneda}{row.activa?'':' (inactiva)'}</option>)}</select></label>
      <DateRangeFilter from={draft.desde} to={draft.hasta} onFromChange={desde=>setDraft(current=>({...current,desde}))} onToChange={hasta=>setDraft(current=>({...current,hasta}))}/>
      <label className="data-table-filter-field"><span>Estado</span><select value={draft.estado} onChange={event=>setDraft(current=>({...current,estado:event.target.value}))}><option value="">Todos</option><option value="Pendiente">Pendientes</option><option value="SinCoincidencia">Sin coincidencia sugerida</option><option value="Conciliado">Conciliados / historial</option><option value="Ignorado">Ignorados</option></select></label>
      <label className="data-table-filter-field"><span>Tolerancia (días)</span><input type="number" min={0} max={30} value={draft.dias} onChange={event=>setDraft(current=>({...current,dias:Number(event.target.value)}))}/></label><button className="button primary" disabled={!draft.cuenta||invalid||loading||draft.dias<0||draft.dias>30}>Consultar</button>
    </DataTableFilters>{invalid&&<p className="field-error">Desde no puede ser posterior a Hasta.</p>}</form>
    {accountError&&<div className="inline-alert error" role="alert">{accountError}<button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Reintentar</button></div>}
    {accountsLoading?<div className="state-box">Consultando cuentas…</div>:accounts.length===0&&!accountError?<div className="state-box">No hay cuentas bancarias registradas. La importación requiere una cuenta activa.</div>:!applied.cuenta?<div className="state-box">Seleccioná una cuenta y consultá el período.</div>:error?<div className="state-box" role="alert"><span>{error}</span><button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Reintentar</button></div>:<>
      {data&&!loading&&<p>{data.resumen.cantidad} movimientos del período · {data.resumen.conciliados} conciliados · {data.resumen.pendientes} pendientes · {data.resumen.sinCoincidencia} sin coincidencia sugerida</p>}
      <DataTable tableClassName="cash-record-table" rows={data?.filas||[]} columns={columns} rowKey={row=>row.bancoMovimientoId} loading={loading} page={page} pageSize={BANK_PAGE_SIZE} totalRecords={data?.total||0} onPageChange={setPage} onRowClick={setReview} emptyState={<div className="state-box">Sin movimientos bancarios para los filtros aplicados.</div>}/>
    </>}
    {importing&&account&&<BankImportDialog account={account.cuentaBancariaId} currency={account.moneda} onClose={()=>setImporting(false)} onImported={()=>refresh('Extracto importado y validado.')}/>}
    {review&&<BankReview key={review.bancoMovimientoId} row={review} days={applied.dias} currency={account?.moneda||'ARS'} canEdit={Boolean(account?.activa)&&hasPermission('Caja','Editar')} onClose={()=>setReview(null)} onSaved={()=>refresh('Conciliación registrada.')}/>}
  </div></AppShell>;
}
function BankReview({row,days,currency,canEdit,onClose,onSaved}:{row:BankQueryRow;days:number;currency:string;canEdit:boolean;onClose:()=>void;onSaved:()=>void}){
  const [candidates,setCandidates]=useState<BankCandidate[]>([]),[selected,setSelected]=useState(''),[notes,setNotes]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(row.estado==='Pendiente'),[busy,setBusy]=useState(false);
  const guard=useRef(false);const money=new Intl.NumberFormat('es-AR',{style:'currency',currency});
  useEffect(()=>{let active=true;if(row.estado!=='Pendiente')return;void cashBankApi.candidates(row.bancoMovimientoId,days).then(rows=>{if(active)setCandidates(rows);}).catch(caught=>{if(active)setError(apiErrorMessage(caught,'No se pudieron consultar candidatos.'));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[row,days]);
  async function submit(event:FormEvent){event.preventDefault();if(guard.current||!canEdit)return;const candidate=candidates.find(item=>String(item.movimientoFinancieroId)===selected);if(!candidate){setError('Seleccioná el movimiento interno verificado.');return;}if(!candidate.referenciaCoincide&&!notes.trim()){setError('Justificá la conciliación manual: las referencias no coinciden.');return;}guard.current=true;setBusy(true);setError('');try{await cashBankApi.reconcile(row.bancoMovimientoId,candidate.movimientoFinancieroId,days,notes.trim());onSaved();}catch(caught){setError(apiErrorMessage(caught,'No se pudo conciliar. Actualizá el historial antes de reintentar.'));}finally{guard.current=false;setBusy(false);}}
  return <Modal wide title={row.estado==='Conciliado'?'Detalle de conciliación':'Revisar movimiento bancario'} onClose={busy?()=>{}:onClose}><form className="daily-cash-form" onSubmit={submit}>
    <div className="cash-bank-comparison"><section><span>Banco</span><strong>{row.descripcion}</strong><p>{formatDate(row.fechaMovimiento)} · {row.tipo} · {money.format(row.importe)}</p><p>Referencia: {row.referenciaBanco||'Sin referencia'}</p><p>{row.nombreArchivo} · {row.responsableImportacion}</p></section><section><span>TEKA</span>{row.estado==='Conciliado'?<><strong>{row.conceptoInterno}</strong><p>{row.referenciaInterna||'Sin referencia'} · {formatDateTime(row.fechaConciliacion)}</p><p>{row.responsableConciliacion} · {row.metodo}</p><p>{row.observacionConciliacion}</p>{row.movimientoFinancieroId&&<a href={cashMovementUrl('Financiero',row.movimientoFinancieroId)}>Consultar movimiento interno</a>}</>:loading?<p>Cargando candidatos…</p>:candidates.length===0?<p>No hay candidatos de la misma cuenta, signo, importe y tolerancia de fechas. No se crean movimientos para conciliar.</p>:candidates.map(candidate=><label className="cash-candidate" key={candidate.movimientoFinancieroId}><input type="radio" name="candidato" disabled={busy||!canEdit} checked={selected===String(candidate.movimientoFinancieroId)} onChange={()=>setSelected(String(candidate.movimientoFinancieroId))}/><div><strong>{candidate.concepto}</strong><small>{formatDateTime(candidate.fechaOperacion)} · {money.format(candidate.importe)} · {candidate.referenciaExterna||'Sin referencia'}</small><em>{candidate.referenciaCoincide?'Referencia coincidente; requiere revisión':'Referencias diferentes; requiere justificación'}</em></div></label>)}</section></div>
    {candidates.some(candidate=>candidate.compartido)&&<p className="field-hint" role="status">Hay candidatos vinculables también con otros movimientos bancarios pendientes. Es una coincidencia ambigua: verificá el documento antes de confirmar.</p>}
    {error&&<div className="inline-alert error" role="alert">{error}</div>}{row.estado==='Pendiente'&&canEdit&&<label className="plain-field"><span>Justificación / observaciones</span><textarea disabled={busy} value={notes} maxLength={500} onChange={event=>setNotes(event.target.value)}/></label>}
    <div className="modal-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cerrar</button>{row.estado==='Pendiente'&&canEdit&&<button className="button primary" type="submit" disabled={busy||!selected}>Confirmar conciliación manual</button>}</div>
  </form></Modal>;
}
