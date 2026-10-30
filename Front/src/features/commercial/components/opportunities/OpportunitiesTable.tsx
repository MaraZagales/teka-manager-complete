import { ArrowDownAZ, ArrowUpAZ, BriefcaseBusiness, Pencil } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Oportunidad } from "../../../../services/commercialApi";
import type { Actividad } from "../../../../services/commercialOperationsApi";
import { formatOpportunityDate, formatOpportunityDateTime, isOpportunityClosed, nextAgendaActivity, opportunityCustomer, opportunityStateTone, type OpportunitySortKey } from "../../utils/opportunityPresentation";

type Props = { rows:Oportunidad[]; activities:Actividad[]; loading:boolean; page:number; pageSize:number; sort:OpportunitySortKey; ascending:boolean; hasFilters:boolean; canCreate:boolean; canEdit:boolean; onPageChange:(page:number)=>void; onSort:(key:OpportunitySortKey)=>void };

export function OpportunitiesTable(props: Props) {
  const visible = props.rows.slice((props.page - 1) * props.pageSize, props.page * props.pageSize);
  function header(label:string,key:OpportunitySortKey) { const active=props.sort===key; return <button type="button" className="opportunities-sort" onClick={(event)=>{event.stopPropagation();props.onSort(key)}}>{label}{active&&(props.ascending?<ArrowDownAZ size={14}/>:<ArrowUpAZ size={14}/>)}</button>; }
  const columns:DataTableColumn<Oportunidad>[] = [
    {key:"customer",header:header("Cliente","cliente"),render:(row)=><strong>{opportunityCustomer(row)}</strong>},
    {key:"interest",header:header("Interés comercial","interes"),render:(row)=><span className="opportunity-interest-cell">{row.interes||"Sin descripción"}</span>},
    {key:"state",header:header("Estado","estado"),render:(row)=><StatusBadge tone={opportunityStateTone(row.estadoOportunidadNombre)}>{row.estadoOportunidadNombre||"Sin estado"}</StatusBadge>},
    {key:"probability",header:"Probabilidad estimada",render:(row)=><strong>{row.probabilidad}%</strong>},
    {key:"responsible",header:header("Responsable","responsable"),render:(row)=>row.responsableNombre||"Sin asignar"},
    {key:"date",header:header("Fecha de creación","fecha"),render:(row)=>formatOpportunityDate(row.fechaAlta)},
    {key:"activity",header:header("Próxima actividad","actividad"),render:(row)=>{const activity=nextAgendaActivity(props.activities,row.oportunidadComercialId);return activity?<span className="opportunity-next-activity"><strong>{formatOpportunityDateTime(activity.fechaProgramada)}</strong><small>{activity.tipo} · {activity.titulo}</small></span>:"Sin actividad programada"}},
    {key:"actions",header:"Acciones",className:"opportunities-actions",render:(row)=><div onClick={(event)=>event.stopPropagation()}>{props.canEdit&&!isOpportunityClosed(row)&&<a href={`/comercial/oportunidades/${row.oportunidadComercialId}/edit`} title="Editar oportunidad" aria-label={`Editar oportunidad de ${opportunityCustomer(row)}`}><Pencil size={16}/></a>}</div>},
  ];
  return <DataTable rows={visible} columns={columns} rowKey={(row)=>row.oportunidadComercialId} loading={props.loading} loadingText="Cargando oportunidades…" page={props.page} pageSize={props.pageSize} totalRecords={props.rows.length} onPageChange={props.onPageChange} onRowClick={(row)=>{location.href=`/comercial/oportunidades/${row.oportunidadComercialId}`}} className="opportunities-table-card" tableClassName="opportunities-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{props.rows.length}</strong> oportunidades</>} emptyState={<div className="state-box opportunities-empty"><BriefcaseBusiness size={28}/><strong>{props.hasFilters?"No hay resultados para estos filtros":"Todavía no hay oportunidades"}</strong><span>{props.hasFilters?"Cambiá la búsqueda o limpiá los filtros.":"Registrá la primera oportunidad para comenzar."}</span>{!props.hasFilters&&props.canCreate&&<a className="button primary" href="/comercial/oportunidades/new">Nueva oportunidad</a>}</div>}/>;
}
