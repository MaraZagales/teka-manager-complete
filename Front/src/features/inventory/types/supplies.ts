export type SupplyFormValues = {
  tipoInsumoId: string;
  nombreInsumoId: string;
  colorId: string;
  unidadMedidaId: string;
  descripcion: string;
  stockMinimo: string;
};

export type SupplyFormField = keyof SupplyFormValues;
export type SupplyFormErrors = Partial<Record<SupplyFormField, string>>;
export type SupplySortKey = "codigo" | "nombre" | "tipo" | "unidad" | "estado";
export type SuppliesPageMode = "list" | "create" | "detail" | "edit";
