import { useCallback, useEffect, useRef, useState } from "react";
import {
  whatsAppApi,
  type WhatsAppAssignee,
  type WhatsAppConversation,
  type WhatsAppConversationDetail,
} from "../../../services/whatsAppApi";

export function useWhatsAppInbox() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(
      [],
    ),
    [detail, setDetail] = useState<WhatsAppConversationDetail | null>(null),
    [assignees, setAssignees] = useState<WhatsAppAssignee[]>([]);
  const [loading, setLoading] = useState(true),
    [detailLoading, setDetailLoading] = useState(false),
    [error, setError] = useState("");
  const selected = useRef<number | null>(null);
  const loadList = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rows = await whatsAppApi.list();
      setConversations(rows);
      setError("");
      if (
        selected.current &&
        !rows.some((x) => x.conversacionId === selected.current)
      ) {
        selected.current = null;
        setDetail(null);
      }
    } catch (e) {
      if (!silent)
        setError(
          e instanceof Error ? e.message : "No se pudo cargar WhatsApp.",
        );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);
  const select = useCallback(async (id: number, silent = false) => {
    selected.current = id;
    if (!silent) setDetailLoading(true);
    try {
      const value = await whatsAppApi.detail(id);
      if (selected.current === id) setDetail(value);
    } catch (e) {
      if (!silent)
        setError(
          e instanceof Error ? e.message : "No se pudo cargar la conversación.",
        );
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    await loadList(true);
    if (selected.current) await select(selected.current, true);
  }, [loadList, select]);
  useEffect(() => {
    void Promise.all([
      loadList(),
      whatsAppApi
        .assignees()
        .then(setAssignees)
        .catch(() => setAssignees([])),
    ]);
  }, [loadList]);
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(tick, 15000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);
  return {
    conversations,
    detail,
    assignees,
    loading,
    detailLoading,
    error,
    select,
    refresh,
    setError,
  };
}
