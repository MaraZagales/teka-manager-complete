import type { Product } from "./productsApi";
/** Denominación comercial para listados y reportes; no altera el nombre persistido. */
export function formatProductName(
  product: Pick<Product, "nombre" | "nombreCatalogo" | "colorNombre">,
): string {
  const base = (product.nombreCatalogo || product.nombre || "").trim();
  const color = (product.colorNombre || "").trim();
  if (!color) return base;
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-AR")
      .trim();
  return normalize(base).endsWith(normalize(color)) ? base : `${base} ${color}`;
}

type ProductIdentity = {
  codigo?: string | null;
  nombre?: string | null;
  nombreCatalogo?: string | null;
  colorNombre?: string | null;
  varianteNombre?: string | null;
  medida?: string | null;
};

/** Identidad inequívoca para selectores; conserva el ProductoId como valor. */
export function formatProductOption(product: ProductIdentity): string {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR").trim();
  const base = (product.nombreCatalogo || product.nombre || "Producto").trim();
  const parts = [product.codigo?.trim(), base];
  for (const attribute of [product.varianteNombre, product.colorNombre, product.medida]) {
    const value = attribute?.trim();
    if (value && !parts.some((part) => part && normalize(part).includes(normalize(value)))) parts.push(value);
  }
  return parts.filter(Boolean).join(" · ");
}
