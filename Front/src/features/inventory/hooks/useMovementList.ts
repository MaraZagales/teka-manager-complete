import { useCallback, useEffect, useRef, useState } from "react";
import { stockMovementsApi, type AnalyticMovement } from "../../../services/stockMovementsApi";
import type { MovementListFilters } from "../types/movements";
import { filterCompleteMovements, MOVEMENT_PAGE_SIZE, toAnalyticFilters } from "../utils/movementPresentation";

export function useMovementList(filters: MovementListFilters, page: number) {
  const [rows, setRows] = useState<AnalyticMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);

  const load = useCallback(async () => {
    const current = ++request.current;
    if (!filters.from || !filters.to || filters.from > filters.to) {
      setRows([]); setTotal(0); setError("La fecha desde no puede ser posterior a la fecha hasta."); setLoading(false); return;
    }
    setLoading(true); setError("");
    try {
      if (filters.movementTypeId) {
        const filtered = filterCompleteMovements(await stockMovementsApi.all(), filters);
        if (current !== request.current) return;
        setTotal(filtered.length);
        setRows(filtered.slice((page - 1) * MOVEMENT_PAGE_SIZE, page * MOVEMENT_PAGE_SIZE));
      } else {
        const result = await stockMovementsApi.list(toAnalyticFilters(filters), page, MOVEMENT_PAGE_SIZE);
        if (current !== request.current) return;
        setRows(result.items); setTotal(result.totalFilas);
      }
    } catch (caught) {
      if (current !== request.current) return;
      setRows([]); setTotal(0); setError(caught instanceof Error ? caught.message : "No se pudieron cargar los movimientos.");
    } finally { if (current === request.current) setLoading(false); }
  }, [filters, page]);

  useEffect(() => { void load(); }, [load]);
  return { rows, total, loading, error, load };
}
