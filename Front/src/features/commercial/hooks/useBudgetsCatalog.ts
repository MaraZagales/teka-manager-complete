import { useCallback, useEffect, useState } from "react";
import { obtenerOportunidades, type Oportunidad } from "../../../services/commercialApi";
import { listarPresupuestos, type Presupuesto } from "../../../services/commercialOperationsApi";
import { productsApi, type Product } from "../../../services/productsApi";
import { salesOrdersApi, type SalesCustomer } from "../../../services/salesOrdersApi";

export type BudgetCatalogScope = "list" | "create" | "edit" | "view";
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_PREFIX = "budget-catalog:";
const pending = new Map<string, Promise<unknown>>();

function readCache<T>(key: string): T[] {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return [];
    const cached = JSON.parse(raw) as { savedAt: number; rows: T[] };
    if (!cached.savedAt || Date.now() - cached.savedAt > CACHE_TTL || !Array.isArray(cached.rows)) return [];
    return cached.rows;
  } catch { return []; }
}
function writeCache<T>(key: string, rows: T[]) {
  try { sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ savedAt: Date.now(), rows })); } catch { /* El catálogo sigue disponible en memoria. */ }
}
function requestOnce<T>(key: string, request: () => Promise<T>): Promise<T> {
  const active = pending.get(key) as Promise<T> | undefined;
  if (active) return active;
  const next = request().finally(() => pending.delete(key));
  pending.set(key, next); return next;
}

export function useBudgetsCatalog(scope: BudgetCatalogScope) {
  const [budgets, setBudgets] = useState<Presupuesto[]>([]);
  const [customers, setCustomers] = useState<SalesCustomer[]>(() => scope === "create" ? readCache<SalesCustomer>("customers") : []);
  const [products, setProducts] = useState<Product[]>(() => scope === "list" ? [] : readCache<Product>("products"));
  const [opportunities, setOpportunities] = useState<Oportunidad[]>(() => scope === "create" ? readCache<Oportunidad>("opportunities") : []);
  const [loading, setLoading] = useState(scope !== "view");
  const [error, setError] = useState("");
  const [catalogError, setCatalogError] = useState("");

  const load = useCallback(async (force = false) => {
    
    setLoading(true); setError(""); setCatalogError("");
    try {
      if (scope === "list") {
        setBudgets(await requestOnce("budgets", listarPresupuestos));
        return;
      }
      if (scope === "edit" || scope === "view") {
        const cached = force ? [] : readCache<Product>("products");
        const rows = cached.length ? cached : (await requestOnce("products", productsApi.list)).filter((item) => item.activo);
        if (!cached.length) writeCache("products", rows);
        setProducts(rows);
        return;
      }
      const cachedProducts = force ? [] : readCache<Product>("products");
      const cachedOpportunities = force ? [] : readCache<Oportunidad>("opportunities");
      const [productRows, opportunityRows] = await Promise.all([
        cachedProducts.length ? Promise.resolve(cachedProducts) : requestOnce("products", productsApi.list).then((rows) => rows.filter((item) => item.activo)),
        cachedOpportunities.length ? Promise.resolve(cachedOpportunities) : requestOnce("opportunities", obtenerOportunidades),
      ]);
      if (!cachedProducts.length) writeCache("products", productRows);
      if (!cachedOpportunities.length) writeCache("opportunities", opportunityRows);
      setProducts(productRows); setOpportunities(opportunityRows);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "No se pudo cargar la información requerida.";
      if (scope === "list") setError(message); else setCatalogError(message);
    } finally { setLoading(false); }
  }, [scope]);

  useEffect(() => { void load(); }, [load]);
  const patchBudget = useCallback((id: number, patch: Partial<Presupuesto>) => setBudgets((current) => current.map((budget) => budget.presupuestoComercialId === id ? { ...budget, ...patch } : budget)), []);
  return { budgets, customers, products, opportunities, loading, error, catalogError, load, patchBudget };
}
