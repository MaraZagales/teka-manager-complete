import type { Interes, Oportunidad } from './commercialApi';
export type CommercialReport = {
 from:string;to:string;generatedAt:string;periodI:Interes[];periodO:Oportunidad[];
 active:Oportunidad[];overdue:Oportunidad[];upcoming:Oportunidad[];
 channels:{label:string;value:number;converted:number;rate:number}[];
 months:{label:string;created:number;won:number;lost:number}[];
 age:{short:number;medium:number;long:number};
 confirmedConversions:Oportunidad[];periodLost:Oportunidad[];confirmedAmount:number;
};
const name=(x:Oportunidad|Interes)=>[x.clienteNombre,x.clienteApellido].filter(Boolean).join(' ')||'Sin identificar';
const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(n);
const date=(s?:string|null)=>s?.slice(0,10)||'';
const indicators=(r:CommercialReport): (string|number)[][]=>[
 ['Indicador','Valor','Criterio'],
 ['Gestiones iniciadas',r.periodO.length,'Fecha de alta en el período'],
 ['Ventas concretadas',r.confirmedConversions.length,'Fecha de conversión en el período; pedido actualmente confirmado'],
 ['Gestiones perdidas',r.periodLost.length,'Fecha de pérdida en el período'],
 ['Importe concretado',r.confirmedAmount,'Suma de pedidos vinculados a las conversiones incluidas']
];
const detail=(xs:Oportunidad[])=>(xs.map(x=>[x.oportunidadComercialId,name(x),x.estadoOportunidadNombre||'',x.canalVentaNombre||'',x.responsableNombre||'',date(x.fechaAlta),date(x.fechaConversion),date(x.fechaPerdida),x.pedidoIdConvertido||'']));
export async function exportCommercialExcel(r:CommercialReport){
 const XLSX=await import('xlsx');const book=XLSX.utils.book_new();
 const add=(title:string,rows:(string|number)[][])=>{const data=[['TEKA MANAGER'],[title],[`Generado: ${r.generatedAt}`],[`Período aplicado: ${r.from} al ${r.to}`],[`Cantidad de registros: ${Math.max(0,rows.length-1)}`],[],...rows];const ws=XLSX.utils.aoa_to_sheet(data);const count=Math.max(1,...data.map(x=>x.length));ws['!cols']=Array.from({length:count},(_,index)=>({wch:Math.min(55,Math.max(14,...data.map(row=>String(row[index]??'').length+2)))}));if(rows[0]?.length)ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:6,c:0},e:{r:6+Math.max(0,rows.length-1),c:rows[0].length-1}})};XLSX.utils.book_append_sheet(book,ws,title)};
 add('Resumen', indicators(r));
 add('Evolución',[['Mes','Iniciadas','Concretadas','Perdidas'],...r.months.map(x=>[x.label,x.created,x.won,x.lost])]);
 add('Canales',[['Canal','Gestiones iniciadas','Convertidas de esas gestiones','Conversión de la cohorte (%)'],...r.channels.map(x=>[x.label,x.value,x.converted,Number(x.rate.toFixed(2))])]);
 const heads=['ID gestión','Cliente','Estado','Canal','Responsable','Alta','Conversión','Pérdida','ID pedido'];
 add('Gestiones iniciadas',[heads,...detail(r.periodO)]);
 add('Gestiones concretadas',[heads,...detail(r.confirmedConversions)]);
 add('Gestiones perdidas',[heads,...detail(r.periodLost)]);
 add('Seguimientos vencidos',[['ID gestión','Cliente','Responsable','Acción','Fecha prevista'],...r.overdue.map(x=>[x.oportunidadComercialId,name(x),x.responsableNombre||'',x.proximaAccion||'',date(x.fechaProximaAccion)])]);
 add('Antigüedad',[['Rango','Gestiones abiertas'],['Hasta 30 días',r.age.short],['31 a 90 días',r.age.medium],['Más de 90 días',r.age.long]]);
 XLSX.writeFile(book,`TEKA_Comercial_${r.from}_${r.to}.xlsx`);
}
export async function exportCommercialPdf(r:CommercialReport){
 const [{jsPDF},{default:autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
 const doc=new jsPDF();let y=52;const margin=14;
 doc.setFillColor(63,81,64);doc.rect(0,0,210,34,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('TEKA MANAGER',margin,16);doc.setFontSize(10);doc.text('Panel Comercial · Informe de gestión',margin,26);
 doc.setTextColor(55,53,49);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(`Período: ${r.from} al ${r.to} | Generado: ${r.generatedAt}`,margin,43);
 const table=(title:string,heads:string[],rows:(string|number)[][])=>{if(y>244){doc.addPage();y=20}doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(title,margin,y);y+=5;autoTable(doc,{startY:y,head:[heads],body:rows.length?rows:[['Sin registros',...heads.slice(1).map(()=>'')]],theme:'grid',styles:{fontSize:8,cellPadding:2.6},headStyles:{fillColor:[111,135,107]},margin:{left:margin,right:margin}});y=((doc as typeof doc & {lastAutoTable?:{finalY:number}}).lastAutoTable?.finalY||y)+12};
 table('Resultados del período',['Indicador','Valor','Criterio'],indicators(r).slice(1).map(row=>row.map((v,i)=>i===1&&row[0]==='Importe concretado'?money(Number(v)):String(v))));
 table('Evolución comercial',['Mes','Iniciadas','Concretadas','Perdidas'],r.months.map(x=>[x.label,x.created,x.won,x.lost]));
 table('Origen comercial',['Canal','Iniciadas','Convertidas'],r.channels.map(x=>[x.label,x.value,x.converted]));
 table('Seguimientos vencidos',['Gestión','Cliente','Responsable','Fecha'],r.overdue.map(x=>[x.oportunidadComercialId,name(x),x.responsableNombre||'Sin asignar',date(x.fechaProximaAccion)]));
 const pages=doc.getNumberOfPages();for(let p=1;p<=pages;p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(110,110,110);doc.text(`TEKA Manager · Página ${p} de ${pages}`,196,289,{align:'right'})}
 doc.save(`TEKA_Comercial_${r.from}_${r.to}.pdf`);
}
