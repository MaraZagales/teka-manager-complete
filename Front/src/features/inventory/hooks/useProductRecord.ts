import { useEffect, useState } from "react";
import { productsApi, type Product } from "../../../services/productsApi";

export function useProductRecord(productId?: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    void productsApi
      .getById(productId)
      .then((item) => {
        if (active) setProduct(item);
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "No se pudo consultar el producto.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  return { product, loading, error };
}
