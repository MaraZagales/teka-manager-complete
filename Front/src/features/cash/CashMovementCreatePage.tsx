import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { Modal } from '../../components/data/Modal';
import { FormField } from '../../components/ui/FormField';
import { ApiError, apiErrorMessage } from '../../services/apiClient';
import { dailyCashApi } from '../../services/dailyCashApi';
import { cashConceptsApi,type CashConceptCatalog } from '../../services/cashConceptsApi';
import {availableCashConcepts,cashConceptChoiceError} from './utils/cashConceptRules';
import { useDailyCash } from './hooks/useDailyCash';
import { money } from './cashFormat';
import { cashAmount, cashAmountError, validateCashMovement } from './utils/dailyCashMoney';
import './cashRecords.css';

export function CashMovementCreatePage() {
  const data=useDailyCash();
  const [type,setType]=useState(''),[amount,setAmount]=useState(''),[description,setDescription]=useState(''),[reference,setReference]=useState(''),[notes,setNotes]=useState('');
  const [errors,setErrors]=useState<Record<string,string>>({}),[error,setError]=useState('');
  const [busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[discard,setDiscard]=useState(false);
  const [uncertain,setUncertain]=useState(false);
  const [catalog,setCatalog]=useState<CashConceptCatalog|null>(null),[conceptId,setConceptId]=useState(''),[catalogError,setCatalogError]=useState(''),[catalogRetry,setCatalogRetry]=useState(0);
  useEffect(()=>{let active=true;setCatalogError('');setCatalog(null);void cashConceptsApi.list().then(result=>{if(active)setCatalog(result);}).catch(caught=>{if(active)setCatalogError(apiErrorMessage(caught,'No se pudo consultar el catálogo.'));});return()=>{active=false;};},[catalogRetry]);
  const operationKey=useRef<string | null>(null);
  const submitting=useRef(false);
  const leaving=useRef(false);
  const dirty=Boolean(type||amount||description||reference||notes)&&!saved;
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty&&!leaving.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  const session=data.state?.sesion;
  function cancel(){if(dirty)setDiscard(true);else location.href='/caja/diaria';}
  function validate(available:number) {
    const result=validateCashMovement({type,types:data.state?.tiposMovimiento||[],amount,description,reference,notes,available});
    if(catalog){const message=cashConceptChoiceError(catalog,type,conceptId);if(message)result.classification=message;}
    return result;
  }
  async function submit(e:FormEvent) {
    e.preventDefault();if(submitting.current||saved||uncertain||!session||!catalog||catalogError)return;
    let next=validate(session.efectivoEsperado);setErrors(next);if(Object.keys(next).length)return;
    submitting.current=true;setBusy(true);setError('');
    let sent=false;
    try {
      const fresh=await data.reload();
      if(!fresh.sesion||fresh.sesion.cajaSesionId!==session.cajaSesionId)throw new Error('La sesión cambió o se cerró. Volvé a Caja diaria.');
      next=validate(fresh.sesion.efectivoEsperado);setErrors(next);if(Object.keys(next).length)return;
      if (!operationKey.current) operationKey.current=crypto.randomUUID();
      sent=true;
      await dailyCashApi.movement(session.cajaSesionId,{tipo:type,importe:cashAmount(amount),concepto:description.trim(),referencia:reference.trim(),observaciones:notes.trim(),claveOperacion:operationKey.current,...(catalog.disponible?{cajaConceptoId:Number(conceptId)}:{})});
      // La escritura ya fue confirmada: nunca habilitar otro envío por un fallo posterior de navegación.
      setSaved(true);
      leaving.current=true;
      location.href='/caja/diaria?movimientoRegistrado=1';
    } catch(caught) {
      if(sent){setUncertain(true);}
      setError(apiErrorMessage(caught,'No se pudo registrar el movimiento.'));void data.reload().catch(()=>{});
    }
    finally{submitting.current=false;setBusy(false);}
  }
  const disabled=busy||data.loading||!session||Boolean(data.error)||saved||uncertain||!catalog||Boolean(catalogError);
  return <AppShell title="Registrar movimiento" breadcrumb="Caja / Caja diaria / Registrar movimiento"><div><form className="cash-record-page" noValidate onSubmit={submit}>
    <PageHeader title="Registrar movimiento de caja" action={<div className="cash-record-actions"><button className="button secondary" type="button" disabled={busy} onClick={cancel}>Cancelar</button><button className="button primary" type="submit" disabled={disabled}>{saved?'Registrado':busy?'Guardando…':'Guardar movimiento'}</button></div>}/>
    {(error||data.error)&&<div className="inline-alert error" role="alert">{error||data.error}{data.error&&<button className="button secondary" type="button" onClick={()=>void data.reload().catch(()=>{})}>Reintentar</button>}</div>}
    {uncertain&&<div className="inline-alert error" role="alert">No se pudo confirmar el resultado del envío. Para evitar duplicados, consultá los movimientos antes de iniciar otra alta. <a href="/caja/movimientos">Consultar movimientos</a></div>}
    {data.loading&&!data.state?<div className="state-box" role="status">Consultando sesión…</div>:!session?<div className="state-box"><strong>No hay una sesión abierta</strong><a className="button secondary" href="/caja/diaria">Volver a Caja diaria</a></div>:<>
      <section className="cash-record-section"><h2>Datos del movimiento</h2><div className="cash-record-grid">
        <FormField label="Caja" value={data.state?.caja.nombre||''} readOnly/>
        <label className="plain-field"><span>Tipo de movimiento *</span><select value={type} disabled={disabled} aria-invalid={Boolean(errors.type)} onChange={e=>{setType(e.target.value);setConceptId('');setErrors(current=>({...current,type:'',classification:''}));}}><option value="">Seleccioná un tipo</option>{data.state?.tiposMovimiento.map(item=><option value={item.codigo} key={item.codigo}>{item.codigo==='IngresoManual'?'Ingreso de caja':item.codigo==='Gasto'?'Egreso de caja':item.descripcion}</option>)}</select>{errors.type&&<small className="field-error">{errors.type}</small>}</label>
        <label className="plain-field"><span>Concepto{catalog?.disponible?' *':''}</span><select value={conceptId} disabled={disabled||!catalog?.disponible||!type} aria-invalid={Boolean(errors.classification)} onChange={e=>{setConceptId(e.target.value);setErrors(current=>({...current,classification:''}));}}><option value="">{!catalog?'Consultando conceptos…':!catalog.disponible?'Catálogo no disponible':!type?'Primero seleccioná el tipo':'Seleccioná un concepto'}</option>{availableCashConcepts(catalog,type).map(row=><option key={row.cajaConceptoId} value={row.cajaConceptoId}>{row.nombre}</option>)}</select>{errors.classification&&<small className="field-error">{errors.classification}</small>}</label>
        <FormField label="Importe *" value={amount} inputMode="decimal" autoComplete="off" disabled={disabled} error={errors.amount} aria-invalid={Boolean(errors.amount)} onBlur={()=>setErrors(current=>({...current,amount:cashAmountError(amount,false)}))} onChange={e=>{setAmount(e.target.value);setErrors(current=>({...current,amount:''}));}}/>
        <FormField label="Efectivo disponible" value={money.format(session.efectivoEsperado)} readOnly/>
        <div className="cash-record-span"><FormField label="Descripción / motivo *" value={description} maxLength={250} disabled={disabled} error={errors.description} aria-invalid={Boolean(errors.description)} onChange={e=>{setDescription(e.target.value);setErrors(current=>({...current,description:''}));}}/></div>
        <FormField label="Referencia documental" value={reference} maxLength={150} disabled={disabled} error={errors.reference} onChange={e=>setReference(e.target.value)}/>
        <label className="plain-field"><span>Observaciones</span><textarea value={notes} maxLength={500} disabled={disabled} onChange={e=>setNotes(e.target.value)}/>{errors.notes&&<small className="field-error">{errors.notes}</small>}</label>
      </div></section>
      {catalog?.disponible&&type&&availableCashConcepts(catalog,type).length===0&&<p className="field-hint">No hay conceptos activos para este tipo. <a href="/caja/movimientos/conceptos">Administrar conceptos</a></p>}
      {catalog&&!catalog.disponible&&<p className="field-hint">{catalog.mensaje} Por ahora se conserva el registro con descripción libre, sin clasificación.</p>}
      {catalogError&&<div className="inline-alert error" role="alert">{catalogError}<button className="button secondary" type="button" onClick={()=>setCatalogRetry(value=>value+1)}>Reintentar</button></div>}
    </>}
    </form>
    {discard&&<Modal title="Descartar movimiento" onClose={()=>setDiscard(false)}><div className="cash-record-modal-body"><p>Los datos ingresados todavía no se guardaron.</p><div className="modal-actions"><button type="button" className="button secondary" onClick={()=>setDiscard(false)}>Seguir editando</button><button type="button" className="button primary" onClick={()=>{leaving.current=true;location.href='/caja/diaria';}}>Descartar y volver</button></div></div></Modal>}
  </div></AppShell>;
}
