import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Box,
  CalendarDays,
  Layers3,
  Play,
} from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/data/DataTable";
import { Modal } from "../../components/data/Modal";
import { PageHeader } from "../../components/data/PageHeader";
import { StatusBadge } from "../../components/data/StatusBadge";
import { AppShell } from "../../components/layout/AppShell";
import { Toast } from "../../components/ui/Toast";
import { productsApi, type Product } from "../../services/productsApi";
import { obtenerResumenCatalogoEcommerce, type ResumenCatalogoEcommerce } from "../../services/ecommerceApi";
import { EcommerceImage } from "../ecommerce/EcommerceImage";
import { formatProductName } from "../../services/productDisplay";
import { Image as ImageIcon } from "lucide-react";
import { apiErrorMessage } from "../../services/apiClient";
import { hasPermission } from "../../services/authorization";
import {
  productionRecipesApi,
  type MaterialList,
} from "../../services/productionRecipesApi";
import {
  productionOrdersApi,
  type ProductionConsumption,
  type ProductionCutConsumption,
  type ProductionFinishPreview,
  type ProductionHistory,
  type ProductionLookup,
  type ProductionOrderDetail,
  type ProductionOrderProduct,
  type ProductionResult,
  type ProductionStartPreview,
} from "../../services/productionOrdersApi";
import {
  productionDateTime,
  productionOrderNumber,
  productionStatusTone,
  quantity,
} from "./productionOrderUtils";
import "./productionOrders.css";

type Tab = "summary" | "models" | "materials" | "cuts" | "history";
const tabs: Array<[Tab, string]> = [
  ["summary", "Resumen"],
  ["models", "Modelos"],
  ["materials", "Materiales"],
  ["cuts", "Recortes"],
  ["history", "Historial"],
];
const normalized = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function ProductionOrderDetailPage({ orderId }: { orderId: number }) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogPhotos, setCatalogPhotos] = useState<ResumenCatalogoEcommerce[]>([]);
  const [order, setOrder] = useState<ProductionOrderDetail | null>(null);
  const [types, setTypes] = useState<ProductionLookup[]>([]);
  const [recipes, setRecipes] = useState<MaterialList[]>([]);
  const [consumptions, setConsumptions] = useState<ProductionConsumption[]>([]);
  const [results, setResults] = useState<ProductionResult[]>([]);
  const [cutConsumptions, setCutConsumptions] = useState<
    ProductionCutConsumption[]
  >([]);
  const [historyRows, setHistoryRows] = useState<ProductionHistory[]>([]);
  const [finishPreview, setFinishPreview] =
    useState<ProductionFinishPreview | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [startPreview, setStartPreview] =
    useState<ProductionStartPreview | null>(null);
  const [startLoading, setStartLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const returnUrl =
    sessionStorage.getItem("production-orders-return-url") ||
    "/production/orders";
  useEffect(() => {
    if (new URLSearchParams(location.search).get("accion") !== "cancelar")
      return;
    // El diálogo existente exige confirmación; nunca anulamos directamente.
    setCancelOpen(true);
    history.replaceState(null, "", location.pathname);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarnings([]);
    try {
      const [orderResult, typeResult, recipeResult] = await Promise.all([
        productionOrdersApi.getById(orderId),
        productionOrdersApi.types(),
        productionRecipesApi.lists(),
      ]);
      setOrder(orderResult);
      setTypes(typeResult);
      setRecipes(recipeResult);
      const settled = await Promise.allSettled([
        productionOrdersApi.consumptions(orderId),
        productionOrdersApi.results(orderId),
        productionOrdersApi.cutConsumptions(orderId),
        productionOrdersApi.history(orderId),
        productionOrdersApi.finishPreview(orderId),
      ]);
      if (settled[0].status === "fulfilled") setConsumptions(settled[0].value);
      else
        setWarnings((value) => [
          ...value,
          "No se pudieron consultar los consumos reales.",
        ]);
      if (settled[1].status === "fulfilled") setResults(settled[1].value);
      else
        setWarnings((value) => [
          ...value,
          "No se pudieron consultar los resultados.",
        ]);
      if (settled[2].status === "fulfilled")
        setCutConsumptions(settled[2].value);
      else
        setWarnings((value) => [
          ...value,
          "No se pudieron consultar los recortes consumidos.",
        ]);
      if (settled[3].status === "fulfilled") setHistoryRows(settled[3].value);
      else
        setWarnings((value) => [
          ...value,
          "No se pudo consultar el historial completo.",
        ]);
      if (settled[4].status === "fulfilled") setFinishPreview(settled[4].value);
      else
        setWarnings((value) => [
          ...value,
          "No se pudieron consultar los recortes previstos y recuperados.",
        ]);
    } catch (caught) {
      setError(
        apiErrorMessage(caught, "No se pudo consultar la orden de producción."),
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const saved = sessionStorage.getItem("production-order-notice");
    if (saved) {
      setNotice(saved);
      sessionStorage.removeItem("production-order-notice");
    }
  }, []);

  const recipeById = useMemo(
    () => new Map(recipes.map((item) => [item.listaMaterialesId, item])),
    [recipes],
  );
  const typeName = order
    ? (types.find((item) => item.id === order.tipoProduccionId)?.descripcion ??
      `Tipo ${order.tipoProduccionId}`)
    : "";
  const totalPlanned =
    order?.productos.reduce((sum, item) => sum + item.cantidadPlanificada, 0) ??
    0;
  const totalProduced = results.reduce(
    (sum, item) => sum + item.cantidadIngresada,
    0,
  );
  const state = order ? normalized(order.estadoOrdenProduccionNombre) : "";
  const isPending = state.includes("pendiente");
  const isRunning = state.includes("proceso");
  const canEdit = hasPermission("Producción", "Editar");
  const canCancel = isPending && hasPermission("Producción", "Inactivar");

  async function openStart() {
    setStartLoading(true);
    setError("");
    try {
      setStartPreview(await productionOrdersApi.startPreview(orderId));
    } catch (caught) {
      setError(
        apiErrorMessage(caught, "No se pudo preparar el inicio de producción."),
      );
    } finally {
      setStartLoading(false);
    }
  }
  async function startOrder() {
    if (!startPreview || starting || startPreview.tieneFaltantes) return;
    setStarting(true);
    try {
      await productionOrdersApi.start(
        orderId,
        startPreview.recortes.map((item) => ({
          recorteId: item.recorteId,
          cantidad: item.cantidadRequerida,
        })),
        null,
      );
      setStartPreview(null);
      setNotice("La producción se inició y los consumos quedaron registrados.");
      await load();
    } catch (caught) {
      setError(
        apiErrorMessage(
          caught,
          "No se pudo iniciar la producción. La disponibilidad pudo cambiar.",
        ),
      );
      setStartPreview(null);
    } finally {
      setStarting(false);
    }
  }
  async function cancelOrder() {
    if (!order || cancelling) return;
    setCancelling(true);
    try {
      await productionOrdersApi.cancel(
        order.ordenProduccionId,
        cancelReason.trim() || null,
      );
      setCancelOpen(false);
      setNotice("La orden fue cancelada.");
      await load();
    } catch (caught) {
      setError(apiErrorMessage(caught, "No se pudo cancelar la orden."));
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    let live = true;
    Promise.all([productsApi.list(), obtenerResumenCatalogoEcommerce()]).then(([products, images]) => {
      if (live) { setCatalogProducts(products); setCatalogPhotos(images); }
    }).catch(() => { /* Las fotos no bloquean el detalle de producción. */ });
    return () => { live = false; };
  }, []);
  const productById = new Map(catalogProducts.map(item => [item.productoId, item]));
  const photoById = new Map(catalogPhotos.map(item => [item.productoId, item.urlPortada]));

  const modelColumns: DataTableColumn<ProductionOrderProduct>[] = [
    {
      key: "model",
      header: "Modelo",
      width: "35%",
      render: (item) => (
        <div className="production-order-cell production-model-with-photo">
          <span className="production-product-photo">{photoById.get(item.productoId) ? <EcommerceImage url={photoById.get(item.productoId)} alt={item.productoNombre}/> : <ImageIcon size={19}/>}</span>
          <span><strong>{productById.get(item.productoId) ? formatProductName(productById.get(item.productoId)!) : item.productoNombre}</strong>
          <small>{item.productoCodigo}</small></span>
        </div>
      ),
    },
    {
      key: "recipe",
      header: "Configuración de fabricación",
      width: "37%",
      render: (item) =>
        item.listaMaterialesId ? (
          <div className="production-order-cell">
            <strong>
              {recipeById.get(item.listaMaterialesId)?.nombre ??
                `Configuración ${item.listaMaterialesId}`}
            </strong>
            <small>
              {recipeById.get(item.listaMaterialesId)?.version
                ? `Versión ${recipeById.get(item.listaMaterialesId)?.version}`
                : "Versión no informada"}
            </small>
          </div>
        ) : (
          <span>Sin configuración de insumos</span>
        ),
    },
    {
      key: "planned",
      header: "Planificado",
      width: "14%",
      className: "production-number",
      render: (item) => (
        <strong>{quantity.format(item.cantidadPlanificada)}</strong>
      ),
    },
    {
      key: "produced",
      header: "Fabricado",
      width: "14%",
      className: "production-number",
      render: (item) => (
        <strong>
          {quantity.format(
            results
              .filter((result) => result.productoId === item.productoId)
              .reduce((sum, result) => sum + result.cantidadIngresada, 0),
          )}
        </strong>
      ),
    },
  ];

  return (
    <AppShell
      title="Detalle de orden"
      breadcrumb="Producción / Órdenes de producción / Detalle"
    >
      <main className="production-orders-page production-detail-page">
        <Toast message={notice} onClose={() => setNotice("")} />
        <a className="production-back-link" href={returnUrl}>
          <ArrowLeft size={16} /> Volver a órdenes
        </a>
        {loading ? (
          <div className="production-detail-state">
            Consultando orden de producción…
          </div>
        ) : error || !order ? (
          <div className="production-message error" role="alert">
            <AlertCircle size={18} />
            <span>{error || "La orden solicitada no está disponible."}</span>
            <button
              type="button"
              className="button secondary"
              onClick={() => void load()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <PageHeader
              title={productionOrderNumber(order.ordenProduccionId)}
              description={`Creada el ${productionDateTime(order.fechaCreacion)}`}
              action={
                <div className="production-heading-actions">
                  <StatusBadge
                    tone={productionStatusTone(
                      order.estadoOrdenProduccionNombre,
                    )}
                  >
                    {order.estadoOrdenProduccionNombre}
                  </StatusBadge>
                  {isPending && canEdit && (
                    <button
                      className="button primary"
                      disabled={startLoading}
                      onClick={() => void openStart()}
                    >
                      <Play size={16} />
                      {startLoading ? "Consultando…" : "Iniciar producción"}
                    </button>
                  )}
                  {isRunning && canEdit && (
                    <a
                      className="button primary"
                      href={`/production/orders/${orderId}/finish`}
                    >
                      Finalizar producción
                    </a>
                  )}
                  {canCancel && (
                    <button
                      className="button danger-ghost"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancelar orden
                    </button>
                  )}
                </div>
              }
            />
            {warnings.length > 0 && (
              <div className="production-message warning">
                <AlertCircle size={18} />
                <span>{[...new Set(warnings)].join(" ")}</span>
              </div>
            )}
            <nav className="production-tabs" aria-label="Detalle de la orden">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={tab === key ? "active" : ""}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === "summary" && (
              <>
                <section className="production-detail-facts">
                  <div>
                    <CalendarDays size={19} />
                    <span>
                      <small>Fecha de creación</small>
                      <strong>{productionDateTime(order.fechaCreacion)}</strong>
                    </span>
                  </div>
                  <div>
                    <Layers3 size={19} />
                    <span>
                      <small>Tipo de producción</small>
                      <strong>{typeName}</strong>
                    </span>
                  </div>
                  <div>
                    <Box size={19} />
                    <span>
                      <small>Plan de fabricación</small>
                      <strong>
                        {order.productos.length} modelos ·{" "}
                        {quantity.format(totalPlanned)} unidades
                      </strong>
                    </span>
                  </div>
                </section>
                <section className="production-detail-grid">
                  <article className="production-detail-section">
                    <header>
                      <div>
                        <h2>Avance registrado</h2>
                      </div>
                    </header>
                    <div className="production-summary-facts">
                      <div>
                        <span>Inicio</span>
                        <strong>
                          {order.fechaInicio
                            ? productionDateTime(order.fechaInicio)
                            : "No iniciado"}
                        </strong>
                      </div>
                      <div>
                        <span>Finalización</span>
                        <strong>
                          {order.fechaFin
                            ? productionDateTime(order.fechaFin)
                            : "Sin finalizar"}
                        </strong>
                      </div>
                      <div>
                        <span>Ingresado</span>
                        <strong>
                          {quantity.format(totalProduced)} unidades
                        </strong>
                      </div>
                    </div>
                  </article>
                  <article className="production-detail-section">
                    <header>
                      <div>
                        <h2>Observaciones</h2>
                      </div>
                    </header>
                    <p className="production-observations">
                      {order.observaciones || "Sin observaciones."}
                    </p>
                  </article>
                </section>
              </>
            )}
            {tab === "models" && (
              <section className="production-detail-section">
                <header>
                  <div>
                    <h2>Modelos y cantidades</h2>
                  </div>
                </header>
                <DataTable
                  rows={order.productos}
                  columns={modelColumns}
                  rowKey={(item) => item.ordenProduccionDetalleId}
                  page={1}
                  pageSize={Math.max(1, order.productos.length)}
                  totalRecords={order.productos.length}
                  onPageChange={() => undefined}
                />
              </section>
            )}
            {tab === "materials" && (
              <section className="production-detail-section">
                <header>
                  <div>
                    <h2>Materiales consumidos</h2>
                  </div>
                </header>
                {consumptions.length ? (
                  <div className="production-record-list">
                    {consumptions.map((item) => (
                      <div key={item.consumoProduccionId}>
                        <span>
                          <strong>{item.insumoNombre}</strong>
                          <small>
                            {item.insumoCodigo} · {item.depositoNombre}
                          </small>
                        </span>
                        <b>{quantity.format(item.cantidadConsumida)}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="production-inline-empty">
                    Todavía no hay consumos reales registrados.
                  </div>
                )}
              </section>
            )}
            {tab === "cuts" && (
              <section className="production-detail-grid">
                <article className="production-detail-section">
                  <header>
                    <div>
                      <h2>Recortes previstos para recuperar</h2>
                    </div>
                  </header>
                  {finishPreview?.recortesPrevistos.length ? (
                    <div className="production-record-list">
                      {finishPreview.recortesPrevistos.map((item) => (
                        <div
                          key={item.ordenProduccionRecortePrevistoSnapshotId}
                        >
                          <span>
                            <strong>{item.insumoNombre}</strong>
                            <small>
                              {item.tipoRecorteNombre || "Sin tipo"} ·{" "}
                              {item.dimension ?? "Sin dimensión"}{" "}
                              {item.unidadMedidaAbreviatura}
                            </small>
                          </span>
                          <b>
                            {quantity.format(item.cantidadSugerida)}{" "}
                            {item.unidadMedidaAbreviatura}
                          </b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="production-inline-empty">
                      La configuración congelada no prevé recortes recuperables.
                    </div>
                  )}
                </article>
                <article className="production-detail-section">
                  <header>
                    <div>
                      <h2>Recortes seleccionados para consumo</h2>
                    </div>
                  </header>
                  {order.recortesPlanificados.length ? (
                    <div className="production-cut-list">
                      {order.recortesPlanificados.map((item) => (
                        <div key={item.recorteId}>
                          <span>Recorte #{item.recorteId}</span>
                          <strong>
                            {quantity.format(item.cantidadPlanificada)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="production-inline-empty">
                      No se seleccionaron recortes existentes.
                    </div>
                  )}
                </article>
                <article className="production-detail-section">
                  <header>
                    <div>
                      <h2>Recortes consumidos</h2>
                    </div>
                  </header>
                  {cutConsumptions.length ? (
                    <div className="production-record-list">
                      {cutConsumptions.map((item) => (
                        <div key={item.consumoRecorteProduccionId}>
                          <span>
                            <strong>{item.insumoNombre}</strong>
                            <small>
                              Recorte #{item.recorteId} · {item.depositoNombre}
                            </small>
                          </span>
                          <b>
                            {quantity.format(item.cantidadConsumida)}{" "}
                            {item.unidadMedidaAbreviatura}
                          </b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="production-inline-empty">
                      No hay recortes consumidos.
                    </div>
                  )}
                </article>
                <article className="production-detail-section">
                  <header>
                    <div>
                      <h2>Recortes recuperados</h2>
                    </div>
                  </header>
                  {finishPreview?.recortesRecuperados.length ? (
                    <div className="production-record-list">
                      {finishPreview.recortesRecuperados.map((item) => (
                        <div key={item.recorteId}>
                          <span>
                            <strong>{item.insumoNombre}</strong>
                            <small>
                              Recorte #{item.recorteId} ·{" "}
                              {item.estadoRecorteNombre}
                            </small>
                          </span>
                          <b>
                            {quantity.format(item.cantidad)}{" "}
                            {item.unidadMedidaAbreviatura}
                          </b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="production-inline-empty">
                      No hay recortes recuperados registrados.
                    </div>
                  )}
                </article>
              </section>
            )}
            {tab === "history" && (
              <section className="production-detail-section">
                <header>
                  <div>
                    <h2>Historial de estados</h2>
                  </div>
                </header>
                {historyRows.length ? (
                  <ol className="production-timeline">
                    {historyRows.map((item) => (
                      <li key={item.historialEstadoOrdenProduccionId}>
                        <span />
                        <div>
                          <strong>{item.estadoOrdenProduccionNombre}</strong>
                          <small>
                            {productionDateTime(item.fechaCambio)}
                            {item.observaciones
                              ? ` · ${item.observaciones}`
                              : ""}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="production-inline-empty">
                    No hay cambios de estado registrados.
                  </div>
                )}
              </section>
            )}
          </>
        )}
        {startPreview && (
          <Modal
            title="Confirmar inicio"
            subtitle={productionOrderNumber(orderId)}
            onClose={() => !starting && setStartPreview(null)}
          >
            <div className="production-operation-dialog">
              <p>
                Se consumirán los materiales y recortes indicados en una única
                transacción.
              </p>
              <h3>Materiales</h3>
              <div className="production-operation-list">
                {startPreview.materiales.map((item) => (
                  <div key={item.insumoId}>
                    <span>
                      <strong>{item.insumoNombre}</strong>
                      <small>
                        {item.depositoNombre} · disponibles{" "}
                        {quantity.format(item.cantidadDisponible)} {item.unidad}
                      </small>
                    </span>
                    <b className={item.faltante > 0 ? "error-text" : ""}>
                      {quantity.format(item.cantidadRequerida)} {item.unidad}
                    </b>
                  </div>
                ))}
              </div>
              <h3>Recortes existentes</h3>
              {startPreview.recortes.length ? (
                <div className="production-operation-list">
                  {startPreview.recortes.map((item) => (
                    <div key={item.recorteId}>
                      <span>
                        <strong>
                          Recorte #{item.recorteId} · {item.insumoNombre}
                        </strong>
                        <small>
                          {item.depositoNombre} · disponibles{" "}
                          {quantity.format(item.cantidadDisponible)}{" "}
                          {item.unidad}
                        </small>
                      </span>
                      <b className={item.faltante !== 0 ? "error-text" : ""}>
                        {quantity.format(item.cantidadRequerida)} {item.unidad}
                      </b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="production-inline-empty">
                  La orden no consume recortes existentes.
                </div>
              )}
              {startPreview.tieneFaltantes && (
                <div className="production-message error">
                  <AlertCircle size={18} />
                  <span>
                    La disponibilidad actual no satisface el plan congelado. El
                    inicio permanece bloqueado.
                  </span>
                </div>
              )}
              <footer>
                <button
                  className="button secondary"
                  disabled={starting}
                  onClick={() => setStartPreview(null)}
                >
                  Volver
                </button>
                <button
                  className="button primary"
                  disabled={starting || startPreview.tieneFaltantes}
                  onClick={() => void startOrder()}
                >
                  {starting ? "Iniciando…" : "Confirmar inicio"}
                </button>
              </footer>
            </div>
          </Modal>
        )}
        {cancelOpen && (
          <Modal
            title="Cancelar orden"
            subtitle={productionOrderNumber(orderId)}
            onClose={() => !cancelling && setCancelOpen(false)}
          >
            <div className="production-cancel-dialog">
              <p>
                Esta acción solo está disponible mientras la orden permanece
                Pendiente.
              </p>
              <label>
                <span>Observación opcional</span>
                <textarea
                  maxLength={250}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
              </label>
              <footer>
                <button
                  className="button secondary"
                  disabled={cancelling}
                  onClick={() => setCancelOpen(false)}
                >
                  Volver
                </button>
                <button
                  className="button danger"
                  disabled={cancelling}
                  onClick={() => void cancelOrder()}
                >
                  {cancelling ? "Cancelando…" : "Confirmar cancelación"}
                </button>
              </footer>
            </div>
          </Modal>
        )}
      </main>
    </AppShell>
  );
}
