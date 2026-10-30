import type { Product } from "../../../services/productsApi";
import type { StockProduct, StockSupply } from "../../../services/inventoryStockApi";
import type { Supply } from "../../../services/suppliesApi";
import type { AnalyticMovement, MovementClass } from "../../../services/stockMovementsApi";
import type { InventoryConsumptionRow, InventoryReportFilters, InventoryReportStockRow, InventoryStockState } from "../types/reports";

export const emptyMovementSummary = { totalMovimientos: 0, cantidadEntradas: 0, cantidadSalidas: 0, cantidadManuales: 0, cantidadAutomaticos: 0, cantidadReversas: 0, cantidadAnulados: 0 };

export function localIso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function defaultReportFilters(): InventoryReportFilters {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 29);
  return { from: localIso(from), to: localIso(to), depositId: "", classCode: "" };
}

export function classifyReportStock(quantity: number, minimum: number | null): InventoryStockState {
  if (quantity <= 0) return "out";
  if (minimum === null) return "unconfigured";
  return quantity <= minimum ? "critical" : "available";
}

export function buildReportStock(
  products: Product[], supplies: Supply[], productStock: StockProduct[], supplyStock: StockSupply[], filters: InventoryReportFilters,
): InventoryReportStockRow[] {
  const depositId = filters.depositId ? Number(filters.depositId) : null;
  const productEntries = depositId ? productStock.filter((row) => row.depositoId === depositId) : productStock;
  const supplyEntries = depositId ? supplyStock.filter((row) => row.depositoId === depositId) : supplyStock;
  const rows: InventoryReportStockRow[] = [];

  function append(clase: MovementClass, items: Product[] | Supply[], entries: (StockProduct | StockSupply)[]) {
    if (filters.classCode && filters.classCode !== clase) return;
    items.forEach((item) => {
      const itemId = clase === "PRODUCTO" ? (item as Product).productoId : (item as Supply).insumoId;
      const matches = entries.filter((entry) => clase === "PRODUCTO" ? (entry as StockProduct).productoId === itemId : (entry as StockSupply).insumoId === itemId);
      if (depositId && !matches.length) return;
      const quantity = matches.reduce((sum, entry) => sum + entry.cantidadActual, 0);
      const minimum = typeof item.stockMinimo === "number" && Number.isFinite(item.stockMinimo) ? item.stockMinimo : null;
      rows.push({
        key: `${clase}-${itemId}`,
        classCode: clase,
        itemId,
        code: item.codigo,
        name: item.nombre,
        deposit: depositId ? matches[0]?.depositoNombre || "Depósito seleccionado" : "Todos los depósitos",
        quantity,
        minimum,
        unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre || "",
        active: item.activo,
        state: classifyReportStock(quantity, minimum),
      });
    });
  }

  append("PRODUCTO", products, productEntries);
  append("INSUMO", supplies, supplyEntries);
  return rows.sort((a, b) => a.name.localeCompare(b.name, "es-AR"));
}

export function buildConsumption(movements: AnalyticMovement[], supplies: Supply[]): InventoryConsumptionRow[] {
  const metadata = new Map(supplies.map((item) => [item.insumoId, item]));
  const rows = new Map<number, InventoryConsumptionRow>();
  movements.filter((item) => item.clase === "INSUMO" && item.signo < 0 && item.estado === "VIGENTE" && item.modalidad !== "REVERSA").forEach((movement) => {
    const supply = metadata.get(movement.articuloId);
    const row = rows.get(movement.articuloId) ?? {
      key: `INSUMO-${movement.articuloId}`,
      itemId: movement.articuloId,
      code: movement.codigo,
      name: movement.articulo,
      quantity: 0,
      unit: supply?.unidadMedidaAbreviatura || supply?.unidadMedidaNombre || "",
      movements: 0,
      origins: [],
    };
    row.quantity += movement.cantidad;
    row.movements += 1;
    if (movement.entidadOrigen && !row.origins.includes(movement.entidadOrigen)) row.origins.push(movement.entidadOrigen);
    rows.set(movement.articuloId, row);
  });
  return [...rows.values()].sort((a, b) => b.movements - a.movements || b.quantity - a.quantity);
}

export function filtersToQuery(filters: InventoryReportFilters) {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.depositId) params.set("deposit", filters.depositId);
  if (filters.classCode) params.set("class", filters.classCode);
  return params.toString();
}

export function filtersFromLocation(): InventoryReportFilters {
  const defaults = defaultReportFilters();
  const params = new URLSearchParams(location.search);
  const classCode = params.get("class");
  return {
    from: params.get("from") || defaults.from,
    to: params.get("to") || defaults.to,
    depositId: params.get("deposit") || "",
    classCode: classCode === "PRODUCTO" || classCode === "INSUMO" ? classCode : "",
  };
}

export const stockStateLabel: Record<InventoryStockState, string> = {
  available: "Con stock disponible",
  critical: "Stock crítico",
  out: "Sin stock",
  unconfigured: "Sin mínimo configurado",
};

/** Conservative classification: only explicitly named negative stock adjustments count. */
export function isNegativeAdjustment(movement: AnalyticMovement): boolean {
  return movement.signo < 0 && movement.estado === "VIGENTE" && movement.modalidad !== "REVERSA"
    && /ajuste/i.test(movement.tipoMovimiento);
}
