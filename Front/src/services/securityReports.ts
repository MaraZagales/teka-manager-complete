import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { User } from "./usersApi";
import type { AuditEvent, AuditSession } from "./auditApi";

type CountRow = { label: string; value: number };
type TimelineRow = { period: string; sessions: number; events: number; failed: number; sensitive: number };

const GREEN: [number, number, number] = [63, 81, 64];
const SAGE: [number, number, number] = [111, 135, 107];
const TEXT: [number, number, number] = [41, 37, 36];
const MUTED: [number, number, number] = [120, 113, 108];
const BORDER: [number, number, number] = [222, 216, 207];
const PAPER: [number, number, number] = [250, 248, 243];

const fmt = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
    : "—";

const generatedAt = () => new Date().toLocaleString("es-AR");
const pct = (part: number, total: number) => (total ? `${((part / total) * 100).toFixed(1)}%` : "0,0%");
const sensitive = (e: AuditEvent) =>
  /bloq|fall|inactiv|elimin|cancel|password|contrase|permiso|rol|desbloq/i.test(`${e.accion} ${e.descripcion || ""}`);

function mapCount<T>(rows: T[], key: (row: T) => string): CountRow[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const value = key(row) || "Sin dato";
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function reportHeader(doc: jsPDF, title: string, subtitle: string, filters: string) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TEKA MANAGER", 14, 15);
  doc.setFontSize(11);
  doc.text(title, 14, 25);

  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(subtitle, 14, 46);
  doc.text(`Generado: ${generatedAt()}`, 14, 52);
  doc.text(doc.splitTextToSize(`Filtros: ${filters || "Sin filtros"}`, 180), 14, 58);
}

function sectionTitle(doc: jsPDF, title: string, y: number, x = 14) {
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(title, x, y);
}

function metric(doc: jsPDF, x: number, y: number, width: number, label: string, value: string | number, note?: string) {
  doc.setFillColor(...PAPER);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(x, y, width, 22, 3, 3, "FD");
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.text(label, x + 5, y + 6);
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text(String(value), x + 5, y + 14);
  if (note) {
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.text(note, x + 5, y + 19);
  }
}

function bars(doc: jsPDF, items: CountRow[], x: number, y: number, width: number, maxRows = 6) {
  const rows = items.slice(0, maxRows);
  const max = Math.max(1, ...rows.map((item) => item.value));
  rows.forEach((item, index) => {
    const yy = y + index * 9;
    doc.setTextColor(87, 83, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text(item.label.slice(0, 27), x, yy + 4);
    doc.setFillColor(232, 225, 215);
    doc.roundedRect(x + 48, yy, width - 61, 5, 1, 1, "F");
    doc.setFillColor(...SAGE);
    doc.roundedRect(x + 48, yy, (width - 61) * (item.value / max), 5, 1, 1, "F");
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(String(item.value), x + width - 2, yy + 4, { align: "right" });
  });
}

function findings(doc: jsPDF, items: string[], y: number) {
  sectionTitle(doc, "Lectura para gestión", y);
  let currentY = y + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT);
  const values = items.length ? items : ["No se detectaron situaciones destacadas con los datos disponibles."];
  values.slice(0, 6).forEach((item) => {
    const lines = doc.splitTextToSize(`• ${item}`, 176);
    doc.text(lines, 16, currentY);
    currentY += lines.length * 4.2 + 2;
  });
  return currentY;
}

function addPageNumber(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`TEKA Manager · Página ${page} de ${pages}`, 196, 289, { align: "right" });
  }
}

function layout(ws: XLSX.WorkSheet, widths: number[], filter?: string) {
  ws["!cols"] = widths.map((wch) => ({ wch }));
  if (filter) ws["!autofilter"] = { ref: filter };
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" } as never;
}

function titleRows(rows: (string | number)[][], title: string, filters: string) {
  rows.push(["TEKA MANAGER"]);
  rows.push([title]);
  rows.push(["Generado", generatedAt()]);
  rows.push(["Filtros", filters]);
  rows.push([]);
}

function dateKey(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : date.toISOString().slice(0, 10);
}

function timeline(sessions: AuditSession[], events: AuditEvent[]): TimelineRow[] {
  const map = new Map<string, TimelineRow>();
  const ensure = (period: string) => {
    if (!map.has(period)) map.set(period, { period, sessions: 0, events: 0, failed: 0, sensitive: 0 });
    return map.get(period)!;
  };
  sessions.forEach((session) => {
    const row = ensure(dateKey(session.fechaLogin));
    row.sessions += 1;
    if (!session.exitoso) row.failed += 1;
  });
  events.forEach((event) => {
    const row = ensure(dateKey(event.fechaEvento));
    row.events += 1;
    if (sensitive(event)) row.sensitive += 1;
  });
  return [...map.values()].sort((a, b) => a.period.localeCompare(b.period));
}

function userReviewReason(user: User, sessions: AuditSession[], adminRoleName = "Administrador del sistema") {
  const reasons: string[] = [];
  const userSessions = sessions.filter((session) => session.usuarioId === user.usuarioId);
  if (user.bloqueado) reasons.push("Cuenta bloqueada");
  if (!user.activo) reasons.push("Cuenta inactiva");
  if (user.activo && !user.ultimoLogin) reasons.push("Activa sin acceso registrado");
  if ((user.intentosFallidos || 0) > 0) reasons.push(`${user.intentosFallidos} intento(s) fallido(s)`);
  if (user.roles.some((role) => role.rolNombre === adminRoleName)) reasons.push("Privilegios de administrador");
  if (user.activo && userSessions.length === 0) reasons.push("Sin sesiones en el período analizado");
  return [...new Set(reasons)].join(" · ");
}

export function usersAccessPdf(users: User[], sessions: AuditSession[] = [], events: AuditEvent[] = [], filters = "Sin filtros") {
  const doc = new jsPDF();
  reportHeader(doc, "Reporte de usuarios y accesos", "Estado de cuentas, cobertura de uso, privilegios y señales que requieren revisión.", filters);

  const active = users.filter((user) => user.activo).length;
  const blocked = users.filter((user) => user.bloqueado).length;
  const activeIds = new Set(sessions.filter((session) => session.exitoso).map((session) => session.usuarioId));
  const activeWithUse = users.filter((user) => user.activo && activeIds.has(user.usuarioId)).length;
  const admins = users.filter((user) => user.roles.some((role) => role.rolNombre === "Administrador del sistema")).length;
  const sensitiveEvents = events.filter(sensitive).length;
  const failedSessions = sessions.filter((session) => !session.exitoso).length;
  const coverage = active ? (activeWithUse / active) * 100 : 0;

  metric(doc, 14, 70, 42, "Cuentas activas", `${active}/${users.length}`, pct(active, users.length));
  metric(doc, 60, 70, 42, "Cobertura de uso", `${coverage.toFixed(1)}%`, `${activeWithUse} activas con uso`);
  metric(doc, 106, 70, 42, "Administradores", admins, pct(admins, users.length));
  metric(doc, 152, 70, 44, "Señales seguridad", blocked + failedSessions + sensitiveEvents, "bloqueos + fallidos + sensibles");

  const roleCounts = mapCount(
    users.flatMap((user) => (user.roles.length ? user.roles.map((role) => ({ role: role.rolNombre })) : [{ role: "Sin rol" }])),
    (row) => row.role,
  );
  const roleActivity = mapCount(
    sessions.filter((session) => session.exitoso),
    (session) => users.find((user) => user.usuarioId === session.usuarioId)?.roles[0]?.rolNombre || "Sin rol",
  );

  sectionTitle(doc, "Estructura de accesos", 105);
  bars(doc, roleCounts, 14, 112, 86, 5);
  sectionTitle(doc, "Uso del sistema por rol", 105, 108);
  bars(doc, roleActivity, 108, 112, 88, 5);

  const management: string[] = [];
  if (active && activeWithUse < active) management.push(`${active - activeWithUse} cuenta(s) activa(s) no registran sesiones exitosas en el período; conviene validar si siguen necesitando acceso.`);
  if (admins) management.push(`${admins} de ${users.length} cuenta(s) poseen rol Administrador (${pct(admins, users.length)}); es conveniente revisar periódicamente que ese nivel de privilegio siga siendo necesario.`);
  if (blocked) management.push(`${blocked} cuenta(s) se encuentran bloqueadas y requieren revisión administrativa.`);
  if (failedSessions) management.push(`Se registraron ${failedSessions} acceso(s) fallido(s) en el período analizado.`);
  if (sensitiveEvents) management.push(`La auditoría registra ${sensitiveEvents} evento(s) sensible(s) vinculados con seguridad, roles, bloqueos o cambios administrativos.`);
  if (!blocked && !failedSessions && !sensitiveEvents) management.push("No se observan bloqueos, accesos fallidos ni eventos sensibles dentro del conjunto analizado.");
  const afterFindings = findings(doc, management, 164);

  const review = users
    .map((user) => ({ user, reason: userReviewReason(user, sessions) }))
    .filter((row) => row.reason);

  doc.addPage();
  reportHeader(doc, "Usuarios y accesos · Cuentas a revisar", "Detalle priorizado para administración de accesos.", filters);
  autoTable(doc, {
    startY: 68,
    head: [["Usuario", "Nombre", "Rol", "Estado", "Motivo de revisión"]],
    body: review.map(({ user, reason }) => [
      user.username,
      `${user.nombre} ${user.apellido || ""}`.trim(),
      user.roles.map((role) => role.rolNombre).join(", ") || "Sin rol",
      user.bloqueado ? "Bloqueado" : user.activo ? "Activo" : "Inactivo",
      reason,
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: { 4: { cellWidth: 66 } },
  });

  doc.addPage();
  reportHeader(doc, "Usuarios y accesos · Detalle", "Evidencia completa del conjunto incluido en el reporte.", filters);
  autoTable(doc, {
    startY: 68,
    head: [["Usuario", "Nombre", "Rol", "Estado", "Último acceso"]],
    body: users.map((user) => [
      user.username,
      `${user.nombre} ${user.apellido || ""}`.trim(),
      user.roles.map((role) => role.rolNombre).join(", ") || "Sin rol",
      user.bloqueado ? "Bloqueado" : user.activo ? "Activo" : "Inactivo",
      fmt(user.ultimoLogin),
    ]),
    styles: { fontSize: 7.2, cellPadding: 2.1 },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: PAPER },
  });

  void afterFindings;
  addPageNumber(doc);
  doc.save("TEKA_Usuarios_y_Accesos.pdf");
}

export function usersAccessExcel(users: User[], sessions: AuditSession[] = [], events: AuditEvent[] = [], filters = "Sin filtros") {
  const wb = XLSX.utils.book_new();
  const active = users.filter((user) => user.activo).length;
  const activeIds = new Set(sessions.filter((session) => session.exitoso).map((session) => session.usuarioId));
  const activeWithUse = users.filter((user) => user.activo && activeIds.has(user.usuarioId)).length;
  const admins = users.filter((user) => user.roles.some((role) => role.rolNombre === "Administrador del sistema")).length;
  const blocked = users.filter((user) => user.bloqueado).length;
  const failedSessions = sessions.filter((session) => !session.exitoso).length;
  const sensitiveEvents = events.filter(sensitive).length;
  const roleCounts = mapCount(users.flatMap((user) => user.roles.length ? user.roles.map((role) => ({ role: role.rolNombre })) : [{ role: "Sin rol" }]), (row) => row.role);

  const summary: (string | number)[][] = [];
  titleRows(summary, "Usuarios y accesos · Resumen ejecutivo", filters);
  summary.push(
    ["INDICADORES DE GESTIÓN"],
    ["Indicador", "Valor", "Lectura"],
    ["Cuentas activas", active, pct(active, users.length)],
    ["Cobertura de uso", active ? `${((activeWithUse / active) * 100).toFixed(1)}%` : "0,0%", `${activeWithUse} de ${active} cuentas activas con sesiones exitosas`],
    ["Cuentas con rol Administrador", admins, pct(admins, users.length)],
    ["Cuentas bloqueadas", blocked, blocked ? "Requieren revisión" : "Sin bloqueos actuales"],
    ["Accesos fallidos del período", failedSessions, failedSessions ? "Revisar origen y recurrencia" : "Sin fallidos registrados"],
    ["Eventos sensibles", sensitiveEvents, sensitiveEvents ? "Revisar hoja de actividad" : "Sin señales registradas"],
    [],
    ["DISTRIBUCIÓN DE PRIVILEGIOS"],
    ["Rol", "Usuarios", "% sobre cuentas"],
    ...roleCounts.map((row) => [row.label, row.value, pct(row.value, users.length)]),
  );
  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  layout(summarySheet, [38, 24, 62]);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen ejecutivo");

  const reviewRows = users
    .map((user) => ({
      Usuario: user.username,
      Nombre: `${user.nombre} ${user.apellido || ""}`.trim(),
      Rol: user.roles.map((role) => role.rolNombre).join(", ") || "Sin rol",
      Estado: user.bloqueado ? "Bloqueado" : user.activo ? "Activo" : "Inactivo",
      "Último acceso": fmt(user.ultimoLogin),
      "Motivo de revisión": userReviewReason(user, sessions),
    }))
    .filter((row) => row["Motivo de revisión"]);
  const reviewSheet = XLSX.utils.json_to_sheet(reviewRows);
  layout(reviewSheet, [18, 28, 30, 16, 22, 60], `A1:F${Math.max(1, reviewRows.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, reviewSheet, "Cuentas a revisar");

  const roleAnalysis = roleCounts.map((role) => {
    const roleUsers = users.filter((user) => user.roles.some((item) => item.rolNombre === role.label));
    const roleIds = new Set(roleUsers.map((user) => user.usuarioId));
    const roleSessions = sessions.filter((session) => roleIds.has(session.usuarioId) && session.exitoso);
    return {
      Rol: role.label,
      Usuarios: role.value,
      "% de cuentas": pct(role.value, users.length),
      "Usuarios con actividad": new Set(roleSessions.map((session) => session.usuarioId)).size,
      "Sesiones exitosas": roleSessions.length,
    };
  });
  const roleSheet = XLSX.utils.json_to_sheet(roleAnalysis);
  layout(roleSheet, [34, 14, 16, 24, 20], `A1:E${Math.max(1, roleAnalysis.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, roleSheet, "Distribución por rol");

  const detail = users.map((user) => ({
    Usuario: user.username,
    Nombre: `${user.nombre} ${user.apellido || ""}`.trim(),
    Email: user.email,
    Rol: user.roles.map((role) => role.rolNombre).join(", ") || "Sin rol",
    Estado: user.bloqueado ? "Bloqueado" : user.activo ? "Activo" : "Inactivo",
    "Intentos fallidos": user.intentosFallidos,
    "Fecha alta": fmt(user.fechaAlta),
    "Último acceso": fmt(user.ultimoLogin),
  }));
  const detailSheet = XLSX.utils.json_to_sheet(detail);
  layout(detailSheet, [18, 28, 34, 30, 16, 18, 22, 22], `A1:H${Math.max(1, detail.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, detailSheet, "Usuarios");

  XLSX.writeFile(wb, "TEKA_Usuarios_y_Accesos.xlsx");
}

export function auditPdf(sessions: AuditSession[], events: AuditEvent[], filters = "Sin filtros") {
  const doc = new jsPDF();
  reportHeader(doc, "Reporte de seguridad y auditoría", "Evolución de actividad, trazabilidad y señales que requieren control.", filters);

  const successful = sessions.filter((session) => session.exitoso).length;
  const failed = sessions.filter((session) => !session.exitoso).length;
  const open = sessions.filter((session) => !session.fechaLogout).length;
  const sens = events.filter(sensitive).length;
  const activeUsers = new Set([...sessions.map((session) => session.usuarioId), ...events.map((event) => event.usuarioId)]).size;
  const timelineRows = timeline(sessions, events);

  metric(doc, 14, 70, 42, "Usuarios con actividad", activeUsers, `${sessions.length} sesiones`);
  metric(doc, 60, 70, 42, "Accesos exitosos", successful, pct(successful, sessions.length));
  metric(doc, 106, 70, 42, "Accesos fallidos", failed, pct(failed, sessions.length));
  metric(doc, 152, 70, 44, "Eventos sensibles", sens, `${events.length} eventos totales`);

  sectionTitle(doc, "Actividad en el tiempo", 105);
  autoTable(doc, {
    startY: 110,
    head: [["Fecha", "Sesiones", "Eventos", "Fallidos", "Sensibles"]],
    body: timelineRows.slice(-10).map((row) => [row.period, row.sessions, row.events, row.failed, row.sensitive]),
    styles: { fontSize: 7.2, cellPadding: 1.8 },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: PAPER },
  });

  const management: string[] = [];
  if (failed) management.push(`Se registraron ${failed} acceso(s) fallido(s), equivalentes al ${pct(failed, sessions.length)} de las sesiones del período.`);
  if (sens) management.push(`${sens} evento(s) fueron clasificados como sensibles por involucrar bloqueos, permisos, roles, contraseñas u otras acciones administrativas.`);
  if (open) management.push(`${open} sesión(es) no registran fecha de cierre. Si corresponden a períodos históricos, conviene revisar el mecanismo de logout o la calidad del registro de auditoría antes de interpretarlas como sesiones actualmente abiertas.`);
  const moduleCounts = mapCount(events, (event) => event.modulo);
  if (moduleCounts[0]) management.push(`${moduleCounts[0].label} concentra ${moduleCounts[0].value} de ${events.length} evento(s) registrados (${pct(moduleCounts[0].value, events.length)}).`);
  const topUsers = mapCount(events, (event) => event.username);
  if (topUsers[0]) management.push(`${topUsers[0].label} es el usuario con mayor cantidad de eventos auditados (${topUsers[0].value}).`);
  findings(doc, management, 205);

  doc.addPage();
  reportHeader(doc, "Seguridad y auditoría · Concentración de actividad", "Dónde y quién concentra la actividad registrada.", filters);
  sectionTitle(doc, "Eventos por módulo", 72);
  bars(doc, moduleCounts, 14, 80, 86, 7);
  sectionTitle(doc, "Usuarios con mayor actividad", 72, 108);
  bars(doc, topUsers, 108, 80, 88, 7);

  const actionCounts = mapCount(events, (event) => event.accion);
  sectionTitle(doc, "Eventos por acción", 158);
  bars(doc, actionCounts, 14, 166, 86, 7);
  sectionTitle(doc, "Señales sensibles", 158, 108);
  bars(doc, mapCount(events.filter(sensitive), (event) => event.accion), 108, 166, 88, 7);

  doc.addPage();
  reportHeader(doc, "Seguridad y auditoría · Eventos sensibles", "Operaciones priorizadas para revisión administrativa.", filters);
  const sensitiveRows = events.filter(sensitive);
  autoTable(doc, {
    startY: 68,
    head: [["Fecha", "Usuario", "Módulo", "Acción", "Detalle"]],
    body: sensitiveRows.map((event) => [fmt(event.fechaEvento), event.username, event.modulo, event.accion, event.descripcion || "—"]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: { 4: { cellWidth: 66 } },
  });

  doc.addPage();
  reportHeader(doc, "Seguridad y auditoría · Evidencia", "Detalle completo de eventos incluidos en el período.", filters);
  autoTable(doc, {
    startY: 68,
    head: [["Fecha", "Usuario", "Módulo", "Acción", "Detalle"]],
    body: events.slice(0, 1000).map((event) => [fmt(event.fechaEvento), event.username, event.modulo, event.accion, event.descripcion || "—"]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: { 4: { cellWidth: 66 } },
  });

  addPageNumber(doc);
  doc.save("TEKA_Seguridad_y_Auditoria.pdf");
}

export function auditExcel(sessions: AuditSession[], events: AuditEvent[], filters = "Sin filtros") {
  const wb = XLSX.utils.book_new();
  const failed = sessions.filter((session) => !session.exitoso).length;
  const successful = sessions.filter((session) => session.exitoso).length;
  const open = sessions.filter((session) => !session.fechaLogout).length;
  const sensitiveEvents = events.filter(sensitive);
  const moduleCounts = mapCount(events, (event) => event.modulo);
  const userCounts = mapCount(events, (event) => event.username);
  const timelineRows = timeline(sessions, events);

  const summary: (string | number)[][] = [];
  titleRows(summary, "Seguridad y auditoría · Resumen del período", filters);
  summary.push(
    ["INDICADORES DE CONTROL"],
    ["Indicador", "Valor", "Lectura"],
    ["Usuarios con actividad", new Set([...sessions.map((session) => session.usuarioId), ...events.map((event) => event.usuarioId)]).size, "Usuarios distintos con sesión o evento"],
    ["Accesos exitosos", successful, pct(successful, sessions.length)],
    ["Accesos fallidos", failed, pct(failed, sessions.length)],
    ["Eventos sensibles", sensitiveEvents.length, pct(sensitiveEvents.length, events.length)],
    ["Sesiones sin cierre registrado", open, "Revisar especialmente si pertenecen a períodos históricos"],
    [],
    ["CONCENTRACIÓN POR MÓDULO"],
    ["Módulo", "Eventos", "% del total"],
    ...moduleCounts.map((row) => [row.label, row.value, pct(row.value, events.length)]),
  );
  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  layout(summarySheet, [38, 22, 64]);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen del período");

  const temporal = timelineRows.map((row) => ({
    Fecha: row.period,
    Sesiones: row.sessions,
    Eventos: row.events,
    "Accesos fallidos": row.failed,
    "Eventos sensibles": row.sensitive,
  }));
  const temporalSheet = XLSX.utils.json_to_sheet(temporal);
  layout(temporalSheet, [16, 14, 14, 18, 20], `A1:E${Math.max(1, temporal.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, temporalSheet, "Actividad temporal");

  const sensitiveRows = sensitiveEvents.map((event) => ({
    Fecha: fmt(event.fechaEvento),
    Usuario: event.username,
    Nombre: `${event.nombre} ${event.apellido || ""}`.trim(),
    Módulo: event.modulo,
    Entidad: event.entidad,
    Acción: event.accion,
    Registro: event.registroId || "",
    Descripción: event.descripcion || "",
  }));
  const sensitiveSheet = XLSX.utils.json_to_sheet(sensitiveRows);
  layout(sensitiveSheet, [22, 18, 28, 20, 22, 22, 14, 58], `A1:H${Math.max(1, sensitiveRows.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, sensitiveSheet, "Eventos sensibles");

  const byUser = userCounts.map((row) => {
    const userSessions = sessions.filter((session) => session.username === row.label);
    const userEvents = events.filter((event) => event.username === row.label);
    const dates = [...userSessions.map((session) => session.fechaLogin), ...userEvents.map((event) => event.fechaEvento)].filter(Boolean).sort();
    return {
      Usuario: row.label,
      Sesiones: userSessions.length,
      Eventos: userEvents.length,
      "Accesos fallidos": userSessions.filter((session) => !session.exitoso).length,
      "Eventos sensibles": userEvents.filter(sensitive).length,
      "Última actividad": dates.length ? fmt(dates[dates.length - 1]) : "—",
    };
  });
  const userSheet = XLSX.utils.json_to_sheet(byUser);
  layout(userSheet, [20, 14, 14, 18, 20, 24], `A1:F${Math.max(1, byUser.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, userSheet, "Actividad por usuario");

  const byModule = moduleCounts.map((row) => ({
    Módulo: row.label,
    Eventos: row.value,
    "% del total": pct(row.value, events.length),
    "Eventos sensibles": events.filter((event) => event.modulo === row.label && sensitive(event)).length,
    Usuarios: new Set(events.filter((event) => event.modulo === row.label).map((event) => event.usuarioId)).size,
  }));
  const moduleSheet = XLSX.utils.json_to_sheet(byModule);
  layout(moduleSheet, [24, 14, 16, 20, 14], `A1:E${Math.max(1, byModule.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, moduleSheet, "Actividad por módulo");

  const eventRows = events.map((event) => ({
    Fecha: fmt(event.fechaEvento), Usuario: event.username, Nombre: `${event.nombre} ${event.apellido || ""}`.trim(),
    Módulo: event.modulo, Entidad: event.entidad, Acción: event.accion, Registro: event.registroId || "",
    Descripción: event.descripcion || "", Sensible: sensitive(event) ? "Sí" : "No",
  }));
  const eventSheet = XLSX.utils.json_to_sheet(eventRows);
  layout(eventSheet, [22, 18, 28, 20, 22, 22, 14, 58, 12], `A1:I${Math.max(1, eventRows.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, eventSheet, "Eventos");

  const sessionRows = sessions.map((session) => ({
    Ingreso: fmt(session.fechaLogin), Salida: fmt(session.fechaLogout), Usuario: session.username,
    Nombre: `${session.nombre} ${session.apellido || ""}`.trim(), Resultado: session.exitoso ? "Exitoso" : "Fallido",
    IP: session.ipOrigen || "", Observaciones: session.observaciones || "",
  }));
  const sessionSheet = XLSX.utils.json_to_sheet(sessionRows);
  layout(sessionSheet, [22, 22, 18, 28, 14, 22, 48], `A1:G${Math.max(1, sessionRows.length + 1)}`);
  XLSX.utils.book_append_sheet(wb, sessionSheet, "Sesiones");

  XLSX.writeFile(wb, "TEKA_Seguridad_y_Auditoria.xlsx");
}
