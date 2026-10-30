import type { Oportunidad } from "../../../services/commercialApi";
import type {
  Actividad,
  OpportunityCatalogProduct,
  OpportunityLookup,
  OpportunityUser,
  Presupuesto,
} from "../../../services/commercialOperationsApi";
import { formatProductOption } from "../../../services/productDisplay";

export type OpportunitySortKey =
  | "cliente"
  | "interes"
  | "estado"
  | "responsable"
  | "fecha"
  | "actividad";
export type OpportunityAction = "assign" | "lose" | "cancel";

export function opportunityCustomer(
  opportunity: Pick<Oportunidad, "clienteNombre" | "clienteApellido">,
) {
  return (
    [opportunity.clienteNombre, opportunity.clienteApellido]
      .filter(Boolean)
      .join(" ")
      .trim() || "Cliente sin nombre disponible"
  );
}

export function opportunityStateTone(
  state?: string | null,
): "success" | "warning" | "danger" | "neutral" {
  if (/convertida/i.test(state || "")) return "success";
  if (/perdida|cancelada/i.test(state || "")) return "danger";
  if (/negoci|visita|seguimiento/i.test(state || "")) return "warning";
  return "neutral";
}

export function isOpportunityClosed(
  opportunity: Pick<Oportunidad, "estadoOportunidadNombre">,
) {
  return /convertida|perdida|cancelada/i.test(
    opportunity.estadoOportunidadNombre || "",
  );
}

export function formatOpportunityDate(value?: string | null) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "—";
}

export function formatOpportunityDateTime(value?: string | null) {
  if (!value) return "—";
  const date = formatOpportunityDate(value);
  const time = /T(\d{2}):(\d{2})/.exec(value);
  return time ? `${date} ${time[1]}:${time[2]}` : date;
}

export function toDateInput(value?: string | null) {
  return value?.slice(0, 10) || "";
}

export function formatOpportunityMoney(value?: number | null) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function lookupId(
  item: OpportunityLookup,
  kind: "channel" | "state" | "reason",
) {
  return Number(
    kind === "channel"
      ? (item.canalVentaId ?? item.id)
      : kind === "state"
        ? (item.estadoOportunidadComercialId ?? item.id)
        : (item.motivoPerdidaOportunidadId ?? item.id),
  );
}

export function lookupName(item?: OpportunityLookup | null) {
  return item?.nombre || item?.descripcion || "";
}

export function opportunityUserName(user: OpportunityUser) {
  return (
    [user.nombre, user.apellido].filter(Boolean).join(" ").trim() ||
    user.descripcion ||
    user.email ||
    "Usuario sin nombre disponible"
  );
}

export function opportunityProductName(
  product: Pick<
    OpportunityCatalogProduct,
    | "codigo"
    | "nombre"
    | "nombreCatalogo"
    | "colorNombre"
    | "varianteNombre"
    | "medida"
  >,
) {
  return formatProductOption({
    ...product,
    nombre: cleanOpportunityProductName(product.nombre),
  });
}

export function cleanOpportunityProductName(value?: string | null) {
  return (value || "Producto sin nombre disponible")
    .replace(/^PROD[-_ ]?\d+\s*[·|\-:]\s*/i, "")
    .trim();
}

export type OpportunityProbability = {
  value: number;
  products: boolean;
  completedActivity: boolean;
  budget: boolean;
  acceptedBudget: boolean;
};
export function calculateOpportunityProbability(
  state: string | undefined | null,
  productCount: number,
  activities: Actividad[] = [],
  budgets: Presupuesto[] = [],
): OpportunityProbability {
  if (/convertida/i.test(state || ""))
    return {
      value: 100,
      products: productCount > 0,
      completedActivity: true,
      budget: true,
      acceptedBudget: true,
    };
  if (/perdida|cancelada/i.test(state || ""))
    return {
      value: 0,
      products: productCount > 0,
      completedActivity: false,
      budget: false,
      acceptedBudget: false,
    };
  const products = productCount > 0;
  const completedActivity = activities.some(
    (activity) => activity.estado === "Realizada",
  );
  const budget = budgets.length > 0;
  const acceptedBudget = budgets.some((item) => item.estado === "Aceptado");
  return {
    value:
      10 +
      (products ? 10 : 0) +
      (completedActivity ? 15 : 0) +
      (budget ? 15 : 0) +
      (acceptedBudget ? 30 : 0),
    products,
    completedActivity,
    budget,
    acceptedBudget,
  };
}

export function nextAgendaActivity(
  activities: Actividad[],
  opportunityId: number,
) {
  const now = localBusinessStamp();
  return (
    activities
      .filter(
        (activity) =>
          activity.oportunidadComercialId === opportunityId &&
          activity.estado === "Pendiente" &&
          activity.fechaProgramada.slice(0, 16) >= now,
      )
      .sort((left, right) =>
        left.fechaProgramada.localeCompare(right.fechaProgramada),
      )[0] || null
  );
}

export function filterAndSortOpportunities(
  rows: Oportunidad[],
  activities: Actividad[],
  search: string,
  from: string,
  to: string,
  state: string,
  responsible: string,
  sort: OpportunitySortKey,
  ascending: boolean,
) {
  const query = normalize(search);
  const upcoming = new Map<number, string>();
  const now = localBusinessStamp();
  activities.forEach((activity) => {
    if (
      !activity.oportunidadComercialId ||
      activity.estado !== "Pendiente" ||
      activity.fechaProgramada.slice(0, 16) < now
    )
      return;
    const saved = upcoming.get(activity.oportunidadComercialId);
    if (!saved || activity.fechaProgramada < saved)
      upcoming.set(activity.oportunidadComercialId, activity.fechaProgramada);
  });
  return rows
    .filter((row) => {
      const date = row.fechaAlta?.slice(0, 10) || "";
      const haystack = normalize(
        `${opportunityCustomer(row)} ${row.interes || ""} ${row.estadoOportunidadNombre || ""} ${row.responsableNombre || ""}`,
      );
      return (
        (!query || haystack.includes(query)) &&
        (!from || date >= from) &&
        (!to || date <= to) &&
        (!state || row.estadoOportunidadNombre === state) &&
        (!responsible ||
          (responsible === "unassigned"
            ? !row.usuarioResponsableId
            : String(row.usuarioResponsableId) === responsible))
      );
    })
    .sort((left, right) => {
      const value = (row: Oportunidad) => {
        if (sort === "cliente") return normalize(opportunityCustomer(row));
        if (sort === "interes") return normalize(row.interes || "");
        if (sort === "estado")
          return normalize(row.estadoOportunidadNombre || "");
        if (sort === "responsable")
          return normalize(row.responsableNombre || "");
        if (sort === "actividad")
          return upcoming.get(row.oportunidadComercialId) || "9999";
        return row.fechaAlta || "";
      };
      const comparison = String(value(left)).localeCompare(
        String(value(right)),
        "es-AR",
        { numeric: true },
      );
      return ascending ? comparison : -comparison;
    });
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .trim();
}
function localBusinessStamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value || "00";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}`;
}
