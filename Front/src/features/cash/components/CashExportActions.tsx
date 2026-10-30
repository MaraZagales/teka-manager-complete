import {useRef,useState} from 'react';
import {InventoryExportActions} from '../../../components/data/InventoryExportActions';
import {hasPermission} from '../../../services/authorization';
import {apiErrorMessage} from '../../../services/apiClient';
import {loadCashReport,cashReportRows,cashReportDefinitions,type CashReportFilters,type CashReportKind} from '../../../services/cashReportsApi';

export function CashExportActions({kind,filters,disabled=false,accountLabel}:{kind:CashReportKind;filters:CashReportFilters;disabled?:boolean;accountLabel?:string}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');const guard=useRef(false);
  async function run(pdf:boolean){if(guard.current)return;guard.current=true;setBusy(true);setError('');try{
    const result=await loadCashReport(kind,filters,1,true);const definition=cashReportDefinitions[kind];
    const records=cashReportRows(kind,result.filas).map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,typeof value==='string'&&/^[=+\-@]/.test(value)?`'${value}`:value])));
    const exporters=await import('../../../services/inventoryAnalyticsReports');
    const period=`Desde ${filters.desde||'inicio'} hasta ${filters.hasta||'hoy'}`;
    const warning='Datos de los libros registrados. Integraciones de otros módulos pendientes; no representa el flujo neto empresarial.';
    const management={objective:definition.title,period,executiveSummary:`${result.total} registros según filtros aplicados.`,interpretations:[],limitations:[warning]};
    const summary=[{label:'Registros',value:result.total,denominator:'Conjunto filtrado completo'}];
    (pdf?exporters.inventoryAnalyticsPdf:exporters.inventoryAnalyticsExcel)(definition.title,`${period} · Cuenta ${accountLabel||(filters.cuenta?'seleccionada':'todas')} · Estado ${filters.estado||'todos'} · Búsqueda ${filters.buscar||'sin filtro'}`,definition.columns,records,warning,summary,management);
  }catch(caught){setError(apiErrorMessage(caught,'No se pudo exportar el reporte completo.'));}finally{guard.current=false;setBusy(false);}}
  return <div><InventoryExportActions allowed={hasPermission('Caja','Exportar')} disabled={disabled} exporting={busy} onExcel={()=>void run(false)} onPdf={()=>void run(true)}/>{error&&<p className="field-error" role="alert">{error}</p>}</div>;
}
