import type { MovementClass } from "../../../services/stockMovementsApi";

export type MovementListFilters = {
  search: string;
  from: string;
  to: string;
  movementTypeId: string;
  articleClass: MovementClass | "";
  depositId: string;
};

export type MovementArticle = {
  key: string;
  kind: MovementClass;
  id: number;
  code: string;
  name: string;
  unit: string;
};
