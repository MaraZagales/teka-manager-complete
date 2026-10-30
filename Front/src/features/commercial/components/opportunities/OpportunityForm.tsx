import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Ban,
  CalendarPlus,
  ClipboardList,
  FileText,
  Pencil,
  Save,
  ShoppingCart,
  UserCog,
  UserRound,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type {
  Actividad,
  OpportunityCatalogProduct,
  OpportunityCustomer,
  OpportunityDetail,
  OpportunityLookup,
  OpportunityProduct,
  Presupuesto,
} from "../../../../services/commercialOperationsApi";
import {
  actualizarOportunidad,
  crearOportunidad,
  crearOportunidadDesdeConsulta,
  eliminarProductoOportunidad,
  guardarProductoOportunidad,
} from "../../../../services/commercialOperationsApi";
import { budgetNumber, formatBudgetDate } from "../../utils/budgetPresentation";
import { formatActivityDateTime } from "../../utils/agendaPresentation";
import {
  calculateOpportunityProbability,
  formatOpportunityDate,
  formatOpportunityMoney,
  isOpportunityClosed,
  lookupId,
  lookupName,
  opportunityCustomer,
  opportunityStateTone,
  toDateInput,
  type OpportunityAction,
} from "../../utils/opportunityPresentation";
import { OpportunityHistory } from "./OpportunityHistory";
import { OpportunityProducts } from "./OpportunityProducts";
import { CustomerPredictiveSearch } from "../shared/CustomerPredictiveSearch";
import type { CommercialCustomerSuggestion } from "../../../../services/commercialCustomersApi";

export type OpportunityFormMode = "create" | "edit" | "view";
type Props = {
  mode: OpportunityFormMode;
  detail?: OpportunityDetail;
  activities?: Actividad[];
  budgets?: Presupuesto[];
  customers?: OpportunityCustomer[];
  products?: OpportunityCatalogProduct[];
  channels?: OpportunityLookup[];
  states?: OpportunityLookup[];
  initialCustomerId?: number | null;
  initialConsultationId?: number | null;
  initialProductId?: number | null;
  initialQuantity?: number | null;
  initialChannelId?: number | null;
  initialInterest?: string;
  canEdit?: boolean;
  canCreate?: boolean;
  canConvert?: boolean;
  onAction?: (action: OpportunityAction) => void;
  onReload?: () => Promise<void> | void;
};

export function OpportunityForm({
  mode,
  detail,
  activities = [],
  budgets = [],
  customers = [],
  products = [],
  channels = [],
  states = [],
  initialCustomerId,
  initialConsultationId,
  initialProductId,
  initialQuantity,
  initialChannelId,
  initialInterest,
  canEdit = false,
  canCreate = false,
  canConvert = false,
  onAction,
}: Props) {
  const readonly = mode === "view",
    editing = mode === "edit";
  const [customerId, setCustomerId] = useState(
    String(detail?.clienteId || initialCustomerId || ""),
  );
  const initialCustomer =
    customers.find((item) => item.clienteId === Number(customerId)) ||
    (detail?.clienteId
      ? {
          clienteId: detail.clienteId,
          nombre: detail.clienteNombre || "Cliente",
          apellido: detail.clienteApellido,
        }
      : null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CommercialCustomerSuggestion | null>(initialCustomer);
  const [type, setType] = useState(detail?.tipoCliente || "particular");
  const [channelId, setChannelId] = useState(
    String(detail?.canalVentaId || initialChannelId || ""),
  );
  const [interest, setInterest] = useState(
    detail?.interes || initialInterest || "",
  );
  const [stateId, setStateId] = useState(
    String(detail?.estadoOportunidadComercialId || ""),
  );
  const [nextAction, setNextAction] = useState(detail?.proximaAccion || "");
  const [nextDate, setNextDate] = useState(
    toDateInput(detail?.fechaProximaAccion),
  );
  const [notes, setNotes] = useState(detail?.observaciones || "");
  const [draftProducts, setDraftProducts] = useState<OpportunityProduct[]>(
    detail?.productos || [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  const customerName = detail
    ? opportunityCustomer(detail)
    : selectedCustomer
      ? [selectedCustomer.nombre, selectedCustomer.apellido]
          .filter(Boolean)
          .join(" ")
      : "Cliente sin seleccionar";
  const amount = useMemo(
    () =>
      draftProducts.reduce(
        (total, item) =>
          total + item.cantidad * Number(item.precioReferencia || 0),
        0,
      ),
    [draftProducts],
  );
  const selectedState =
    detail?.estadoOportunidadNombre ||
    lookupName(
      states.find((item) => lookupId(item, "state") === Number(stateId)),
    );
  const probability = useMemo(
    () =>
      calculateOpportunityProbability(
        selectedState,
        draftProducts.length,
        activities,
        budgets,
      ),
    [selectedState, draftProducts.length, activities, budgets],
  );
  const initial = useMemo(
    () =>
      JSON.stringify({
        customerId: String(detail?.clienteId || initialCustomerId || ""),
        type: detail?.tipoCliente || "particular",
        channelId: String(detail?.canalVentaId || initialChannelId || ""),
        interest: detail?.interes || initialInterest || "",
        stateId: String(detail?.estadoOportunidadComercialId || ""),
        nextAction: detail?.proximaAccion || "",
        nextDate: toDateInput(detail?.fechaProximaAccion),
        notes: detail?.observaciones || "",
      }),
    [detail, initialCustomerId, initialChannelId, initialInterest],
  );
  const dirty =
    !readonly &&
    JSON.stringify({
      customerId,
      type,
      channelId,
      interest,
      stateId,
      nextAction,
      nextDate,
      notes,
    }) !== initial;
  const sourceBlocked = false;
  const editableStates = states.filter(
    (item) =>
      !/convertida|perdida|cancelada/i.test(lookupName(item)) ||
      lookupId(item, "state") === detail?.estadoOportunidadComercialId,
  );
  const conversionReady = Boolean(
    detail?.clienteId &&
      draftProducts.length &&
      draftProducts.every(
        (item) => item.cantidad > 0 && Number(item.precioReferencia) > 0,
      ),
  );

  function validate() {
    if (!Number(customerId)) return "Seleccioná un cliente activo.";
    if (!Number(channelId)) return "Seleccioná el canal comercial.";
    if (!interest.trim()) return "Describí el interés comercial.";
    if (interest.trim().length > 150)
      return "El interés admite hasta 150 caracteres.";
    if (
      draftProducts.some(
        (item) => item.cantidad <= 0 || !Number.isFinite(item.cantidad),
      )
    )
      return "Revisá las cantidades de los productos.";
    if (
      draftProducts.some(
        (item) =>
          !Number.isFinite(Number(item.precioReferencia)) ||
          Number(item.precioReferencia) <= 0,
      )
    )
      return "Todos los productos deben tener un precio de venta vigente.";
    if (nextAction.length > 250 || notes.length > 500)
      return "Revisá la extensión de la próxima acción y las observaciones.";
    if (editing && !Number(stateId)) return "Seleccioná un estado válido.";
    return "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitLock.current) return;
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    const customer = selectedCustomer || customers.find((item) => item.clienteId === Number(customerId)) || null;
    if (!customer) {
      setError("El cliente seleccionado no está disponible.");
      return;
    }
    const payload = {
      clienteId: customer.clienteId,
      clienteNombre: customer.nombre.trim(),
      clienteApellido: customer.apellido?.trim() || null,
      tipoCliente: type,
      canalVentaId: Number(channelId),
      interes: interest.trim(),
      montoEstimado: amount,
      probabilidad: probability.value,
      proximaAccion: nextAction.trim() || null,
      fechaProximaAccion: nextDate || null,
      observaciones: notes.trim() || null,
    };
    submitLock.current = true;
    setSaving(true);
    setError("");
    let createdId: number | null = null;
    try {
      if (editing && detail) {
        await actualizarOportunidad(detail.oportunidadComercialId, {
          ...payload,
          estadoOportunidadComercialId: Number(stateId),
        });
        sessionStorage.setItem(
          "opportunity-notice",
          "Oportunidad actualizada correctamente.",
        );
        location.href = `/comercial/oportunidades/${detail.oportunidadComercialId}`;
        return;
      }
      const created = initialConsultationId
        ? await crearOportunidadDesdeConsulta(initialConsultationId, {
            interes: payload.interes,
            proximaAccion: payload.proximaAccion,
            fechaProximaAccion: payload.fechaProximaAccion,
            observaciones: payload.observaciones,
          })
        : await crearOportunidad(payload);
      createdId = created.oportunidadComercialId;
      await Promise.all(
        draftProducts.map((item) =>
          guardarProductoOportunidad(
            created.oportunidadComercialId,
            item.productoId,
            item.cantidad,
          ),
        ),
      );
      sessionStorage.setItem(
        "opportunity-notice",
        "Oportunidad registrada correctamente.",
      );
      location.href = `/comercial/oportunidades/${created.oportunidadComercialId}`;
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar la oportunidad.";
      if (createdId) {
        sessionStorage.setItem(
          "opportunity-notice",
          `La oportunidad fue registrada, pero alguna asociación no pudo completarse: ${message}`,
        );
        location.href = `/comercial/oportunidades/${createdId}`;
        return;
      }
      setError(message);
      submitLock.current = false;
      setSaving(false);
    }
  }

  async function saveProduct(
    productId: number,
    quantity: number,
    productName: string,
    currentPrice: number,
  ) {
    if (editing && detail)
      await guardarProductoOportunidad(
        detail.oportunidadComercialId,
        productId,
        quantity,
      );
    setDraftProducts((current) => [
      ...current.filter((item) => item.productoId !== productId),
      {
        oportunidadProductoId:
          current.find((item) => item.productoId === productId)
            ?.oportunidadProductoId || -productId,
        productoId: productId,
        productoNombre: productName,
        cantidad: quantity,
        precioReferencia: currentPrice,
      },
    ]);
  }

  async function removeProduct(productId: number) {
    if (editing && detail)
      await eliminarProductoOportunidad(
        detail.oportunidadComercialId,
        productId,
      );
    setDraftProducts((current) =>
      current.filter((item) => item.productoId !== productId),
    );
  }

  function convertToOrder() {
    if (!detail || !conversionReady || !canConvert) return;
    sessionStorage.setItem(
      "teka-pedido-borrador",
      JSON.stringify({
        origin: "opportunity",
        opportunityId: detail.oportunidadComercialId,
        customerId: detail.clienteId,
        channelId: String(detail.canalVentaId),
        observations: detail.observaciones || "",
        requestedStep: 3,
        lines: draftProducts.map((item) => ({
          id: item.productoId,
          quantity: String(item.cantidad),
        })),
      }),
    );
    location.href = "/ventas/pedidos/nuevo?origen=oportunidad";
  }

  const agendaUrl = detail?.clienteId
    ? `/comercial/agenda/new?clienteId=${detail.clienteId}&oportunidadId=${detail.oportunidadComercialId}${detail.interesComercialId ? `&consultaId=${detail.interesComercialId}` : ""}`
    : "/comercial/agenda/new";
  const budgetUrl = detail?.clienteId
    ? `/comercial/presupuestos?clienteId=${detail.clienteId}&oportunidadId=${detail.oportunidadComercialId}${detail.interesComercialId ? `&consultaId=${detail.interesComercialId}` : ""}`
    : "/comercial/presupuestos/new";
  const heading = readonly
    ? "Consultar oportunidad"
    : editing
      ? "Editar oportunidad"
      : "Registrar oportunidad";

  return (
    <form
      className={`product-editor opportunity-editor product-editor-${mode}`}
      noValidate
      onSubmit={submit}
    >
      <header className="product-editor-header">
        <div className="product-editor-heading">
          <h1>{heading}</h1>
        </div>
        <div className="product-editor-actions">
          {readonly ? (
            <>
              {canCreate && detail?.clienteId && (
                <a className="button secondary" href={agendaUrl}>
                  <CalendarPlus size={16} />
                  Programar actividad
                </a>
              )}
              {canCreate && detail?.clienteId && (
                <a className="button secondary" href={budgetUrl}>
                  <FileText size={16} />
                  Registrar presupuesto
                </a>
              )}
              {canEdit && detail && !isOpportunityClosed(detail) && (
                <a
                  className="button primary"
                  href={`/comercial/oportunidades/${detail.oportunidadComercialId}/edit`}
                >
                  <Pencil size={16} />
                  Editar
                </a>
              )}
            </>
          ) : (
            <>
              <a
                className="button secondary"
                href={
                  detail
                    ? `/comercial/oportunidades/${detail.oportunidadComercialId}`
                    : "/comercial/oportunidades"
                }
              >
                Cancelar
              </a>
              <button
                type="submit"
                className="button primary"
                disabled={saving || sourceBlocked || (editing && !dirty)}
              >
                <Save size={16} />
                {saving ? "Guardando…" : "Guardar oportunidad"}
              </button>
            </>
          )}
        </div>
      </header>
      {error && (
        <div className="product-form-alert" role="alert">
          <Ban size={18} />
          {error}
        </div>
      )}
      <div className="opportunity-form-layout">
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
              {readonly ? (
                <>
                  <ReadField label="Cliente" value={customerName} />
                  <ReadField
                    label="Tipo de cliente"
                    value={detail?.tipoCliente || "—"}
                  />
                  <ReadField
                    label="Canal comercial"
                    value={detail?.canalVentaNombre || "—"}
                  />
                  <ReadField
                    label="Interés comercial"
                    value={detail?.interes || "Sin descripción"}
                    wide
                  />
                  {detail?.interesComercialId && (
                    <ReadField
                      label="Consulta de origen"
                      value={
                        <a
                          href={`/comercial/consultas?consultaId=${detail.interesComercialId}`}
                        >
                          Volver a la consulta de origen
                        </a>
                      }
                    />
                  )}
                </>
              ) : (
                <>
                  <CustomerPredictiveSearch
                    value={Number(customerId) || null}
                    initialCustomer={initialCustomer}
                    disabled={Boolean(initialCustomerId && (selectedCustomer || customers.some((item) => item.clienteId === Number(initialCustomerId))))}
                    onChange={(customer) => {
                      setSelectedCustomer(customer);
                      setCustomerId(customer ? String(customer.clienteId) : "");
                    }}
                  />
                  <label className="product-field">
                    <span>
                      Tipo de cliente <b>*</b>
                    </span>
                    <select
                      value={type}
                      onChange={(event) => setType(event.target.value)}
                    >
                      <option value="particular">Particular</option>
                      <option value="empresa">Empresa</option>
                    </select>
                  </label>
                  <label className="product-field">
                    <span>
                      Canal comercial <b>*</b>
                    </span>
                    <select
                      value={channelId}
                      onChange={(event) => setChannelId(event.target.value)}
                    >
                      <option value="">Seleccioná un canal</option>
                      {channels.map((item) => (
                        <option
                          key={lookupId(item, "channel")}
                          value={lookupId(item, "channel")}
                        >
                          {lookupName(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {editing && (
                    <label className="product-field">
                      <span>
                        Estado <b>*</b>
                      </span>
                      <select
                        value={stateId}
                        onChange={(event) => setStateId(event.target.value)}
                      >
                        {editableStates.map((item) => (
                          <option
                            key={lookupId(item, "state")}
                            value={lookupId(item, "state")}
                          >
                            {lookupName(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="product-field product-field-wide">
                    <span>
                      Interés comercial <b>*</b>
                    </span>
                    <input
                      maxLength={150}
                      value={interest}
                      onChange={(event) => setInterest(event.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
          </section>
          <section className="product-form-section">
            <header>
              <span>
                <ClipboardList size={18} />
              </span>
              <div>
                <h2>Gestión comercial</h2>
              </div>
            </header>
            <div className="product-form-grid">
              {readonly ? (
                <>
                  <ReadField
                    label="Responsable"
                    value={detail?.responsableNombre || "Sin asignar"}
                  />
                  <ReadField
                    label="Próxima acción"
                    value={detail?.proximaAccion || "Sin próxima acción"}
                  />
                  <ReadField
                    label="Fecha prevista"
                    value={formatOpportunityDate(detail?.fechaProximaAccion)}
                  />
                  <ReadField
                    label="Fecha de creación"
                    value={formatOpportunityDate(detail?.fechaAlta)}
                  />
                  <ReadField
                    label="Observaciones"
                    value={detail?.observaciones || "Sin observaciones"}
                    wide
                  />
                </>
              ) : (
                <>
                  <label className="product-field">
                    <span>Próxima acción</span>
                    <input
                      maxLength={250}
                      value={nextAction}
                      onChange={(event) => setNextAction(event.target.value)}
                    />
                  </label>
                  <label className="product-field">
                    <span>Fecha prevista</span>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(event) => setNextDate(event.target.value)}
                    />
                  </label>
                  <label className="product-field product-field-wide">
                    <span>Observaciones</span>
                    <textarea
                      maxLength={500}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                    <small>{notes.length}/500</small>
                  </label>
                </>
              )}
            </div>
          </section>
          <OpportunityProducts
            lines={draftProducts}
            catalog={products}
            editable={!readonly}
            initialProductId={initialProductId}
            initialQuantity={initialQuantity}
            onSave={saveProduct}
            onRemove={removeProduct}
          />
          {readonly && detail && (
            <>
              <RelatedActivities
                activities={activities}
                agendaUrl={agendaUrl}
                canCreate={canCreate}
              />
              <RelatedBudgets
                budgets={budgets}
                budgetUrl={budgetUrl}
                canCreate={canCreate}
              />
              <OpportunityHistory
                history={detail.historialEstados || []}
                legacyVisits={detail.visitas || []}
              />
            </>
          )}
        </div>
        <aside className="product-form-side">
          <section className="product-form-section opportunity-summary">
            <header>
              <span>
                <ClipboardList size={18} />
              </span>
              <div>
                <h2>Resumen</h2>
              </div>
            </header>
            <div>
              <span>Estado</span>
              <strong>
                {detail ? (
                  <StatusBadge
                    tone={opportunityStateTone(detail.estadoOportunidadNombre)}
                  >
                    {detail.estadoOportunidadNombre || "Sin estado"}
                  </StatusBadge>
                ) : (
                  lookupName(
                    states.find(
                      (item) => lookupId(item, "state") === Number(stateId),
                    ),
                  ) || "Estado inicial automático"
                )}
              </strong>
            </div>
            <div>
              <span>Productos de interés</span>
              <strong>{draftProducts.length}</strong>
            </div>
            <div>
              <span>Probabilidad estimada</span>
              <strong>{probability.value}%</strong>
              <small>
                Calculada automáticamente según hitos comerciales persistidos.
              </small>
            </div>
            <div>
              <span>Importe estimado</span>
              <strong>{formatOpportunityMoney(amount)}</strong>
            </div>
            {readonly && detail && !isOpportunityClosed(detail) && canEdit && (
              <div className="opportunity-summary-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => onAction?.("assign")}
                >
                  <UserCog size={16} />
                  Asignar responsable
                </button>
                <button
                  type="button"
                  className="button danger-ghost"
                  onClick={() => onAction?.("lose")}
                >
                  <XCircle size={16} />
                  Marcar perdida
                </button>
                <button
                  type="button"
                  className="button danger-ghost"
                  onClick={() => onAction?.("cancel")}
                >
                  <XCircle size={16} />
                  Cancelar oportunidad
                </button>
              </div>
            )}
            {readonly && detail?.pedidoIdConvertido && (
              <a href={`/ventas/pedidos/${detail.pedidoIdConvertido}`}>
                <ShoppingCart size={15} />
                Abrir pedido convertido
              </a>
            )}
            {readonly &&
              detail &&
              !detail.pedidoIdConvertido &&
              !isOpportunityClosed(detail) &&
              canConvert && (
                <div className="opportunity-conversion">
                  <button
                    type="button"
                    className="button primary"
                    disabled={!conversionReady}
                    onClick={convertToOrder}
                  >
                    <ShoppingCart size={16} />
                    Convertir en pedido
                  </button>
                  {!conversionReady && (
                    <small>
                      Todos los productos deben tener cantidad y precio de venta
                      vigente.
                    </small>
                  )}
                </div>
              )}
            {detail?.interesComercialId && (
              <a
                href={`/comercial/consultas?consultaId=${detail.interesComercialId}`}
              >
                Volver a la consulta de origen
              </a>
            )}
          </section>
        </aside>
      </div>
    </form>
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
      className={`product-field product-read-field ${wide ? "product-field-wide" : ""}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function RelatedActivities({
  activities,
  agendaUrl,
  canCreate,
}: {
  activities: Actividad[];
  agendaUrl: string;
  canCreate: boolean;
}) {
  return (
    <section className="product-form-section opportunity-relations">
      <header>
        <span>
          <CalendarPlus size={18} />
        </span>
        <div>
          <h2>Actividades de Agenda</h2>
          <p>Agenda Comercial es el único circuito para nuevos seguimientos.</p>
        </div>
        {canCreate && (
          <a className="button secondary" href={agendaUrl}>
            Programar actividad
          </a>
        )}
      </header>
      {activities.length ? (
        <div className="opportunity-relation-list">
          {[...activities]
            .sort((a, b) => b.fechaProgramada.localeCompare(a.fechaProgramada))
            .map((activity) => (
              <a
                key={activity.actividadComercialId}
                href={`/comercial/agenda/${activity.actividadComercialId}`}
              >
                <span>
                  <strong>
                    {activity.tipo} · {activity.titulo}
                  </strong>
                  <small>
                    {formatActivityDateTime(activity.fechaProgramada)}
                  </small>
                </span>
                <StatusBadge
                  tone={
                    activity.estado === "Realizada"
                      ? "success"
                      : activity.estado === "Cancelada"
                        ? "danger"
                        : "warning"
                  }
                >
                  {activity.estado}
                </StatusBadge>
              </a>
            ))}
        </div>
      ) : (
        <p className="opportunity-empty-copy">
          No hay actividades de Agenda vinculadas.
        </p>
      )}
    </section>
  );
}
function RelatedBudgets({
  budgets,
  budgetUrl,
  canCreate,
}: {
  budgets: Presupuesto[];
  budgetUrl: string;
  canCreate: boolean;
}) {
  return (
    <section className="product-form-section opportunity-relations">
      <header>
        <span>
          <FileText size={18} />
        </span>
        <div>
          <h2>Presupuestos vinculados</h2>
          <p>Documentos comerciales asociados a esta oportunidad.</p>
        </div>
        {canCreate && (
          <a className="button secondary" href={budgetUrl}>
            Registrar presupuesto
          </a>
        )}
      </header>
      {budgets.length ? (
        <div className="opportunity-relation-list">
          {budgets.map((budget) => (
            <a
              key={budget.presupuestoComercialId}
              href={`/comercial/presupuestos/${budget.presupuestoComercialId}`}
            >
              <span>
                <strong>Presupuesto {budgetNumber(budget)}</strong>
                <small>Emitido {formatBudgetDate(budget.fechaEmision)}</small>
              </span>
              <StatusBadge
                tone={
                  budget.estado === "Aceptado"
                    ? "success"
                    : /Rechazado|Cancelado|Vencido/.test(budget.estado)
                      ? "danger"
                      : "warning"
                }
              >
                {budget.estado}
              </StatusBadge>
            </a>
          ))}
        </div>
      ) : (
        <p className="opportunity-empty-copy">
          No hay presupuestos vinculados.
        </p>
      )}
    </section>
  );
}
