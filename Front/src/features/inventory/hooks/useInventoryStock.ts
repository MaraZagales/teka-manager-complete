import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryStockApi } from "../../../services/inventoryStockApi";
import { productsApi } from "../../../services/productsApi";
import { suppliesApi } from "../../../services/suppliesApi";
import { buildProductStockRows, buildSupplyStockRows } from "../utils/stockPresentation";

export function useInventoryStock() {
  const [productStock, setProductStock] = useState<Awaited<ReturnType<typeof inventoryStockApi.products>>>([]);
  const [supplyStock, setSupplyStock] = useState<Awaited<ReturnType<typeof inventoryStockApi.supplies>>>([]);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof productsApi.list>>>([]);
  const [supplies, setSupplies] = useState<Awaited<ReturnType<typeof suppliesApi.list>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productRows, supplyRows, productCatalog, supplyCatalog] = await Promise.all([
        inventoryStockApi.products(),
        inventoryStockApi.supplies(),
        productsApi.list(),
        suppliesApi.list(),
      ]);
      setProductStock(productRows);
      setSupplyStock(supplyRows);
      setProducts(productCatalog);
      setSupplies(supplyCatalog);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar las existencias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return {
    productRows: useMemo(() => buildProductStockRows(productStock, products), [productStock, products]),
    supplyRows: useMemo(() => buildSupplyStockRows(supplyStock, supplies), [supplyStock, supplies]),
    loading,
    error,
    load,
  };
}
