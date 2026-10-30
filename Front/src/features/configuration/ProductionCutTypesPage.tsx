import { useEffect,useState } from 'react';
import { ArrowLeft,Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable,type DataTableColumn } from '../../components/data/DataTable';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { productionConfigurationAdminApi as api,type ProductionCutType } from '../../services/productionConfigurationAdminApi';
import './configuration.css';

export function ProductionCutTypesPage(){
 const[rows,setRows]=useState<ProductionCutType[]>([]),[name,setName]=useState(''),[error,setError]=useState('');
 async function load(){try{setRows(await api.cutTypes())}catch(e){setError(apiErrorMessage(e,'No se pudieron consultar los tipos de recorte.'))}}
 useEffect(()=>{void load()},[]);
 async function save(){try{await api.saveCutType(null,name);setName('');await load()}catch(e){setError(apiErrorMessage(e,'No se pudo guardar el tipo de recorte.'))}}
 async function inactive(id:number){try{await api.inactivateCutType(id);await load()}catch(e){setError(apiErrorMessage(e,'No se pudo inactivar el tipo de recorte.'))}}
 const columns:DataTableColumn<ProductionCutType>[]=[{key:'name',header:'Tipo',render:x=><strong>{x.nombre}</strong>},{key:'state',header:'Estado',render:x=>x.activo?'Activo':'Inactivo'},{key:'actions',header:'Acciones',render:x=>x.activo&&hasPermission('Configuración','Inactivar')?<button className="configuration-text-action" onClick={()=>void inactive(x.tipoRecorteId)}>Inactivar</button>:null}];
 return <AppShell title="Tipos de recorte" breadcrumb="Administración / Configuración / Producción / Tipos de recorte"><div className="configuration-page"><a className="configuration-back" href="/configuracion/produccion"><ArrowLeft size={16}/> Producción</a><PageHeader title="Tipos de recorte"/>{error&&<div className="sales-prices-error">{error}</div>}{hasPermission('Configuración','Crear')&&<div className="production-admin-quick-form"><input value={name} maxLength={50} placeholder="Nombre" onChange={e=>setName(e.target.value)}/><button className="button primary" disabled={!name.trim()} onClick={()=>void save()}><Plus size={16}/> Nuevo tipo</button></div>}<DataTable rows={rows} columns={columns} rowKey={x=>x.tipoRecorteId} loading={false} page={1} pageSize={Math.max(1,rows.length)} totalRecords={rows.length}/></div></AppShell>;
}
