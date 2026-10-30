import type { ReactNode } from 'react';
import { RotateCcw, Search } from 'lucide-react';

type DataTableFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onClear: () => void;
  clearDisabled?: boolean;
  clearLabel?: string;
  children?: ReactNode;
  className?: string;
  balanced?: boolean;
};

export function DataTableFilters({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  onClear,
  clearDisabled = false,
  clearLabel = 'Limpiar',
  children,
  className = '',
  balanced = false,
}: DataTableFiltersProps) {
  return (
    <section className={`data-table-filters${balanced ? ' data-table-filters-balanced' : ''} ${className}`.trim()}>
      <label className="data-table-search" aria-label="Buscar">
        <Search size={17}/>
        <input value={search} onChange={event => onSearchChange(event.target.value)} placeholder={searchPlaceholder}/>
      </label>
      {children}
      <button type="button" className="button secondary filter-clear-button" onClick={onClear} disabled={clearDisabled}>
        <RotateCcw size={16}/> {clearLabel}
      </button>
    </section>
  );
}
