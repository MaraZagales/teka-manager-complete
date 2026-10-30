import type {CashConceptCatalog} from '../../../services/cashConceptsApi';
export function availableCashConcepts(catalog:CashConceptCatalog|null,type:string){return catalog?.conceptos.filter(row=>row.activo&&row.tipo===type)||[];}
export function cashConceptChoiceError(catalog:CashConceptCatalog,type:string,id:string){
  return catalog.disponible&&!availableCashConcepts(catalog,type).some(row=>String(row.cajaConceptoId)===id)?'Seleccioná un concepto activo del tipo elegido.':'';
}
