import {useEffect,useState} from 'react';
import {cashApi,type BankAccount} from '../../../services/cashApi';
import {cashBankApi,type BankFilters,type BankQuery} from '../../../services/cashBankApi';
import {apiErrorMessage} from '../../../services/apiClient';
export function useBankReconciliation(filters:BankFilters,page:number,retry:number,pageSize=10){
  const [accounts,setAccounts]=useState<BankAccount[]>([]),[accountError,setAccountError]=useState(''),[accountsLoading,setAccountsLoading]=useState(true);
  const [data,setData]=useState<BankQuery|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  useEffect(()=>{let active=true;setAccountsLoading(true);void cashApi.bankAccounts().then(rows=>{if(active){setAccounts(rows);setAccountError('');}}).catch(caught=>{if(active)setAccountError(apiErrorMessage(caught,'No se pudieron consultar las cuentas.'));}).finally(()=>{if(active)setAccountsLoading(false);});return()=>{active=false;};},[retry]);
  useEffect(()=>{const abort=new AbortController();let active=true;setError('');if(!filters.cuenta){setData(null);setLoading(false);return;}setLoading(true);
    void cashBankApi.query(filters,page,abort.signal,pageSize).then(result=>{if(active)setData(result);}).catch(caught=>{if(active){setData(null);setError(apiErrorMessage(caught,'No se pudieron consultar los movimientos bancarios.'));}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;abort.abort();};
  },[filters,page,retry,pageSize]);return{accounts,accountError,accountsLoading,data,loading,error};
}
