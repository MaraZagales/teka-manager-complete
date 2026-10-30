import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { commercialCustomersApi, type CommercialCustomerSuggestion } from "../../../../services/commercialCustomersApi";
import "../../styles/customerPredictiveSearch.css";

type Props = {
  value: number | null;
  initialCustomer?: CommercialCustomerSuggestion | null;
  disabled?: boolean;
  error?: string;
  onChange: (customer: CommercialCustomerSuggestion | null) => void;
};

const label = (customer: CommercialCustomerSuggestion) => [customer.nombre, customer.apellido].filter(Boolean).join(" ").trim();

export function CustomerPredictiveSearch({ value, initialCustomer, disabled = false, error, onChange }: Props) {
  const listId = useId();
  const [selected, setSelected] = useState<CommercialCustomerSuggestion | null>(initialCustomer ?? null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CommercialCustomerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState(-1);
  const request = useRef(0);

  useEffect(() => {
    // El formulario puede traer un cliente precargado desde Consultas o Pedidos.
    if (!value) { setSelected(null); setLoadError(""); return; }
    if (selected?.clienteId === value) { setLoadError(""); return; }
    const controller = new AbortController();
    setLoadError("");
    void commercialCustomersApi.get(value, controller.signal)
      .then((customer) => {
        if (controller.signal.aborted) return;
        if (!customer) { setLoadError("No se encontró el cliente seleccionado."); return; }
        setSelected(customer);
        setLoadError("");
        onChange(customer);
      })
      .catch(() => {
        // React puede cancelar la petición al actualizar el estado: no es un error real.
        if (!controller.signal.aborted) setLoadError("No se pudo recuperar el cliente seleccionado.");
      });
    return () => controller.abort();
  }, [value, selected?.clienteId]);

  useEffect(() => {
    const term = query.trim();
    if (disabled || selected || term.length < 2) { setRows([]); setLoading(false); return; }
    const id = ++request.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setLoadError("");
      try { const result = await commercialCustomersApi.search(term, controller.signal); if (id === request.current) { setRows(result); setActive(result.length ? 0 : -1); } }
      catch (caught) { if (!controller.signal.aborted && id === request.current) setLoadError(caught instanceof Error ? caught.message : "No se pudieron buscar clientes."); }
      finally { if (id === request.current) setLoading(false); }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, selected, disabled]);

  function choose(customer: CommercialCustomerSuggestion) { setLoadError(""); setSelected(customer); setQuery(""); setRows([]); onChange(customer); }
  function clear() { setLoadError(""); setSelected(null); setQuery(""); setRows([]); onChange(null); }
  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!rows.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((current) => (current + 1) % rows.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((current) => (current - 1 + rows.length) % rows.length); }
    else if (event.key === "Enter" && active >= 0) { event.preventDefault(); choose(rows[active]); }
    else if (event.key === "Escape") setRows([]);
  }

  return <div className={`product-field customer-predictive ${error ? "field-invalid" : ""}`}>
    <span>Cliente <b>*</b></span>
    {selected ? <div className="customer-predictive-selected"><span><strong>{label(selected)}</strong>{selected.documento && <small>Documento {selected.documento}</small>}</span>{!disabled && <button type="button" onClick={clear} aria-label="Cambiar cliente"><X size={16}/></button>}</div> : <div className="customer-predictive-input"><Search size={17}/><input role="combobox" aria-controls={listId} aria-expanded={rows.length > 0} aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined} disabled={disabled} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={keyDown} placeholder="Buscar cliente por nombre, apellido o razón social" autoComplete="off"/>{loading && <LoaderCircle className="customer-predictive-spinner" size={17}/>}</div>}
    {!selected && query.trim().length >= 2 && !loading && <div className="customer-predictive-results" id={listId} role="listbox">{rows.map((customer, index) => <button type="button" role="option" aria-selected={index === active} className={index === active ? "active" : ""} id={`${listId}-${index}`} key={customer.clienteId} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(customer)}><strong>{label(customer)}</strong><small>{[customer.documento && `Doc. ${customer.documento}`, customer.telefono].filter(Boolean).join(" · ")}</small></button>)}{!rows.length && !loadError && <p>Sin resultados</p>}</div>}
    {(error || loadError) && <p className="field-error">{error || loadError}</p>}
  </div>;
}
