import { useEffect, useState } from "react";
import { suppliesApi, type Supply } from "../../../services/suppliesApi";

export function useSupplyRecord(supplyId?: number) {
  const [supply, setSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(Boolean(supplyId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supplyId) { setSupply(null); setLoading(false); return; }
    let active = true;
    setLoading(true); setError("");
    void suppliesApi.getById(supplyId)
      .then((item) => { if (active) setSupply(item); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "No se pudo consultar el insumo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [supplyId]);

  return { supply, loading, error };
}
