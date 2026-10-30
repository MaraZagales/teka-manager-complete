import type { Lookup, Supply, SupplyPayload, UnitLookup } from "../../../services/suppliesApi";
import type { SupplyFormErrors, SupplyFormField, SupplyFormValues } from "../types/supplies";

export const emptySupplyForm: SupplyFormValues = {
  tipoInsumoId: "",
  nombreInsumoId: "",
  colorId: "",
  unidadMedidaId: "",
  descripcion: "",
  stockMinimo: "0",
};

export function normalizeSupplyText(value?: string | null) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR").trim();
}

export function isMelamine(type?: Lookup) {
  return normalizeSupplyText(type?.descripcion) === "melamina";
}

export function isSquareMeter(unit: UnitLookup) {
  return normalizeSupplyText(unit.abreviatura).replace("²", "2") === "m2" || normalizeSupplyText(unit.descripcion).includes("cuadrado");
}

export function validateSupplyField(field: SupplyFormField, form: SupplyFormValues): string | undefined {
  if (field === "tipoInsumoId" && (!form.tipoInsumoId || Number(form.tipoInsumoId) <= 0)) return "Seleccioná un tipo de insumo válido.";
  if (field === "nombreInsumoId" && (!form.nombreInsumoId || Number(form.nombreInsumoId) <= 0)) return "Seleccioná un nombre de insumo.";
  if (field === "unidadMedidaId" && (!form.unidadMedidaId || Number(form.unidadMedidaId) <= 0)) return "Seleccioná una unidad de medida.";
  if (field === "descripcion" && form.descripcion.trim().length > 500) return "La descripción no puede superar 500 caracteres.";
  if (field === "stockMinimo") {
    if (form.stockMinimo === "") return "El stock mínimo es obligatorio.";
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(form.stockMinimo)) return "Ingresá un número no negativo con hasta 2 decimales.";
    const value = Number(form.stockMinimo.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) return "El stock mínimo debe ser cero o mayor.";
    if (value > 9999999999999999.99) return "El stock mínimo supera la precisión admitida por la API.";
  }
  return undefined;
}

export function validateSupplyForm(form: SupplyFormValues) {
  const errors: SupplyFormErrors = {};
  (Object.keys(form) as SupplyFormField[]).forEach((field) => {
    const error = validateSupplyField(field, form);
    if (error) errors[field] = error;
  });
  return errors;
}

export function supplyToForm(supply: Supply): SupplyFormValues {
  return {
    tipoInsumoId: String(supply.tipoInsumoId),
    nombreInsumoId: supply.nombreInsumoId == null ? "" : String(supply.nombreInsumoId),
    colorId: supply.colorId == null ? "" : String(supply.colorId),
    unidadMedidaId: String(supply.unidadMedidaId),
    descripcion: supply.descripcion || "",
    stockMinimo: String(supply.stockMinimo),
  };
}

export function supplyFormToPayload(form: SupplyFormValues, names: Lookup[]): SupplyPayload {
  const selectedName = names.find((item) => String(item.id) === form.nombreInsumoId);
  return {
    nombre: selectedName?.descripcion || "",
    nombreInsumoId: Number(form.nombreInsumoId),
    descripcion: form.descripcion.trim() || undefined,
    tipoInsumoId: Number(form.tipoInsumoId),
    colorId: form.colorId ? Number(form.colorId) : null,
    unidadMedidaId: Number(form.unidadMedidaId),
    stockMinimo: Number(form.stockMinimo.replace(",", ".")),
  };
}
