import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inventoryStockApi, type DepositLookup, type StockProduct, type StockSupply } from "../../../services/inventoryStockApi";
import { productsApi, type Product } from "../../../services/productsApi";
import { suppliesApi, type Supply } from "../../../services/suppliesApi";
import { stockMovementsApi, type AnalyticMovement, type MovementSeriesPoint, type MovementSummary } from "../../../services/stockMovementsApi";
import type { InventoryReportData, InventoryReportFilters } from "../types/reports";
import { buildConsumption, buildReportStock, emptyMovementSummary } from "../utils/reportPresentation";

async function loadAllMovements(filters: InventoryReportFilters) {
  const query = { desde: filters.from, hasta: filters.to, clase: filters.classCode || undefined, depositoId: filters.depositId ? Number(filters.depositId) : undefined };
  const first = await stockMovementsApi.list(query, 1, 100);
  const pages = Math.ceil(first.totalFilas / 100);
  if (pages <= 1) return first.items;
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, index) => stockMovementsApi.list(query, index + 2, 100)));
  return [first, ...rest].flatMap((page) => page.items);
}

export function useInventoryReportData(filters: InventoryReportFilters): InventoryReportData {
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [productStock, setProductStock] = useState<StockProduct[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[]>([]);
  const [deposits, setDeposits] = useState<DepositLookup[]>([]);
  const [movements, setMovements] = useState<AnalyticMovement[]>([]);
  const [movementSeries, setMovementSeries] = useState<MovementSeriesPoint[]>([]);
  const [movementSummary, setMovementSummary] = useState<MovementSummary>(emptyMovementSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);

  const reload = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError("");
    const query = { desde: filters.from, hasta: filters.to, clase: filters.classCode || undefined, depositoId: filters.depositId ? Number(filters.depositId) : undefined };
    try {
      const [nextProducts, nextSupplies, nextProductStock, nextSupplyStock, nextDeposits, nextMovements, nextSeries, nextSummary] = await Promise.all([
        productsApi.list(), suppliesApi.list(), inventoryStockApi.products(), inventoryStockApi.supplies(), inventoryStockApi.deposits(),
        loadAllMovements(filters), stockMovementsApi.series(query), stockMovementsApi.summary(query),
      ]);
      if (current !== request.current) return;
      setProducts(nextProducts); setSupplies(nextSupplies); setProductStock(nextProductStock); setSupplyStock(nextSupplyStock);
      setDeposits(nextDeposits); setMovements(nextMovements); setMovementSeries(nextSeries); setMovementSummary(nextSummary);
    } catch (caught) {
      if (current !== request.current) return;
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar los reportes de inventario.");
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [filters.classCode, filters.depositId, filters.from, filters.to]);

  useEffect(() => { void reload(); }, [reload]);
  const stock = useMemo(() => buildReportStock(products, supplies, productStock, supplyStock, filters), [filters, productStock, products, supplies, supplyStock]);
  const consumption = useMemo(() => buildConsumption(movements, supplies), [movements, supplies]);
  return { loading, error, deposits, stock, movements, movementSeries, movementSummary, consumption, reload };
}
