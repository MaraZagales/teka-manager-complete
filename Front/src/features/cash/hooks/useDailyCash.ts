import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '../../../services/apiClient';
import { dailyCashApi, type DailyCashState } from '../../../services/dailyCashApi';

export function useDailyCash() {
  const [state, setState] = useState<DailyCashState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const requestSequence = useRef(0);
  const submitting = useRef(false);
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true); setError('');
    try {
      const next = await dailyCashApi.state();
      if (mounted.current && sequence === requestSequence.current) setState(next);
      return next;
    } catch (caught) {
      if (mounted.current && sequence === requestSequence.current) setError(apiErrorMessage(caught, 'No se pudo actualizar Caja diaria.'));
      throw caught;
    } finally { if (mounted.current && sequence === requestSequence.current) setLoading(false); }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void reload().catch(() => {});
    return () => { mounted.current = false; requestSequence.current++; };
  }, [reload]);

  const execute = useCallback(async (action: () => Promise<unknown>, success: string) => {
    if (submitting.current) return null;
    submitting.current = true; setBusy(true);
    try {
      await action();
      setNotice(success);
      // Una escritura confirmada nunca se reenvía si falla la actualización posterior.
      try { return await reload(); }
      catch { return null; }
    } catch (caught) {
      try { await reload(); } catch { /* El estado de error bloquea nuevas acciones. */ }
      throw caught;
    } finally { submitting.current = false; if (mounted.current) setBusy(false); }
  }, [reload]);

  return { state, loading, error, busy, notice, setNotice, reload, execute };
}
