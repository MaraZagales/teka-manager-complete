import { useCallback, useEffect, useState } from "react";
import { listarActividades, type Actividad } from "../../../services/commercialOperationsApi";

const CACHE_PREFIX = "agenda-activity:";
const CACHE_TTL = 5 * 60 * 1000;
const records = new Map<number, Actividad>();
const pending = new Map<number, Promise<Actividad | null>>();

function readStored(id: number) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${id}`); if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; activity: Actividad };
    return cached.savedAt && Date.now() - cached.savedAt <= CACHE_TTL ? cached.activity : null;
  } catch { return null; }
}
export function rememberActivity(activity: Actividad) {
  records.set(activity.actividadComercialId, activity);
  try { sessionStorage.setItem(`${CACHE_PREFIX}${activity.actividadComercialId}`, JSON.stringify({ savedAt: Date.now(), activity })); } catch { /* La copia en memoria sigue disponible. */ }
}
export function forgetActivity(id?: number) { if (id) { records.delete(id); sessionStorage.removeItem(`${CACHE_PREFIX}${id}`); } }

async function requestActivity(id: number, force: boolean) {
  if (!force) {
    const cached = records.get(id) || readStored(id); if (cached) { records.set(id, cached); return cached; }
    const active = pending.get(id); if (active) return active;
  }
  const request = listarActividades().then((rows) => {
    const activity = rows.find((item) => item.actividadComercialId === id) || null;
    if (activity) rememberActivity(activity); return activity;
  }).finally(() => pending.delete(id));
  pending.set(id, request); return request;
}

export function useActivityRecord(id?: number) {
  const initial = id ? records.get(id) || readStored(id) : null;
  if (id && initial) records.set(id, initial);
  const [activity, setActivity] = useState<Actividad | null>(initial);
  const [loading, setLoading] = useState(Boolean(id && !initial));
  const [error, setError] = useState("");
  const load = useCallback(async (force = false) => {
    if (!id) { setActivity(null); setLoading(false); return; }
    setLoading(true); setError("");
    try { setActivity(await requestActivity(id, force)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo cargar la actividad."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (id && !records.has(id)) void load(); }, [id, load]);
  const patch = useCallback((changes: Partial<Actividad>) => setActivity((current) => { if (!current) return current; const next = { ...current, ...changes }; rememberActivity(next); return next; }), []);
  return { activity, loading, error, load, patch };
}
