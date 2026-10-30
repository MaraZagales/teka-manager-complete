import { Search, X } from "lucide-react";
import type { MovementArticle } from "../../types/movements";

function normalized(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR"); }

export function MovementArticleSelector({ articles, selected, query, disabled, error, placeholder = "Código o nombre", onQueryChange, onSelect, onClear }: { articles: MovementArticle[]; selected?: MovementArticle; query: string; disabled?: boolean; error?: string; placeholder?: string; onQueryChange: (value: string) => void; onSelect: (article: MovementArticle) => void; onClear: () => void }) {
  const search = normalized(query.trim());
  const suggestions = articles.filter((item) => !search || normalized(`${item.code} ${item.name}`).includes(search)).slice(0, 8);
  return <div className={`movement-article-selector ${error ? "field-invalid" : ""}`}>
    <label><span>Buscar artículo <b>*</b></span><div className="movement-article-input"><Search size={16}/><input value={query} disabled={disabled} autoComplete="off" placeholder={placeholder} onChange={(event) => onQueryChange(event.target.value)}/>{selected && <button type="button" aria-label="Quitar artículo seleccionado" onClick={onClear}><X size={15}/></button>}</div></label>
    {!selected && query.trim() && <div className="movement-article-results" role="listbox">{suggestions.length ? suggestions.map((item) => <button key={item.key} type="button" role="option" aria-selected="false" onClick={() => onSelect(item)}><strong>{item.name}</strong><small>{item.code} · {item.kind === "PRODUCTO" ? "Producto terminado" : "Insumo"} · {item.unit}</small></button>) : <p>No se encontraron artículos.</p>}</div>}
    {error && <p className="field-error">{error}</p>}
  </div>;
}
