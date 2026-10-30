import { useCallback, useEffect, useRef, useState } from "react";
import { detalleOportunidad, listarActividades, listarPresupuestos, type Actividad, type OpportunityDetail, type Presupuesto } from "../../../services/commercialOperationsApi";

const records = new Map<number, OpportunityDetail>();
const pending = new Map<number, Promise<OpportunityDetail>>();
const relationCache = new Map<number, { at:number; activities:Actividad[]; budgets:Presupuesto[] }>();
const relationPending = new Map<number, Promise<{ activities:Actividad[]; budgets:Presupuesto[] }>>();
const RELATION_TTL = 60 * 1000;

export function rememberOpportunity(value: OpportunityDetail) { records.set(value.oportunidadComercialId, value); }

function requestRelations(id:number){
  const cached=relationCache.get(id);if(cached&&Date.now()-cached.at<RELATION_TTL)return Promise.resolve(cached);
  const active=relationPending.get(id);if(active)return active;
  const request=Promise.all([listarActividades(),listarPresupuestos(id)]).then(([allActivities,budgets])=>{const result={at:Date.now(),activities:allActivities.filter((item)=>item.oportunidadComercialId===id),budgets};relationCache.set(id,result);return result}).finally(()=>relationPending.delete(id));
  relationPending.set(id,request);return request;
}

export function useOpportunityRecord(id?: number, includeRelations = false) {
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(() => id ? records.get(id) || null : null);
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [budgets, setBudgets] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [relationsLoading, setRelationsLoading] = useState(includeRelations);
  const [relationsError, setRelationsError] = useState("");
  const sequence = useRef(0);

  const load = useCallback(async (force = false) => {
    if (!id) { setLoading(false); return; }
    const requestId = ++sequence.current; setLoading(true); setError(""); setRelationsError("");
    try {
      let detailRequest = !force && records.has(id) ? Promise.resolve(records.get(id)!) : pending.get(id);
      if (!detailRequest) {
        detailRequest = detalleOportunidad(id).then((value) => { rememberOpportunity(value); return value; }).finally(() => pending.delete(id));
        pending.set(id, detailRequest);
      }
      const detail = await detailRequest;
      if (requestId === sequence.current) {
        setOpportunity(detail);
        setLoading(false);
      }
      if (includeRelations) {
        setRelationsLoading(true);
        try {
          const relations=await requestRelations(id);
          if(requestId===sequence.current){setActivities(relations.activities);setBudgets(relations.budgets)}
        } catch(caught) {
          if(requestId===sequence.current)setRelationsError(caught instanceof Error?caught.message:"No se pudo cargar la información relacionada.");
        } finally {
          if(requestId===sequence.current)setRelationsLoading(false);
        }
      }
    } catch (caught) { if (requestId === sequence.current) setError(caught instanceof Error ? caught.message : "No se pudo cargar la oportunidad."); }
    finally { if (requestId === sequence.current) setLoading(false); }
  }, [id, includeRelations]);

  useEffect(() => { void load(); }, [load]);
  const patch = useCallback((changes: Partial<OpportunityDetail>) => setOpportunity((current) => { if (!current) return current; const next = { ...current, ...changes }; rememberOpportunity(next); return next; }), []);
  return { opportunity, activities, budgets, loading, error, relationsLoading, relationsError, load, patch };
}
