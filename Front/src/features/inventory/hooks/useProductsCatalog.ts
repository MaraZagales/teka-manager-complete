import { useCallback, useEffect, useState } from "react";
import {
  productsApi,
  type ColorLookup,
  type Lookup,
  type Product,
  type UnitLookup,
} from "../../../services/productsApi";
import {
  obtenerResumenCatalogoEcommerce,
  type ResumenCatalogoEcommerce,
} from "../../../services/ecommerceApi";

export function useProductsCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [units, setUnits] = useState<UnitLookup[]>([]);
  const [reasons, setReasons] = useState<Lookup[]>([]);
  const [ecommerceSummary, setEcommerceSummary] = useState<ResumenCatalogoEcommerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [items, productTypes, productColors, productUnits, stateReasons, photoSummary] =
        await Promise.all([
          productsApi.list(),
          productsApi.productTypes(),
          productsApi.colors(),
          productsApi.units(),
          productsApi.inactivationReasons(),
          obtenerResumenCatalogoEcommerce().catch(() => [] as ResumenCatalogoEcommerce[]),
        ]);
      setProducts(items);
      setTypes(productTypes);
      setColors(productColors);
      setUnits(productUnits);
      setReasons(stateReasons);
      setEcommerceSummary(photoSummary);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron cargar los productos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, types, colors, units, reasons, ecommerceSummary, loading, error, load };
}
