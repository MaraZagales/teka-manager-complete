import { BudgetsPage } from "./pages/BudgetsPage";
import { AgendaPage } from "./pages/AgendaPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { CommercialDashboard } from "./CommercialDashboard";
import "./commercialDashboard.css";


export function CommercialPage({ section = "consultas" }: { section?: "consultas" | "oportunidades" | "presupuestos" | "agenda" | "reportes" }) {
  return section === "oportunidades" ? (
    <OpportunitiesPage />
  ) : section === "consultas" ? (
    <ConsultationsPage />
  ) : section === "presupuestos" ? (
    <BudgetsPage />
  ) : section === "agenda" ? (
    <AgendaPage />
  ) : (
    <CommercialDashboard />
  );
}
