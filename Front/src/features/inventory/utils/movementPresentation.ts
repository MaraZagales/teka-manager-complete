import type { StockProduct, StockSupply } from "../../../services/inventoryStockApi";
import { formatProductName } from "../../../services/productDisplay";
import type { Product } from "../../../services/productsApi";
import { formatSupplyName } from "../../../services/supplyDisplay";
import type { Supply } from "../../../services/suppliesApi";
import type { AnalyticMovement, MovementDetail, MovementFilters } from "../../../services/stockMovementsApi";
import type { MovementArticle, MovementListFilters } from "../types/movements";

export const MOVEMENT_PAGE_SIZE = 8;

function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function initialMovementFilters(): MovementListFilters {
  const now = new Date();
  return { search: "", from: `${now.getFullYear()}-01-01`, to: localDate(now), movementTypeId: "", articleClass: "", depositId: "" };
}

export function toAnalyticFilters(filters: MovementListFilters): MovementFilters {
  return {
    desde: filters.from,
    hasta: filters.to,
    buscar: filters.search.trim() || undefined,
    clase: filters.articleClass || undefined,
    depositoId: filters.depositId ? Number(filters.depositId) : undefined,
  };
}

export function buildMovementArticles(products: Product[], supplies: Supply[]): MovementArticle[] {
  return [
    ...products.filter((item) => item.activo).map((item) => ({ key: `PRODUCTO-${item.productoId}`, kind: "PRODUCTO" as const, id: item.productoId, code: item.codigo, name: formatProductName(item), unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre })),
    ...supplies.filter((item) => item.activo).map((item) => ({ key: `INSUMO-${item.insumoId}`, kind: "INSUMO" as const, id: item.insumoId, code: item.codigo, name: formatSupplyName(item), unit: item.unidadMedidaAbreviatura || item.unidadMedidaNombre })),
  ].sort((left, right) => left.name.localeCompare(right.name, "es-AR"));
}

export function unitForMovement(row: Pick<AnalyticMovement, "clase" | "articuloId">, articles: MovementArticle[]) {
  return articles.find((item) => item.kind === row.clase && item.id === row.articuloId)?.unit || "";
}

export function detailToAnalytic(row: MovementDetail): AnalyticMovement {
  const product = row.productoId != null;
  return {
    movimientoStockId: row.movimientoStockId,
    fechaMovimiento: row.fechaMovimiento,
    clase: product ? "PRODUCTO" : "INSUMO",
    articuloId: product ? row.productoId! : row.insumoId!,
    codigo: (product ? row.productoCodigo : row.insumoCodigo) || "—",
    articulo: (product ? row.productoNombre : row.insumoNombre) || "Artículo sin identificar",
    depositoId: row.depositoId,
    deposito: row.depositoNombre,
    tipoMovimientoStockId: row.tipoMovimientoStockId,
    tipoMovimiento: row.tipoMovimientoNombre,
    signo: row.signo,
    cantidad: row.cantidad,
    motivo: row.motivo,
    entidadOrigen: row.entidadOrigen,
    origenId: row.origenId,
    activo: row.activo,
    fechaAnulacion: row.fechaAnulacion,
    motivoAnulacion: row.motivoAnulacion,
    observacionAnulacion: row.observacionAnulacion,
    movimientoStockIdReversaDe: row.movimientoStockIdReversaDe,
    modalidad: row.movimientoStockIdReversaDe != null ? "REVERSA" : row.entidadOrigen ? "AUTOMATICO" : "MANUAL",
    estado: !row.activo ? "ANULADO" : row.movimientoStockIdReversaDe != null ? "REVERSA" : "VIGENTE",
    totalFilas: 0,
  };
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR");
}

export function filterCompleteMovements(rows: MovementDetail[], filters: MovementListFilters) {
  const query = normalized(filters.search.trim());
  return rows.map(detailToAnalytic).filter((row) => {
    const date = row.fechaMovimiento.slice(0, 10);
    return date >= filters.from && date <= filters.to
      && (!filters.movementTypeId || row.tipoMovimientoStockId === Number(filters.movementTypeId))
      && (!filters.articleClass || row.clase === filters.articleClass)
      && (!filters.depositId || row.depositoId === Number(filters.depositId))
      && (!query || normalized(`${row.codigo} ${row.articulo}`).includes(query));
  }).sort((left, right) => right.fechaMovimiento.localeCompare(left.fechaMovimiento));
}

export function stockForArticle(article: MovementArticle, depositId: number, products: StockProduct[], supplies: StockSupply[]) {
  if (article.kind === "PRODUCTO") return products.find((item) => item.productoId === article.id && item.depositoId === depositId)?.cantidadActual ?? 0;
  return supplies.find((item) => item.insumoId === article.id && item.depositoId === depositId)?.cantidadActual ?? 0;
}

export function movementClassesForDeposit(depositId: number, products: StockProduct[], supplies: StockSupply[]) {
  const classes = new Set<MovementArticle["kind"]>();
  if (products.some((item) => item.depositoId === depositId)) classes.add("PRODUCTO");
  if (supplies.some((item) => item.depositoId === depositId)) classes.add("INSUMO");
  return classes;
}

export function movementMode(row: Pick<MovementDetail, "entidadOrigen" | "movimientoStockIdReversaDe">) {
  if (row.movimientoStockIdReversaDe != null) return "Reversa";
  return row.entidadOrigen === "AjusteManual" ? "Manual" : "Automático";
}

export function movementOriginLabel(value?: string | null) {
  if (!value) return "Proceso no informado";
  if (value === "AjusteManual") return "Ajuste manual";
  return value.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2");
}

export function formatMovementDate(value: string) {
  return new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}
