import { useEffect, useMemo, useState } from 'react';
import { apiRequest, apiErrorMessage } from '../../services/apiClient';
import type { Pedido } from '../../services/onlineOrdersApi';
export type Voucher = { comprobanteId:number; pedidoId:number|null; clienteId:number; clienteNombre:string; clienteApellido:string|null; tipoComprobanteNombre:string; fechaComprobante:string; importeTotal:number; estadoComprobante:string; numeroComprobante:number|null; puntoVenta:number };
export type SalesFilters = {from:string;to:string;channel:string};
export const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
export const number=(n:number)=>new Intl.NumberFormat('es-AR').format(n);
export const dateOnly=(s:string)=>s?.slice(0,10)||'';
export const credit=(v:Voucher)=>/nota\s+de\s+cr[eé]dito|\bcr[eé]dito\b/i.test(v.tipoComprobanteNombre);
export const debit=(v:Voucher)=>/nota\s+de\s+d[eé]bito|\bd[eé]bito\b/i.test(v.tipoComprobanteNombre);
export const voided=(v:Voucher)=>/anulad|cancelad/i.test(v.estadoComprobante);
export const canceled=(p:Pedido)=>/anulad|cancelad/i.test(p.estadoPedidoNombre);
export function defaultSalesFilters():SalesFilters {const d=new Date();return {from:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`,to:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,channel:''};}
export function filtersFromUrl():SalesFilters {const d=defaultSalesFilters();const q=new URLSearchParams(window.location.search);return {from:q.get('from')||d.from,to:q.get('to')||d.to,channel:q.get('channel')||''};}
export const filterQuery=(f:SalesFilters)=>new URLSearchParams({from:f.from,to:f.to,channel:f.channel}).toString();
export function useSalesAnalytics(f:SalesFilters){
 const [orders,setOrders]=useState<Pedido[]>([]),[vouchers,setVouchers]=useState<Voucher[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 useEffect(()=>{let alive=true;setLoading(true);setError('');Promise.all([apiRequest<Pedido[]>('/api/ventas'),apiRequest<Voucher[]>('/api/comprobantes')]).then(([o,v])=>{if(alive){setOrders(o);setVouchers(v)}}).catch(e=>{if(alive)setError(apiErrorMessage(e,'No se pudieron cargar los datos comerciales.'))}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[refresh]);
 const channels=useMemo(()=>[...new Set(orders.map(o=>o.canalVentaNombre).filter(Boolean))].sort(),[orders]);
 const map=useMemo(()=>new Map(orders.map(o=>[o.pedidoId,o])),[orders]);
 const selectedOrders=useMemo(()=>orders.filter(o=>dateOnly(o.fechaPedido)>=f.from&&dateOnly(o.fechaPedido)<=f.to&&(!f.channel||o.canalVentaNombre===f.channel)),[orders,f]);
 const selectedVouchers=useMemo(()=>vouchers.filter(v=>!voided(v)&&dateOnly(v.fechaComprobante)>=f.from&&dateOnly(v.fechaComprobante)<=f.to&&(!f.channel||(v.pedidoId!=null&&map.get(v.pedidoId)?.canalVentaNombre===f.channel))),[vouchers,f,map]);
 const gross=selectedVouchers.filter(v=>!credit(v)).reduce((s,v)=>s+v.importeTotal,0),credits=selectedVouchers.filter(credit).reduce((s,v)=>s+v.importeTotal,0),net=gross-credits;
 const sales=selectedVouchers.filter(v=>!credit(v)&&!debit(v));
 const byChannel=useMemo(()=>{const m=new Map<string,{name:string;orders:number;gross:number;credits:number;net:number}>();selectedOrders.forEach(o=>{const name=o.canalVentaNombre||'Sin canal';const r=m.get(name)||{name,orders:0,gross:0,credits:0,net:0};r.orders++;m.set(name,r)});selectedVouchers.forEach(v=>{const name=v.pedidoId==null?'Sin pedido asociado':map.get(v.pedidoId)?.canalVentaNombre||'Canal no disponible';const r=m.get(name)||{name,orders:0,gross:0,credits:0,net:0};if(credit(v))r.credits+=v.importeTotal;else r.gross+=v.importeTotal;r.net=r.gross-r.credits;m.set(name,r)});return [...m.values()].sort((a,b)=>b.net-a.net)},[selectedOrders,selectedVouchers,map]);
 const byClient=useMemo(()=>{const m=new Map<number,{id:number;name:string;documents:number;gross:number;credits:number;net:number}>();selectedVouchers.forEach(v=>{const r=m.get(v.clienteId)||{id:v.clienteId,name:[v.clienteNombre,v.clienteApellido].filter(Boolean).join(' ')||`Cliente ${v.clienteId}`,documents:0,gross:0,credits:0,net:0};if(credit(v))r.credits+=v.importeTotal;else {r.gross+=v.importeTotal;if(!debit(v))r.documents++}r.net=r.gross-r.credits;m.set(v.clienteId,r)});return [...m.values()].sort((a,b)=>b.net-a.net)},[selectedVouchers]);
 const period=useMemo(()=>{const days=Math.max(1,Math.round((new Date(f.to+'T12:00:00').getTime()-new Date(f.from+'T12:00:00').getTime())/86400000)+1);const unit=days<=31?'day':days<=120?'week':'month';const start=new Date(f.from+'T12:00:00');const key=(d:Date)=>{if(unit==='month')return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(unit==='week'){const n=Math.floor((d.getTime()-start.getTime())/86400000/7);return `Semana ${n+1}`}return dateOnly(d.toISOString())};const groups=new Map<string,{label:string;gross:number;credits:number;net:number}>();for(let d=new Date(start);d<=new Date(f.to+'T12:00:00');d.setDate(d.getDate()+1)){const k=key(d);if(!groups.has(k))groups.set(k,{label:k,gross:0,credits:0,net:0})}selectedVouchers.forEach(v=>{const k=key(new Date(dateOnly(v.fechaComprobante)+'T12:00:00'));const r=groups.get(k);if(!r)return;if(credit(v))r.credits+=v.importeTotal;else r.gross+=v.importeTotal;r.net=r.gross-r.credits});return [...groups.values()]},[f,selectedVouchers]);
 return {loading,error,reload:()=>setRefresh(x=>x+1),channels,orders:selectedOrders,vouchers:selectedVouchers,gross,credits,net,sales,byChannel,byClient,period,cancellations:selectedOrders.filter(canceled)};
}
