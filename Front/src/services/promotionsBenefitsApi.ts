import { apiRequest, responseFormatError } from './apiClient';

const base = '/api/ecommerce/promociones-beneficios';
const camel = (key:string) => key.charAt(0).toLowerCase()+key.slice(1);

function sets(response:unknown):Record<string,unknown>[][]{
  if(!response||typeof response!=='object')throw responseFormatError();
  const value='conjuntos' in response?response.conjuntos:'Conjuntos' in response?response.Conjuntos:undefined;
  if(!Array.isArray(value)||value.some(set=>!Array.isArray(set)))throw responseFormatError();
  return value as Record<string,unknown>[][];
}
function rows<T>(response:unknown,index=0):T[]{
  const all=sets(response);
  if(!Array.isArray(all[index]))throw responseFormatError();
  return all[index].map(row=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw responseFormatError();
    return Object.fromEntries(Object.entries(row).map(([key,value])=>[camel(key),value])) as T;
  });
}
function first<T>(response:unknown,index=0):T{
  const value=rows<T>(response,index)[0];
  if(!value)throw responseFormatError();
  return value;
}
async function get(path:string){return apiRequest<unknown>(`${base}/${path}`);}
async function post(path:string,body?:unknown){return apiRequest<unknown>(`${base}/${path}`,{method:'POST',body:body===undefined?undefined:JSON.stringify(body)});}

export type PromotionDiscountType='PORCENTAJE'|'FIJO'|'IMPORTE';
export type Promotion={promocionId:number;nombre:string;descripcion:string|null;tipoDescuento:PromotionDiscountType;valorDescuento:number;fechaDesde:string;fechaHasta:string;activa:boolean;fechaAlta:string;cantidadProductos:number};
export type PromotionPayload={promocionId:number|null;nombre:string;descripcion:string|null;tipoDescuento:'PORCENTAJE'|'FIJO';valorDescuento:number;fechaDesde:string;fechaHasta:string;activa:boolean};
export type PromotionProduct={promocionId:number;productoId:number;codigo:string;nombre:string;activo:boolean};
export type CutBenefit={productoRecorteId:number;ordenProduccionId:number;productoId:number;codigo:string;nombre:string;cantidadHabilitada:number;precioSimbolico:number;activo:boolean;fechaAlta:string;estadoOrdenProduccionId:number;cantidadProducida:number;recorteProductoSugeridoId:number|null};
export type CutBenefitConfig={configuracionId:number;umbralGratuidad:number;activo:boolean;fechaActualizacion:string};
export type AvailableCutBenefit={productoRecorteId:number;productoId:number;nombre:string;ordenProduccionId:number;precioSimbolico:number;cantidadHabilitada:number;cupoRestante:number;depositoId:number;cupoOnline:number|null;stockLibre:number};
export type CutBenefitPayload={productoRecorteId:number|null;ordenProduccionId:number;cantidadHabilitada:number;precioSimbolico:number;activo:boolean};
export type CutBenefitAssignment={pedidoId:number;fechaPedido:string;clienteId:number;productoRecorteId:number;productoId:number;detallePedidoId:number|null;precioAplicado:number;esGratuito:boolean;fechaAsignacion:string;estadoPedidoId:number};

export const promotionsBenefitsApi={
  promotions:async()=>rows<Promotion>(await get('promociones')),
  savePromotion:async(payload:PromotionPayload)=>first<{promocionId:number}>(await post('promociones',payload)),
  promotionProducts:async(id:number)=>rows<PromotionProduct>(await get(`promociones/${id}/productos`)),
  assignProduct:async(promocionId:number,productoId:number,asignar:boolean)=>{await post('promociones/productos',{promocionId,productoId,asignar});},
  deactivatePromotion:async(id:number)=>{await post(`promociones/${id}/desactivar`);},
  cutBenefits:async()=>{const response=await get('recortes');return{items:rows<CutBenefit>(response,0),config:rows<CutBenefitConfig>(response,1)[0]??null};},
  availableCutBenefits:async()=>rows<AvailableCutBenefit>(await get('recortes/disponibles')),
  saveCutConfig:async(umbralGratuidad:number,activo:boolean)=>{await post('recortes/configuracion',{umbralGratuidad,activo});},
  saveCutBenefit:async(payload:CutBenefitPayload)=>first<{productoRecorteId:number}>(await post('recortes/productos',payload)),
  deactivateCutBenefit:async(id:number)=>{await post(`recortes/${id}/desactivar`);},
  report:async(desde?:string,hasta?:string)=>{const query=new URLSearchParams();if(desde)query.set('desde',desde);if(hasta)query.set('hasta',hasta);return rows<CutBenefitAssignment>(await get(`recortes/reporte${query.toString()?`?${query}`:''}`));},
};
