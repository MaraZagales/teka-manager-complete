import { ArrowDownAZ,ArrowUpAZ,MessageCircle,Pencil } from "lucide-react";
import { DataTable,type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import type { Interes } from "../../../../services/commercialApi";
import { consultationClosed,consultationCustomer,consultationSubject,consultationTone,formatConsultationDate,type ConsultationSortKey } from "../../utils/consultationPresentation";

type Props={rows:Interes[];loading:boolean;page:number;pageSize:number;sort:ConsultationSortKey;ascending:boolean;hasFilters:boolean;canCreate:boolean;canEdit:boolean;onPageChange:(page:number)=>void;onSort:(key:ConsultationSortKey)=>void};
export function ConsultationsTable(props:Props){const visible=props.rows.slice((props.page-1)*props.pageSize,props.page*props.pageSize);const header=(label:string,key:ConsultationSortKey)=><button type="button" className="consultations-sort" onClick={event=>{event.stopPropagation();props.onSort(key)}}>{label}{props.sort===key&&(props.ascending?<ArrowDownAZ size={14}/>:<ArrowUpAZ size={14}/>)}</button>;
 const columns:DataTableColumn<Interes>[]=[
  {key:"date",header:header("Fecha","fecha"),render:item=>formatConsultationDate(item.fechaAlta,true)},
  {key:"contact",header:header("Cliente o contacto","contacto"),render:item=><span className="consultation-contact"><strong>{consultationCustomer(item)}</strong><small>{item.telefono||item.email||"Sin contacto informado"}</small></span>},
  {key:"channel",header:header("Canal","canal"),render:item=>item.canalVentaNombre||item.tipoOrigen},
  {key:"subject",header:header("Asunto","asunto"),render:item=><span className="consultation-subject"><strong>{consultationSubject(item)}</strong><small>{item.descripcion}</small></span>},
  {key:"responsible",header:header("Responsable","responsable"),render:item=>item.responsableNombre||"Sin asignar"},
  {key:"state",header:header("Estado","estado"),render:item=><StatusBadge tone={consultationTone(item.estadoNombre)}>{item.estadoNombre}</StatusBadge>},
  {key:"follow",header:header("Último seguimiento","seguimiento"),render:item=>formatConsultationDate(item.fechaUltimaActividad,true)},
  {key:"actions",header:"Acciones",className:"consultations-actions",render:item=><div onClick={event=>event.stopPropagation()}>{props.canEdit&&!consultationClosed(item)&&<a href={`/comercial/consultas/${item.interesComercialId}/edit`} title="Editar consulta" aria-label={`Editar consulta de ${consultationCustomer(item)}`}><Pencil size={16}/></a>}</div>},
 ];
 return <DataTable rows={visible} columns={columns} rowKey={item=>item.interesComercialId} loading={props.loading} loadingText="Cargando consultas…" page={props.page} pageSize={props.pageSize} totalRecords={props.rows.length} onPageChange={props.onPageChange} onRowClick={item=>{location.href=`/comercial/consultas/${item.interesComercialId}`}} className="consultations-table-card" tableClassName="consultations-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{props.rows.length}</strong> consultas</>} emptyState={<div className="state-box consultations-empty"><MessageCircle size={28}/><strong>{props.hasFilters?"No hay resultados para estos filtros":"Todavía no hay consultas"}</strong><span>{props.hasFilters?"Cambiá la búsqueda o limpiá los filtros.":"Registrá la primera consulta comercial."}</span>{!props.hasFilters&&props.canCreate&&<a className="button primary" href="/comercial/consultas/new">Registrar consulta</a>}</div>}/>;
}
