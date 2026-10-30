import { useCallback, useEffect, useMemo, useState } from 'react';
import { LockKeyhole, Plus, WalletCards } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { Toast } from '../../components/ui/Toast';
import { hasPermission } from '../../services/authorization';
import { DailyCashDialogs, type DailyCashDialogKind } from './components/DailyCashDialogs';
import { cashMovementUrl, cashSessionColumns } from './components/CashSessionTable';
import { useDailyCash } from './hooks/useDailyCash';
import { money, movementTypeLabel } from './cashFormat';
import './dailyCash.css';
import './cashRecords.css';

export function DailyCashPage() {
  const data=useDailyCash();
  const [navigationNotice,setNavigationNotice]=useState(()=>{
    const params=new URLSearchParams(window.location.search);
    return params.has('cerrada')?'Caja cerrada correctamente.':params.has('movimientoRegistrado')?'Movimiento de caja registrado correctamente.':'';
  });
  useEffect(()=>{
    const url=new URL(window.location.href);
    if(!url.searchParams.has('cerrada')&&!url.searchParams.has('movimientoRegistrado'))return;
    url.searchParams.delete('cerrada');
    url.searchParams.delete('movimientoRegistrado');
    window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
  },[]);
  const {state,loading,error,busy}=data;
  const canCreate=hasPermission('Caja','Crear'),canEdit=hasPermission('Caja','Editar');
  const [dialog,setDialog]=useState<DailyCashDialogKind|null>(null);
  const [search,setSearch]=useState(''),[type,setType]=useState('');
  const [page,setPage]=useState(1);
  const [closedSession,setClosedSession]=useState<number|null>(null);
  const session=state?.sesion;
  const blocked=loading||busy||Boolean(error);
  const closeDialog=useCallback(()=>setDialog(null),[]);
  const filtered=useMemo(()=>(state?.movimientos||[]).filter(item=>(!type||item.tipo===type)&&`${item.concepto} ${item.referencia||''} ${item.responsable}`.toLocaleLowerCase('es-AR').includes(search.trim().toLocaleLowerCase('es-AR'))),[state,search,type]);
  const safePage=Math.min(page,Math.max(1,Math.ceil(filtered.length/5)));
  async function openDialog(kind:DailyCashDialogKind) {
    try {
      const fresh=await data.reload();
      if ((kind==='open'&&fresh.sesion)||(['count','close'].includes(kind)&&!fresh.sesion)) {data.setNotice('El estado cambió. Revisá la caja actualizada.');return;}
      setDialog(kind);
    } catch { /* El hook expone el error real y permite reintentar. */ }
  }
  return <AppShell title="Caja diaria" breadcrumb="Caja / Caja diaria"><div className="daily-cash-page cash-query-workspace">
    <Toast message={data.notice || navigationNotice} onClose={()=>{data.setNotice('');setNavigationNotice('');}}/>
    <PageHeader title="Caja diaria" action={state&&!error&&<div className="daily-cash-actions">{session?<>{canCreate&&<a className="button primary" href="/caja/movimientos/nuevo"><Plus size={16}/>Registrar movimiento</a>}{canEdit&&<a className="button primary" href="/caja/diaria/cerrar"><LockKeyhole size={16}/>Cerrar caja</a>}</>:canCreate&&<button className="button primary" disabled={blocked||!(state.caja.fondoFijoObjetivo&&state.caja.fondoFijoObjetivo>0)} onClick={()=>void openDialog('open')}><WalletCards size={16}/>Abrir caja</button>}</div>}/>
    {error?<div className="state-box" role="alert"><strong>No se pudo actualizar la caja</strong><span>{error}</span><button className="button secondary" onClick={()=>void data.reload().catch(()=>{})}>Reintentar</button></div>:!state?<div className="state-box" role="status">Cargando caja…</div>:<>

      {closedSession&&!session&&<div className="inline-alert success" role="status">Caja cerrada. <a href={`/caja/cierres/${closedSession}`}>Consultar cierre</a></div>}
      {session?<>
          <DataTableFilters search={search} onSearchChange={value=>{setSearch(value);setPage(1);}} searchPlaceholder="Buscar descripción, referencia o responsable" onClear={()=>{setSearch('');setType('');setPage(1);}} clearDisabled={!search&&!type} balanced><label className="data-table-filter-field"><span>Tipo</span><select value={type} onChange={e=>{setType(e.target.value);setPage(1);}}><option value="">Todos</option>{Array.from(new Set(state.movimientos.map(row=>row.tipo))).map(value=><option key={value} value={value}>{movementTypeLabel(value)}</option>)}</select></label></DataTableFilters>
        <section className="daily-cash-summary" aria-label="Resumen de caja"><Summary label="Saldo esperado" value={session.efectivoEsperado} emphasis/><Summary label="Ingresos" value={session.ingresos}/><Summary label="Egresos" value={session.egresos}/></section>
        <section className="daily-cash-work"><h2>Movimientos</h2>

          <DataTable tableClassName="cash-record-table" rows={filtered.slice((safePage-1)*5,safePage*5)} columns={cashSessionColumns} rowKey={row=>row.cajaMovimientoId} loading={loading} page={safePage} pageSize={5} totalRecords={filtered.length} onPageChange={setPage} onRowClick={row=>{location.href=cashMovementUrl('Caja',row.cajaMovimientoId);}} summary={<>{filtered.length} movimientos</>} emptyState={<div className="state-box">{search||type?'Sin resultados para estos filtros.':'Todavía no hay movimientos.'}</div>}/>
        </section>
      </>:<section className="daily-cash-closed"><WalletCards size={30}/><h2>Caja cerrada</h2><p>No hay una sesión abierta. Abrí caja para registrar y controlar los movimientos de efectivo.</p><div className="daily-cash-closed-info"><span>Fondo fijo de referencia</span><strong>{state.caja.fondoFijoObjetivo===null?'Sin configurar':money.format(state.caja.fondoFijoObjetivo)}</strong></div>{!(state.caja.fondoFijoObjetivo&&state.caja.fondoFijoObjetivo>0)&&<p>El fondo fijo se configura desde Administración / Configuración / Caja.</p>}</section>}
    </>}
    {dialog&&state&&<DailyCashDialogs key={`${dialog}-${session?.cajaSesionId||'closed'}`} kind={dialog} state={state} busy={busy} blocked={Boolean(error)||loading} onClose={closeDialog} execute={async(action,message)=>{const id=state.sesion?.cajaSesionId;const fresh=await data.execute(action,message);if(fresh&&id&&!fresh.sesion)setClosedSession(id);return fresh;}}/>}
  </div></AppShell>;
}
function Summary({label,value,emphasis=false}:{label:string;value:number|null;emphasis?:boolean}) {return <div className={emphasis?'emphasis':''}><span>{label}</span><strong>{value===null?'Sin configurar':money.format(value)}</strong></div>;}
