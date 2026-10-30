import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '../../../services/apiClient';
import { recortesApi, type Recorte, type StockRecorte } from '../../../services/recortesApi';
import type { Lookup } from '../../../services/suppliesApi';

export function useRecortesCatalog() {
  const [recortes, setRecortes] = useState<Recorte[]>([]);
  const [stock, setStock] = useState<StockRecorte[]>([]);
  const [states, setStates] = useState<Lookup[]>([]);
  const [deposits, setDeposits] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [cuts, stocks, stateList, depositList] = await Promise.all([
        recortesApi.list(), recortesApi.stock(), recortesApi.states(), recortesApi.deposits(),
      ]);
      setRecortes(cuts); setStock(stocks); setStates(stateList); setDeposits(depositList);
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron cargar los recortes.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return { recortes, stock, states, deposits, loading, error, load };
}
