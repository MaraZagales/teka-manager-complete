import { RotateCcw } from "lucide-react";
import type { DepositLookup } from "../../../../services/inventoryStockApi";
import type { InventoryReportFilters } from "../../types/reports";
import { defaultReportFilters } from "../../utils/reportPresentation";

export function InventoryReportFiltersBar({ value, deposits, onChange }: { value: InventoryReportFilters; deposits: DepositLookup[]; onChange: (value: InventoryReportFilters) => void }) {
  const defaults = defaultReportFilters();
  return <section className="inventory-reports-filters" aria-label="Filtros generales de reportes">
    <div className="inventory-report-period"><label><span>Desde</span><input type="date" value={value.from} max={value.to} onChange={(event) => onChange({ ...value, from: event.target.value })} /></label><label><span>Hasta</span><input type="date" value={value.to} min={value.from} max={defaults.to} onChange={(event) => onChange({ ...value, to: event.target.value })} /></label></div>
    <label><span>Depósito</span><select value={value.depositId} onChange={(event) => onChange({ ...value, depositId: event.target.value })}><option value="">Todos</option>{deposits.map((deposit) => <option key={deposit.id} value={deposit.id}>{deposit.descripcion}</option>)}</select></label>
    <label><span>Clase de artículo</span><select value={value.classCode} onChange={(event) => onChange({ ...value, classCode: event.target.value as InventoryReportFilters["classCode"] })}><option value="">Todos</option><option value="PRODUCTO">Productos terminados</option><option value="INSUMO">Insumos</option></select></label>
    <button type="button" className="button secondary" onClick={() => onChange(defaults)} disabled={value.from === defaults.from && value.to === defaults.to && !value.depositId && !value.classCode}><RotateCcw size={16} /> Limpiar filtros</button>
  </section>;
}
