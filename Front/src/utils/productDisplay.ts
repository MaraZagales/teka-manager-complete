/** Identificación comercial uniforme, sin modificar el nombre persistido en SQL. */
export type ProductDisplay = { nombre: string; nombreCatalogo?: string | null; colorNombre?: string | null };

export function formatProductName(product: ProductDisplay): string {
  const base = (product.nombreCatalogo || product.nombre || '').trim();
  const color = (product.colorNombre || '').trim();
  if (!color) return base;
  // Para registros históricos sin catálogo, conservar la denominación original.
  if (!product.nombreCatalogo) return base;
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
  return normalize(base).endsWith(normalize(color)) ? base : `${base} ${color}`;
}
