import { apiRequest } from './apiClient';

export type TechnicalTemplateSummary={plantillaDespieceId:number;codigo:string;nombre:string;descripcion:string|null;tipoProductoId:number;tipoProducto:string;nombreProductoId:number|null;familia:string|null;activa:boolean;plantillaDespieceVersionId:number|null;numeroVersion:number|null;estado:string|null;materiales:number;piezas:number};
export type TechnicalMaterial={key:string;codigoRol:string;nombre:string;tipoInsumoId:number;origenColor:'PRODUCTO'|'FIJO';colorId:number|null;espesorMm:number;observaciones:string|null};
export type TechnicalPiece={materialKey:string;orden:number;nombrePieza:string;cantidad:number;baseLargo:string;factorLargo:number;ajusteLargoMm:number;baseAncho:string;factorAncho:number;ajusteAnchoMm:number;orientacionVeta:string;cantosTerminados:string|null;observaciones:string|null};
export type TechnicalTemplatePayload={plantillaDespieceId?:number|null;codigo:string;nombre:string;descripcion:string|null;tipoProductoId:number;nombreProductoId:number|null;observaciones:string|null;materiales:TechnicalMaterial[];piezas:TechnicalPiece[]};
export type TechnicalTemplateDetail={cabecera:TechnicalTemplateSummary;observaciones:string|null;materiales:Array<TechnicalMaterial&{plantillaDespieceMaterialId:number}>;piezas:Array<TechnicalPiece&{plantillaDespiecePiezaReglaId:number}>};
export type BoardFormat={formatoPlacaInsumoId:number;insumoId:number;insumoCodigo:string;insumo:string;codigo:string;nombre:string;largoMm:number;anchoMm:number;espesorMm:number;orientacionVeta:string;tipoRecorteId:number;tipoRecorte:string;predeterminado:boolean;activo:boolean};
export type CutParameter={parametroCorteProduccionId:number;nombre:string;numeroVersion:number;anchoSierraMm:number;margenSeguridadMm:number;largoMinimoRecuperableMm:number;anchoMinimoRecuperableMm:number;areaMinimaRecuperableMm2:number;activo:boolean;fechaCreacion:string};
export type ProductionCutType={tipoRecorteId:number;nombre:string;activo:boolean};

const root='/api/configuracion/produccion';
export const productionConfigurationAdminApi={
 templates:()=>apiRequest<TechnicalTemplateSummary[]>(`${root}/plantillas-despiece`),
 template:(id:number)=>apiRequest<TechnicalTemplateDetail>(`${root}/plantillas-despiece/${id}`),
 saveTemplate:(p:TechnicalTemplatePayload)=>apiRequest<{plantillaDespieceId:number}>(p.plantillaDespieceId?`${root}/plantillas-despiece/${p.plantillaDespieceId}`:`${root}/plantillas-despiece`,{method:p.plantillaDespieceId?'PUT':'POST',body:JSON.stringify(p)}),
 approve:(id:number)=>apiRequest<void>(`${root}/plantillas-despiece/${id}/aprobar`,{method:'POST'}),
 newVersion:(id:number)=>apiRequest<void>(`${root}/plantillas-despiece/${id}/versiones`,{method:'POST'}),
 formats:()=>apiRequest<BoardFormat[]>(`${root}/formatos-placa`),
 saveFormat:(p:Omit<BoardFormat,'insumoCodigo'|'insumo'|'tipoRecorte'|'activo'>)=>apiRequest<{formatoPlacaInsumoId:number}>(p.formatoPlacaInsumoId?`${root}/formatos-placa/${p.formatoPlacaInsumoId}`:`${root}/formatos-placa`,{method:p.formatoPlacaInsumoId?'PUT':'POST',body:JSON.stringify(p)}),
 parameters:()=>apiRequest<CutParameter[]>(`${root}/parametros-corte`),
 saveParameter:(p:{nombre:string;anchoSierraMm:number;margenSeguridadMm:number;largoMinimoRecuperableMm:number;anchoMinimoRecuperableMm:number;areaMinimaRecuperableMm2:number;activar:boolean})=>apiRequest<{parametroCorteProduccionId:number}>(`${root}/parametros-corte`,{method:'POST',body:JSON.stringify(p)}),
 cutTypes:()=>apiRequest<ProductionCutType[]>(`${root}/tipos-recorte`),
 saveCutType:(id:number|null,nombre:string)=>apiRequest<{tipoRecorteId:number}>(id?`${root}/tipos-recorte/${id}`:`${root}/tipos-recorte`,{method:id?'PUT':'POST',body:JSON.stringify({nombre})}),
 inactivateCutType:(id:number)=>apiRequest<void>(`${root}/tipos-recorte/${id}/inactivar`,{method:'POST'}),
};
