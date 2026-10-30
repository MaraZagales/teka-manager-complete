import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryStockApi, type StockProduct, type StockSupply } from "../../../services/inventoryStockApi";
import { productsApi, type Product } from "../../../services/productsApi";
import { suppliesApi, type Supply } from "../../../services/suppliesApi";
import { stockMovementsApi, type MovementLookup } from "../../../services/stockMovementsApi";
import { buildMovementArticles } from "../utils/movementPresentation";

export function useMovementCatalogs() {
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [deposits, setDeposits] = useState<MovementLookup[]>([]);
  const [types, setTypes] = useState<MovementLookup[]>([]);
  const [reasons, setReasons] = useState<MovementLookup[]>([]);
  const [productStock, setProductStock] = useState<StockProduct[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [productItems, supplyItems, depositItems, typeItems, reasonItems, productStocks, supplyStocks] = await Promise.all([
        productsApi.list(), suppliesApi.list(), stockMovementsApi.deposits(), stockMovementsApi.movementTypes(), stockMovementsApi.movementReasons(), inventoryStockApi.products(), inventoryStockApi.supplies(),
      ]);
      setProducts(productItems); setSupplies(supplyItems); setDeposits(depositItems); setTypes(typeItems); setReasons(reasonItems); setProductStock(productStocks); setSupplyStock(supplyStocks);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar los catálogos de inventario.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { products, supplies, deposits, types, reasons, productStock, supplyStock, articles: useMemo(() => buildMovementArticles(products, supplies), [products, supplies]), loading, error, load };
}
