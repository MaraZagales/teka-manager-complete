import type { StockKind } from "../../types/stock";

export function StockViewSelector({ value, onChange }: { value: StockKind; onChange: (value: StockKind) => void }) {
  return <div className="stock-view-selector" role="tablist" aria-label="Tipo de artículo">
    <button type="button" role="tab" aria-selected={value === "products"} className={value === "products" ? "active" : ""} onClick={() => onChange("products")}>Productos terminados</button>
    <button type="button" role="tab" aria-selected={value === "supplies"} className={value === "supplies" ? "active" : ""} onClick={() => onChange("supplies")}>Insumos</button>
  </div>;
}
