
import { useId, useState } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "../../../../services/productsApi";
import { formatProductOption } from "../../../../services/productDisplay";
import "../../styles/customerPredictiveSearch.css";

type Props = {
  products: Product[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ProductPredictiveSearch({
  products,
  value,
  disabled = false,
  onChange,
}: Props) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = products.find(
    (product) => String(product.productoId) === value
  );

  const rows = products
    .filter(
      (product) =>
        product.activo &&
        formatProductOption(product)
          .toLocaleLowerCase("es-AR")
          .includes(query.trim().toLocaleLowerCase("es-AR"))
    )
    .slice(0, 30);

  function choose(product: Product) {
    onChange(String(product.productoId));
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  function clear() {
    onChange("");
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  return (
    <div
      className="product-field customer-predictive"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span>Producto de interés</span>

      {selected ? (
        <div className="customer-predictive-selected">
          <span>
            <strong>{formatProductOption(selected)}</strong>
          </span>

          {!disabled && (
            <button
              type="button"
              onClick={clear}
              aria-label="Quitar producto"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="customer-predictive-input">
          <Search size={17} />

          <input
            role="combobox"
            aria-label="Buscar producto"
            aria-controls={open ? listId : undefined}
            aria-expanded={open && !disabled}
            aria-autocomplete="list"
            aria-activedescendant={
              open && rows.length > 0
                ? `${listId}-${active}`
                : undefined
            }
            value={query}
            disabled={disabled}
            placeholder="Buscar mueble..."
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActive((current) =>
                  Math.min(current + 1, Math.max(0, rows.length - 1))
                );
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) => Math.max(0, current - 1));
              }

              if (
                event.key === "Enter" &&
                open &&
                rows[active]
              ) {
                event.preventDefault();
                choose(rows[active]);
              }
            }}
          />
        </div>
      )}

      {!selected && open && !disabled && (
        <div
          className="customer-predictive-results"
          id={listId}
          role="listbox"
        >
          {rows.map((product, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              className={index === active ? "active" : ""}
              id={`${listId}-${index}`}
              key={product.productoId}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(product)}
            >
              <strong>{formatProductOption(product)}</strong>
            </button>
          ))}

          {!rows.length && (
            <p>No se encontraron productos.</p>
          )}
        </div>
      )}
    </div>
  );
}
