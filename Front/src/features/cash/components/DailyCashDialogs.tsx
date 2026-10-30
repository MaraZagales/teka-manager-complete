import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Modal } from '../../../components/data/Modal';
import { FormField } from '../../../components/ui/FormField';
import { apiErrorMessage } from '../../../services/apiClient';
import { dailyCashApi, type DailyCashState } from '../../../services/dailyCashApi';
import { formatDateTime, money } from '../cashFormat';
import { cashAmount, cashAmountError, cashDifference } from '../utils/dailyCashMoney';
import { CashSessionTable, CashTurnSummary } from './CashSessionTable';

export type DailyCashDialogKind='open'|'fund'|'count'|'close';
type Props={kind:DailyCashDialogKind;state:DailyCashState;busy:boolean;blocked:boolean;onClose:()=>void;execute:(action:()=>Promise<unknown>,success:string)=>Promise<DailyCashState|null>};
export function DailyCashDialogs({kind,state,busy,blocked,onClose,execute}:Props) {
  const [amount,setAmount]=useState(kind==='fund'&&state.caja.fondoFijoObjetivo!==null?String(state.caja.fondoFijoObjetivo):'');
  const [notes,setNotes]=useState(state.ultimoArqueo?.observaciones&&kind==='close'?state.ultimoArqueo.observaciones:'');
  const [errors,setErrors]=useState<Record<string,string>>({}),[error,setError]=useState('');
  const [recount,setRecount]=useState(false);
  const submitting=useRef(false),formRef=useRef<HTMLFormElement>(null);
  const busyRef=useRef(busy);busyRef.current=busy;
  const titleId=useId();
  const session=state.sesion,count=state.ultimoArqueo;
  const needsCount=kind==='close'&&(!count?.vigente||recount),showAmount=kind!=='close'||needsCount;
  const expected=kind==='open'?state.caja.fondoFijoObjetivo:session?.efectivoEsperado;
  const amountError=cashAmountError(amount,kind!=='fund');
  const difference=!amountError&&expected!=null?cashDifference(cashAmount(amount),expected):null;
  const disabled=busy||blocked;
  useEffect(()=>{
    const modal=formRef.current?.closest<HTMLElement>('.modal');if(!modal)return;
    const previous=document.activeElement as HTMLElement|null;
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby',titleId);
    const heading=modal.querySelector('h2');if(heading)heading.id=titleId;
    const timer=window.setTimeout(()=>formRef.current?.querySelector<HTMLElement>('input,textarea,button')?.focus(),0);
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();if(!busyRef.current)onClose();}
      if(event.key!=='Tab')return;
      const controls=Array.from(modal.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')).filter(item=>item.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    modal.addEventListener('keydown',key);return()=>{clearTimeout(timer);modal.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
  },[onClose,titleId]);
  async function submit(event:FormEvent) {
    event.preventDefault();if(disabled||submitting.current)return;
    const next:Record<string,string>={};
    if(showAmount&&amountError)next.amount=amountError;
    if(kind==='close'&&(needsCount?difference:count?.diferencia)!==0&&!notes.trim())next.notes='Justificá la diferencia para cerrar la caja.';
    if(notes.length>500)next.notes='Máximo 500 caracteres.';
    setErrors(next);setError('');if(Object.keys(next).length)return;
    submitting.current=true;
    try {
      let fresh:DailyCashState|null;
      if(kind==='open')fresh=await execute(()=>dailyCashApi.open(state.caja.cajaId,cashAmount(amount),notes.trim()),'Caja abierta.');
      else if(kind==='fund')fresh=await execute(()=>dailyCashApi.fixedFund(state.caja.cajaId,cashAmount(amount)),'Fondo fijo actualizado.');
      else if(!session)throw new Error('La sesión ya no está abierta. Actualizá la caja.');
      else if(kind==='count'||needsCount){
        fresh=await execute(()=>dailyCashApi.count(session.cajaSesionId,cashAmount(amount),notes.trim()),'Arqueo guardado.');
        if(kind==='close'){setRecount(false);if(!fresh?.ultimoArqueo?.vigente)setError('El arqueo se guardó, pero no se pudo verificar su vigencia. Actualizá la caja antes de cerrar.');return;}
      } else fresh=await execute(()=>dailyCashApi.close(session.cajaSesionId,notes.trim()),'Caja cerrada.');
      if(fresh)onClose();else setError('La operación se guardó, pero no se pudo recuperar el estado. Actualizá Caja diaria antes de continuar.');
    }catch(caught){setError(apiErrorMessage(caught,'No se pudo completar la operación.'));}finally{submitting.current=false;}
  }
  const titles={open:'Abrir caja',fund:'Configurar fondo fijo',count:'Realizar arqueo',close:'Cerrar caja'};
  return <Modal title={titles[kind]} wide={kind==='count'||kind==='close'} onClose={busy?()=>{}:onClose}>
    <form ref={formRef} className="daily-cash-form" noValidate onSubmit={submit}>
      <div className="daily-cash-form-context"><strong>{state.caja.nombre}</strong><span>{session?`${session.responsable} · ${formatDateTime(session.fechaApertura)}`:`Fondo fijo objetivo: ${state.caja.fondoFijoObjetivo===null?'Sin configurar':money.format(state.caja.fondoFijoObjetivo)}`}</span></div>
      {error&&<div className="inline-alert error" role="alert">{error}</div>}
      {blocked&&<div className="inline-alert error" role="alert">Actualizá Caja diaria antes de continuar.</div>}
      {(kind==='count'||kind==='close')&&session&&<><CashTurnSummary session={session}/><div className="cash-record-count-table"><CashSessionTable rows={state.movimientos} interactive={!disabled}/></div></>}
      {kind==='close'&&count&&<div className="daily-cash-count-summary"><div><span>{count.vigente?'Arqueo vigente':'Arqueo desactualizado'}</span><strong>{formatDateTime(count.fecha)} · {count.responsable}</strong></div><div><span>Contado</span><strong>{money.format(count.efectivoContado)}</strong></div><div><span>Diferencia</span><strong>{money.format(count.diferencia)}</strong></div></div>}
      {kind==='close'&&count?.vigente&&!recount&&<button className="button ghost" type="button" disabled={disabled} onClick={()=>{setRecount(true);setAmount('');}}>Realizar un nuevo recuento</button>}
      {showAmount&&<FormField label={`${kind==='fund'?'Fondo fijo objetivo':kind==='open'?'Efectivo inicial contado':'Efectivo contado'} *`} inputMode="decimal" autoComplete="off" value={amount} disabled={disabled} error={errors.amount} aria-invalid={Boolean(errors.amount)} placeholder="0,00" onBlur={()=>setErrors(current=>({...current,amount:amountError}))} onChange={e=>{setAmount(e.target.value);setErrors(current=>({...current,amount:''}));}}/>}
      {(kind==='open'||kind==='count'||needsCount)&&<div className="daily-cash-difference" role="status"><span>{kind==='open'?'Diferencia respecto del fondo fijo':'Diferencia de arqueo'}</span><strong>{difference===null?'Ingresá el efectivo contado':money.format(difference)}</strong></div>}
      {kind!=='fund'&&<label className="plain-field"><span>Observaciones{kind==='close'&&(needsCount?difference:count?.diferencia)!==0?' *':''}</span><textarea value={notes} maxLength={500} disabled={disabled} aria-invalid={Boolean(errors.notes)} onChange={e=>{setNotes(e.target.value);setErrors(current=>({...current,notes:''}));}}/>{errors.notes&&<small className="field-error">{errors.notes}</small>}</label>}
      {kind==='close'&&!needsCount&&<p className="daily-cash-help">Confirmá el cierre del turno. No se podrán registrar más movimientos; no se retirará efectivo automáticamente.</p>}
      <footer className="modal-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" disabled={disabled||!session&&['count','close'].includes(kind)||kind==='open'&&!(state.caja.fondoFijoObjetivo&&state.caja.fondoFijoObjetivo>0)} type="submit">{busy?'Guardando…':kind==='close'?needsCount?'Guardar recuento y revisar cierre':'Confirmar cierre':kind==='count'?'Guardar arqueo':kind==='fund'?'Guardar fondo fijo':'Abrir caja'}</button></footer>
    </form>
  </Modal>;
}
