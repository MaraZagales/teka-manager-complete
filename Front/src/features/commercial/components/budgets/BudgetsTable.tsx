import { ArrowDownAZ, ArrowUpAZ, FileText, Pencil, RefreshCw } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Presupuesto } from "../../../../services/commercialOperationsApi";
import { availableBudgetStates, budgetCustomer, budgetNumber, budgetOrigin, budgetStateTone, budgetTotal, displayBudgetState, formatBudgetDate, formatBudgetMoney, isBudgetExpired, type BudgetSortKey } from "../../utils/budgetPresentation";

type Props = {
  budgets: Presupuesto[]; loading: boolean; page: number; pageSize: number; sort: BudgetSortKey; ascending: boolean;
  hasFilters: boolean; canCreate: boolean; canEdit: boolean;
  onPageChange: (page: number) => void; onSort: (key: BudgetSortKey) => void; onStateChange: (budget: Presupuesto) => void;
};

export function BudgetsTable({ budgets, loading, page, pageSize, sort, ascending, hasFilters, canCreate, canEdit, onPageChange, onSort, onStateChange }: Props) {
  const visible = budgets.slice((page - 1) * pageSize, page * pageSize);
  function sortHeader(label: string, key: BudgetSortKey) {
    const active = sort === key;
    return <button type="button" className="budgets-sort" onClick={(event) => { event.stopPropagation(); onSort(key); }} aria-label={`Ordenar por ${label}${active ? ascending ? ", ascendente" : ", descendente" : ""}`}>{label}{active && (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>)}</button>;
  }
  const columns: DataTableColumn<Presupuesto>[] = [
    { key: "numero", header: sortHeader("Número", "numero"), render: (budget) => <strong>{budgetNumber(budget)}</strong> },
    { key: "cliente", header: sortHeader("Cliente", "cliente"), render: (budget) => budgetCustomer(budget) },
    { key: "origen", header: sortHeader("Origen", "origen"), render: (budget) => budgetOrigin(budget) },
    { key: "emision", header: sortHeader("Emisión", "emision"), render: (budget) => formatBudgetDate(budget.fechaEmision) },
    { key: "vencimiento", header: sortHeader("Vencimiento", "vencimiento"), render: (budget) => formatBudgetDate(budget.fechaVencimiento) },
    { key: "estado", header: sortHeader("Estado", "estado"), render: (budget) => { const state = displayBudgetState(budget); return <span className="budget-state-cell"><StatusBadge tone={budgetStateTone(state)}>{state}</StatusBadge>{isBudgetExpired(budget) && <small>Fecha vencida</small>}</span>; } },
    { key: "importe", header: sortHeader("Importe", "importe"), className: "budgets-money-cell", render: (budget) => formatBudgetMoney(budgetTotal(budget)) },
    { key: "action", header: "Acciones", className: "budgets-action-cell", render: (budget) => <div className="budgets-inline-actions" onClick={(event) => event.stopPropagation()}>
      {canEdit && budget.estado === "Borrador" && <a href={`/comercial/presupuestos/${budget.presupuestoComercialId}/edit`} title="Editar presupuesto" aria-label={`Editar presupuesto ${budgetNumber(budget)}`}><Pencil size={16}/></a>}
      {canEdit && availableBudgetStates(budget).length > 0 && <button type="button" title="Cambiar estado" aria-label={`Cambiar estado de ${budgetNumber(budget)}`} onClick={() => onStateChange(budget)}><RefreshCw size={16}/></button>}
    </div> },
  ];
  return <DataTable rows={visible} columns={columns} rowKey={(budget) => budget.presupuestoComercialId} loading={loading} loadingText="Cargando presupuestos…" page={page} pageSize={pageSize} totalRecords={budgets.length} onPageChange={onPageChange} onRowClick={(budget) => { location.href = `/comercial/presupuestos/${budget.presupuestoComercialId}`; }} className="budgets-table-card" tableClassName="budgets-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{budgets.length}</strong> presupuestos</>} emptyState={<div className="state-box budgets-empty-state"><FileText size={28}/><strong>{hasFilters ? "No hay resultados para estos filtros" : "Todavía no hay presupuestos"}</strong><span>{hasFilters ? "Cambiá la búsqueda o limpiá los filtros." : "Registrá el primer presupuesto para comenzar."}</span>{!hasFilters && canCreate && <a className="button primary" href="/comercial/presupuestos/new">Registrar presupuesto</a>}</div>}/>;
}
