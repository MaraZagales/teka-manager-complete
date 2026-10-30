import type { Pedido } from './onlineOrdersApi';
import type { CustomerEvolution, ProductPreference, SummaryResponse } from './onlineCustomersApi';
import type { CutBenefitAssignment } from './promotionsBenefitsApi';

export type EcommerceReportData={
  from:string;to:string;generatedAt:Date;
  orders:Pedido[];summary:SummaryResponse|null;evolution:CustomerEvolution[];products:ProductPreference[];benefits:CutBenefitAssignment[];
  states:{name:string;count:number;percentage:number}[];
  productsAvailable:boolean;
};
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2});
const date=(value:string)=>new Date(value).toLocaleDateString('es-AR');

export async function exportEcommerceExcel(data:EcommerceReportData){
  const XLSX=await import('xlsx');const book=XLSX.utils.book_new();
  const delivered=data.summary?.periodo;
  const indicators=[['TEKA Manager · Reportes de E-commerce'],['Período',`${data.from} al ${data.to}`],['Generado',data.generatedAt.toLocaleString('es-AR')],[],['Indicador','Valor'],['Ventas entregadas',delivered?.importePedidosEntregadosPeriodo??'No disponible'],['Operaciones entregadas',delivered?.comprasEntregadasPeriodo??'No disponible'],['Pedidos online ingresados',data.orders.length],['Ticket promedio',delivered&&delivered.comprasEntregadasPeriodo?delivered.importePedidosEntregadosPeriodo/delivered.comprasEntregadasPeriodo:'No disponible'],['Unidades vendidas',data.productsAvailable?data.products.reduce((sum,row)=>sum+row.unidadesEntregadas,0):'No disponible']];
  XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(indicators),'Resumen');
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data.states.map(row=>({Estado:row.name,Pedidos:row.count,Porcentaje:row.percentage/100}))),'Estados');
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data.evolution.map(row=>({Mes:date(row.mes),'Ventas entregadas':row.comprasEntregadas,'Clientes':row.compradores,'Importe entregado':row.importePedidosEntregados}))),'Evolución');
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data.products.map(row=>({Código:row.codigo,Producto:row.nombre,'Unidades entregadas':row.unidadesEntregadas,Pedidos:row.pedidosConProducto,Clientes:row.compradoresDistintos,Importe:row.importeLineas}))),'Productos');
  const orderById=new Map(data.orders.map(row=>[row.pedidoId,row]));const productById=new Map(data.products.map(row=>[row.productoId,row]));
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data.benefits.map(row=>({Pedido:row.pedidoId,'Fecha del pedido':date(row.fechaPedido),Cliente:orderById.has(row.pedidoId)?`${orderById.get(row.pedidoId)!.clienteNombre} ${orderById.get(row.pedidoId)!.clienteApellido??''}`.trim():'No disponible',Producto:productById.get(row.productoId)?.nombre??'No disponible','Tipo de beneficio':row.esGratuito?'Gratuito':'Precio simbólico','Precio aplicado':row.precioAplicado,'Fecha de asignación':date(row.fechaAsignacion)}))),'Beneficios');
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data.orders.map(row=>({Pedido:row.pedidoId,Fecha:date(row.fechaPedido),Cliente:`${row.clienteNombre} ${row.clienteApellido??''}`.trim(),Estado:row.estadoPedidoNombre,Total:row.total}))),'Pedidos');
  XLSX.writeFile(book,`TEKA_Ecommerce_${data.from}_${data.to}.xlsx`);
}

export async function exportEcommercePdf(data:EcommerceReportData){
  const [{default:jsPDF},{default:autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
  const doc=new jsPDF();const delivered=data.summary?.periodo;let y=18;
  doc.setFillColor(55,78,62);doc.rect(0,0,210,30,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('TEKA | Reportes de E-commerce',14,14);doc.setFontSize(9);doc.text(`Período: ${data.from} al ${data.to} · Generado: ${data.generatedAt.toLocaleString('es-AR')}`,14,22);doc.setTextColor(35,43,38);y=40;
  const metrics=[['Ventas entregadas',delivered?money.format(delivered.importePedidosEntregadosPeriodo):'No disponible'],['Pedidos online',String(data.orders.length)],['Ticket promedio',delivered&&delivered.comprasEntregadasPeriodo?money.format(delivered.importePedidosEntregadosPeriodo/delivered.comprasEntregadasPeriodo):'No disponible'],['Unidades vendidas',data.productsAvailable?String(data.products.reduce((sum,row)=>sum+row.unidadesEntregadas,0)):'No disponible']];
  autoTable(doc,{startY:y,head:[['Indicador','Resultado']],body:metrics,theme:'grid',headStyles:{fillColor:[73,105,78]}});y=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+10;
  if(data.evolution.length){doc.setFontSize(13);doc.text('Evolución comercial',14,y);autoTable(doc,{startY:y+4,head:[['Mes','Ventas entregadas','Importe']],body:data.evolution.slice(-12).map(row=>[date(row.mes),String(row.comprasEntregadas),money.format(row.importePedidosEntregados)]),headStyles:{fillColor:[73,105,78]}});y=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+10;if(y>235){doc.addPage();y=18;}}
  doc.setFontSize(13);doc.text('Pedidos por estado',14,y);autoTable(doc,{startY:y+4,head:[['Estado','Pedidos','Participación']],body:data.states.map(row=>[row.name,String(row.count),`${row.percentage.toFixed(1)}%`]),headStyles:{fillColor:[73,105,78]}});y=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+10;
  if(y>235){doc.addPage();y=18;}doc.setFontSize(13);doc.text('Productos destacados',14,y);autoTable(doc,{startY:y+4,head:[['Producto','Unidades','Pedidos','Importe']],body:data.products.slice(0,10).map(row=>[`${row.codigo} · ${row.nombre}`,String(row.unidadesEntregadas),String(row.pedidosConProducto),money.format(row.importeLineas)]),headStyles:{fillColor:[73,105,78]}});y=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+10;
  if(y>235){doc.addPage();y=18;}doc.setFontSize(13);doc.text('Beneficios por recortes',14,y);autoTable(doc,{startY:y+4,head:[['Asignados','Gratuitos','Precio simbólico']],body:[[String(data.benefits.length),String(data.benefits.filter(row=>row.esGratuito).length),String(data.benefits.filter(row=>!row.esGratuito).length)]],headStyles:{fillColor:[73,105,78]}});
  const pages=doc.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setFontSize(8);doc.setTextColor(110);doc.text(`TEKA Manager · Página ${page} de ${pages}`,14,289);}
  doc.save(`TEKA_Ecommerce_${data.from}_${data.to}.pdf`);
}
