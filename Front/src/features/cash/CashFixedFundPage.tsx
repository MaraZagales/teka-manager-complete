import { useRef, useState, type FormEvent } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { FormField } from '../../components/ui/FormField';
import { useDailyCash } from './hooks/useDailyCash';
import { dailyCashApi } from '../../services/dailyCashApi';
import { apiErrorMessage } from '../../services/apiClient';
import { cashAmount,cashAmountError } from './utils/dailyCashMoney';
import { money } from './cashFormat';
import './cashRecords.css';

export function CashFixedFundPage(){
 const {state,loading,error,reload}=useDailyCash();
 const [amount,setAmount]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const submitting=useRef(false);
 async function submit(event:FormEvent){
  event.preventDefault();if(!state||busy||submitting.current)return;
  const problem=cashAmountError(amount,false);if(problem){setMessage(problem);return;}
  if(state.sesion){setMessage('Cerrá la caja antes de modificar el fondo fijo.');return;}
  submitting.current=true;setBusy(true);setMessage('');
  try{await dailyCashApi.fixedFund(state.caja.cajaId,cashAmount(amount));await reload();setAmount('');setMessage('Fondo fijo actualizado.');}
  catch(caught){setMessage(apiErrorMessage(caught,'No se pudo actualizar el fondo fijo.'));}
  finally{submitting.current=false;setBusy(false);}
 }
 return <AppShell title="Fondo fijo" breadcrumb="Administración / Configuración / Caja / Fondo fijo"><div className="cash-record-page">
  <PageHeader title="Fondo fijo de caja" action={<a className="button secondary" href="/configuracion/caja">Volver a Configuración</a>}/>
  {error&&<div className="inline-alert error" role="alert">{error}</div>}
  {!state&&loading?<div className="state-box">Cargando configuración…</div>:state&&<form className="cash-record-section cash-fund-form" onSubmit={submit} noValidate>
   <h2>{state.caja.nombre}</h2><p>Fondo fijo objetivo actual: <strong>{state.caja.fondoFijoObjetivo===null?'Sin configurar':money.format(state.caja.fondoFijoObjetivo)}</strong></p>
   <p className="cash-record-help">El fondo fijo es el importe de referencia para la apertura. El efectivo inicial se cuenta y registra en cada apertura, porque puede ser diferente.</p>
   <FormField label="Nuevo fondo fijo objetivo *" value={amount} inputMode="decimal" disabled={busy||Boolean(state.sesion)} placeholder="0,00" onChange={e=>setAmount(e.target.value)}/>
   {state.sesion&&<div className="inline-alert" role="status">Para modificar el fondo fijo, primero cerrá la caja.</div>}
   {message&&<div className="inline-alert" role="status">{message}</div>}
   <div className="cash-record-actions"><button className="button primary" type="submit" disabled={busy||Boolean(state.sesion)}>{busy?'Guardando…':'Guardar fondo fijo'}</button></div>
  </form>}
 </div></AppShell>;
}
