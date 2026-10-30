import { useEffect, useState } from "react";
import { Ban, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { PageHeader } from "../../../components/data/PageHeader";
import { Toast } from "../../../components/ui/Toast";
import { hasPermission } from "../../../services/authorization";
import { MovementFilters } from "../components/movements/MovementFilters";
import { MovementsTable } from "../components/movements/MovementsTable";
import { useMovementCatalogs } from "../hooks/useMovementCatalogs";
import { useMovementList } from "../hooks/useMovementList";
import type { MovementListFilters } from "../types/movements";
import { initialMovementFilters } from "../utils/movementPresentation";
import "../styles/movements.css";

export function MovementsPage() {
  const catalogs = useMovementCatalogs();
  const canCreate = hasPermission("Inventario", "Crear");
  const [filters, setFilters] = useState<MovementListFilters>(initialMovementFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const list = useMovementList(filters, page);

  useEffect(() => {
    const saved = sessionStorage.getItem("movement-notice");
    if (saved) { setNotice(saved); sessionStorage.removeItem("movement-notice"); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => ({ ...current, search: search.trim() })), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => setPage(1), [filters]);

  function changeFilter<K extends keyof MovementListFilters>(key: K, value: MovementListFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  function clearFilters() {
    const clean = initialMovementFilters();
    setSearch(""); setFilters(clean); setPage(1);
  }

  return <AppShell title="Movimientos de stock" breadcrumb="Inventario / Movimientos de stock">
    <main className="movement-list-page">
      <Toast message={notice} onClose={() => setNotice("")}/>
      <PageHeader title="Movimientos de stock" action={canCreate && <a className="button primary" href="/inventory/movements/new"><Plus size={17}/>Registrar movimiento</a>}/>
      {catalogs.error ? <div className="movement-page-error" role="alert"><Ban size={20}/><span>{catalogs.error}</span><button type="button" className="button secondary" onClick={() => void catalogs.load()}><RotateCcw size={15}/>Reintentar</button></div> : <>
        <MovementFilters filters={filters} search={search} deposits={catalogs.deposits} movementTypes={catalogs.types} onSearchChange={setSearch} onChange={changeFilter} onClear={clearFilters}/>
        {list.error ? <div className="movement-page-error" role="alert"><Ban size={20}/><span>{list.error}</span><button type="button" className="button secondary" onClick={() => void list.load()}><RotateCcw size={15}/>Reintentar</button></div> : <MovementsTable rows={list.rows} articles={catalogs.articles} loading={list.loading || catalogs.loading} page={page} total={list.total} onPageChange={setPage}/>} 
      </>}
    </main>
  </AppShell>;
}
