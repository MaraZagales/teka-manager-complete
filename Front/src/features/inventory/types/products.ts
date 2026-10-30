export type ProductFormValues = {
  nombre: string;
  nombreProductoId: string;
  descripcion: string;
  tipoProductoId: string;
  colorId: string;
  unidadMedidaId: string;
  stockMinimo: string;
  anchoCm: string;
  altoCm: string;
  profundidadCm: string;
};

export type ProductFormField = keyof ProductFormValues;
export type ProductFormErrors = Partial<Record<ProductFormField, string>>;

export type ProductSortKey =
  | "codigo"
  | "nombre"
  | "tipo"
  | "estado";

export type ProductsPageMode = "list" | "detail" | "create" | "edit";

export type PendingProductPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  esPrincipal: boolean;
  ordenVisual: number;
  textoAlternativo: string;
};
