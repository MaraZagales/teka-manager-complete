import { useEffect, useState } from 'react';
import { apiErrorMessage } from '../../../services/apiClient';
import { cashApi, type BankAccount } from '../../../services/cashApi';
import { cashQueriesApi, type CashFinancialRow, type CashClosure, type CashQueryFilters, type CashFilterOptions } from '../../../services/cashQueriesApi';

export function useCashQueries(view: string, filters: CashQueryFilters, page: number, onPageChange: (page: number) => void, retry: number) {
  const [rows, setRows] = useState<CashFinancialRow[]>([]);
  const [closures, setClosures] = useState<CashClosure[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [options, setOptions] = useState<CashFilterOptions | null>(null);
  const [channels, setChannels] = useState<CashFilterOptions['canales']>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([cashQueriesApi.options(), cashApi.bankAccounts()])
      .then(([loadedOptions, loadedAccounts]) => {
        if (!active) return;
        setOptions(loadedOptions); setChannels(loadedOptions.canales); setAccounts(loadedAccounts); setLookupError('');
      })
      .catch(caught => { if (active) setLookupError(apiErrorMessage(caught, 'No se pudieron cargar los filtros.')); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    setLoading(true); setError('');
    const finishPage = (count: number, length: number) => {
      setTotal(count);
      if (page > 1 && !length) onPageChange(Math.max(1, Math.ceil(count / (view === 'movimientos' ? 5 : 10))));
    };
    const request = view === 'cierres'
      ? cashQueriesApi.closures(filters, page, abort.signal).then(result => {
          if (active) { setClosures(result.filas); finishPage(result.total, result.filas.length); }
        })
      : cashQueriesApi.financial(filters, page, abort.signal).then(result => {
          if (active) { setRows(result.filas); finishPage(result.total, result.filas.length); }
        });
    void request.catch(caught => {
      if (!active) return;
      setError(apiErrorMessage(caught, 'No se pudo consultar Caja.'));
      setRows([]); setClosures([]); setTotal(0);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; abort.abort(); };
  }, [filters, page, view, retry, onPageChange]);

  return { rows, closures, total, loading, error, lookupError, options, channels, accounts };
}
