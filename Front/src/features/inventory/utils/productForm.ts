import type { Lookup, Product, ProductPayload } from "../../../services/productsApi";
import type {
  ProductFormErrors,
  ProductFormField,
  ProductFormValues,
} from "../types/products";

export const emptyProductForm: ProductFormValues = {
  nombre: "",
  nombreProductoId: "",
  descripcion: "",
  tipoProductoId: "",
  colorId: "",
  unidadMedidaId: "",
  stockMinimo: "0",
  anchoCm: "",
  altoCm: "",
  profundidadCm: "",
};

export function validateProductField(
  field: ProductFormField,
  form: ProductFormValues,
): string | undefined {
  if (field === "nombre" && form.nombre.trim().length > 120)
    return "El nombre no puede superar 120 caracteres.";
  if (field === "nombreProductoId" && !form.nombreProductoId)
    return "Seleccioná un nombre de producto.";
  if (field === "descripcion" && form.descripcion.trim().length > 500)
    return "La descripción no puede superar 500 caracteres.";
  if (field === "tipoProductoId" && !form.tipoProductoId)
    return "Seleccioná una categoría.";
  if (field === "unidadMedidaId" && !form.unidadMedidaId)
    return "No se encontró la unidad de medida del producto. Revisá el catálogo de unidades.";
  if (field === "stockMinimo") {
    if (form.stockMinimo === "") return "El stock mínimo es obligatorio.";
    const value = Number(form.stockMinimo);
    if (!Number.isFinite(value) || value < 0)
      return "El stock mínimo debe ser cero o mayor.";
  }
  if (field === "anchoCm" || field === "altoCm" || field === "profundidadCm") {
    const labels = {
      anchoCm: "ancho",
      altoCm: "alto",
      profundidadCm: "profundidad",
    } as const;
    if (form[field] === "") return `El ${labels[field]} es obligatorio.`;
    const value = Number(form[field]);
    if (!Number.isFinite(value) || value <= 0)
      return `El ${labels[field]} debe ser mayor que cero.`;
    if (value > 99999999.99)
      return `El ${labels[field]} no puede superar 99999999,99 cm.`;
  }
  return undefined;
}

export function validateProductForm(form: ProductFormValues) {
  const errors: ProductFormErrors = {};
  (Object.keys(form) as ProductFormField[]).forEach((field) => {
    const error = validateProductField(field, form);
    if (error) errors[field] = error;
  });
  return errors;
}

export function productToForm(product: Product): ProductFormValues {
  return {
    nombre: product.nombre,
    nombreProductoId:
      product.nombreProductoId == null ? "" : String(product.nombreProductoId),
    descripcion: product.descripcion || "",
    tipoProductoId: String(product.tipoProductoId),
    colorId: product.colorId == null ? "" : String(product.colorId),
    unidadMedidaId: String(product.unidadMedidaId),
    stockMinimo: String(product.stockMinimo),
    anchoCm: product.anchoCm == null ? "" : String(product.anchoCm),
    altoCm: product.altoCm == null ? "" : String(product.altoCm),
    profundidadCm:
      product.profundidadCm == null ? "" : String(product.profundidadCm),
  };
}

export function productFormToPayload(
  form: ProductFormValues,
  names: Lookup[],
  original?: Product,
): ProductPayload {
  return {
    nombre:
      original && String(original.nombreProductoId) === form.nombreProductoId
        ? original.nombre
        : names.find((item) => String(item.id) === form.nombreProductoId)
            ?.descripcion || form.nombre.trim(),
    nombreProductoId: form.nombreProductoId
      ? Number(form.nombreProductoId)
      : null,
    descripcion: form.descripcion.trim() || undefined,
    tipoProductoId: Number(form.tipoProductoId),
    colorId: form.colorId ? Number(form.colorId) : null,
    unidadMedidaId: Number(form.unidadMedidaId),
    stockMinimo: Number(form.stockMinimo),
    anchoCm: Number(form.anchoCm),
    altoCm: Number(form.altoCm),
    profundidadCm: Number(form.profundidadCm),
  };
}
