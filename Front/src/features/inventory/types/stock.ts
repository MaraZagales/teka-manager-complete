export type StockKind = "products" | "supplies";

export type StockState = "available" | "critical" | "out" | "unconfigured";

export type StockSortKey = "code" | "name" | "quantity" | "minimum" | "state";

export type InventoryStockRow = {
  key: string;
  kind: StockKind;
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  minimum: number | null;
  unit: string;
  state: StockState;
  active: boolean;
};
