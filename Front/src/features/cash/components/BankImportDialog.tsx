import {useRef,useState} from 'react';
import {Modal} from '../../../components/data/Modal';
import {DataTable,type DataTableColumn} from '../../../components/data/DataTable';
import {apiErrorMessage} from '../../../services/apiClient';
import {cashBankApi,type BankImportPayload,type BankPreview} from '../../../services/cashBankApi';
import {parseBankExtract} from '../utils/bankExtractImport';

export function BankImportDialog({account,currency,onClose,onImported}:{account:number;currency:string;onClose:()=>void;onImported:()=>void}){
  const money=new Intl.NumberFormat('es-AR',{style:'currency',currency});
  const [payload,setPayload]=useState<BankImportPayload|null>(null),[preview,setPreview]=useState<BankPreview|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(1),[uncertain,setUncertain]=useState(false);
  const guard=useRef(false);
  const fileInput=useRef<HTMLInputElement|null>(null);
  const [selectedFile,setSelectedFile]=useState('');
  async function fileSelected(file:File|undefined){if(!file||guard.current)return;setSelectedFile(file.name);guard.current=true;setBusy(true);setError('');setPreview(null);setPayload(null);try{const filas=parseBankExtract(await file.arrayBuffer(),file.name);const next={cuentaBancariaId:account,nombreArchivo:file.name,filas};const result=await cashBankApi.preview(next);setPayload(next);setPreview(result);setPage(1);}catch(caught){setError(apiErrorMessage(caught,'No se pudo validar el extracto.'));}finally{guard.current=false;setBusy(false);}}
  async function confirm(){if(!payload||!preview||guard.current||uncertain)return;guard.current=true;setBusy(true);setError('');try{await cashBankApi.confirm(payload);onImported();}catch(caught){setUncertain(true);setError(`${apiErrorMessage(caught,'No se pudo confirmar la importación.')} Cerrá y consultá el historial antes de reintentar. Los identificadores duplicados no se volverán a insertar.`);}finally{guard.current=false;setBusy(false);}}
  const columns:DataTableColumn<BankPreview['filas'][number]>[]=[{key:'fecha',header:'Fecha',width:'16%',render:row=>row.fecha},{key:'concepto',header:'Descripción',width:'32%',render:row=>row.descripcion},{key:'tipo',header:'Tipo',width:'12%',render:row=>row.tipo},{key:'importe',header:'Importe',width:'20%',className:'cash-record-money',headerClassName:'cash-record-money',render:row=>money.format(row.importe)},{key:'estado',header:'Validación',width:'20%',render:row=>row.duplicada?'Duplicado · se omite':'Nuevo'}];
  return <Modal wide title="Importar extracto" onClose={busy?()=>{}:onClose}><div className="daily-cash-form">
    <div className="plain-field"><span>Archivo CSV o XLSX</span><div className="bank-file-picker"><input ref={fileInput} className="bank-file-native" type="file" accept=".csv,.xlsx" disabled={busy||uncertain} aria-label="Seleccionar extracto CSV o Excel" onChange={event=>void fileSelected(event.target.files?.[0])}/><button type="button" className="button secondary" disabled={busy||uncertain} onClick={()=>fileInput.current?.click()}>Seleccionar archivo</button><span className="bank-file-name" title={selectedFile||'Ningún archivo seleccionado'}>{selectedFile||'Ningún archivo seleccionado'}</span></div></div>
    <details className="cash-record-help"><summary>Formato del archivo</summary><p>Una hoja, hasta 1000 filas. Columnas: fecha (AAAA-MM-DD), tipo (Ingreso/Egreso), importe positivo, descripcion, referencia e id único provisto por el banco.</p></details>
    {error&&<div className="inline-alert error" role="alert">{error}</div>}
    {preview&&<><p>{preview.nuevas} nuevos · {preview.duplicadas} duplicados{preview.archivoDuplicado?' · Extracto ya registrado':''}</p><DataTable tableClassName="cash-record-table" rows={preview.filas.slice((page-1)*10,page*10)} columns={columns} rowKey={(_row)=>`${page}-${preview.filas.indexOf(_row)}`} page={page} pageSize={10} totalRecords={preview.filas.length} onPageChange={setPage}/></>}
    <div className="modal-actions"><button className="button secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy||uncertain||!preview||preview.archivoDuplicado||!preview.nuevas} onClick={()=>void confirm()}>{busy?'Procesando…':'Confirmar importación'}</button></div>
  </div></Modal>;
}
