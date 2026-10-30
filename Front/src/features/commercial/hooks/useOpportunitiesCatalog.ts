import { useCallback, useEffect, useRef, useState } from "react";
import type { Oportunidad } from "../../../services/commercialApi";
import {
  canalesVenta, estadosOportunidad, listarActividades, listarOportunidades,
  productosOportunidad, type Actividad, type OpportunityCatalogProduct,
  type OpportunityCustomer, type OpportunityLookup,
} from "../../../services/commercialOperationsApi";

export type OpportunitiesCatalogScope = "list" | "create" | "view" | "edit";
const TTL = 5 * 60 * 1000;
const pending = new Map<string, Promise<unknown>>();
const cache = new Map<string, { at: number; value: unknown }>();

function once<T>(key: string, request: () => Promise<T>, force = false) {
  const saved = cache.get(key);
  if (!force && saved && Date.now() - saved.at < TTL) return Promise.resolve(saved.value as T);
  const active = pending.get(key) as Promise<T> | undefined;
  if (!force && active) return active;
  const next = request().then((value) => { cache.set(key, { at: Date.now(), value }); return value; }).finally(() => pending.delete(key));
  pending.set(key, next); return next;
}

export function useOpportunitiesCatalog(scope: OpportunitiesCatalogScope) {
  const [opportunities, setOpportunities] = useState<Oportunidad[]>([]);
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [customers, setCustomers] = useState<OpportunityCustomer[]>([]);
  const [products, setProducts] = useState<OpportunityCatalogProduct[]>([]);
  const [channels, setChannels] = useState<OpportunityLookup[]>([]);
  const [states, setStates] = useState<OpportunityLookup[]>([]);
  const [loading, setLoading] = useState(scope !== "view");
  const [error, setError] = useState("");
  const sequence = useRef(0);

  const load = useCallback(async (force = false) => {
    if (scope === "view") { setLoading(false); return; }
    const current = ++sequence.current; setLoading(true); setError("");
    try {
      if (scope === "list") {
        const [rows, agenda] = await Promise.all([
          once("opportunities", listarOportunidades, force),
          once("opportunity-activities", () => listarActividades(), force),
        ]);
        if (current === sequence.current) { setOpportunities(rows); setActivities(agenda); }
        return;
      }
      const [productResult, channelResult, stateResult] = await Promise.allSettled([
        once("opportunity-products", productosOportunidad, force),
        once("opportunity-channels", canalesVenta, force),
        once("opportunity-states", estadosOportunidad, force),
      ]);
      if (productResult.status === "rejected" || channelResult.status === "rejected" || stateResult.status === "rejected") throw new Error("No se pudieron cargar los catálogos necesarios para la oportunidad.");
      if (current === sequence.current) {
        setProducts(productResult.value.filter((item) => item.activo !== false));
        setChannels(channelResult.value); setStates(stateResult.value);
      }
    } catch (caught) { if (current === sequence.current) setError(caught instanceof Error ? caught.message : "No se pudieron cargar las oportunidades."); }
    finally { if (current === sequence.current) setLoading(false); }
  }, [scope]);

  useEffect(() => { void load(); }, [load]);
  const patchOpportunity = useCallback((id: number, changes: Partial<Oportunidad>) => setOpportunities((current) => current.map((row) => row.oportunidadComercialId === id ? { ...row, ...changes } : row)), []);
  return { opportunities, activities, customers, products, channels, states, loading, error, load, patchOpportunity };
}
