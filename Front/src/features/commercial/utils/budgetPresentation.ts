import type {
  Presupuesto,
  ProductoPresupuesto,
} from "../../../services/commercialOperationsApi";
import type { Product } from "../../../services/productsApi";
import { formatProductOption } from "../../../services/productDisplay";

export type BudgetSortKey =
  | "numero"
  | "cliente"
  | "origen"
  | "emision"
  | "vencimiento"
  | "estado"
  | "importe";

export const budgetStates = [
  "Borrador",
  "Enviado",
  "Aceptado",
  "Rechazado",
  "Vencido",
  "Cancelado",
] as const;

export function budgetNumber(budget: Presupuesto) {
  return (
    budget.numero?.trim().replace(/^#\s*/, "") ||
    String(budget.presupuestoComercialId)
  );
}

export function budgetCustomer(
  budget: Pick<Presupuesto, "clienteNombre" | "clienteApellido" | "clienteId">,
) {
  return (
    [budget.clienteNombre, budget.clienteApellido]
      .filter(Boolean)
      .join(" ")
      .trim() || `Cliente #${budget.clienteId}`
  );
}

export function budgetOrigin(
  budget: Pick<Presupuesto, "interesComercialId" | "oportunidadComercialId">,
) {
  if (budget.interesComercialId)
    return `Consulta #${budget.interesComercialId}`;
  if (budget.oportunidadComercialId)
    return `Oportunidad #${budget.oportunidadComercialId}`;
  return "Directo";
}

export function dateOnly(value?: string | null) {
  return value ? String(value).slice(0, 10) : "";
}
export function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function formatBudgetDate(value?: string | null) {
  const date = dateOnly(value);
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
export function formatBudgetDateTime(value?: string | null) {
  return value
    ? new Date(value).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
}
export function formatBudgetMoney(value?: number | null) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value || 0));
}
export function budgetTotal(budget: Presupuesto) {
  return Number(budget.total ?? budget.importeTotal ?? 0);
}
export function isBudgetExpired(budget: Presupuesto) {
  return (
    !["Aceptado", "Rechazado", "Cancelado", "Vencido"].includes(
      budget.estado,
    ) &&
    Boolean(dateOnly(budget.fechaVencimiento)) &&
    dateOnly(budget.fechaVencimiento) < today()
  );
}
export function displayBudgetState(budget: Presupuesto) {
  return budget.estado;
}
export function budgetStateTone(
  state: string,
): "success" | "warning" | "danger" | "neutral" {
  if (state === "Aceptado") return "success";
  if (state === "Borrador" || state === "Enviado") return "warning";
  if (state === "Rechazado" || state === "Vencido" || state === "Cancelado")
    return "danger";
  return "neutral";
}
export function availableBudgetStates(budget: Presupuesto) {
  if (budget.estado === "Borrador") return ["Enviado", "Cancelado"];
  if (budget.estado === "Enviado")
    return [
      ...(isBudgetExpired(budget) ? [] : ["Aceptado"]),
      "Rechazado",
      "Vencido",
      "Cancelado",
    ];
  return [];
}

type PresentableProduct = {
  codigo?: string | null;
  nombre?: string | null;
  nombreCatalogo?: string | null;
  colorNombre?: string | null;
  productoNombre?: string | null;
  varianteNombre?: string | null;
};
export function budgetProductName(product?: PresentableProduct | null) {
  return (
    product?.nombreCatalogo?.trim() ||
    product?.productoNombre?.trim() ||
    product?.nombre?.trim() ||
    "Producto"
  );
}
export function budgetProductVariant(product?: PresentableProduct | null) {
  const variant = product?.varianteNombre?.trim();
  const color = product?.colorNombre?.trim();
  return [variant, color]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(" · ");
}
export function budgetProductLabel(product?: PresentableProduct | null) {
  return product
    ? formatProductOption({
        codigo: product.codigo,
        nombre: product.nombre || product.productoNombre,
        nombreCatalogo: product.nombreCatalogo,
        varianteNombre: product.varianteNombre,
        colorNombre: product.colorNombre,
      })
    : "Producto";
}

export function filterAndSortBudgets(
  rows: Presupuesto[],
  search: string,
  from: string,
  to: string,
  state: string,
  sort: BudgetSortKey,
  ascending: boolean,
) {
  const term = search.trim().toLocaleLowerCase("es");
  const filtered = rows.filter((budget) => {
    const emission = dateOnly(budget.fechaEmision);
    return (
      (!term ||
        `${budgetNumber(budget)} ${budgetCustomer(budget)}`
          .toLocaleLowerCase("es")
          .includes(term)) &&
      (!from || emission >= from) &&
      (!to || emission <= to) &&
      (!state || displayBudgetState(budget) === state)
    );
  });
  const values: Record<
    BudgetSortKey,
    (budget: Presupuesto) => string | number
  > = {
    numero: (budget) => budget.numero || budget.presupuestoComercialId,
    cliente: budgetCustomer,
    origen: budgetOrigin,
    emision: (budget) => dateOnly(budget.fechaEmision),
    vencimiento: (budget) => dateOnly(budget.fechaVencimiento),
    estado: displayBudgetState,
    importe: budgetTotal,
  };
  return filtered.sort((left, right) => {
    const a = values[sort](left);
    const b = values[sort](right);
    const result =
      typeof a === "number" && typeof b === "number"
        ? a - b
        : String(a).localeCompare(String(b), "es", { numeric: true });
    return ascending ? result : -result;
  });
}
