import type { Pedido } from "../../services/onlineOrdersApi";

export type DateRange = { from: string; to: string };
export type PeriodMode = "7" | "30" | "90" | "custom";
export type OrderStateKind = "pending" | "delivered" | "cancelled";
export type OrderSeriesPoint = {
  key: string;
  label: string;
  orders: number;
  amount: number;
};

export function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function presetRange(days: number): DateRange {
  const to = new Date(),
    from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - days + 1);
  return { from: localIso(from), to: localIso(to) };
}
export function dateOnly(value: string) {
  const iso = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return iso || localIso(new Date(value));
}
export function inRange(value: string, range: DateRange) {
  const current = dateOnly(value);
  return current >= range.from && current <= range.to;
}
export function formatRange(range: DateRange) {
  const format = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return `${format(range.from)} al ${format(range.to)}`;
}
export function classifyOrderState(name: string): OrderStateKind {
  if (/cancelad/i.test(name)) return "cancelled";
  if (/entregad/i.test(name)) return "delivered";
  return "pending";
}
export function requiresManagement(order: Pedido) {
  return classifyOrderState(order.estadoPedidoNombre) === "pending";
}

function startOfWeek(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return result;
}
export function groupOrders(
  orders: Pedido[],
  range: DateRange,
): { grouping: "day" | "week" | "month"; points: OrderSeriesPoint[] } {
  const days =
    Math.round(
      (new Date(`${range.to}T12:00:00`).getTime() -
        new Date(`${range.from}T12:00:00`).getTime()) /
        86400000,
    ) + 1;
  const grouping = days > 180 ? "month" : days > 45 ? "week" : "day";
  const grouped = new Map<string, { orders: number; amount: number }>();
  orders.forEach((order) => {
    const value = new Date(order.fechaPedido);
    let key: string;
    if (grouping === "month")
      key = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
    else if (grouping === "week") key = localIso(startOfWeek(value));
    else key = localIso(value);
    const current = grouped.get(key) || { orders: 0, amount: 0 };
    current.orders += 1;
    current.amount += order.total;
    grouped.set(key, current);
  });
  const points = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label:
        grouping === "month"
          ? new Date(`${key}-01T12:00:00`).toLocaleDateString("es-AR", {
              month: "short",
              year: "2-digit",
            })
          : new Date(`${key}T12:00:00`).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
            }),
      ...value,
    }));
  return { grouping, points };
}
