import { useCallback, useEffect, useRef, useState } from "react";
import { listarActividades, type Actividad } from "../../../services/commercialOperationsApi";
import { salesOrdersApi, type SalesCustomer } from "../../../services/salesOrdersApi";
import { rememberActivity } from "./useActivityRecord";

export type AgendaCatalogScope = "list" | "create" | "view" | "edit";
const CUSTOMER_CACHE = "agenda-customers-v2";
const CACHE_TTL = 5 * 60 * 1000;
const pending = new Map<string, Promise<unknown>>();

function readCustomers() {
  try { const raw = sessionStorage.getItem(CUSTOMER_CACHE); if (!raw) return [] as SalesCustomer[]; const value = JSON.parse(raw) as { savedAt: number; rows: SalesCustomer[] }; return value.savedAt && Date.now() - value.savedAt <= CACHE_TTL ? value.rows : []; } catch { return []; }
}
function storeCustomers(rows: SalesCustomer[]) { try { sessionStorage.setItem(CUSTOMER_CACHE, JSON.stringify({ savedAt: Date.now(), rows })); } catch { /* Caché opcional. */ } }
function requestOnce<T>(key: string, request: () => Promise<T>) { const active = pending.get(key) as Promise<T> | undefined; if (active) return active; const next = request().finally(() => pending.delete(key)); pending.set(key, next); return next; }

export function useAgendaCatalog(scope: AgendaCatalogScope, from?: string, to?: string) {
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>(() => scope === "list" || scope === "create" ? readCustomers() : []);
  const [loading, setLoading] = useState(scope === "list" || scope === "create");
  const [error, setError] = useState("");
  const requestSequence = useRef(0);

  const load = useCallback(async (force = false) => {
    if (scope === "view" || scope === "edit") { setLoading(false); return; }
    const requestId = ++requestSequence.current;
    setLoading(true); setError("");
    try {
      const cachedCustomers = force ? [] : readCustomers();
      if (scope === "create") {
        if (requestId === requestSequence.current) setCustomers([]); return;
      }
      const [activityRows, customerRows] = await Promise.all([
        requestOnce(`activities:${from || ""}:${to || ""}`, () => listarActividades(from, to)),
        cachedCustomers.length ? Promise.resolve(cachedCustomers) : requestOnce("customers", salesOrdersApi.customers),
      ]);
      if (!cachedCustomers.length) storeCustomers(customerRows);
      const enriched = activityRows.map((activity) => { const customer = customerRows.find((item) => item.clienteId === activity.clienteId); const row = activity.clienteNombre || activity.clienteApellido ? activity : { ...activity, clienteNombre: customer?.nombre || null, clienteApellido: customer?.apellido || null }; rememberActivity(row); return row; });
      if (requestId === requestSequence.current) { setCustomers(customerRows); setActivities(enriched); }
    } catch (caught) { if (requestId === requestSequence.current) setError(caught instanceof Error ? caught.message : "No se pudo cargar la Agenda comercial."); }
    finally { if (requestId === requestSequence.current) setLoading(false); }
  }, [scope, from, to]);

  useEffect(() => { void load(); }, [load]);
  const patchActivity = useCallback((id: number, changes: Partial<Actividad>) => setActivities((current) => current.map((activity) => { if (activity.actividadComercialId !== id) return activity; const next = { ...activity, ...changes }; rememberActivity(next); return next; })), []);
  const addActivity = useCallback((activity: Actividad) => { rememberActivity(activity); setActivities((current) => [...current, activity].sort((left, right) => left.fechaProgramada.localeCompare(right.fechaProgramada))); }, []);
  return { activities, customers, loading, error, load, patchActivity, addActivity };
}
