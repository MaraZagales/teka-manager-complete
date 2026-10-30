import type { StockProduct, StockSupply } from "../../../services/inventoryStockApi";
import { formatProductName } from "../../../services/productDisplay";
import type { Product } from "../../../services/productsApi";
import { formatSupplyName } from "../../../services/supplyDisplay";
import type { Supply } from "../../../services/suppliesApi";
import type { InventoryStockRow, StockSortKey, StockState } from "../types/stock";

export const stockStateLabel: Record<StockState, string> = {
  available: "Disponible",
  critical: "Crítico",
  out: "Sin stock",
  unconfigured: "Sin configurar",
};

export const stockStateTone: Record<StockState, "success" | "warning" | "danger" | "neutral"> = {
  available: "success",
  critical: "warning",
  out: "danger",
  unconfigured: "neutral",
};

export function classifyStock(quantity: number, minimum: number | null): StockState {
  if (quantity <= 0) return "out";
  if (minimum === null) return "unconfigured";
  return quantity <= minimum ? "critical" : "available";
}

function validMinimum(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildProductStockRows(stock: StockProduct[], catalog: Product[]): InventoryStockRow[] {
  const metadata = new Map(catalog.map((item) => [item.productoId, item]));
  const grouped = new Map<number, StockProduct[]>();
  stock.forEach((item) => grouped.set(item.productoId, [...(grouped.get(item.productoId) || []), item]));
  const ids = new Set([...metadata.keys(), ...grouped.keys()]);

  return [...ids].map((itemId) => {
    const product = metadata.get(itemId);
    const entries = grouped.get(itemId) || [];
    const first = entries[0];
    const quantity = entries.reduce((total, item) => total + item.cantidadActual, 0);
    const minimum = validMinimum(product?.stockMinimo ?? first?.stockMinimo);
    return {
      key: `products-${itemId}`,
      kind: "products",
      itemId,
      code: product?.codigo || first?.productoCodigo || String(itemId),
      name: product ? formatProductName(product) : first?.productoNombre || "Producto sin identificar",
      quantity,
      minimum,
      unit: product?.unidadMedidaAbreviatura || product?.unidadMedidaNombre || "",
      state: classifyStock(quantity, minimum),
      active: product?.activo ?? true,
    };
  });
}

export function buildSupplyStockRows(stock: StockSupply[], catalog: Supply[]): InventoryStockRow[] {
  const metadata = new Map(catalog.map((item) => [item.insumoId, item]));
  const grouped = new Map<number, StockSupply[]>();
  stock.forEach((item) => grouped.set(item.insumoId, [...(grouped.get(item.insumoId) || []), item]));
  const ids = new Set([...metadata.keys(), ...grouped.keys()]);

  return [...ids].map((itemId) => {
    const supply = metadata.get(itemId);
    const entries = grouped.get(itemId) || [];
    const first = entries[0];
    const quantity = entries.reduce((total, item) => total + item.cantidadActual, 0);
    const minimum = validMinimum(supply?.stockMinimo ?? first?.stockMinimo);
    return {
      key: `supplies-${itemId}`,
      kind: "supplies",
      itemId,
      code: supply?.codigo || first?.insumoCodigo || String(itemId),
      name: supply ? formatSupplyName(supply) : first?.insumoNombre || "Insumo sin identificar",
      quantity,
      minimum,
      unit: supply?.unidadMedidaAbreviatura || supply?.unidadMedidaNombre || "",
      state: classifyStock(quantity, minimum),
      active: supply?.activo ?? true,
    };
  });
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR");
}

export function filterAndSortStock(
  rows: InventoryStockRow[],
  search: string,
  state: StockState | "",
  sort: StockSortKey,
  ascending: boolean,
) {
  const query = normalized(search.trim());
  const factor = ascending ? 1 : -1;
  return rows
    .filter((row) => (!query || normalized(`${row.code} ${row.name}`).includes(query)) && (!state || row.state === state))
    .sort((left, right) => {
      const leftValue = sort === "state" ? stockStateLabel[left.state] : left[sort];
      const rightValue = sort === "state" ? stockStateLabel[right.state] : right[sort];
      if (leftValue === null && rightValue === null) return 0;
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;
      if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * factor;
      return String(leftValue).localeCompare(String(rightValue), "es-AR", { numeric: true }) * factor;
    });
}
