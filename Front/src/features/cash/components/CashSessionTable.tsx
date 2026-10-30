import { useState } from 'react';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/data/StatusBadge';
import type { DailyCashEntry, DailyCashSession } from '../../../services/dailyCashApi';
import { formatDateTime, money, movementTypeLabel } from '../cashFormat';

export { cashMovementUrl } from '../cashRoutes';
import { cashMovementUrl } from '../cashRoutes';
export const cashSessionColumns: DataTableColumn<DailyCashEntry>[] = [
  {key:'fecha',header:'Fecha / hora',width:'20%',render:row=>formatDateTime(row.fecha)},
  {key:'tipo',header:'Tipo',width:'17%',render:row=><><StatusBadge tone={row.sentido==='Ingreso'?'success':'neutral'}>{row.sentido}</StatusBadge><small>{movementTypeLabel(row.tipo)}</small></>},
  {key:'concepto',header:'Concepto / descripción',width:'27%',render:row=><><strong>{row.conceptoClasificado||row.concepto}</strong>{row.conceptoClasificado&&<small>{row.concepto}</small>}</>},
  {key:'importe',header:'Importe',width:'17%',className:'cash-record-money',headerClassName:'cash-record-money',render:row=><strong>{money.format(row.importe)}</strong>},
  {key:'responsable',header:'Responsable',width:'19%',render:row=>row.responsable},
];
export function CashSessionTable({rows,interactive=true}:{rows:DailyCashEntry[];interactive?:boolean}) {
  const [page,setPage]=useState(1);
  const safePage=Math.min(page,Math.max(1,Math.ceil(rows.length/10)));
  return <DataTable tableClassName="cash-record-table" rows={rows.slice((safePage-1)*10,safePage*10)} columns={cashSessionColumns} rowKey={row=>row.cajaMovimientoId} page={safePage} pageSize={10} totalRecords={rows.length} onPageChange={setPage} onRowClick={interactive?row=>{location.href=cashMovementUrl('Caja',row.cajaMovimientoId);}:undefined} summary={<>{rows.length} movimientos</>} emptyState={<div className="state-box">No hay movimientos en esta sesión.</div>}/>;
}
export function CashTurnSummary({session}:{session:DailyCashSession}) {
  return <dl className="cash-record-turn">{[['Inicial contado',session.efectivoInicial],['Ingresos',session.ingresos],['Egresos',session.egresos],['Esperado',session.efectivoEsperado]].map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{money.format(Number(value))}</dd></div>)}</dl>;
}
