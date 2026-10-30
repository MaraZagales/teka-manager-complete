import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Pencil,
  RefreshCw,
  Save,
  UserRound,
  XCircle,
} from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import {
  crearActividad,
  reprogramarActividad,
  type Actividad,
} from "../../../../services/commercialOperationsApi";
import type { SalesCustomer } from "../../../../services/salesOrdersApi";
import {
  forgetActivity,
  rememberActivity,
} from "../../hooks/useActivityRecord";
import {
  activityCanChange,
  activityCustomer,
  activityStateTone,
  activityTypes,
  businessToday,
  formatActivityDateTime,
  toLocalDateTimeInput,
  type ActivityAction,
} from "../../utils/agendaPresentation";
import { CustomerPredictiveSearch } from "../shared/CustomerPredictiveSearch";
import type { CommercialCustomerSuggestion } from "../../../../services/commercialCustomersApi";

type ActivityFormMode = "create" | "edit" | "view";
type Props = {
  mode: ActivityFormMode;
  activity?: Actividad;
  customers?: SalesCustomer[];
  initialCustomerId?: number | null;
  initialConsultationId?: number | null;
  initialOpportunityId?: number | null;
  initialDate?: string;
  canEdit?: boolean;
  onAction?: (activity: Actividad, action: ActivityAction) => void;
};

export function ActivityForm({
  mode,
  activity,
  customers = [],
  initialCustomerId,
  initialConsultationId,
  initialOpportunityId,
  initialDate,
  canEdit = false,
  onAction,
}: Props) {
  const editing = mode === "edit";
  const readonly = mode === "view";
  const initialWhen = activity
    ? toLocalDateTimeInput(activity.fechaProgramada)
    : `${initialDate || businessToday()}T10:00`;
  const [clientId, setClientId] = useState(
    String(initialCustomerId || activity?.clienteId || ""),
  );
  const initialCustomer =
    customers.find((customer) => customer.clienteId === Number(clientId)) ||
    (activity?.clienteId
      ? {
          clienteId: activity.clienteId,
          nombre: activity.clienteNombre || "Cliente",
          apellido: activity.clienteApellido,
        }
      : null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CommercialCustomerSuggestion | null>(initialCustomer);
  const [type, setType] = useState(activity?.tipo || "Visita");
  const [title, setTitle] = useState(
    activity?.titulo || (initialConsultationId ? "Visita comercial" : ""),
  );
  const [when, setWhen] = useState(initialWhen);
  const [description, setDescription] = useState(activity?.descripcion || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const submitLock = useRef(false);
  const allowNavigation = useRef(false);
  const consultationId =
    initialConsultationId || activity?.interesComercialId || null;
  const opportunityId =
    initialOpportunityId || activity?.oportunidadComercialId || null;
  const customerName = activity
    ? activityCustomer(activity)
    : selectedCustomer
      ? `${selectedCustomer.nombre} ${selectedCustomer.apellido || ""}`.trim()
      : "Cliente";
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        clientId: String(initialCustomerId || activity?.clienteId || ""),
        type: activity?.tipo || "Visita",
        title:
          activity?.titulo || (initialConsultationId ? "Visita comercial" : ""),
        when: initialWhen,
        description: activity?.descripcion || "",
      }),
    [activity, initialCustomerId, initialConsultationId, initialWhen],
  );
  const currentSnapshot = JSON.stringify({
    clientId,
    type,
    title,
    when,
    description,
  });
  const dirty = !readonly && currentSnapshot !== initialSnapshot;
  const fixedOrigin = Boolean(consultationId || opportunityId);

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (!dirty || saving || allowNavigation.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, saving]);
  function validate() {
    const next: Record<string, string> = {};
    if (!editing && !Number(clientId)) next.clientId = "Seleccioná un cliente.";
    if (
      !editing &&
      !activityTypes.includes(type as (typeof activityTypes)[number])
    )
      next.type = "Seleccioná un tipo válido.";
    if (!editing && !title.trim()) next.title = "Ingresá un título.";
    if (title.trim().length > 150)
      next.title = "El título no puede superar 150 caracteres.";
    if (!when) next.when = "Ingresá la fecha y hora programadas.";
    if (description.length > 1000)
      next.description = "La descripción no puede superar 1000 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function leave() {
    allowNavigation.current = true;
    location.href =
      editing && activity
        ? `/comercial/agenda/${activity.actividadComercialId}`
        : "/comercial/agenda";
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readonly || submitLock.current || !validate()) return;
    submitLock.current = true;
    setSaving(true);
    setSubmitError("");
    try {
      let saved: Actividad;
      let created = false;
      if (editing && activity) {
        await reprogramarActividad(
          activity.actividadComercialId,
          when,
          description.trim() || undefined,
        );
        saved = {
          ...activity,
          fechaProgramada: when,
          descripcion: description.trim() || null,
        };
        sessionStorage.setItem(
          "agenda-notice",
          "Actividad actualizada correctamente.",
        );
      } else {
        const result = await crearActividad({
          clienteId: Number(clientId),
          tipo: type,
          titulo: title.trim(),
          fechaProgramada: when,
          descripcion: description.trim() || undefined,
          interesComercialId: consultationId,
          oportunidadComercialId: opportunityId,
        });
        saved = {
          actividadComercialId: result.actividadComercialId,
          clienteId: Number(clientId),
          clienteNombre: selectedCustomer?.nombre || null,
          clienteApellido: selectedCustomer?.apellido || null,
          interesComercialId: consultationId,
          tipo: type,
          titulo: title.trim(),
          descripcion: description.trim() || null,
          fechaProgramada: when,
          estado: "Pendiente",
        };
        created = true;
        sessionStorage.setItem(
          "agenda-notice",
          consultationId
            ? `Actividad registrada y vinculada a la consulta ${consultationId}.`
            : "Actividad registrada correctamente.",
        );
      }
      if (created) forgetActivity(saved.actividadComercialId);
      else rememberActivity(saved);
      allowNavigation.current = true;
      location.href = `/comercial/agenda/${saved.actividadComercialId}`;
    } catch (caught) {
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar la actividad.",
      );
      setSaving(false);
      submitLock.current = false;
    }
  }

  const heading =
    mode === "create"
      ? "Registrar actividad"
      : mode === "edit"
        ? "Editar actividad"
        : "Consultar actividad";
  return (
    <>
      <form
        className={`product-editor activity-editor product-editor-${mode}`}
        noValidate
        onSubmit={submit}
      >
        <header className="product-editor-header">
          <div className="product-editor-heading">
            <h1>{heading}</h1>
            <p>
              {readonly
                ? "Información y seguimiento de la gestión comercial."
                : editing
                  ? "Modificá la programación y las observaciones disponibles en la API."
                  : "Agendá una gestión vinculada con un cliente."}
            </p>
          </div>
          <div className="product-editor-actions">
            {readonly ? (
              <>
                {canEdit && activity && activityCanChange(activity) && (
                  <a
                    className="button secondary"
                    href={`/comercial/agenda/${activity.actividadComercialId}/edit`}
                  >
                    <Pencil size={16} />
                    Editar
                  </a>
                )}
                {canEdit &&
                  activity &&
                  activityCanChange(activity) &&
                  onAction && (
                    <>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => onAction(activity, "reschedule")}
                      >
                        <RefreshCw size={16} />
                        Reprogramar
                      </button>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => onAction(activity, "finish")}
                      >
                        <CheckCircle2 size={16} />
                        Finalizar
                      </button>
                      <button
                        type="button"
                        className="button danger-ghost"
                        onClick={() => onAction(activity, "cancel")}
                      >
                        <XCircle size={16} />
                        Cancelar
                      </button>
                    </>
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
                  disabled={saving || (editing && !dirty)}
                >
                  <Save size={16} />
                  {saving
                    ? "Guardando…"
                    : editing
                      ? "Guardar cambios"
                      : "Guardar actividad"}
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
        <div className="activity-form-layout">
          <div className="product-form-main">
            <section className="product-form-section">
              <header>
                <span>
                  <UserRound size={18} />
                </span>
                <div>
                  <h2>Datos generales</h2>
                  <p>Cliente, origen y tipo de gestión.</p>
                </div>
              </header>
              <div className="product-form-grid">
                {activity ? (
                  <>
                    <ReadField label="Cliente" value={customerName} />
                    <ReadField
                      label="Tipo de actividad"
                      value={activity.tipo}
                    />
                    <ReadField
                      label="Estado"
                      value={
                        <StatusBadge tone={activityStateTone(activity.estado)}>
                          {activity.estado}
                        </StatusBadge>
                      }
                    />
                    <ReadField
                      label="Consulta de origen"
                      value={
                        consultationId ? (
                          <a
                            href={`/comercial/consultas?consultaId=${consultationId}`}
                          >
                            Abrir consulta de origen
                          </a>
                        ) : (
                          "Sin consulta asociada"
                        )
                      }
                    />
                    {activity.oportunidadComercialId && (
                      <ReadField
                        label="Oportunidad vinculada"
                        value={
                          <a
                            href={`/comercial/oportunidades/${activity.oportunidadComercialId}`}
                          >
                            Abrir oportunidad
                          </a>
                        }
                      />
                    )}{" "}
                    {activity.presupuestoComercialId && (
                      <ReadField
                        label="Presupuesto vinculado"
                        value={
                          <a
                            href={`/comercial/presupuestos/${activity.presupuestoComercialId}`}
                          >
                            Abrir presupuesto
                          </a>
                        }
                      />
                    )}
                  </>
                ) : (
                  <>
                    <CustomerPredictiveSearch
                      value={Number(clientId) || null}
                      initialCustomer={initialCustomer}
                      disabled={fixedOrigin}
                      error={errors.clientId}
                      onChange={(customer) => {
                        setSelectedCustomer(customer);
                        setClientId(customer ? String(customer.clienteId) : "");
                        setErrors((current) => ({ ...current, clientId: "" }));
                      }}
                    />
                    <label className="product-field">
                      <span>Origen comercial</span>
                      <input
                        readOnly
                        value={
                          opportunityId
                            ? "Oportunidad comercial"
                            : consultationId
                              ? "Consulta comercial"
                              : "Sin origen asociado"
                        }
                      />
                    </label>
                    <label
                      className={`product-field ${errors.type ? "field-invalid" : ""}`}
                    >
                      <span>
                        Tipo de actividad <b>*</b>
                      </span>
                      <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                      >
                        {activityTypes.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="field-error">{errors.type}</p>
                      )}
                    </label>
                  </>
                )}
              </div>
            </section>
            <section className="product-form-section">
              <header>
                <span>
                  <CalendarClock size={18} />
                </span>
                <div>
                  <h2>Programación</h2>
                  <p>Asunto, fecha y observaciones de seguimiento.</p>
                </div>
              </header>
              <div className="product-form-grid">
                {readonly ? (
                  <>
                    <ReadField
                      label="Título"
                      value={activity?.titulo || "—"}
                      wide
                    />
                    <ReadField
                      label="Fecha y hora programadas"
                      value={formatActivityDateTime(activity?.fechaProgramada)}
                    />
                    <ReadField
                      label="Observaciones"
                      value={activity?.descripcion || "Sin observaciones"}
                      wide
                    />
                  </>
                ) : editing ? (
                  <>
                    <ReadField
                      label="Título"
                      value={activity?.titulo || "—"}
                      wide
                    />
                    <label
                      className={`product-field ${errors.when ? "field-invalid" : ""}`}
                    >
                      <span>
                        Fecha y hora programadas <b>*</b>
                      </span>
                      <input
                        type="datetime-local"
                        value={when}
                        onChange={(event) => {
                          setWhen(event.target.value);
                          setErrors((current) => ({ ...current, when: "" }));
                        }}
                      />
                      {errors.when && (
                        <p className="field-error">{errors.when}</p>
                      )}
                    </label>
                    <label
                      className={`product-field product-field-wide ${errors.description ? "field-invalid" : ""}`}
                    >
                      <span>Observaciones</span>
                      <textarea
                        maxLength={1000}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                      <small>{description.length}/1000</small>
                      {errors.description && (
                        <p className="field-error">{errors.description}</p>
                      )}
                    </label>
                  </>
                ) : (
                  <>
                    <label
                      className={`product-field product-field-wide ${errors.title ? "field-invalid" : ""}`}
                    >
                      <span>
                        Título <b>*</b>
                      </span>
                      <input
                        maxLength={150}
                        value={title}
                        onChange={(event) => {
                          setTitle(event.target.value);
                          setErrors((current) => ({ ...current, title: "" }));
                        }}
                      />
                      {errors.title && (
                        <p className="field-error">{errors.title}</p>
                      )}
                    </label>
                    <label
                      className={`product-field ${errors.when ? "field-invalid" : ""}`}
                    >
                      <span>
                        Fecha y hora programadas <b>*</b>
                      </span>
                      <input
                        type="datetime-local"
                        value={when}
                        onChange={(event) => {
                          setWhen(event.target.value);
                          setErrors((current) => ({ ...current, when: "" }));
                        }}
                      />
                      {errors.when && (
                        <p className="field-error">{errors.when}</p>
                      )}
                    </label>
                    <label
                      className={`product-field product-field-wide ${errors.description ? "field-invalid" : ""}`}
                    >
                      <span>Observaciones</span>
                      <textarea
                        maxLength={1000}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                      <small>{description.length}/1000</small>
                      {errors.description && (
                        <p className="field-error">{errors.description}</p>
                      )}
                    </label>
                  </>
                )}
              </div>
            </section>
          </div>
          <aside className="product-form-side">
            <section className="product-form-section activity-summary-card">
              <header>
                <span>
                  <ClipboardList size={18} />
                </span>
                <div>
                  <h2>Seguimiento</h2>
                </div>
              </header>
              <div>
                <span>Estado</span>
                <strong>{activity?.estado || "Pendiente"}</strong>
              </div>
              <div>
                <span>Programación</span>
                <strong>{formatActivityDateTime(when)}</strong>
              </div>
              {activity?.fechaRealizacion && (
                <div>
                  <span>Realización</span>
                  <strong>
                    {formatActivityDateTime(activity.fechaRealizacion)}
                  </strong>
                </div>
              )}
              {activity?.resultado && (
                <p>
                  <strong>Resultado</strong>
                  {activity.resultado}
                </p>
              )}
              {opportunityId && (
                <a href={`/comercial/oportunidades/${opportunityId}`}>
                  Volver a la oportunidad
                </a>
              )}
              {consultationId && (
                <a href={`/comercial/consultas?consultaId=${consultationId}`}>
                  Volver a la consulta de origen
                </a>
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
              <p>¿Querés salir sin guardar los cambios de la actividad?</p>
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
      className={`product-field activity-read-field ${wide ? "product-field-wide" : ""}`}
    >
      <span>{label}</span>
      <div>{value}</div>
    </div>
  );
}
