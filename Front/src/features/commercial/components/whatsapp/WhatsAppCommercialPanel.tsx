import {
  BriefcaseBusiness,
  CalendarPlus,
  ExternalLink,
  FileText,
  History,
  Link2,
  Save,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../../../../services/authorization";
import type { Interes } from "../../../../services/commercialApi";
import {
  consultationsApi,
  type ConsultationCustomer,
  type ConsultationReason,
} from "../../../../services/commercialConsultationsApi";
import {
  listarActividades,
  listarPresupuestos,
  type Actividad,
  type Presupuesto,
} from "../../../../services/commercialOperationsApi";
import type { Product } from "../../../../services/productsApi";
import { ProductPredictiveSearch } from "../shared/ProductPredictiveSearch";
import {
  whatsAppApi,
  type WhatsAppAssignee,
  type WhatsAppConversationDetail,
} from "../../../../services/whatsAppApi";

type Props = {
  detail: WhatsAppConversationDetail;
  assignees: WhatsAppAssignee[];
  consultations: Interes[];
  customers: ConsultationCustomer[];
  products: Product[];
  reasons: ConsultationReason[];
  onChanged: () => Promise<void>;
  onError: (value: string) => void;
};
const digits = (value?: string | null) => (value || "").replace(/\D/g, "");
const closed = (item: Interes) => !item.activo || Boolean(item.fechaCierre);
export function WhatsAppCommercialPanel({
  detail,
  assignees,
  consultations,
  customers,
  products,
  reasons,
  onChanged,
  onError,
}: Props) {
  const conversation = detail.conversation,
    consultation = consultations.find(
      (x) => x.interesComercialId === conversation.interesComercialId,
    );
  const [customerId, setCustomerId] = useState(""),
    [reasonId, setReasonId] = useState(""),
    [productId, setProductId] = useState(""),
    [description, setDescription] = useState(""),
    [amount, setAmount] = useState("0"),
    [quantity, setQuantity] = useState("1"),
    [linkId, setLinkId] = useState(""),
    [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Actividad[]>([]),
    [budgets, setBudgets] = useState<Presupuesto[]>([]);
  const canCreate = hasPermission("Comercial", "Crear"),
    canEdit = hasPermission("Comercial", "Editar"),
    canSales = hasPermission("Ventas", "Crear");
  useEffect(() => {
    setCustomerId(
      String(conversation.clienteId || consultation?.clienteId || ""),
    );
    setReasonId(String(consultation?.motivoConsultaId || ""));
    setProductId(String(consultation?.productoConsultadoId || ""));
    setDescription(consultation?.descripcion || "");
    setAmount(String(consultation?.montoPotencial ?? 0));
    setQuantity("1");
  }, [
    conversation.conversacionId,
    conversation.clienteId,
    consultation?.interesComercialId,
    consultation?.fechaUltimaActividad,
  ]);
  useEffect(() => {
    let active = true;
    if (!consultation) {
      setActivities([]);
      setBudgets([]);
      return () => {
        active = false;
      };
    }
    void Promise.all([
      listarActividades(undefined, undefined, consultation.interesComercialId),
      listarPresupuestos(undefined, consultation.interesComercialId),
    ])
      .then(([a, b]) => {
        if (active) {
          setActivities(a);
          setBudgets(b);
        }
      })
      .catch(() => {
        if (active) {
          setActivities([]);
          setBudgets([]);
        }
      });
    return () => {
      active = false;
    };
  }, [consultation?.interesComercialId, consultation?.fechaUltimaActividad]);
  const phone = digits(conversation.telefono);
  const matches = useMemo(
    () =>
      customers.filter((x) => {
        const value = digits(x.telefono);
        return (
          value &&
          phone &&
          (value === phone ||
            (value.length >= 10 &&
              phone.length >= 10 &&
              value.slice(-10) === phone.slice(-10)))
        );
      }),
    [customers, phone],
  );
  const selectedCustomer = customers.find(
    (x) => x.clienteId === Number(customerId),
  );

  const validQuantity =
    Number.isInteger(Number(quantity)) && Number(quantity) > 0;
  const base = `clienteId=${Number(customerId)}&consultaId=${consultation?.interesComercialId || ""}${consultation ? `&canalId=${consultation.canalVentaId}&interes=${encodeURIComponent(consultation.descripcion.slice(0, 150))}` : ""}${productId ? `&productoId=${productId}&cantidad=${encodeURIComponent(quantity)}` : ""}`;
  async function run(action: () => Promise<unknown>) {
    setSaving(true);
    try {
      await action();
      await onChanged();
    } catch (e) {
      onError(
        e instanceof Error ? e.message : "No se pudo completar la operación.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function linkCustomer() {
    if (!Number(customerId) || !selectedCustomer) return;
    await run(async () => {
      await whatsAppApi.linkCustomer(
        conversation.conversacionId,
        Number(customerId),
      );
      if (consultation && !closed(consultation))
        await consultationsApi.update(consultation.interesComercialId, {
          clienteId: selectedCustomer.clienteId,
          motivoConsultaId: consultation.motivoConsultaId || null,
          productoConsultadoId: consultation.productoConsultadoId || null,
          clienteNombre: selectedCustomer.nombre,
          clienteApellido: selectedCustomer.apellido || null,
          telefono:
            selectedCustomer.telefono ||
            consultation.telefono ||
            conversation.telefono,
          email: selectedCustomer.email || consultation.email || null,
          canalVentaId: consultation.canalVentaId,
          tipoOrigen: consultation.tipoOrigen,
          referenciaOrigen: consultation.referenciaOrigen,
          descripcion: consultation.descripcion,
          montoPotencial: consultation.montoPotencial,
        });
    });
  }

  async function saveConsultation() {
    if (productId && !validQuantity) {
      onError("Ingresá una cantidad entera mayor a cero.");
      return;
    }
    if (!description.trim() || description.trim().length < 3) {
      onError("Describí la necesidad comercial.");
      return;
    }
    if (Number(amount) < 0) {
      onError("El monto potencial no puede ser negativo.");
      return;
    }
    await run(async () => {
      if (Number(customerId) && Number(customerId) !== conversation.clienteId)
        await whatsAppApi.linkCustomer(
          conversation.conversacionId,
          Number(customerId),
        );
      if (!consultation) {
        await whatsAppApi.createConsultation(conversation.conversacionId, {
          descripcion: description.trim(),
          motivoConsultaId: Number(reasonId) || null,
          productoConsultadoId: Number(productId) || null,
          montoPotencial: Number(amount) || 0,
        });
        return;
      }
      await consultationsApi.update(consultation.interesComercialId, {
        clienteId: Number(customerId) || consultation.clienteId || null,
        motivoConsultaId: Number(reasonId) || null,
        productoConsultadoId: Number(productId) || null,
        clienteNombre:
          selectedCustomer?.nombre ||
          consultation.clienteNombre ||
          conversation.nombrePerfil ||
          "Contacto WhatsApp",
        clienteApellido:
          selectedCustomer?.apellido || consultation.clienteApellido || null,
        telefono:
          selectedCustomer?.telefono ||
          consultation.telefono ||
          conversation.telefono,
        email: selectedCustomer?.email || consultation.email || null,
        canalVentaId: consultation.canalVentaId,
        tipoOrigen: consultation.tipoOrigen,
        referenciaOrigen: consultation.referenciaOrigen,
        descripcion: description.trim(),
        montoPotencial: Number(amount) || 0,
      });
    });
  }

  async function linkConsultation() {
    if (!Number(linkId)) return;
    await run(() =>
      whatsAppApi.link(conversation.conversacionId, Number(linkId)),
    );
  }
  async function assign(value: string) {
    await run(() =>
      whatsAppApi.assign(
        conversation.conversacionId,
        value ? Number(value) : null,
      ),
    );
  }

  async function changeState(value: "Abierta" | "Pendiente" | "Cerrada") {
    await run(() =>
      whatsAppApi.changeState(conversation.conversacionId, value),
    );
  }

  function validateCommercialAction() {
    if (!consultation) {
      onError("Primero debés registrar la consulta.");
      return false;
    }

    if (!Number(customerId)) {
      onError("Debés vincular un cliente.");
      return false;
    }

    if (productId && !validQuantity) {
      onError("Ingresá una cantidad entera mayor a cero.");
      return false;
    }

    return true;
  }

  function order() {
    if (!consultation || !canSales) return;

    if (!validateCommercialAction()) return;

    sessionStorage.setItem(
      "teka-pedido-borrador",
      JSON.stringify({
        customerId: Number(customerId),
        channelId: String(consultation.canalVentaId),
        observations: consultation.descripcion,
        lines:
          productId && validQuantity
            ? [{ id: Number(productId), quantity: String(quantity) }]
            : [],
      }),
    );
    location.href = "/ventas/pedidos/nuevo?origen=consulta";
  }
  return (
    <aside className="wa-commercial">
      <header>
        <div>
          <strong>Gestión comercial</strong>
        </div>
        {consultation && (
          <a
            href={`/comercial/consultas/${consultation.interesComercialId}`}
            title="Ver ficha completa"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </header>
      <div className="wa-commercial-scroll">
        <section>
          <h3>
            <UserRound size={15} /> Cliente o contacto
          </h3>
          {conversation.clienteId && selectedCustomer ? (
            <div className="wa-linked">
              <strong>
                {selectedCustomer.nombre} {selectedCustomer.apellido}
              </strong>
              <small>Cliente vinculado</small>
            </div>
          ) : (
            <>
              <label>
                Cliente existente
                <select
                  value={customerId}
                  disabled={!canEdit || saving}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Sin cliente vinculado</option>
                  {customers
                    .filter((x) => x.activo)
                    .map((x) => (
                      <option key={x.clienteId} value={x.clienteId}>
                        {x.nombre} {x.apellido} · {x.telefono || "sin teléfono"}
                      </option>
                    ))}
                </select>
              </label>
              {matches.length === 1 && !customerId && (
                <button
                  className="wa-suggestion"
                  type="button"
                  onClick={() => setCustomerId(String(matches[0].clienteId))}
                >
                  Coincidencia sugerida: {matches[0].nombre}{" "}
                  {matches[0].apellido}
                </button>
              )}
              {matches.length > 1 && !customerId && (
                <small className="wa-warning">
                  Hay {matches.length} clientes con teléfono coincidente.
                  Seleccioná manualmente.
                </small>
              )}
              <div className="wa-inline-actions">
                <button
                  className="button secondary"
                  disabled={!Number(customerId) || !canEdit || saving}
                  onClick={() => void linkCustomer()}
                >
                  Vincular
                </button>
                <a className="button secondary" href="/ventas/clientes/nuevo">
                  Registrar cliente
                </a>
              </div>
            </>
          )}
        </section>
        <section>
          <h3>
            <FileText size={15} /> Gestión de la consulta
          </h3>
          <label>
            Responsable
            <select
              value={conversation.usuarioResponsableId || ""}
              disabled={!canEdit || saving}
              onChange={(e) => void assign(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {assignees.map((x) => (
                <option key={x.id} value={x.id}>
                  {[x.nombre, x.apellido].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado de atención
            <select
              value={conversation.estado}
              disabled={!canEdit || saving}
              onChange={(e) =>
                void changeState(
                  e.target.value as "Abierta" | "Pendiente" | "Cerrada",
                )
              }
            >
              <option value="Abierta">Abierta</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </label>

          {!consultation && (
            <div className="wa-link-existing">
              <select
                value={linkId}
                onChange={(e) => setLinkId(e.target.value)}
              >
                <option value="">Vincular consulta histórica…</option>
                {consultations
                  .filter((x) => !x.oportunidadComercialId && x.activo)
                  .map((x) => (
                    <option
                      key={x.interesComercialId}
                      value={x.interesComercialId}
                    >
                      {x.clienteNombre || x.telefono} · {x.descripcion}{" "}
                    </option>
                  ))}
              </select>
              <button
                disabled={!linkId || !canEdit || saving}
                onClick={() => void linkConsultation()}
              >
                <Link2 size={14} />
              </button>
            </div>
          )}
          <details className="wa-consultation-details">
            <summary>Datos adicionales</summary>

            <label>
              Asunto
              <select
                value={reasonId}
                disabled={
                  Boolean(consultation && closed(consultation)) || saving
                }
                onChange={(e) => setReasonId(e.target.value)}
              >
                <option value="">Consulta general</option>
                {reasons
                  .filter((x) => x.activo)
                  .map((x) => (
                    <option key={x.motivoConsultaId} value={x.motivoConsultaId}>
                      {x.nombre}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Observaciones
              <textarea
                maxLength={500}
                value={description}
                disabled={
                  Boolean(consultation && closed(consultation)) || saving
                }
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </details>

          <ProductPredictiveSearch
            key={conversation.conversacionId}
            products={products}
            value={productId}
            disabled={
              (consultation ? !canEdit : !canCreate) ||
              Boolean(consultation && closed(consultation)) ||
              saving
            }
            onChange={(value) => {
              setProductId(value);
              setQuantity("1");
            }}
          />

          {productId && (
            <label>
              Cantidad
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                disabled={
                  (consultation ? !canEdit : !canCreate) ||
                  Boolean(consultation && closed(consultation)) ||
                  saving
                }
                onChange={(e) => setQuantity(e.target.value)}
              />
              {!validQuantity && (
                <small className="wa-warning">
                  Ingresá una cantidad entera mayor a cero.
                </small>
              )}
            </label>
          )}
          <button
            className="button primary wa-save"
            disabled={
              (consultation ? !canEdit : !canCreate) ||
              saving ||
              Boolean(consultation && closed(consultation))
            }
            onClick={() => void saveConsultation()}
          >
            <Save size={15} />
            {saving
              ? "Guardando…"
              : consultation
                ? "Guardar cambios"
                : "Registrar consulta"}
          </button>
        </section>
        <section>
          <h3>
            <BriefcaseBusiness size={15} /> Acciones comerciales
          </h3>
          {consultation && Number(customerId) ? (
            <div className="wa-action-grid">
              {canCreate && (
                <a
                  href={
                    consultation.oportunidadComercialId
                      ? `/comercial/oportunidades/${consultation.oportunidadComercialId}`
                      : `/comercial/oportunidades/new?${base}`
                  }
                  onClick={(event) => {
                    if (
                      !consultation.oportunidadComercialId &&
                      !validateCommercialAction()
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <BriefcaseBusiness size={15} />
                  {consultation.oportunidadComercialId
                    ? "Abrir oportunidad"
                    : "Crear oportunidad"}
                </a>
              )}
              {canCreate && (
                <a
                  href={`/comercial/presupuestos?${base}`}
                  onClick={(event) => {
                    if (!validateCommercialAction()) {
                      event.preventDefault();
                    }
                  }}
                >
                  <FileText size={15} />
                  Generar presupuesto
                </a>
              )}
              {canCreate && (
                <a
                  href={`/comercial/agenda/new?clienteId=${customerId}&consultaId=${consultation.interesComercialId}`}
                >
                  <CalendarPlus size={15} />
                  Programar actividad
                </a>
              )}
              {canSales && (
                <button type="button" onClick={order}>
                  <ShoppingCart size={15} />
                  Iniciar pedido
                </button>
              )}
              {!canCreate && !canSales && (
                <small>
                  No tenés permisos para iniciar acciones comerciales.
                </small>
              )}
            </div>
          ) : (
            <small>
              Vinculá un cliente y registrá la consulta para habilitar las
              acciones.
            </small>
          )}
        </section>
        {consultation && (
          <section>
            <h3>
              <History size={15} /> Operaciones vinculadas
            </h3>
            <div className="wa-relations">
              {activities.map((x) => (
                <a
                  key={`a${x.actividadComercialId}`}
                  href={`/comercial/agenda/${x.actividadComercialId}`}
                >
                  {x.titulo} · {x.estado}{" "}
                </a>
              ))}
              {budgets.map((x) => (
                <a
                  key={`p${x.presupuestoComercialId}`}
                  href={`/comercial/presupuestos/${x.presupuestoComercialId}`}
                >
                  Presupuesto {x.numero || "sin numerar"} · {x.estado}
                </a>
              ))}
              {!activities.length && !budgets.length && (
                <small>Sin actividades ni presupuestos vinculados.</small>
              )}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
