import { Check, CheckCheck, Clock3, Send, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { hasPermission } from "../../../../services/authorization";
import {
  whatsAppApi,
  type WhatsAppConversationDetail,
  type WhatsAppMessage,
} from "../../../../services/whatsAppApi";

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
function State({ message }: { message: WhatsAppMessage }) {
  if (message.estado === "Fallido")
    return (
      <span
        title={message.errorDescripcion || "Envío fallido"}
        className="wa-state failed"
      >
        <TriangleAlert size={13} /> Fallido
      </span>
    );
  if (message.estado === "Pendiente")
    return (
      <span className="wa-state">
        <Clock3 size={12} /> Pendiente
      </span>
    );
  if (message.estado === "Leido")
    return (
      <span className="wa-state read">
        <CheckCheck size={14} /> Leído
      </span>
    );
  if (message.estado === "Entregado")
    return (
      <span className="wa-state">
        <CheckCheck size={14} /> Entregado
      </span>
    );
  return (
    <span className="wa-state">
      <Check size={13} /> {message.estado}
    </span>
  );
}
export function WhatsAppThread({
  detail,
  onChanged,
  onError,
}: {
  detail: WhatsAppConversationDetail;
  onChanged: () => Promise<void>;
  onError: (value: string) => void;
}) {
  const { textWindowOpen } = useMemo(
    () => ({
      textWindowOpen: detail.conversation.ultimoMensajeEntrante
        ? Date.now() -
            new Date(detail.conversation.ultimoMensajeEntrante).getTime() <
          24 * 3600_000
        : false,
    }),
    [detail.conversation.ultimoMensajeEntrante],
  );
  const [text, setText] = useState(""),
    [sending, setSending] = useState(false),
    [sendError, setSendError] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const canCreate = hasPermission("Comercial", "Crear");
  const messages = useMemo(() => {
    const unique = new Map<string, WhatsAppMessage>();
    for (const message of detail.messages) {
      const key = message.mensajeMetaId || message.solicitudClienteId || String(message.mensajeId);
      unique.set(key, message);
    }
    return [...unique.values()].sort((left, right) => left.fechaMensaje.localeCompare(right.fechaMensaje) || left.mensajeId - right.mensajeId);
  }, [detail.messages]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ block: "end" }); }, [messages]);
  async function send() {
    if (!text.trim() || sending || !canCreate || !textWindowOpen) return;
    setSending(true);
    setSendError("");
    const value = text.trim();
    try {
      await whatsAppApi.send(
        detail.conversation.conversacionId,
        value,
        crypto.randomUUID(),
      );
      setText("");
      await onChanged();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo enviar el mensaje.";
      setSendError(message);
      onError(message);
      await onChanged().catch(() => undefined);
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="wa-thread">
      <header>
        <div>
          <strong>
            {detail.conversation.nombrePerfil || detail.conversation.telefono}
          </strong>
          <span>{detail.conversation.telefono}</span>
        </div>
        <small>WhatsApp oficial · {detail.conversation.estado}</small>
      </header>
      <div className="wa-messages">
        {messages.map((message) => (
          <article
            key={message.mensajeId}
            className={
              message.direccion === "Saliente" ? "outgoing" : "incoming"
            }
          >
            <p>{message.texto || `[${message.tipo}]`}</p>
            <footer>
              <time>{dateTime(message.fechaMensaje)}</time>
              {message.direccion === "Saliente" && <State message={message} />}
            </footer>
          </article>
        ))}
        <div ref={messagesEnd} aria-hidden="true" />
      </div>
      <div className="wa-composer">
        {!textWindowOpen && (
          <div className="wa-window-warning">
            <TriangleAlert size={16} /> La ventana de 24 horas está cerrada. Se
            requerirá una plantilla aprobada.
          </div>
        )}
        {sendError && <div className="wa-send-error" role="alert"><TriangleAlert size={15}/><span>{sendError}</span></div>}
        {!canCreate && <div className="wa-send-hint">No tenés permiso para enviar mensajes comerciales.</div>}
        <div>
          <textarea
            value={text}
            maxLength={4096}
            disabled={!canCreate || !textWindowOpen || sending}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Escribí una respuesta…"
          />
          <button
            type="button"
            disabled={!text.trim() || !textWindowOpen || !canCreate || sending}
            onClick={() => void send()}
            aria-label="Enviar"
          >
            <Send size={18} />
            <span>{sending ? "Enviando…" : "Enviar"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
