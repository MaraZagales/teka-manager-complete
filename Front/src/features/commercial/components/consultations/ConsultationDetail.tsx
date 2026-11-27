
import { UserRound, ClipboardList, BriefcaseBusiness } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Interes } from "../../../../services/commercialApi";
import type {
  Actividad,
  Presupuesto,
} from "../../../../services/commercialOperationsApi";
import type { Product } from "../../../../services/productsApi";
import { formatProductName } from "../../../../services/productDisplay";
import { budgetNumber, formatBudgetDate } from "../../utils/budgetPresentation";
import { formatActivityDateTime } from "../../utils/agendaPresentation";
import {
  consultationCustomer,
  consultationSubject,
  consultationTone,
  formatConsultationDate,
} from "../../utils/consultationPresentation";

type Props = {
  consultation: Interes;
  activities: Actividad[];
  budgets: Presupuesto[];
  product?: Product | null;
};

export function ConsultationDetail({
  consultation,
  activities,
  budgets,
  product,
}: Props) {
  return (
<div className="product-editor consultation-editor consultation-detail">      <header className="product-editor-header">
        <div className="product-editor-heading">
          <h1>Detalle de consulta</h1>
        </div>
      </header>

      <div className="product-form-main">
        <section className="product-form-section">
          <header>
            <span><UserRound size={18} /></span>
            <div><h2>Información general</h2></div>
          </header>

          <div className="product-form-grid">
            <ReadField
              label="Cliente o contacto"
              value={consultationCustomer(consultation)}
            />
            <ReadField
              label="Canal de origen"
              value={consultation.canalVentaNombre || consultation.tipoOrigen}
            />
            <ReadField
              label="Fecha de consulta"
              value={formatConsultationDate(consultation.fechaAlta, true)}
            />
            <ReadField
              label="Asunto"
              value={consultationSubject(consultation)}
            />
            <ReadField
              label="Teléfono"
              value={consultation.telefono || "No informado"}
            />
            <ReadField
              label="Correo"
              value={consultation.email || "No informado"}
            />
            <ReadField
              label="Observaciones"
              value={consultation.descripcion || "—"}
            />
            {product && (
              <ReadField
                label="Producto consultado"
                value={formatProductName(product)}
              />
            )}
          </div>
        </section>

        <section className="product-form-section">
          <header>
            <span><ClipboardList size={18} /></span>
            <div><h2>Seguimiento comercial</h2></div>
          </header>

          <div className="product-form-grid">
            <ReadField
              label="Estado comercial"
              value={
                <StatusBadge
                  tone={consultationTone(consultation.estadoNombre)}
                >
                  {consultation.estadoNombre}
                </StatusBadge>
              }
            />
            <ReadField
              label="Responsable"
              value={consultation.responsableNombre || "Sin asignar"}
            />
            <ReadField
              label="Última actividad"
              value={formatConsultationDate(
                consultation.fechaUltimaActividad, true
              )}
            />
            <ReadField
              label="Fecha de atención"
              value={formatConsultationDate(
                consultation.fechaAtencion, true
              )}
            />
            {consultation.fechaCierre && (
              <ReadField
                label="Fecha de cierre"
                value={formatConsultationDate(
                  consultation.fechaCierre, true
                )}
              />
            )}
            {consultation.motivoDescarte && (
              <ReadField
                label="Motivo de descarte"
                value={consultation.motivoDescarte}
                wide
              />
            )}
          </div>
        </section>

        <section className="product-form-section consultation-relations">
          <header>
            <span><BriefcaseBusiness size={18} /></span>
            <div><h2>Operaciones vinculadas</h2></div>
          </header>

          <div className="consultation-relations-grid">
            <div>
              <h3>Actividades</h3>
              {activities.length ? (
                activities.map((item) => (
                  <a
                    key={item.actividadComercialId}
                    href={`/comercial/agenda/${item.actividadComercialId}`}
                  >
                    <span>
                      <strong>{item.tipo} · {item.titulo}</strong>
                      <small>
                        {formatActivityDateTime(item.fechaProgramada)}
                      </small>
                    </span>
                    <StatusBadge
                      tone={
                        item.estado === "Realizada"
                          ? "success"
                          : item.estado === "Cancelada"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {item.estado}
                    </StatusBadge>
                  </a>
                ))
              ) : (
                <p>Sin actividades vinculadas.</p>
              )}
            </div>

            <div>
              <h3>Presupuestos</h3>
              {budgets.length ? (
                budgets.map((item) => (
                  <a
                    key={item.presupuestoComercialId}
                    href={`/comercial/presupuestos/${item.presupuestoComercialId}`}
                  >
                    <span>
                      <strong>
                        Presupuesto {item.numero ? budgetNumber(item) : "sin numerar"}
                      </strong>
                      <small>{formatBudgetDate(item.fechaEmision)}</small>
                    </span>
                    <StatusBadge
                      tone={
                        item.estado === "Aceptado"
                          ? "success"
                          : /Rechazado|Cancelado|Vencido/.test(item.estado)
                            ? "danger"
                            : "warning"
                      }
                    >
                      {item.estado}
                    </StatusBadge>
                  </a>
                ))
              ) : (
                <p>Sin presupuestos vinculados.</p>
              )}
            </div>

            <div>
              <h3>Oportunidad</h3>
              {consultation.oportunidadComercialId ? (
                <a
                  href={`/comercial/oportunidades/${consultation.oportunidadComercialId}`}
                >
                  Consultar oportunidad vinculada
                </a>
              ) : (
                <p>Sin oportunidad vinculada.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
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
      className={`product-field product-read-field ${
        wide ? "product-field-wide" : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
