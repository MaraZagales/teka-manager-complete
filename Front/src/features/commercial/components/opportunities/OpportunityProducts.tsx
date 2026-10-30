import { PackagePlus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "../../../../components/data/Modal";
import { ApiError, apiErrorMessage } from "../../../../services/apiClient";
import type {
  OpportunityCatalogProduct,
  OpportunityProduct,
} from "../../../../services/commercialOperationsApi";
import { salesOrdersApi } from "../../../../services/salesOrdersApi";
import {
  cleanOpportunityProductName,
  formatOpportunityMoney,
  opportunityProductName,
} from "../../utils/opportunityPresentation";

type Props = {
  lines: OpportunityProduct[];
  catalog?: OpportunityCatalogProduct[];
  editable: boolean;
  initialProductId?: number | null;
  initialQuantity?: number | null;
  onSave?: (
    productId: number,
    quantity: number,
    productName: string,
    currentPrice: number,
  ) => Promise<void> | void;
  onRemove?: (productId: number) => Promise<void> | void;
};

export function OpportunityProducts({
  lines,
  catalog = [],
  editable,
  initialProductId,
  initialQuantity,
  onSave,
  onRemove,
}: Props) {
  const [productId, setProductId] = useState(
    initialProductId ? String(initialProductId) : "",
  );
  const [quantity, setQuantity] = useState(String(initialQuantity || 1));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState<OpportunityProduct | null>(null);
  const available = useMemo(
    () =>
      catalog.filter(
        (product) =>
          !lines.some((line) => line.productoId === product.productoId),
      ),
    [catalog, lines],
  );

  async function add() {
    const selected = catalog.find(
      (item) => item.productoId === Number(productId),
    );
    const amount = Number(quantity);
    if (!selected) {
      setError("Seleccioná un producto del catálogo.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("La cantidad debe ser mayor que cero.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const price = await salesOrdersApi.currentPrice(selected.productoId);
      if (!Number.isFinite(price.precio) || price.precio <= 0)
        throw new Error("El producto no tiene un precio de venta vigente.");
      await onSave?.(
        selected.productoId,
        amount,
        opportunityProductName(selected),
        price.precio,
      );
      setProductId("");
      setQuantity("1");
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 404
          ? "El producto seleccionado no tiene un precio de venta vigente."
          : apiErrorMessage(
              caught,
              "No se pudo consultar el precio de venta vigente.",
            ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove() {
    if (!remove) return;
    setBusy(true);
    setError("");
    try {
      await onRemove?.(remove.productoId);
      setRemove(null);
    } catch (caught) {
      setError(apiErrorMessage(caught, "No se pudo quitar el producto."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="product-form-section opportunity-products">
      <header>
        <span>
          <PackagePlus size={18} />
        </span>
        <div>
          <h2>Productos de interés</h2>
        </div>
      </header>
      {error && (
        <div className="product-form-alert" role="alert">
          {error}
        </div>
      )}
      {editable && (
        <div className="opportunity-product-add">
          <label className="product-field">
            <span>Producto</span>
            <select
              value={productId}
              disabled={busy}
              onChange={(event) => setProductId(event.target.value)}
            >
              <option value="">Seleccioná un producto</option>
              {available.map((product) => (
                <option key={product.productoId} value={product.productoId}>
                  {opportunityProductName(product)}
                </option>
              ))}
            </select>
          </label>
          <label className="product-field">
            <span>Cantidad</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              disabled={busy}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="button secondary"
            disabled={busy || !productId || !available.length}
            onClick={() => void add()}
          >
            <PackagePlus size={16} />
            {busy ? "Consultando…" : "Agregar"}
          </button>
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table opportunity-products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de venta vigente</th>
              <th>Subtotal</th>
              {editable && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {lines.length ? (
              lines.map((line) => (
                <tr key={line.productoId}>
                  <td>
                    <strong>
                      {cleanOpportunityProductName(line.productoNombre)}
                    </strong>
                  </td>
                  <td>
                    {new Intl.NumberFormat("es-AR", {
                      maximumFractionDigits: 2,
                    }).format(line.cantidad)}
                  </td>
                  <td>
                    {line.precioReferencia == null
                      ? "Sin precio vigente"
                      : formatOpportunityMoney(line.precioReferencia)}
                  </td>
                  <td>
                    {line.precioReferencia == null
                      ? "—"
                      : formatOpportunityMoney(
                          line.cantidad * line.precioReferencia,
                        )}
                  </td>
                  {editable && (
                    <td>
                      <button
                        type="button"
                        className="icon-action danger"
                        disabled={busy}
                        onClick={() => setRemove(line)}
                        title="Quitar producto"
                        aria-label={`Quitar ${cleanOpportunityProductName(line.productoNombre)}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={editable ? 5 : 4}
                  className="opportunity-products-empty"
                >
                  No hay productos asociados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {remove && (
        <Modal
          title="Quitar producto"
          subtitle="La asociación se eliminará de la oportunidad; el stock no se modificará."
          onClose={() => setRemove(null)}
        >
          <div className="product-confirm-dialog">
            <p>
              ¿Querés quitar{" "}
              <strong>
                {cleanOpportunityProductName(remove.productoNombre)}
              </strong>{" "}
              de los productos de interés?
            </p>
            <footer>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setRemove(null)}
              >
                Volver
              </button>
              <button
                type="button"
                className="button danger"
                disabled={busy}
                onClick={() => void confirmRemove()}
              >
                {busy ? "Quitando…" : "Quitar producto"}
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </section>
  );
}
