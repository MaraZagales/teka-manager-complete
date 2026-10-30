import { useRef, useState, type FormEvent } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { FormField } from '../../components/ui/FormField';
import { useDailyCash } from './hooks/useDailyCash';
import { dailyCashApi } from '../../services/dailyCashApi';
import { apiErrorMessage } from '../../services/apiClient';
import { cashAmount, cashAmountError, cashDifference } from './utils/dailyCashMoney';
import { money, formatDateTime } from './cashFormat';
import { CashTurnSummary } from './components/CashSessionTable';
import './cashRecords.css';
import './dailyCash.css';

/** El cierre es una página, no un modal. Respeta los dos pasos existentes de API: arqueo y cierre. */
export function CashClosePage() {
  const {state,loading,error,reload}=useDailyCash();
  const [amount,setAmount]=useState('');
  const [notes,setNotes]=useState('');
  const [formError,setFormError]=useState('');
  const [busy,setBusy]=useState(false);
  const [countSaved,setCountSaved]=useState(false);
  const [forceRecount,setForceRecount]=useState(false);
  const submitting=useRef(false);
  const session=state?.sesion;
  const count=state?.ultimoArqueo;
  const validCount=Boolean(count?.vigente);
  const needsCount=!validCount || forceRecount || (!countSaved && Boolean(amount));
  const amountProblem=cashAmountError(amount);
  const difference=amountProblem||!session?null:cashDifference(cashAmount(amount),session.efectivoEsperado);
  const finalDifference=needsCount?difference:count?.diferencia;
  async function submit(event:FormEvent) {
    event.preventDefault();if(submitting.current||!session||busy)return;
    if(needsCount&&amountProblem){setFormError(amountProblem);return;}
    if(finalDifference!==null&&finalDifference!==undefined&&finalDifference!==0&&!notes.trim()&&!(count?.observaciones&&!needsCount)){setFormError('Justificá la diferencia de efectivo antes de cerrar.');return;}
    if(notes.length>500){setFormError('Las observaciones admiten hasta 500 caracteres.');return;}
    submitting.current=true;setBusy(true);setFormError('');
    try {
      const fresh=await dailyCashApi.state();
      if(!fresh.sesion||fresh.sesion.cajaSesionId!==session.cajaSesionId)throw new Error('La sesión cambió. Volvé a Caja diaria.');
      if(needsCount){
        await dailyCashApi.count(session.cajaSesionId,cashAmount(amount),notes.trim());
        const updated=await reload();
        if(!updated.ultimoArqueo?.vigente)throw new Error('El recuento se guardó, pero no pudo verificarse su vigencia. Actualizá la página.');
        setCountSaved(true);setForceRecount(false);setAmount('');
      } else {
        if(!fresh.ultimoArqueo?.vigente)throw new Error('El arqueo dejó de estar vigente. Realizá otro recuento.');
        await dailyCashApi.close(session.cajaSesionId,notes.trim());
        location.href='/caja/diaria?cerrada=1';
      }
    }catch(caught){setFormError(apiErrorMessage(caught,'No se pudo completar el cierre.'));void reload().catch(()=>{});}
    finally{submitting.current=false;setBusy(false);}
  }
  return <AppShell title="Cerrar caja" breadcrumb="Caja / Caja diaria / Cerrar caja"><div className="cash-record-page cash-close-page">
    <PageHeader title="Cerrar caja" action={<a className="button secondary" href="/caja/diaria">Volver a Caja diaria</a>}/>
    {error&&<div className="inline-alert error" role="alert">{error}</div>}
    {loading&&!state?<div className="state-box">Cargando caja…</div>:!session?<div className="state-box"><strong>No hay una caja abierta.</strong><a href="/caja/diaria">Volver a Caja diaria</a></div>:<>
      <section className="cash-record-section"><h2>Resumen de caja</h2><p className="cash-record-help">{state?.caja.nombre} · Apertura: {formatDateTime(session.fechaApertura)} · Responsable: {session.responsable}</p><CashTurnSummary session={session}/></section>
      <form className="cash-record-section cash-close-form" onSubmit={submit} noValidate>
        <h2>{needsCount?'Recuento de efectivo':'Confirmar cierre'}</h2>
        {formError&&<div className="inline-alert error" role="alert">{formError}</div>}
        {needsCount?<>
          <FormField label="Efectivo contado *" value={amount} inputMode="decimal" autoComplete="off" disabled={busy} onChange={event=>{setAmount(event.target.value);setFormError('');}} placeholder="0,00"/>
          <div className="daily-cash-difference"><span>Diferencia con el saldo esperado</span><strong>{difference===null?'Ingresá el importe contado':money.format(difference)}</strong></div>
        </>:<>
          <div className="daily-cash-count-summary"><div><span>Efectivo contado</span><strong>{money.format(count!.efectivoContado)}</strong></div><div><span>Diferencia</span><strong>{money.format(count!.diferencia)}</strong></div></div>
          <button className="button secondary" type="button" disabled={busy} onClick={()=>{setAmount('');setCountSaved(false);setForceRecount(true);setFormError('');}}>Modificar recuento</button>
        </>}
        <label className="plain-field"><span>Observaciones{finalDifference!==null&&finalDifference!==undefined&&finalDifference!==0?' *':''}</span><textarea maxLength={500} value={notes} disabled={busy} onChange={event=>{setNotes(event.target.value);setFormError('');}}/></label>
        <div className="cash-record-actions"><a className="button secondary" href="/caja/diaria">Cancelar</a><button className="button primary" type="submit" disabled={busy}>{busy?'Procesando…':needsCount?'Guardar recuento y revisar':'Confirmar cierre'}</button></div>
      </form>
    </>}
  </div></AppShell>;
}
