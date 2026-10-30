import * as XLSX from 'xlsx';
import type {BankImportRow} from '../../../services/cashBankApi';

/** Formato explícito: no adivina débitos/créditos ni inventa IDs bancarios. */
export function parseBankExtract(data:ArrayBuffer,name:string):BankImportRow[]{
  if(data.byteLength>5_000_000||!(/\.(csv|xlsx)$/i.test(name)))throw new Error('Seleccioná un archivo CSV o XLSX de hasta 5 MB.');
  const book=XLSX.read(data,{type:'array',cellDates:true,raw:true,sheetRows:1002});
  if(book.SheetNames.length!==1)throw new Error('El extracto debe contener una sola hoja.');
  const sheet=book.Sheets[book.SheetNames[0]];
  if(Object.values(sheet).some(cell=>cell&&typeof cell==='object'&&'f' in cell))throw new Error('No se admiten fórmulas en el extracto.');
  const values=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',raw:true,blankrows:false});
  if(values.length<2||values.length>1001)throw new Error('El extracto debe contener entre 1 y 1000 movimientos.');
  const headers=values[0].map(value=>String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
  const required=['fecha','tipo','importe','descripcion','referencia','id'];
  if(new Set(headers).size!==headers.length||!required.every(key=>headers.includes(key)))throw new Error('Columnas requeridas: fecha, tipo, importe, descripcion, referencia, id. El id debe provenir del banco.');
  return values.slice(1).map((row,index)=>{
    const value=(key:string)=>row[headers.indexOf(key)];
    const rawDate=value('fecha');
    const fecha=rawDate instanceof Date?`${rawDate.getFullYear()}-${String(rawDate.getMonth()+1).padStart(2,'0')}-${String(rawDate.getDate()).padStart(2,'0')}`:String(rawDate).trim();
    const rawAmount=value('importe');const amountText=String(rawAmount).trim();
    const importe=typeof rawAmount==='number'?rawAmount:/^\d+(?:[.,]\d{1,2})?$/.test(amountText)?Number(amountText.replace(',','.')):NaN;
    const type=String(value('tipo')).trim().toLowerCase();const tipo=type==='ingreso'?'Ingreso':type==='egreso'?'Egreso':null;
    if(typeof value('id')!=='string')throw new Error(`Fila ${index+2}: el id bancario debe estar guardado como texto para conservar ceros y precisión.`);
    const descripcion=String(value('descripcion')).trim(),referencia=String(value('referencia')).trim()||null,idBanco=String(value('id')).trim();
    const date=new Date(`${fecha}T12:00:00Z`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==fecha||!tipo||!Number.isFinite(importe)||importe<=0||importe>999999999999.99||Math.abs(importe*100-Math.round(importe*100))>0.000001||!descripcion||descripcion.length>500||!idBanco||idBanco.length>150||(referencia?.length||0)>150)
      throw new Error(`Fila ${index+2}: revisá fecha AAAA-MM-DD, tipo Ingreso/Egreso, importe positivo, descripción e id bancario.`);
    return {fecha,tipo,importe,descripcion,referencia,idBanco};
  });
}
