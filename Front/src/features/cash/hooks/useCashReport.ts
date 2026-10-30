import {useEffect,useState} from 'react';
import {loadCashReport,cashReportRows,type CashReportKind,type CashReportFilters,type CashReportData} from '../../../services/cashReportsApi';
import type {ReportRecord} from '../../../services/inventoryAnalyticsReports';
import {apiErrorMessage} from '../../../services/apiClient';
export function useCashReport(kind:CashReportKind,filters:CashReportFilters,page:number,retry:number){
  const [data,setData]=useState<CashReportData|null>(null),[rows,setRows]=useState<ReportRecord[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{const abort=new AbortController();let active=true;setError('');
    if(kind==='bancos'&&!filters.cuenta){setData(null);setRows([]);setLoading(false);return;}
    setLoading(true);void loadCashReport(kind,filters,page,false,abort.signal).then(result=>{const parsed=cashReportRows(kind,result.filas);if(active){setData(result);setRows(parsed);}}).catch(caught=>{if(active){setData(null);setRows([]);setError(apiErrorMessage(caught,'No se pudo consultar el reporte.'));}}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;abort.abort();};
  },[kind,filters,page,retry]);return {data,rows,loading,error};
}
