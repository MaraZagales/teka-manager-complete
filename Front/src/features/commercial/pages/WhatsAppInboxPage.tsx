import {
  Archive,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Toast } from "../../../components/ui/Toast";
import type { Interes } from "../../../services/commercialApi";
import {
  consultationsApi,
  type ConsultationCustomer,
  type ConsultationReason,
} from "../../../services/commercialConsultationsApi";
import { productsApi, type Product } from "../../../services/productsApi";
import { WhatsAppCommercialPanel } from "../components/whatsapp/WhatsAppCommercialPanel";
import { WhatsAppConversationList } from "../components/whatsapp/WhatsAppConversationList";
import { WhatsAppThread } from "../components/whatsapp/WhatsAppThread";
import { useWhatsAppInbox } from "../hooks/useWhatsAppInbox";
import "../styles/whatsappInbox.css";

export function WhatsAppInboxPage() {
   const inbox = useWhatsAppInbox();

  const [selected, setSelected] = useState<number>();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [assignee, setAssignee] = useState("");

const [view, setView] = useState<
  "conversations" | "history"
>("conversations");

  const [historySearch, setHistorySearch] = useState("");

  const [consultations, setConsultations] = useState<Interes[]>([]);
  const [customers, setCustomers] = useState<ConsultationCustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reasons, setReasons] = useState<ConsultationReason[]>([]);
  const routed = useRef(false);
  const loadCatalog = useCallback(async () => {
    try {
      const [c, cl, p, r] = await Promise.all([
        consultationsApi.list(),
        consultationsApi.customers(),
        productsApi.list(),
        consultationsApi.reasons(),
      ]);
      setConsultations(c);
      setCustomers(cl.filter((x) => x.activo));
      setProducts(p.filter((x) => x.activo));
      setReasons(r.filter((x) => x.activo));
    } catch (e) {
      inbox.setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar la gestión comercial.",
      );
    }
  }, [inbox.setError]);
  useEffect(() => {
    void loadCatalog();
    if (location.pathname === "/comercial/whatsapp")
      history.replaceState(null, "", `/comercial/consultas${location.search}`);
  }, [loadCatalog]);
  useEffect(() => {
    if (routed.current || inbox.loading || !consultations.length) return;
    const consultationId = Number(
      new URLSearchParams(location.search).get("consultaId") || 0,
    );
    if (!consultationId) return;
    routed.current = true;
    const conversation = inbox.conversations.find(
      (x) => x.interesComercialId === consultationId,
    );
    if (conversation) {
      setSelected(conversation.conversacionId);
      void inbox.select(conversation.conversacionId);
    } else {
      location.href = `/comercial/consultas/${consultationId}`;
    }
  }, [inbox.loading, inbox.conversations, consultations, inbox.select]);
  const rows = useMemo(
    () =>
      inbox.conversations.filter(
        (x) =>
          (!search ||
            `${x.nombrePerfil || ""} ${x.telefono}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!state || x.estado === state) &&
          (!assignee ||
            (assignee === "none"
              ? !x.usuarioResponsableId
              : String(x.usuarioResponsableId) === assignee)),
      ),
    [inbox.conversations, search, state, assignee],
  );
  const historical = useMemo(() => {
    const linked = new Set(
      inbox.conversations
        .map((item) => item.interesComercialId)
        .filter(Boolean),
    );

    const query = historySearch.trim().toLowerCase();

    return consultations.filter((item) => {
      const finished =
        !item.activo ||
        Boolean(item.fechaCierre) ||
        ["Calificado", "Descartado", "Convertido", "Concretado"].includes(
          item.estadoNombre,
        );

      const matchesView =
        view === "history"
          ? finished
          : !finished && !linked.has(item.interesComercialId);

      const searchableText = [
        item.clienteNombre,
        item.clienteApellido,
        item.telefono,
        item.descripcion,
        item.canalVentaNombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesView && searchableText.includes(query);
    });
  }, [consultations, inbox.conversations, historySearch, view]);

  async function choose(id: number) {
    setView("conversations");
    setSelected(id);
    await inbox.select(id);
  }
  async function refreshAll() {
    await Promise.all([inbox.refresh(), loadCatalog()]);
  }
  return (
    <AppShell
      title="Consultas Comerciales"
      breadcrumb="Comercial / Consultas Comerciales"
    >
      <Toast message={inbox.error} onClose={() => inbox.setError("")} />
      <div className="wa-page">
        <header className="wa-page-title">
          <div>
            <h1>Consultas Comerciales</h1>
          </div>
          <div>
            <div className="wa-view-tabs">
              <button
                type="button"
                className={`button secondary ${
                  view === "conversations" ? "active" : ""
                }`}
                onClick={() => {
                  setView("conversations");
                  setHistorySearch("");
                }}
              >
                <MessageCircle size={15} />
                Conversaciones
              </button>

              <button
                type="button"
                className={`button secondary ${
                  view === "history" ? "active" : ""
                }`}
                onClick={() => {
                  setView("history");
                  setHistorySearch("");
                }}
              >
                <Archive size={15} />
                Historial
              </button>
            </div>

            <button
              className="button secondary"
              onClick={() => void refreshAll()}
            >
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </header>
        {view !== "conversations" ? (
          <section className="wa-history">
            <header>
              <label>
                <Search size={16} />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Buscar por cliente, descripción o canal"
                />
              </label>
            </header>

            <div className="wa-history-list">
              {historical.map((item) => (
                <a
                  className="wa-history-record"
                  key={item.interesComercialId}
                  href={`/comercial/consultas/${item.interesComercialId}`}
                >
                  <div>
                    <strong>
                      {item.clienteNombre || "Contacto sin nombre"}{" "}
                      {item.clienteApellido}
                    </strong>

                    <span>
                      {item.canalVentaNombre} ·{" "}
                      {new Date(item.fechaAlta).toLocaleDateString("es-AR")}
                    </span>

                    <p>{item.descripcion}</p>
                  </div>

                  <span>{item.estadoNombre}</span>
                </a>
              ))}

              {!historical.length && (
                <div className="wa-empty">
                  <MessageCircle size={26} />
                  <strong>No se encontraron consultas</strong>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="wa-inbox">
            <aside className="wa-conversations">
              <div className="wa-filters">
                <label>
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar contacto o número"
                  />
                </label>
                <div>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option>Abierta</option>
                    <option>Pendiente</option>
                    <option>Cerrada</option>
                  </select>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  >
                    <option value="">Todos los responsables</option>
                    <option value="none">Sin asignar</option>
                    {inbox.assignees.map((x) => (
                      <option key={x.id} value={x.id}>
                        {[x.nombre, x.apellido].filter(Boolean).join(" ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {inbox.loading ? (
                <div className="wa-loading">Cargando conversaciones…</div>
              ) : (
                <WhatsAppConversationList
                  rows={rows}
                  selected={selected}
                  onSelect={(id) => void choose(id)}
                />
              )}
            </aside>
            <main>
              {inbox.detailLoading ? (
                <div className="wa-empty">Cargando conversación…</div>
              ) : inbox.detail ? (
                <WhatsAppThread
                  detail={inbox.detail}
                  onChanged={inbox.refresh}
                  onError={inbox.setError}
                />
              ) : (
                <div className="wa-empty">
                  <strong>Seleccioná una conversación</strong>
                  <span>Acá verás el historial real y podrás responder.</span>
                </div>
              )}
            </main>
            {inbox.detail ? (
              <WhatsAppCommercialPanel
                detail={inbox.detail}
                assignees={inbox.assignees}
                consultations={consultations}
                customers={customers}
                products={products}
                reasons={reasons}
                onChanged={refreshAll}
                onError={inbox.setError}
              />
            ) : (
              <aside className="wa-commercial wa-commercial-empty">
                <BriefcaseBusinessIcon />
                <strong>Gestión comercial</strong>
                <span>
                  Seleccioná una conversación para identificar al cliente y
                  administrar su consulta.
                </span>
              </aside>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function BriefcaseBusinessIcon() {
  return (
    <span className="wa-commercial-placeholder">
      <MessageCircle size={25} />
    </span>
  );
}
