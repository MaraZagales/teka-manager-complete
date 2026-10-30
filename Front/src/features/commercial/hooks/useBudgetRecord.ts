import { useCallback, useEffect, useState } from "react";
import { detallePresupuesto, type PresupuestoDetalle } from "../../../services/commercialOperationsApi";

const records = new Map<number, PresupuestoDetalle>();
const pendingRecords = new Map<number, Promise<PresupuestoDetalle>>();

function requestRecord(id: number, force: boolean) {
  if (!force) {
    const cached = records.get(id); if (cached) return Promise.resolve(cached);
    const pending = pendingRecords.get(id); if (pending) return pending;
  }
  const request = detallePresupuesto(id).then((detail) => { records.set(id, detail); return detail; }).finally(() => pendingRecords.delete(id));
  pendingRecords.set(id, request); return request;
}

export function invalidateBudgetRecord(id?: number) { if (id) records.delete(id); }

export function useBudgetRecord(id?: number) {
  const [budget, setBudget] = useState<PresupuestoDetalle | null>(() => id ? records.get(id) || null : null);
  const [loading, setLoading] = useState(Boolean(id && !records.has(id)));
  const [error, setError] = useState("");
  const load = useCallback(async (force = false) => {
    if (!id) { setBudget(null); setLoading(false); return; }
    setLoading(true); setError("");
    try { setBudget(await requestRecord(id, force)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo cargar el presupuesto."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (id && !records.has(id)) void load(); }, [id, load]);
  return { budget, loading, error, load };
}
