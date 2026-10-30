import { ArrowLeft, Wallet, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { apiErrorMessage } from '../../services/apiClient';
import { cashQueriesApi, type CashFinancialRow } from '../../services/cashQueriesApi';
import { hasPermission } from '../../services/authorization';
import { cashMovementsReturnUrl } from './cashRoutes';
import type { DailyCashState } from '../../services/dailyCashApi';
import { CashSessionTable, CashTurnSummary } from './components/CashSessionTable';
import { formatDateTime, money, movementTypeLabel, sourceLabel, paymentMethodLabel } from './cashFormat';
import './cashRecords.css';

export function CashRecordDetailPage({id,source}:{id:number;source?:string}) {
  const [movement,setMovement]=useState<CashFinancialRow|null>(null),[state,setState]=useState<DailyCashState|null>(null);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
  useEffect(()=>{
    const abort=new AbortController();let active=true;setLoading(true);setError('');
    const load=source?cashQueriesApi.detail(source,id,abort.signal).then(row=>{if(active)setMovement(row);}):cashQueriesApi.session(id,abort.signal).then(row=>{if(active)setState(row);});
    void load.catch(caught=>{if(active)setError(apiErrorMessage(caught,'No se pudo recuperar el detalle.'));}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;abort.abort();};
  },[id,source,retry]);
  const session=state?.sesion,count=state?.ultimoArqueo;
  const title=source?'Detalle del movimiento':session?.estado==='Cerrada'?'Detalle del cierre':'Detalle de la sesión';
  return <AppShell title={title} breadcrumb={`Caja / Movimientos / ${title}`}><div className="cash-record-page">
    <PageHeader title={title} action={<a className="button secondary" href={source==='Caja'||!source?'/caja/diaria':cashMovementsReturnUrl(false)}><ArrowLeft size={16}/> {source==='Caja'||!source?'Volver a Caja diaria':'Volver a Movimientos'}</a>}/>
    {new URLSearchParams(location.search).has('registrado')&&<Toast message="Movimiento registrado." onClose={()=>history.replaceState(null,'',location.pathname)}/>} 
    {loading?<div className="state-box" role="status">Cargando detalle…</div>:error?<div className="state-box" role="alert"><span>{error}</span><button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Reintentar</button></div>:movement?<>
      <div className="cash-detail-layout">
        <section className="cash-record-section cash-detail-card">
          <div className="cash-detail-card-heading"><ReceiptText size={20}/>Información principal</div>
          <dl className="cash-detail-fields">
            <Item label="N.º de movimiento" value={String(movement.movimientoId)}/>
            <Item label="Fecha de operación" value={formatDateTime(movement.fecha)}/>
            <Item label="Tipo" value={movement.tipoCaja?movementTypeLabel(movement.tipoCaja):movement.tipo}/>
            <Item label="Descripción" value={movement.concepto}/>
            <Item label="Importe" value={money.format(movement.importe)}/>
            <Item label="Medio de pago" value={paymentMethodLabel(movement.medio)}/>
          </dl>
        </section>
        <section className="cash-record-section cash-detail-card">
          <div className="cash-detail-card-heading"><Wallet size={20}/>Registro y origen</div>
          <dl className="cash-detail-fields">
            <Item label="Estado" value={movement.estado}/>
            <Item label="Origen" value={sourceLabel(movement.origenTipo)}/>
            <Item label="Responsable" value={movement.responsable}/>
            <Item label="Registrado el" value={formatDateTime(movement.fechaRegistro)}/>
          </dl>
        </section>
      </div>
      <details className="cash-record-section cash-detail-secondary">
        <summary>Información adicional</summary>
        <dl className="cash-detail-fields">
          {([
            ['Referencia documental',movement.referencia],['Canal',movement.canal],
            ['Cuenta bancaria',movement.cuenta],['Observaciones',movement.observaciones],
            ['Caja',movement.caja],['Documento de origen',movement.documentoOrigen],
            ['Estado en el origen',movement.estadoOrigen],['Medio en el origen',movement.medioOrigen],
            ['Concepto clasificado',movement.conceptoClasificado]
          ] as [string,string|null|undefined][]).filter(([,value])=>Boolean(value&&value!=='—')).map(([label,value])=><Item key={label} label={label} value={value}/>)}
        </dl>
      </details>
      {movement.fuente==='Caja'&&movement.medioOrigen&&movement.medioOrigen!=='Efectivo'&&<div className="inline-alert error" role="alert">El cobro vinculado indica un medio distinto de efectivo. Requiere revisión; la consulta no modifica ni compensa registros.</div>}
      {!!movement.comprobantes?.length&&<section className="cash-record-section"><h2>Comprobantes aplicados al cobro</h2><ul>{movement.comprobantes.map((document,index)=><li key={`${document.tipo}-${document.puntoVenta}-${document.numeroComprobante}-${index}`}>{document.tipo} {String(document.puntoVenta).padStart(4,'0')}-{String(document.numeroComprobante).padStart(8,'0')} · Aplicado: {money.format(document.importeAplicado)}</li>)}</ul></section>}
      <div className="cash-record-actions">{movement.pedidoId&&hasPermission('Ventas','Ver')&&<a className="button secondary" href={`/ventas/pedidos/${movement.pedidoId}`}>Consultar pedido de origen</a>}</div>
    </>:session&&state?<>
      <section className="cash-record-section"><h2>{state.caja.nombre} <StatusBadge tone={session.estado==='Cerrada'?'neutral':'success'}>{session.estado}</StatusBadge></h2><dl className="cash-record-detail"><Item label="Apertura" value={formatDateTime(session.fechaApertura)}/><Item label="Responsable de apertura" value={session.responsable}/><Item label="Fondo objetivo al abrir" value={money.format(session.fondoObjetivoApertura)}/><Item label="Observación de apertura" value={session.observacionApertura}/><Item label="Cierre" value={session.fechaCierre?formatDateTime(session.fechaCierre):'Sesión abierta'}/><Item label="Responsable de cierre" value={session.responsableCierre}/><Item label="Observación de cierre" value={session.observacionCierre}/></dl></section>
      <section className="cash-record-section"><CashTurnSummary session={session}/></section>
      <section className="cash-record-section"><h2>{session.estado==='Cerrada'?'Arqueo final':'Último arqueo'}</h2>{count?<dl className="cash-record-detail"><Item label="Fecha" value={formatDateTime(count.fecha)}/><Item label="Responsable" value={count.responsable}/><Item label="Efectivo esperado" value={money.format(count.efectivoEsperado)}/><Item label="Efectivo contado" value={money.format(count.efectivoContado)}/><Item label="Diferencia" value={money.format(count.diferencia)}/><Item label="Observaciones" value={count.observaciones}/></dl>:<p>Sin arqueos registrados.</p>}</section>
      <section><h2>Movimientos de la sesión</h2><CashSessionTable rows={state.movimientos}/></section>
    </>:null}
  </div></AppShell>;
}
function Item({label,value}:{label:string;value:string|null|undefined}){return <div><dt>{label}</dt><dd>{value||'—'}</dd></div>;}
