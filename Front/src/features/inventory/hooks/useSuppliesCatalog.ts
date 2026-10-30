import { useCallback, useEffect, useState } from "react";
import { suppliesApi, type ColorLookup, type Lookup, type Supply, type UnitLookup } from "../../../services/suppliesApi";

export function useSuppliesCatalog() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [units, setUnits] = useState<UnitLookup[]>([]);
  const [reasons, setReasons] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [items, supplyTypes, supplyColors, supplyUnits, stateReasons] = await Promise.all([
        suppliesApi.list(), suppliesApi.supplyTypes(), suppliesApi.colors(), suppliesApi.units(), suppliesApi.inactivationReasons(),
      ]);
      setSupplies(items); setTypes(supplyTypes); setColors(supplyColors); setUnits(supplyUnits); setReasons(stateReasons);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar los insumos.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { supplies, types, colors, units, reasons, loading, error, load };
}
