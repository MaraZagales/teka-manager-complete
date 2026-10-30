import { formatSupplyName } from "../../../services/supplyDisplay";
import type { Supply } from "../../../services/suppliesApi";
import type { SupplySortKey } from "../types/supplies";
import { normalizeSupplyText } from "./supplyForm";

export function filterAndSortSupplies(items: Supply[], search: string, typeFilter: string, statusFilter: string, sort: SupplySortKey, ascending: boolean) {
  const query = normalizeSupplyText(search);
  const valueFor = (supply: Supply): string | number | boolean => ({
    codigo: supply.codigo,
    nombre: formatSupplyName(supply),
    tipo: supply.tipoInsumoNombre,
    unidad: supply.unidadMedidaAbreviatura,
    estado: supply.activo,
  })[sort];

  return items.filter((supply) => {
    const searchable = normalizeSupplyText(`${supply.codigo} ${formatSupplyName(supply)} ${supply.descripcion || ""} ${supply.tipoInsumoNombre} ${supply.colorNombre || ""} ${supply.unidadMedidaNombre}`);
    return (!query || searchable.includes(query)) && (!typeFilter || String(supply.tipoInsumoId) === typeFilter) && (!statusFilter || (statusFilter === "active" ? supply.activo : !supply.activo));
  }).sort((left, right) => {
    const a = valueFor(left);
    const b = valueFor(right);
    const comparison = typeof a === "string" && typeof b === "string" ? a.localeCompare(b, "es-AR", { numeric: true, sensitivity: "base" }) : Number(a) - Number(b);
    return ascending ? comparison : -comparison;
  });
}
