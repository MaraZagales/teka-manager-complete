import { RotateCcw, Search } from "lucide-react";
import type { MovementLookup } from "../../../../services/stockMovementsApi";
import type { MovementListFilters } from "../../types/movements";
import { initialMovementFilters } from "../../utils/movementPresentation";

type Props = {
  filters: MovementListFilters;
  search: string;
  deposits: MovementLookup[];
  movementTypes: MovementLookup[];
  onSearchChange: (value: string) => void;
  onChange: <K extends keyof MovementListFilters>(key: K, value: MovementListFilters[K]) => void;
  onClear: () => void;
};

export function MovementFilters({ filters, search, deposits, movementTypes, onSearchChange, onChange, onClear }: Props) {
  const defaults = initialMovementFilters();
  const hasFilters = Boolean(search.trim() || filters.movementTypeId || filters.articleClass || filters.depositId || filters.from !== defaults.from || filters.to !== defaults.to);
  return <section className="movement-list-filters" aria-label="Filtros de movimientos">
    <label className="movement-search"><span>Buscar por código o nombre</span><div><Search size={16}/><input maxLength={120} value={search} placeholder="Código o nombre del artículo" onChange={(event) => onSearchChange(event.target.value)}/></div></label>
    <label><span>Desde</span><input type="date" value={filters.from} max={filters.to} onChange={(event) => onChange("from", event.target.value)}/></label>
    <label><span>Hasta</span><input type="date" value={filters.to} min={filters.from} onChange={(event) => onChange("to", event.target.value)}/></label>
    <label><span>Tipo de movimiento</span><select value={filters.movementTypeId} onChange={(event) => onChange("movementTypeId", event.target.value)}><option value="">Todos</option>{movementTypes.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
    <label><span>Clase de artículo</span><select value={filters.articleClass} onChange={(event) => onChange("articleClass", event.target.value as MovementListFilters["articleClass"])}><option value="">Todos</option><option value="PRODUCTO">Productos terminados</option><option value="INSUMO">Insumos</option></select></label>
    <label><span>Depósito</span><select value={filters.depositId} onChange={(event) => onChange("depositId", event.target.value)}><option value="">Todos</option>{deposits.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
    <button type="button" className="button secondary movement-clear" disabled={!hasFilters} onClick={onClear}><RotateCcw size={15}/>Limpiar filtros</button>
  </section>;
}
