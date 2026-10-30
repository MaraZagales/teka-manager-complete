type Props = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  disabled?: boolean;
  fromLabel?: string;
  toLabel?: string;
};

export function DateRangeFilter({ from, to, onFromChange, onToChange, disabled = false, fromLabel = 'Desde', toLabel = 'Hasta' }: Props) {
  const invalid = Boolean(from && to && from > to);
  return <>
    <label className="data-table-filter-field"><span>{fromLabel}</span><input type="date" value={from} max={to || undefined} disabled={disabled} aria-invalid={invalid} onChange={event => onFromChange(event.target.value)}/></label>
    <label className="data-table-filter-field"><span>{toLabel}</span><input type="date" value={to} min={from || undefined} disabled={disabled} aria-invalid={invalid} onChange={event => onToChange(event.target.value)}/></label>
  </>;
}
