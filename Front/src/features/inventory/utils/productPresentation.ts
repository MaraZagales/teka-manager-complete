import type { Product } from "../../../services/productsApi";
import type { ProductSortKey } from "../types/products";
import { formatProductName } from "../../../services/productDisplay";

export const productNumber = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function formatProductNumber(value?: number | null) {
  return value == null ? "—" : productNumber.format(value);
}

export function formatProductDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-AR");
}

export function filterAndSortProducts(
  products: Product[],
  search: string,
  typeFilter: string,
  statusFilter: string,
  sort: ProductSortKey,
  ascending: boolean,
) {
  const query = search.trim().toLocaleLowerCase("es-AR");
  const valueFor = (product: Product): string | number | boolean =>
    ({
      codigo: product.codigo,
      nombre: formatProductName(product),
      tipo: product.tipoProductoNombre,
      color: product.colorNombre || "",
      stockMinimo: product.stockMinimo,
      estado: product.activo,
    })[sort];

  return products
    .filter((product) => {
      const searchable = `${product.codigo} ${formatProductName(product)}`.toLocaleLowerCase("es-AR");
      return (
        (!query || searchable.includes(query)) &&
        (!typeFilter || String(product.tipoProductoId) === typeFilter) &&
        (!statusFilter ||
          (statusFilter === "active" ? product.activo : !product.activo))
      );
    })
    .sort((left, right) => {
      const a = valueFor(left);
      const b = valueFor(right);
      const comparison =
        typeof a === "string" && typeof b === "string"
          ? a.localeCompare(b, "es-AR", { numeric: true, sensitivity: "base" })
          : Number(a) - Number(b);
      return ascending ? comparison : -comparison;
    });
}
