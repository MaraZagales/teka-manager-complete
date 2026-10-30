import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  Mail,
  PackageCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import type { CustomerProfileResponse } from "../../services/onlineCustomersApi";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const dateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Sin dato verificable";

export function OnlineCustomerProfile({
  data,
  loading,
  error,
  onBack,
  onRetry,
}: {
  data: CustomerProfileResponse | null;
  loading: boolean;
  error: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <section
      className="online-customer-profile"
      aria-label="Ficha comercial del cliente"
    >
      <header>
        <button type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          Volver al explorador
        </button>
        <span>FICHA COMERCIAL</span>
      </header>
      {loading ? (
        <div className="state-box">Cargando historial comercial…</div>
      ) : error ? (
        <div className="online-customers-error">
          <XCircle size={19} />
          <span>{error}</span>
          <button className="button secondary" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : !data ? (
        <div className="state-box">No hay un cliente seleccionado.</div>
      ) : (
        <Profile data={data} />
      )}
    </section>
  );
}

function Profile({ data }: { data: CustomerProfileResponse }) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const customer = data.cliente;
  return (
    <div className="online-customer-profile-body">
      <div className="online-customer-profile-hero">
        <span className="online-profile-avatar">
          <UserRound size={26} />
        </span>
        <div>
          <h2>
            {customer.nombre} {customer.apellido}
          </h2>
          <p>
            {customer.email || "Sin correo informado"} · Cliente #
            {customer.clienteId}
          </p>
        </div>
        <span
          className={`online-customer-badge ${customer.activo ? "repeat" : "once"}`}
        >
          {customer.activo ? "Activo" : "Inactivo"}
        </span>
      </div>
      <section className="online-profile-identification">
        <header>
          <UserRound size={18} />
          <div>
            <h3>Identificación del cliente</h3>
            <p>Datos maestros y de contacto.</p>
          </div>
        </header>
        <dl>
          <div>
            <dt>Documento</dt>
            <dd>{customer.documento || "No informado"}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{customer.telefono || "No informado"}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{customer.email || "No informado"}</dd>
          </div>
          <div>
            <dt>Fecha de alta</dt>
            <dd>{dateTime(customer.fechaAlta)}</dd>
          </div>
        </dl>
      </section>
      <section className="online-profile-summary">
        <header>
          <PackageCheck size={18} />
          <div>
            <h3>Resumen comercial</h3>
            <p>Ventas entregadas en el historial disponible.</p>
          </div>
        </header>
        <div>
          <article>
            <span>Ventas históricas</span>
            <strong>{number.format(customer.comprasHistoricas)}</strong>
            <small>{customer.comprasSinFecha} sin fecha verificable</small>
          </article>
          <article>
            <span>Importe acumulado</span>
            <strong>{money.format(customer.importeHistorico)}</strong>
            <small>Ventas entregadas, no cobros</small>
          </article>
          <article>
            <span>Primera entrega verificable</span>
            <strong>{dateTime(customer.primeraEntregaConFecha)}</strong>
          </article>
          <article>
            <span>Última entrega verificable</span>
            <strong>{dateTime(customer.ultimaEntregaConFecha)}</strong>
          </article>
        </div>
      </section>
      <section className="online-profile-digital">
        <header>
          <Mail size={18} />
          <div>
            <h3>Cuenta digital</h3>
            <p>Registro y estado de acceso al canal.</p>
          </div>
        </header>
        {customer.cuentaClienteEcommerceId ? (
          <dl>
            <div>
              <dt>Estado de cuenta</dt>
              <dd>{customer.cuentaActiva ? "Activa" : "Inactiva"}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>
                {customer.emailVerificado ? "Verificado" : "Sin verificar"}
              </dd>
            </div>
            <div>
              <dt>Registro digital</dt>
              <dd>{dateTime(customer.fechaRegistroDigital)}</dd>
            </div>
            <div>
              <dt>Último acceso</dt>
              <dd>{dateTime(customer.fechaUltimoAcceso)}</dd>
            </div>
          </dl>
        ) : (
          <p className="online-profile-empty-copy">
            Este cliente no tiene una cuenta digital registrada.
          </p>
        )}
      </section>
      <section className="online-profile-orders">
        <header>
          <Clock3 size={18} />
          <div>
            <h3>Historial de pedidos online</h3>
            <p>
              Expandí un pedido entregado para consultar sus productos
              asociados.
            </p>
          </div>
        </header>
        {data.pedidos.length ? (
          <div className="online-order-accordion">
            {data.pedidos.map((order) => {
              const lines = data.detalle.filter(
                (line) => line.pedidoId === order.pedidoId,
              );
              const expanded = expandedOrder === order.pedidoId;
              return (
                <article
                  key={order.pedidoId}
                  className={
                    order.cuentaComoCompraEntregada ? "delivered" : "pending"
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      lines.length &&
                      setExpandedOrder(expanded ? null : order.pedidoId)
                    }
                    aria-expanded={lines.length ? expanded : undefined}
                  >
                    <span className="online-order-state-icon">
                      {order.cuentaComoCompraEntregada ? (
                        <PackageCheck size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </span>
                    <span>
                      <strong>Pedido #{order.pedidoId}</strong>
                      <small>Solicitado {dateTime(order.fechaPedido)}</small>
                    </span>
                    <span>
                      <strong>
                        {order.cuentaComoCompraEntregada
                          ? "Venta entregada"
                          : "Aún no representa una venta entregada"}
                      </strong>
                      <small>
                        {order.fechaEntregaAnalitica
                          ? `${dateTime(order.fechaEntregaAnalitica)} · origen ${order.origenFecha}`
                          : "Sin fecha de entrega verificable"}
                      </small>
                    </span>
                    <b>{money.format(order.total)}</b>
                    {lines.length ? (
                      <ChevronDown
                        size={18}
                        className={expanded ? "rotated" : ""}
                      />
                    ) : (
                      <span />
                    )}
                  </button>
                  {expanded && (
                    <div className="online-order-products">
                      <div className="online-order-products-head">
                        <span>Producto</span>
                        <span>Cantidad</span>
                        <span>Precio unitario</span>
                        <span>Subtotal</span>
                      </div>
                      {lines.map((line, index) => (
                        <div
                          key={`${line.pedidoId}-${line.productoId}-${index}`}
                        >
                          <span>
                            <strong>{line.nombre}</strong>
                            <small>{line.codigo}</small>
                          </span>
                          <span>{number.format(line.cantidad)}</span>
                          <span>{money.format(line.precioUnitario)}</span>
                          <span>{money.format(line.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="state-box">
            Sin pedidos online para el período seleccionado.
          </div>
        )}
        <p className="online-profile-quality-note">
          Los productos solo están disponibles para pedidos que cuentan como
          ventas entregadas. No se crean fechas de entrega cuando el historial
          no permite verificarlas.
        </p>
      </section>
    </div>
  );
}
