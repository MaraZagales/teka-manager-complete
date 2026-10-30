import { FileBarChart, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { InventoryReportFiltersBar } from "../components/reports/InventoryReportFilters";
import { ReportDashboardCharts } from "../components/reports/InventoryReportVisuals";
import { useInventoryReportData } from "../hooks/useInventoryReportData";
import { useState } from "react";
import { defaultReportFilters, filtersToQuery } from "../utils/reportPresentation";
import "../styles/reports.css";

export function InventoryReportsHomePage() {
  const [filters, setFilters] = useState(defaultReportFilters);
  const data = useInventoryReportData(filters);
  const query = filtersToQuery(filters);
  return <AppShell title="Reportes de inventario" breadcrumb="Inventario / Reportes de inventario">
    <main className="inventory-reports-page">
      <PageHeader title="Reportes de inventario" action={<a className="button primary" href={`/inventory/reports/generate?${query}`}><FileBarChart size={17} /> Generar informe</a>} />
      <InventoryReportFiltersBar value={filters} deposits={data.deposits} onChange={setFilters} />

      {data.error && <div className="inventory-report-error" role="alert"><span>{data.error}</span><button className="button secondary compact" onClick={() => void data.reload()}><RotateCcw size={15} /> Reintentar</button></div>}
      <ReportDashboardCharts stock={data.stock} movements={data.movements} consumption={data.consumption} query={query} loading={data.loading} />

    </main>
  </AppShell>;
}
