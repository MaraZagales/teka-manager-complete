import type { AnalyticMovement, MovementClass, MovementSeriesPoint, MovementSummary } from "../../../services/stockMovementsApi";
import type { DepositLookup } from "../../../services/inventoryStockApi";

export type InventoryReportKey = "active" | "critical" | "out" | "available" | "status" | "movements" | "risk" | "consumption" | "adjustments" | "product-state" | "supply-state";
export type InventoryReportClass = MovementClass | "";
export type InventoryStockState = "available" | "critical" | "out" | "unconfigured";

export type InventoryReportFilters = {
  from: string;
  to: string;
  depositId: string;
  classCode: InventoryReportClass;
};

export type InventoryReportStockRow = {
  key: string;
  classCode: MovementClass;
  itemId: number;
  code: string;
  name: string;
  deposit: string;
  quantity: number;
  minimum: number | null;
  unit: string;
  active: boolean;
  state: InventoryStockState;
};

export type InventoryConsumptionRow = {
  key: string;
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  movements: number;
  origins: string[];
};

export type InventoryReportData = {
  loading: boolean;
  error: string;
  deposits: DepositLookup[];
  stock: InventoryReportStockRow[];
  movements: AnalyticMovement[];
  movementSeries: MovementSeriesPoint[];
  movementSummary: MovementSummary;
  consumption: InventoryConsumptionRow[];
  reload: () => Promise<void>;
};
