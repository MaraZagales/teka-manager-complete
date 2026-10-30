import { createBudgetPdf } from "../../utils/budgetPdf";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Download, Printer, Mail, MessageCircle,
  AlertTriangle,
  Ban,
  Calculator,
  FileText,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Oportunidad } from "../../../../services/commercialApi";
import {
  enviarPresupuestoEmail,
  crearPresupuestoDirecto,
  guardarProductoPresupuesto,
  eliminarProductoPresupuesto,
  type Presupuesto,
  type PresupuestoDetalle,
  type ProductoPresupuesto,
} from "../../../../services/commercialOperationsApi";
import type { Product } from "../../../../services/productsApi";
import {
  salesOrdersApi,
  type SalesCustomer,
} from "../../../../services/salesOrdersApi";
import { invalidateBudgetRecord } from "../../hooks/useBudgetRecord";
import {
  availableBudgetStates,
  budgetCustomer,
  budgetNumber,
  budgetOrigin,
  budgetProductLabel,
  budgetProductName,
  budgetProductVariant,
  budgetStateTone,
  formatBudgetDate,
  formatBudgetMoney,
  isBudgetExpired,
  today,
} from "../../utils/budgetPresentation";
import { CustomerPredictiveSearch } from "../shared/CustomerPredictiveSearch";

type BudgetFormMode = "create" | "edit" | "view";
type DraftLine = {
  productId: number;
  quantity: string;
  price: number;
  discount: string;
  persisted: boolean;
  source?: ProductoPresupuesto;
};
type Props = {
  mode: BudgetFormMode;
  detail?: PresupuestoDetalle;
  customers?: SalesCustomer[];
  products?: Product[];
  opportunities?: Oportunidad[];
  initialCustomerId?: number | null;
  initialConsultationId?: number | null;
  initialOpportunityId?: number | null;
  initialProductId?: number | null;
  initialQuantity?: number | null;
  canEdit?: boolean;
  onStateChange?: (budget: Presupuesto) => void;
};

export function BudgetForm({
  mode,
  detail,
  customers = [],
  products = [],
  opportunities = [],
  initialCustomerId,
  initialConsultationId,
  initialOpportunityId,
  initialProductId,
  initialQuantity,
  canEdit = false,
  onStateChange,
}: Props) {
  const [emailOpen,setEmailOpen] = useState(false);
  const [emailTo,setEmailTo] = useState("");
  const customerEmail = customers.find(c => c.clienteId === Number(budget?.clienteId || customerId))?.email?.trim() || "";
  const [emailBusy,setEmailBusy] = useState(false);
  const [documentNotice,setDocumentNotice] = useState("");
  const editing = mode === "edit";
  const readonly = mode === "view";
  const budget = detail?.presupuesto;
  const initialOpportunity =
    initialOpportunityId || budget?.oportunidadComercialId || null;
  const opportunityRecord = opportunities.find(
    (item) => item.oportunidadComercialId === initialOpportunity,
  );
  const [customerId, setCustomerId] = useState(
    String(
      initialCustomerId ||
        opportunityRecord?.clienteId ||
        budget?.clienteId ||
        "",
    ),
  );
  const initialCustomer =
    customers.find((item) => item.clienteId === Number(customerId)) ||
    (budget?.clienteId
      ? {
          clienteId: budget.clienteId,
          nombre: budget.clienteNombre || "Cliente",
          apellido: budget.clienteApellido,
        }
      : null);
  const [expiry, setExpiry] = useState(
    budget?.fechaVencimiento?.slice(0, 10) || today(),
  );
  const [observations, setObservations] = useState(budget?.observaciones || "");
  const [lines, setLines] = useState<DraftLine[]>(
    () =>
      detail?.productos.map((line) => ({
        productId: line.productoId,
        quantity: String(line.cantidad),
        price: Number(line.precioUnitario),
        discount: String(line.descuentoPorcentaje),
        persisted: true,
        source: line,
      })) || [],
  );
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(String(initialQuantity || 1));
  const [discount, setDiscount] = useState("0");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const submitLock = useRef(false);
  const allowNavigation = useRef(false);
  const initialProductLoaded = useRef(false);
  const consultationId =
    initialConsultationId ||
    (initialOpportunityId ? opportunityRecord?.interesComercialId : null) ||
    budget?.interesComercialId ||
    null;
  const activeOpportunity = opportunityRecord;
  const visibleProducts = useMemo(
    () =>
      products
        .filter((item) =>
          `${item.codigo} ${item.nombre} ${item.nombreCatalogo || ""} ${item.colorNombre || ""}`
            .toLocaleLowerCase("es")
            .includes(productSearch.trim().toLocaleLowerCase("es")),
        )
        .slice(0, 100),
    [products, productSearch],
  );
  const initialLinesSnapshot = useMemo(
    () =>
      JSON.stringify(
        (detail?.productos || []).map((line) => [
          line.productoId,
          String(line.cantidad),
          Number(line.precioUnitario),
          String(line.descuentoPorcentaje),
        ]),
      ),
    [detail],
  );
  const linesSnapshot = JSON.stringify(
    lines.map(
      ({
        productId,
        quantity: lineQuantity,
        price,
        discount: lineDiscount,
      }) => [productId, lineQuantity, price, lineDiscount],
    ),
  );
  const dirty =
    !readonly &&
    (editing
      ? linesSnapshot !== initialLinesSnapshot
      : Boolean(
          customerId ||
            initialOpportunity ||
            observations ||
            lines.length ||
            expiry !== today(),
        ));
  const total = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum +
          (Number(line.quantity) || 0) *
            line.price *
            (1 - (Number(line.discount) || 0) / 100),
        0,
      ),
    [lines],
  );
  const expired = budget ? isBudgetExpired(budget) : false;

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (!dirty || saving || allowNavigation.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, saving]);
  useEffect(() => {
    if (mode !== "create" || !initialProductId || initialProductLoaded.current)
      return;
    initialProductLoaded.current = true;
    setSelectedProductId(String(initialProductId));
    void selectProduct(String(initialProductId));
  }, [initialProductId, mode]);

  async function sendBudgetEmail() {
    if (!detail || !emailTo.trim() || emailBusy) return;
    setEmailBusy(true); setDocumentNotice("");
    try {
      const {doc} = await createBudgetPdf(detail, products);
      const base64 = (doc.output("datauristring") as string).split(",")[1];
      await enviarPresupuestoEmail(detail.presupuesto.presupuestoComercialId,emailTo.trim(),base64);
      setEmailOpen(false);setDocumentNotice("Presupuesto enviado correctamente.");
    } catch(e) {setDocumentNotice(e instanceof Error?e.message:"No se pudo enviar el correo.");}
    finally {setEmailBusy(false);}
  }
  async function shareBudget() {
    if (!detail) return;
    const {doc, filename} = await createBudgetPdf(detail, products);
    doc.save(filename);
    window.open(`https://wa.me/?text=${encodeURIComponent(`Hola, te compartimos el presupuesto TEKA N° ${detail.presupuesto.numero || detail.presupuesto.presupuestoComercialId}. Adjuntá el PDF descargado.`)}`,"_blank","noopener,noreferrer");
  }
  function linePresentation(line: DraftLine) {
    return (
      products.find((item) => item.productoId === line.productId) || line.source
    );
  }
  async function selectProduct(value: string) {
    setSelectedProductId(value);
    setCurrentPrice(null);
    setPriceError("");
    const id = Number(value);
    if (!id) return;
    setPriceLoading(true);
    try {
      const result = await salesOrdersApi.currentPrice(id);
      if (
        !result.activo ||
        !Number.isFinite(result.precio) ||
        result.precio <= 0
      )
        throw new Error(
          "El producto no tiene un precio de venta vigente válido.",
        );
      setCurrentPrice(Number(result.precio));
    } catch (caught) {
      setPriceError(
        caught instanceof Error
          ? caught.message
          : "No se pudo recuperar el precio vigente.",
      );
    } finally {
      setPriceLoading(false);
    }
  }
  function addLine() {
    const productId = Number(selectedProductId);
    const parsedQuantity = Number(quantity);
    const parsedDiscount = Number(discount);
    if (
      !productId ||
      !currentPrice ||
      !Number.isSafeInteger(parsedQuantity) || parsedQuantity <= 0 ||
      parsedDiscount < 0 ||
      parsedDiscount > 100
    ) {
      setPriceError(
        "Seleccioná un producto con precio vigente e ingresá cantidad y descuento válidos.",
      );
      return;
    }
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      const next = {
        productId,
        quantity: String(parsedQuantity),
        price: currentPrice,
        discount: String(parsedDiscount),
        persisted: existing?.persisted || false,
        source: existing?.source,
      };
      return [...current.filter((line) => line.productId !== productId), next];
    });
    setSelectedProductId("");
    setQuantity("1");
    setDiscount("0");
    setCurrentPrice(null);
    setPriceError("");
    setErrors((current) => ({ ...current, lines: "" }));
  }
  function updateLine(
    index: number,
    field: "quantity" | "discount",
    value: string,
  ) {
    if (!readonly)
      setLines((current) =>
        current.map((line, position) =>
          position === index ? { ...line, [field]: value } : line,
        ),
      );
  }
  function validate() {
    const next: Record<string, string> = {};
    if (!editing && !Number(customerId))
      next.customerId = "Seleccioná un cliente.";
    if (!editing && (!expiry || expiry < today()))
      next.expiry = "Ingresá una fecha de vencimiento válida.";
    if (!editing && observations.length > 1000)
      next.observations =
        "Las observaciones no pueden superar 1000 caracteres.";
    if (!lines.length) next.lines = "Agregá al menos un producto.";
    if (
      lines.some(
        (line) =>
          !Number.isSafeInteger(Number(line.quantity)) || Number(line.quantity) <= 0 ||
          line.price <= 0 ||
          Number(line.discount) < 0 ||
          Number(line.discount) > 100,
      )
    )
      next.lines = "Revisá cantidades, precios y descuentos de los productos.";
    if (
      !editing &&
      initialOpportunity &&
      (!activeOpportunity || activeOpportunity.clienteId !== Number(customerId))
    )
      next.opportunityId =
        "La oportunidad de origen no corresponde al cliente indicado.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function leave() {
    allowNavigation.current = true;
    location.href =
      editing && budget
        ? `/comercial/presupuestos/${budget.presupuestoComercialId}`
        : "/comercial/presupuestos";
  }
  function lineChanged(line: DraftLine) {
    const original = detail?.productos.find(
      (item) => item.productoId === line.productId,
    );
    return (
      !original ||
      Number(line.quantity) !== Number(original.cantidad) ||
      line.price !== Number(original.precioUnitario) ||
      Number(line.discount) !== Number(original.descuentoPorcentaje)
    );
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readonly || submitLock.current || !validate()) return;
    submitLock.current = true;
    setSaving(true);
    setSubmitError("");
    try {
      let id = budget?.presupuestoComercialId;
      if (editing && id) {
        const removed = (detail?.productos || []).filter(original => !lines.some(line => line.productId === original.productoId));
        for (const item of removed) await eliminarProductoPresupuesto(id, item.productoId);
        const changed = lines.filter(lineChanged);
        await Promise.all(
          changed.map((line) =>
            guardarProductoPresupuesto(id!, {
              productoId: line.productId,
              cantidad: Number(line.quantity),
              precioUnitario: line.price,
              descuentoPorcentaje: Number(line.discount),
            }),
          ),
        );
      } else {
        const created = await crearPresupuestoDirecto({
          clienteId: Number(customerId),
          interesComercialId: consultationId,
          oportunidadComercialId: initialOpportunity,
          fechaVencimiento: expiry,
          observaciones: observations.trim() || undefined,
          productos: lines.map((line) => ({
            productoId: line.productId,
            cantidad: Number(line.quantity),
            precioUnitario: line.price,
            descuentoPorcentaje: Number(line.discount),
          })),
        });
        id = created.presupuestoComercialId;
      }
      invalidateBudgetRecord(id);
      allowNavigation.current = true;
      sessionStorage.setItem(
        "budget-notice",
        editing
          ? `Presupuesto ${budget ? budgetNumber(budget) : ""} actualizado correctamente.`
          : `Presupuesto ${id} registrado correctamente.`,
      );
      location.href = `/comercial/presupuestos/${id}`;
    } catch (caught) {
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar el presupuesto.",
      );
      setSaving(false);
      submitLock.current = false;
    }
  }

  const title =
    mode === "create"
      ? "Registrar presupuesto"
      : mode === "edit"
        ? `Editar presupuesto ${budget ? budgetNumber(budget) : ""}`
        : `Consultar presupuesto ${budget ? budgetNumber(budget) : ""}`;
  return (
    <>
      {documentNotice && <div role="status" className="budget-document-notice">{documentNotice}</div>}
      {emailOpen && <div className="budget-mail-backdrop" role="presentation"><div className="budget-mail-dialog" role="dialog" aria-modal="true" aria-label="Enviar presupuesto por correo"><h3>Enviar presupuesto por correo</h3><p>Se adjuntará el presupuesto en PDF.</p><label>Correo del destinatario<input type="email" autoFocus value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder={customerEmail || "El cliente no tiene correo registrado"}/></label><div><button type="button" className="button secondary" disabled={emailBusy} onClick={()=>setEmailOpen(false)}>Cancelar</button><button type="button" className="button primary" disabled={emailBusy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)} onClick={()=>void sendBudgetEmail()}>{emailBusy?"Enviando…":"Enviar PDF"}</button></div></div></div>}
      <form
        className={`product-editor budget-editor product-editor-${mode}`}
        noValidate
        onSubmit={submit}
      >
        <header className="product-editor-header">
          <div className="product-editor-heading">
            <h1>{title}</h1>
          </div>
          <div className="product-editor-actions">
            {readonly ? (
              <>
                {detail && <>
                  <button type="button" className="button secondary" onClick={async()=>{if(!detail)return;const {doc}=await createBudgetPdf(detail, products);doc.autoPrint();window.open(doc.output("bloburl"),"_blank","noopener,noreferrer");}}><Printer size={16}/>Imprimir</button>
                  <button type="button" className="button secondary" onClick={async()=>{if(!detail)return;const {doc,filename}=await createBudgetPdf(detail, products);doc.save(filename);}}><Download size={16}/>Descargar PDF</button>
                  <button type="button" className="button secondary" onClick={()=>{setEmailTo(customerEmail);setEmailOpen(true);}}><Mail size={16}/>Enviar correo</button>
                  <button type="button" className="button secondary" onClick={shareBudget}><MessageCircle size={16}/>WhatsApp</button>
                </>}
                {canEdit && budget?.estado === "Borrador" && (
                  <a
                    className="button secondary"
                    href={`/comercial/presupuestos/${budget.presupuestoComercialId}/edit`}
                  >
                    <Pencil size={16} />
                    Editar productos
                  </a>
                )}
                {canEdit &&
                  budget &&
                  availableBudgetStates(budget).length > 0 &&
                  onStateChange && (
                    <button
                      type="button"
                      className="button primary"
                      onClick={() => onStateChange(budget)}
                    >
                      <RefreshCw size={16} />
                      Cambiar estado
                    </button>
                  )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="button secondary"
                  disabled={saving}
                  onClick={() => (dirty ? setConfirmCancel(true) : leave())}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={saving || priceLoading || (editing && !dirty)}
                >
                  <Save size={16} />
                  {saving
                    ? "Guardando…"
                    : editing
                      ? "Guardar cambios"
                      : "Guardar presupuesto"}
                </button>
              </>
            )}
          </div>
        </header>
        {submitError && (
          <div className="product-form-alert" role="alert">
            <Ban size={18} />
            <span>{submitError}</span>
          </div>
        )}
        {expired && (
          <div className="product-detail-warning">
            <AlertTriangle size={17} />
            La fecha de vencimiento ya transcurrió. El estado persistido
            continúa siendo <strong>{budget?.estado}</strong> hasta que se
            registre una transición permitida.
          </div>
        )}
        <div className="budget-form-layout">
          <div className="product-form-main">
            <section className="product-form-section">
              <header>
                <span>
                  <UserRound size={18} />
                </span>
                <div>
                  <h2>Datos generales</h2>
                </div>
              </header>
              <div className="product-form-grid">
                {budget ? (
                  <>
                    <ReadField label="Cliente" value={budgetCustomer(budget)} />
                    <ReadField
                      label="Origen comercial"
                      value={budgetOrigin(budget)}
                    />
                    <ReadField
                      label="Fecha de emisión"
                      value={formatBudgetDate(budget.fechaEmision)}
                    />
                    <ReadField
                      label="Fecha de vencimiento"
                      value={formatBudgetDate(budget.fechaVencimiento)}
                    />
                    <ReadField
                      label="Estado"
                      value={
                        <StatusBadge tone={budgetStateTone(budget.estado)}>
                          {budget.estado}
                        </StatusBadge>
                      }
                    />
                    <ReadField
                      label="Observaciones"
                      value={observations || "Sin observaciones"}
                      wide
                    />
                  </>
                ) : (
                  <>
                    <CustomerPredictiveSearch
                      value={Number(customerId) || null}
                      initialCustomer={initialCustomer}
                      disabled={Boolean(initialOpportunity || consultationId)}
                      error={errors.customerId || errors.opportunityId}
                      onChange={(customer) => {
                        setCustomerId(
                          customer ? String(customer.clienteId) : "",
                        );
                        setErrors((current) => ({
                          ...current,
                          customerId: "",
                        }));
                      }}
                    />
                    <label
                      className={`product-field ${errors.expiry ? "field-invalid" : ""}`}
                    >
                      <span>
                        Fecha de vencimiento <b>*</b>
                      </span>
                      <input
                        type="date"
                        min={today()}
                        value={expiry}
                        onChange={(event) => {
                          setExpiry(event.target.value);
                          setErrors((current) => ({ ...current, expiry: "" }));
                        }}
                      />
                      {errors.expiry && (
                        <p className="field-error">{errors.expiry}</p>
                      )}
                    </label>
                    <label
                      className={`product-field product-field-wide ${errors.observations ? "field-invalid" : ""}`}
                    >
                      <span>Observaciones</span>
                      <textarea
                        maxLength={1000}
                        value={observations}
                        onChange={(event) => {
                          setObservations(event.target.value);
                          setErrors((current) => ({
                            ...current,
                            observations: "",
                          }));
                        }}
                        placeholder="Información adicional para el presupuesto"
                      />
                      <small>{observations.length}/1000</small>
                      {errors.observations && (
                        <p className="field-error">{errors.observations}</p>
                      )}
                    </label>
                  </>
                )}
              </div>
            </section>
            <section className="product-form-section">
              <header>
                <span>
                  <Package size={18} />
                </span>
                <div>
                  <h2>Productos</h2>
                </div>
              </header>
              {!readonly && (
                <>
                  <div className="budget-product-picker">
                    <label className="product-field">
                      <span>Buscar producto</span>
                      <input
                        value={productSearch}
                        onChange={(event) =>
                          setProductSearch(event.target.value)
                        }
                        placeholder="Nombre, variante o código"
                      />
                    </label>
                    <label className="product-field">
                      <span>Producto</span>
                      <select
                        value={selectedProductId}
                        onChange={(event) =>
                          void selectProduct(event.target.value)
                        }
                      >
                        <option value="">Seleccioná un producto</option>
                        {visibleProducts.map((product) => (
                          <option
                            key={product.productoId}
                            value={product.productoId}
                          >
                            {budgetProductLabel(product)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="product-field">
                      <span>Cantidad</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                      />
                    </label>
                    <label className="product-field">
                      <span>Precio unitario</span>
                      <input
                        readOnly
                        value={
                          priceLoading
                            ? "Consultando…"
                            : currentPrice == null
                              ? "—"
                              : formatBudgetMoney(currentPrice)
                        }
                      />
                    </label>
                    <label className="product-field">
                      <span>Descuento %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={discount}
                        onChange={(event) => setDiscount(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="button secondary budget-add-product"
                      disabled={priceLoading || !currentPrice}
                      onClick={addLine}
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                  {priceError && (
                    <div className="budget-inline-error" role="alert">
                      {priceError}
                    </div>
                  )}
                  {errors.lines && (
                    <div className="budget-inline-error" role="alert">
                      {errors.lines}
                    </div>
                  )}
                </>
              )}
              {lines.length ? (
                <div className="budget-lines-table-wrap">
                  <table
                    className={`budget-lines-table budget-edit-lines ${readonly ? "budget-view-lines" : ""}`}
                  >
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Descuento</th>
                        <th>Subtotal</th>
                        {!readonly && <th />}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => {
                        const presentation = linePresentation(line);
                        const variant = budgetProductVariant(presentation);
                        return (
                          <tr key={line.productId}>
                            <td>
                              <span className="budget-product-name">
                                <strong>
                                  {budgetProductName(presentation)}
                                </strong>
                                {variant && <small>{variant}</small>}
                              </span>
                            </td>
                            <td>
                              {readonly ? (
                                Number(line.quantity).toLocaleString("es-AR")
                              ) : (
                                <input
                                  aria-label={`Cantidad de ${budgetProductLabel(presentation)}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={line.quantity}
                                  onChange={(event) =>
                                    updateLine(
                                      index,
                                      "quantity",
                                      event.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td>{formatBudgetMoney(line.price)}</td>
                            <td>
                              {readonly ? (
                                `${Number(line.discount).toLocaleString("es-AR")}%`
                              ) : (
                                <input
                                  aria-label={`Descuento de ${budgetProductLabel(presentation)}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={line.discount}
                                  onChange={(event) =>
                                    updateLine(
                                      index,
                                      "discount",
                                      event.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td>
                              {formatBudgetMoney(
                                Number(line.quantity) *
                                  line.price *
                                  (1 - Number(line.discount) / 100),
                              )}
                            </td>
                            {!readonly && (
                              <td>
                                {(
                                  <button
                                    type="button"
                                    className="budget-remove-line"
                                    onClick={() =>
                                      setLines((current) =>
                                        current.filter(
                                          (_, position) => position !== index,
                                        ),
                                      )
                                    }
                                    aria-label={`Quitar ${budgetProductLabel(presentation)}`}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="budget-products-empty">
                  <Package size={22} />
                  <span>El presupuesto no tiene productos.</span>
                </div>
              )}
            </section>
          </div>
          <aside className="product-form-side">
            <section className="product-form-section budget-summary-card">
              <header>
                <span>
                  <Calculator size={18} />
                </span>
                <div>
                  <h2>Resumen</h2>
                </div>
              </header>
              <div>
                <span>Productos</span>
                <strong>{lines.length}</strong>
              </div>
              <div className="budget-summary-total">
                <span>Importe total</span>
                <strong>{formatBudgetMoney(total)}</strong>
              </div>
              {consultationId && (
                <p>
                  <FileText size={15} />
                  Vinculado a consulta {consultationId}
                </p>
              )}
              {(budget?.oportunidadComercialId || activeOpportunity) && (
                <p>
                  <FileText size={15} />
                  Vinculado a oportunidad{" "}
                  {budget?.oportunidadComercialId ||
                    activeOpportunity?.oportunidadComercialId}
                </p>
              )}
            </section>
          </aside>
        </div>
      </form>
      {confirmCancel && (
        <Modal
          title="Descartar cambios"
          subtitle="Los datos sin guardar se perderán."
          onClose={() => setConfirmCancel(false)}
        >
          <div className="product-confirm-dialog">
            <div>
              <Ban size={19} />
              <p>¿Querés salir sin guardar los cambios del presupuesto?</p>
            </div>
            <footer>
              <button
                type="button"
                className="button secondary"
                onClick={() => setConfirmCancel(false)}
              >
                Continuar editando
              </button>
              <button type="button" className="button danger" onClick={leave}>
                Descartar cambios
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </>
  );
}

function ReadField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`product-field budget-read-field ${wide ? "product-field-wide" : ""}`}
    >
      <span>{label}</span>
      <div>{value}</div>
    </div>
  );
}
